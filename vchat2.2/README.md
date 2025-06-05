# VChat Web Application

AI 페르소나와 대화할 수 있는 웹 애플리케이션입니다.

## 기능

-   🔐 Google 로그인
-   🎭 페르소나 생성 및 관리
-   💬 텍스트 채팅 (Text-to-Text)
-   🎤 음성 채팅 (Speech-to-Speech)
-   🔊 텍스트-음성 변환 (Text-to-Speech)
-   🔥 Firebase Firestore 데이터베이스 연동

## 설치 및 실행

### 1. 의존성 설치

```bash
# Node.js 의존성 설치
npm install

# Python 의존성 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

**`.env.local` 파일을 생성**하고 다음 값들을 설정하세요:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Backend URL (중요!)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Firebase 설정 (Frontend용)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**`.env` 파일 확인** (Python 백엔드용):

```env
# AI API Keys
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Firebase 설정 (Backend용)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Firebase 서비스 계정 키 (선택사항)
# FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
```

### 3. Firebase 설정

1.  [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2.  Firestore Database 활성화
3.  환경 변수에 Firebase 설정 추가

### 4. 데이터 마이그레이션 (최초 1회)

로컬 `data/personas.json` 데이터를 Firebase로 마이그레이션:

```bash
python scripts/migrate_to_firebase.py
```

### 5. 실행 순서 (중요!)

**Step 1: Python 백엔드 실행** (먼저 실행)

```bash
# 터미널 1
cd "c:\Users\user\Desktop\NEXT\product day\V-chat\vchat2.2"
python backend/main.py
```

백엔드가 성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```
VChat Backend API 시작됨
✅ Firebase 연결 확인됨
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Step 2: 백엔드 연결 확인**

브라우저에서 `http://localhost:8000/docs`에 접속하여 FastAPI Swagger UI가 표시되는지 확인하세요.

**Step 3: 프론트엔드 실행** (별도 터미널)

```bash
# 터미널 2
cd "c:\Users\user\Desktop\NEXT\product day\V-chat\vchat2.2"
npm run dev
```

### 6. 문제 해결

**백엔드 연결 실패 시:**

1. **포트 확인**: 포트 8000이 이미 사용 중인지 확인

    ```bash
    # Windows
    netstat -ano | findstr :8000

    # 프로세스 종료 (PID 확인 후)
    taskkill /PID <PID> /F
    ```

2. **환경변수 확인**: `.env` 파일에 모든 필수 API 키가 설정되어 있는지 확인

3. **의존성 확인**: Python 패키지가 모두 설치되어 있는지 확인
    ```bash
    pip install -r requirements.txt
    ```

**프론트엔드 연결 실패 시:**

1. **환경변수 확인**: `.env.local` 파일에 `NEXT_PUBLIC_BACKEND_URL`이 설정되어 있는지 확인

2. **재시작**: Next.js 개발 서버 재시작 (환경변수 변경 후)

## 사용법

1.  Google 계정으로 로그인
2.  사이드바에서 페르소나 선택 또는 새 페르소나 생성
3.  상단바에서 "페르소나 실행" 또는 "페르소나 생성" 모드 선택
4.  채팅 모드 선택 (텍스트↔텍스트, 음성↔음성, 텍스트→음성)
5.  AI 페르소나와 대화 시작!

## 기술 스택

-   **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
-   **Backend**: FastAPI, Python
-   **Database**: Firebase Firestore
-   **Authentication**: NextAuth.js (Google OAuth)
-   **AI**: OpenAI GPT, ElevenLabs TTS
-   **UI Components**: Radix UI, shadcn/ui

## 데이터베이스 구조

### Firestore Collections

```
personas/
  ├── 둥그레/
  │   ├── name: "둥그레"
  │   ├── voice_id: "..."
  │   ├── fine_tuned_model_id: "..."
  │   ├── url: "..."
  │   ├── persona_data: {...}
  │   └── few_shot_examples: [...]
  ├── 릴파/
  └── ...
```

## 포트 정보

-   **Frontend**: http://localhost:3000
-   **Backend**: http://localhost:8000
-   **Backend API Docs**: http://localhost:8000/docs

## 주요 명령어

```bash
# 개발 모드 실행
npm run dev                    # 프론트엔드
python backend/main.py         # 백엔드

# 빌드
npm run build                  # 프론트엔드

# 마이그레이션
python scripts/migrate_to_firebase.py

# 콘솔 앱 실행
python main.py
```
