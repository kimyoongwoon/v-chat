from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
import os
import tempfile
import uuid
from typing import Optional, List

# 기존 모듈들 import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))

from modules.persona_manager import PersonaManager
from modules.vchat_bot import VChatBot
from modules.tts_service import VoiceConverter
from modules.stt_service import RealTimeSTT
from modules.audio_utils import AudioConfig

app = FastAPI(title="VChat Backend API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
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

@app.post("/api/speech/record")
async def handle_speech_recording(request: SpeechRequest):
    """음성 녹음 처리"""
    try:
        if not stt_service:
            raise HTTPException(status_code=400, detail="STT 서비스가 초기화되지 않았습니다")
        
        if request.action == "start":
            # 실제 구현에서는 WebSocket이나 다른 방식으로 실시간 처리
            return {"success": True, "message": "녹음 시작"}
        
        elif request.action == "stop":
            # 녹음 중지 및 텍스트 변환
            # 실제 구현에서는 녹음된 오디오를 처리
            transcription = "음성 인식 결과"  # 실제로는 STT 처리 결과
            return {
                "success": True,
                "transcription": transcription
            }
        
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
    
    # 기본 페르소나가 있으면 자동 선택
    personas = persona_manager.get_available_personas()
    if personas:
        persona_manager.select_persona(personas[0])
        initialize_services()
        print(f"기본 페르소나 '{personas[0]}' 선택됨")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
