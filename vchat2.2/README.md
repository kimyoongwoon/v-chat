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

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend URL
BACKEND_URL=http://localhost:8000

# AI API Keys
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Firebase 설정 (Frontend용)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase 서비스 계정 키 (Backend용, 선택사항)
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
```

**중요**:

-   `NEXT_PUBLIC_` 접두사가 있는 환경변수는 클라이언트 사이드에서 사용됩니다
-   `FIREBASE_SERVICE_ACCOUNT_KEY`는 서버 사이드(Python backend)에서만 사용됩니다
-   서비스 계정 키가 없어도 Google Cloud 환경에서는 자동으로 인증됩니다

### 3. Firebase 설정

1.  [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2.  Firestore Database 활성화
3.  서비스 계정 키 생성 (선택사항)
4.  환경 변수에 Firebase 설정 추가

### 4. 데이터 마이그레이션 (최초 1회)

로컬 `data/personas.json` 데이터를 Firebase로 마이그레이션:

```bash
# 방법 1: 마이그레이션 스크립트 실행
python scripts/migrate_to_firebase.py

# 방법 2: 직접 실행
python -c "
import sys, os
sys.path.append('modules')
from persona_manager import PersonaManager
pm = PersonaManager()
pm.migrate_local_to_firebase()
"
```

### 5. 백엔드 실행

\`\`\`bash
npm run backend
\`\`\`

### 6. 프론트엔드 실행

\`\`\`bash
npm run dev
\`\`\`

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
