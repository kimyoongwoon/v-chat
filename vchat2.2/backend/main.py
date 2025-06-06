import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
import os
import tempfile
import uuid
from typing import Optional, List
from dotenv import load_dotenv

# .env 파일 로드 (모듈 import 전에)
load_dotenv()

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# 기존 모듈들 import
from modules.persona_manager import PersonaManager
from modules.vchat_bot import VChatBot
from modules.tts_service import VoiceConverter
from modules.stt_service import RealTimeSTT
from modules.audio_utils import AudioConfig

app = FastAPI(title="VChat Backend API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://v-chat-42ah.vercel.app/"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 전역 변수들
persona_manager = PersonaManager()
chatbot = None
tts_service = None
stt_service = None

# Pydantic 모델들
class PersonaCreateRequest(BaseModel):
    name: str
    url: str
    voice_id: Optional[str] = None
    model_id: Optional[str] = None

class PersonaSelectRequest(BaseModel):
    persona_name: str

class ChatRequest(BaseModel):
    message: str
    mode: str  # 'text-to-text', 'speech-to-speech', 'text-to-speech'
    persona: str

class SpeechRequest(BaseModel):
    action: str  # 'start' or 'stop'

class TTSRequest(BaseModel):
    text: str

def initialize_services():
    """서비스들 초기화"""
    global chatbot, tts_service, stt_service
    
    if persona_manager.get_current_persona():
        chatbot = VChatBot(persona_manager=persona_manager)
        tts_service = VoiceConverter(persona_manager=persona_manager)
        
        audio_config = AudioConfig()
        stt_service = RealTimeSTT(
            silence_threshold=2.0,
            sample_rate=audio_config.sample_rate,
            chunk_size=audio_config.chunk_size
        )

@app.get("/api/personas")
async def get_personas():
    """사용 가능한 페르소나 목록 반환"""
    try:
        personas = persona_manager.get_available_personas()
        current_persona = persona_manager.get_current_persona()
        current_name = current_persona.get('name') if current_persona else None
        
        return {
            "success": True,
            "personas": personas,
            "current_persona": current_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/personas/select")
async def select_persona(request: PersonaSelectRequest):
    """페르소나 선택"""
    try:
        success = persona_manager.select_persona(request.persona_name)
        if success:
            initialize_services()
            return {"success": True, "message": f"{request.persona_name} 선택됨"}
        else:
            raise HTTPException(status_code=404, detail="페르소나를 찾을 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/personas/create")
async def create_persona(request: PersonaCreateRequest):
    """새 페르소나 생성"""
    try:
        success = persona_manager.add_persona_from_url(
            name=request.name,
            url=request.url,
            voice_id=request.voice_id,
            model_id=request.model_id
        )
        
        if success:
            return {"success": True, "message": f"{request.name} 페르소나 생성 완료"}
        else:
            raise HTTPException(status_code=400, detail="페르소나 생성에 실패했습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """채팅 응답 생성"""
    try:
        if not chatbot:
            raise HTTPException(status_code=400, detail="페르소나가 선택되지 않았습니다")
        
        # 텍스트 응답 생성
        response_text = chatbot.get_response(request.message)
        
        result = {
            "success": True,
            "response": response_text
        }
        
        # TTS 모드인 경우 음성 파일 생성
        if request.mode in ['text-to-speech', 'speech-to-speech']:
            if tts_service:
                # 임시 파일 생성
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                temp_filename = temp_file.name
                temp_file.close()
                
                # 음성 변환
                audio = tts_service.convert_text_to_speech(response_text)
                if audio:
                    tts_service.save_audio_to_file(audio, temp_filename)
                    result["audio_url"] = f"/api/audio/{os.path.basename(temp_filename)}"
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech/upload")
async def upload_audio_for_transcription(file: UploadFile = File(...)):
    """업로드된 오디오 파일을 텍스트로 변환"""
    try:
        if not stt_service:
            raise HTTPException(status_code=400, detail="STT 서비스가 초기화되지 않았습니다")
        
        # 지원되는 오디오 형식 확인
        allowed_types = ["audio/wav", "audio/mpeg", "audio/mp4", "audio/webm", "audio/ogg"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="지원되지 않는 오디오 형식입니다")
        
        # 임시 파일에 저장
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_filename = temp_file.name
        
        # 파일 내용 읽기 및 저장
        contents = await file.read()
        temp_file.write(contents)
        temp_file.close()
        
        # STT 처리
        transcription = stt_service.transcribe_audio_file(temp_filename)
        
        # 임시 파일 삭제
        try:
            os.unlink(temp_filename)
        except:
            pass
        
        if transcription and not transcription.startswith("❌"):
            return {
                "success": True,
                "transcription": transcription
            }
        else:
            raise HTTPException(status_code=500, detail=transcription or "음성 인식에 실패했습니다")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"음성 처리 중 오류: {str(e)}")

@app.post("/api/speech/record")
async def handle_speech_recording(request: SpeechRequest):
    """음성 녹음 상태 관리 (호환성 유지)"""
    try:
        if request.action == "start":
            return {"success": True, "message": "녹음 시작 - 클라이언트에서 처리됩니다"}
        elif request.action == "stop":
            return {"success": True, "message": "녹음 중지 - /api/speech/upload로 파일을 업로드하세요"}
        else:
            raise HTTPException(status_code=400, detail="잘못된 액션입니다")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech/tts")
async def text_to_speech(request: TTSRequest):
    """텍스트를 음성으로 변환"""
    try:
        if not tts_service:
            raise HTTPException(status_code=400, detail="TTS 서비스가 초기화되지 않았습니다")
        
        # 임시 파일 생성
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_filename = temp_file.name
        temp_file.close()
        
        # 음성 변환
        audio = tts_service.convert_text_to_speech(request.text)
        if audio:
            tts_service.save_audio_to_file(audio, temp_filename)
            return {
                "success": True,
                "audio_url": f"/api/audio/{os.path.basename(temp_filename)}"
            }
        else:
            raise HTTPException(status_code=500, detail="음성 변환에 실패했습니다")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audio/{filename}")
async def get_audio_file(filename: str):
    """오디오 파일 제공"""
    try:
        file_path = os.path.join(tempfile.gettempdir(), filename)
        if os.path.exists(file_path):
            return FileResponse(
                file_path,
                media_type="audio/mpeg",
                filename=filename
            )
        else:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """앱 시작시 초기화"""
    print("VChat Backend API 시작됨")
    print(f"프로젝트 루트: {project_root}")
    
    # Firebase 연결 테스트 및 데이터 로드
    try:
        # 페르소나 매니저에서 Firebase 연결 확인
        if persona_manager.db:
            print("✅ Firebase 연결 확인됨")
            # 로컬 데이터가 있고 Firebase가 비어있다면 마이그레이션 제안
            personas = persona_manager.get_available_personas()
            if not personas and os.path.exists(os.path.join(project_root, 'data/personas.json')):
                print("🔄 로컬 데이터를 Firebase로 마이그레이션합니다...")
                if persona_manager.migrate_local_to_firebase():
                    personas = persona_manager.get_available_personas()
        else:
            print("⚠️ Firebase 연결 실패, 로컬 파일 시스템 사용")
        
        # 기본 페르소나가 있으면 자동 선택
        personas = persona_manager.get_available_personas()
        if personas:
            persona_manager.select_persona(personas[0])
            initialize_services()
            print(f"기본 페르소나 '{personas[0]}' 선택됨")
            
    except Exception as e:
        print(f"⚠️ 시작 시 오류: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
