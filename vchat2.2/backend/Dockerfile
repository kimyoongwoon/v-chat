FROM python:3.11-slim

WORKDIR /app

# 시스템 업데이트 및 오디오 관련 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    portaudio19-dev \
    libasound2-dev \
    libpulse-dev \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# pip 업그레이드
RUN pip install --upgrade pip setuptools wheel

# 1단계: 핵심 패키지들 먼저 설치 (의존성 기반으로)
RUN pip install --no-cache-dir \
    numpy==1.24.3 \
    python-dotenv==1.0.0

# 2단계: 웹 프레임워크 (pydantic 포함)
RUN pip install --no-cache-dir \
    "pydantic>=2.5.0" \
    "fastapi>=0.104.0" \
    "uvicorn[standard]>=0.24.0" \
    "python-multipart>=0.0.6"

# 3단계: OpenAI 관련
RUN pip install --no-cache-dir \
    "openai>=1.3.0" \
    "tiktoken>=0.5.0"

# 4단계: ElevenLabs (pydantic 호환 문제 해결)
RUN pip install --no-cache-dir \
    "elevenlabs>=1.0.0,<2.0.0"

# 5단계: 오디오 처리
RUN pip install --no-cache-dir \
    PyAudio==0.2.13 \
    "pydub>=0.25.1" \
    "simpleaudio>=1.0.4"

# 6단계: 웹 스크래핑
RUN pip install --no-cache-dir \
    "requests>=2.31.0" \
    "beautifulsoup4>=4.12.0" \
    "lxml>=4.9.0"

# 7단계: Firebase
RUN pip install --no-cache-dir \
    "firebase-admin>=6.2.0"

# 8단계: 기타 유틸리티
RUN pip install --no-cache-dir \
    "python-dateutil>=2.8.0"

# 앱 코드 복사
COPY . .

# 포트 설정
EXPOSE 8000

# 앱 실행
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"