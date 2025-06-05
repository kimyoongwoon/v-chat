"""
TTS (Text-to-Speech) 서비스 모듈
ElevenLabs API를 사용한 음성 변환
"""

import os
from elevenlabs.client import ElevenLabs
from elevenlabs import play, VoiceSettings
from .audio_utils import validate_api_keys

class VoiceConverter:
    """음성 변환 서비스 클래스"""
    
    def __init__(self, persona_manager=None, model_id="eleven_multilingual_v2"):
        """
        TTS 서비스 초기화
        
        Args:
            persona_manager: PersonaManager 인스턴스
            model_id (str): 사용할 모델 ID
        """
        # API 키 검증
        validate_api_keys()
        
        self.persona_manager = persona_manager
        self.model_id = model_id
        
        # PersonaManager에서 voice_id 가져오기
        if persona_manager and persona_manager.get_voice_id():
            self.voice_id = persona_manager.get_voice_id()
        else:
            self.voice_id = "HAIQu18Se8Zljrot4frx"  # 기본값
        
        # ElevenLabs 클라이언트 초기화
        api_key = os.getenv('ELEVENLABS_API_KEY')
        self.client = ElevenLabs(api_key=api_key)
        
        # 음성 설정
        self.voice_settings = VoiceSettings(
            stability=0.75,
            similarity_boost=0.75,
            style=0.1,
            use_speaker_boost=True
        )
    
    def update_persona(self, persona_manager):
        """페르소나 업데이트"""
        self.persona_manager = persona_manager
        if persona_manager and persona_manager.get_voice_id():
            self.voice_id = persona_manager.get_voice_id()
    
    def convert_text_to_speech(self, text):
        """
        텍스트를 음성으로 변환
        
        Args:
            text (str): 변환할 텍스트
            
        Returns:
            audio_generator: 오디오 생성기 또는 None
        """
        try:
            if not text or not text.strip():
                print("❌ 변환할 텍스트가 없습니다.")
                return None
            
            print(f"🎵 텍스트 변환 중: '{text[:50]}{'...' if len(text) > 50 else ''}'")
            
            audio = self.client.text_to_speech.convert(
                text=text,
                voice_id=self.voice_id,
                model_id=self.model_id,
                voice_settings=self.voice_settings
            )
            
            return audio
            
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg:
                print("❌ ElevenLabs API 키가 유효하지 않습니다.")
            elif "quota" in error_msg.lower():
                print("❌ ElevenLabs API 할당량이 초과되었습니다.")
            elif "429" in error_msg:
                print("❌ API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.")
            else:
                print(f"❌ 음성 변환 오류: {error_msg}")
            return None
    
    def play_audio(self, audio):
        """
        오디오 재생
        
        Args:
            audio: 재생할 오디오 객체
            
        Returns:
            bool: 재생 성공 여부
        """
        try:
            if audio is None:
                return False
            
            print("🔊 음성을 재생합니다...")
            play(audio)
            return True
            
        except Exception as e:
            print(f"❌ 음성 재생 오류: {str(e)}")
            return False
    
    def save_audio_to_file(self, audio, filename):
        """
        오디오를 파일로 저장
        
        Args:
            audio: 저장할 오디오 객체
            filename (str): 저장할 파일명
            
        Returns:
            bool: 저장 성공 여부
        """
        try:
            if audio is None:
                return False
            
            with open(filename, 'wb') as f:
                for chunk in audio:
                    f.write(chunk)
            
            print(f"💾 음성 파일 저장 완료: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ 파일 저장 오류: {str(e)}")
            return False
    
    def convert_and_play(self, text, save_to_file=None):
        """
        텍스트를 음성으로 변환하고 재생
        
        Args:
            text (str): 변환할 텍스트
            save_to_file (str, optional): 저장할 파일명
            
        Returns:
            bool: 성공 여부
        """
        # 텍스트를 음성으로 변환
        audio = self.convert_text_to_speech(text)
        
        if audio is None:
            return False
        
        # 파일 저장 (옵션)
        if save_to_file:
            # 오디오를 복사해서 저장 (재생용과 저장용 분리)
            try:
                audio_for_save = self.convert_text_to_speech(text)
                if audio_for_save:
                    self.save_audio_to_file(audio_for_save, save_to_file)
            except:
                pass
        
        # 음성 재생
        return self.play_audio(audio)
    
    def set_voice_settings(self, stability=None, similarity_boost=None, style=None, use_speaker_boost=None):
        """
        음성 설정 변경
        
        Args:
            stability (float): 안정성 (0.0-1.0)
            similarity_boost (float): 유사성 부스트 (0.0-1.0)
            style (float): 스타일 (0.0-1.0)
            use_speaker_boost (bool): 스피커 부스트 사용 여부
        """
        if stability is not None:
            self.voice_settings.stability = stability
        if similarity_boost is not None:
            self.voice_settings.similarity_boost = similarity_boost
        if style is not None:
            self.voice_settings.style = style
        if use_speaker_boost is not None:
            self.voice_settings.use_speaker_boost = use_speaker_boost
        
        print("✅ 음성 설정이 업데이트되었습니다.")
    
    def list_available_voices(self):
        """
        사용 가능한 음성 목록 조회
        
        Returns:
            list: 음성 목록
        """
        try:
            voices = self.client.voices.get_all()
            return voices.voices
        except Exception as e:
            print(f"❌ 음성 목록 조회 오류: {str(e)}")
            return []
    
    def get_voice_info(self):
        """현재 설정된 음성 정보 반환"""
        return {
            "voice_id": self.voice_id,
            "model_id": self.model_id,
            "settings": {
                "stability": self.voice_settings.stability,
                "similarity_boost": self.voice_settings.similarity_boost,
                "style": self.voice_settings.style,
                "use_speaker_boost": self.voice_settings.use_speaker_boost
            }
        }
