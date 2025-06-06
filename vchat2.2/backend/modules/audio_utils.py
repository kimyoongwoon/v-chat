class AudioConfig:
    """오디오 설정 관리 클래스"""
    
    def __init__(self):
        self.sample_rate = 44100
        self.chunk_size = 1024
        self.channels = 1
        self.format = "paInt16"
        self.silence_threshold = 2.0
        self.volume_threshold = 500
    
    def get_config_dict(self):
        """설정을 딕셔너리로 반환"""
        return {
            "sample_rate": self.sample_rate,
            "chunk_size": self.chunk_size,
            "channels": self.channels,
            "format": self.format,
            "silence_threshold": self.silence_threshold,
            "volume_threshold": self.volume_threshold
        }

def validate_api_keys():
    """API 키 유효성 검사"""
    import os
    
    openai_key = os.getenv('OPENAI_API_KEY')
    elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    if not openai_key:
        raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
    
    if not elevenlabs_key:
        raise ValueError("ELEVENLABS_API_KEY가 .env 파일에 설정되지 않았습니다.")
    
    return True

def print_system_info():
    """시스템 정보 출력"""
    import platform
    import sys
    
    print("📊 시스템 정보:")
    print(f"  - Python: {sys.version}")
    print(f"  - 플랫폼: {platform.system()} {platform.release()}")
    print(f"  - 아키텍처: {platform.machine()}")
