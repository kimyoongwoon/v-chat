"""
STT (Speech-to-Text) 서비스 모듈
OpenAI Whisper API를 사용한 실시간 음성 인식
"""

import os
import pyaudio
import wave
import threading
import time
import tempfile
import tiktoken
import numpy as np
from openai import OpenAI
from .audio_utils import validate_api_keys

class RealTimeSTT:
    """실시간 STT 서비스 클래스"""
    
    def __init__(self, silence_threshold=2.0, sample_rate=44100, chunk_size=1024):
        """
        STT 서비스 초기화
        
        Args:
            silence_threshold (float): 침묵 감지 임계값 (초)
            sample_rate (int): 샘플링 레이트
            chunk_size (int): 오디오 청크 크기
        """
        # API 키 검증
        validate_api_keys()
        
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.silence_threshold = silence_threshold
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.format = pyaudio.paInt16
        self.channels = 1
        
        # 녹음 상태 관리
        self.is_recording = False
        self.is_speaking = False
        self.audio_frames = []
        self.last_sound_time = 0
        self.volume_threshold = 500
        
        # PyAudio 초기화
        self.audio = pyaudio.PyAudio()
        
        # tiktoken 인코더 (토큰 계산용)
        try:
            self.encoding = tiktoken.get_encoding("cl100k_base")
        except:
            self.encoding = None
    
    def is_silence(self, audio_chunk):
        """오디오 청크가 침묵인지 확인"""
        audio_data = np.frombuffer(audio_chunk, dtype=np.int16)
        volume = np.sqrt(np.mean(audio_data**2))
        return volume < self.volume_threshold
    
    def save_audio_to_temp_file(self, audio_frames):
        """오디오 프레임을 임시 WAV 파일로 저장"""
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_filename = temp_file.name
        
        with wave.open(temp_filename, 'wb') as wf:
            wf.setnchannels(self.channels)
            wf.setsampwidth(self.audio.get_sample_size(self.format))
            wf.setframerate(self.sample_rate)
            wf.writeframes(b''.join(audio_frames))
        
        return temp_filename
    
    def transcribe_audio_file(self, audio_file_path, language="ko"):
        """오디오 파일을 텍스트로 변환"""
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="json"
                )
            return transcript.text
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg and "quota" in error_msg:
                return "❌ OpenAI API 할당량이 초과되었습니다."
            elif "401" in error_msg:
                return "❌ API 키가 유효하지 않습니다."
            else:
                return f"❌ 변환 오류: {error_msg}"
        finally:
            # 임시 파일 삭제
            try:
                os.unlink(audio_file_path)
            except:
                pass
    
    def audio_callback(self, in_data, frame_count, time_info, status):
        """실시간 오디오 콜백 함수"""
        if not self.is_recording:
            return (in_data, pyaudio.paContinue)

        current_time = time.time()
        
        if not self.is_silence(in_data):
            self.is_speaking = True
            self.last_sound_time = current_time
            self.audio_frames.append(in_data)
            print("🎤 녹음 중...", end="\r")
        else:
            if self.is_speaking and (current_time - self.last_sound_time) > self.silence_threshold:
                print("\n⏸️  침묵 감지: 녹음을 중단합니다.")
                self.is_recording = False
            elif self.is_speaking:
                self.audio_frames.append(in_data)
        
        return (in_data, pyaudio.paContinue)
    
    def record_and_transcribe(self):
        """
        녹음하고 텍스트로 변환 (메인에서 호출할 함수)
        
        Returns:
            str: 변환된 텍스트 또는 None
        """
        if self.is_recording:
            return None
        
        self.is_recording = True
        self.is_speaking = False
        self.audio_frames = []
        self.last_sound_time = time.time()
        
        # 스트림 시작
        stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size,
            stream_callback=self.audio_callback
        )
        
        # Enter 키 감지 스레드
        stop_event = threading.Event()
        
        def wait_for_enter():
            try:
                input()  # Enter 대기
                if self.is_recording:
                    print("\n🔔 Enter 감지: 녹음을 중단합니다.")
                    self.is_recording = False
                stop_event.set()
            except:
                stop_event.set()
        
        enter_thread = threading.Thread(target=wait_for_enter, daemon=True)
        enter_thread.start()
        
        stream.start_stream()
        
        # 녹음 대기
        while stream.is_active() and self.is_recording:
            time.sleep(0.1)
        
        # 스트림 정리
        try:
            stream.stop_stream()
            stream.close()
        except:
            pass
        
        # STT 처리
        if len(self.audio_frames) > 0:
            print("🔄 음성을 텍스트로 변환 중...")
            temp_file = self.save_audio_to_temp_file(self.audio_frames)
            result = self.transcribe_audio_file(temp_file)
            
            # 토큰 정보 출력
            if self.encoding and result and not result.startswith("❌"):
                try:
                    tokens = self.encoding.encode(result)
                    token_count = len(tokens)
                    print(f"🔢 토큰 개수: {token_count}개")
                except:
                    pass
            
            return result
        else:
            print("❌ 녹음된 오디오가 없습니다.")
            return None
    
    def terminate(self):
        """자원 해제"""
        self.is_recording = False
        try:
            self.audio.terminate()
        except:
            pass
