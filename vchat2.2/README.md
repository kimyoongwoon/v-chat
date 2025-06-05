# VChat Web Application

AI 페르소나와 대화할 수 있는 웹 애플리케이션입니다.

## 기능

- 🔐 Google 로그인
- 🎭 페르소나 생성 및 관리
- 💬 텍스트 채팅 (Text-to-Text)
- 🎤 음성 채팅 (Speech-to-Speech)
- 🔊 텍스트-음성 변환 (Text-to-Speech)

## 설치 및 실행

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

\`\`\`env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BACKEND_URL=http://localhost:8000
\`\`\`

### 3. 백엔드 실행

\`\`\`bash
npm run backend
\`\`\`

### 4. 프론트엔드 실행

\`\`\`bash
npm run dev
\`\`\`

## 사용법

1. Google 계정으로 로그인
2. 사이드바에서 페르소나 선택 또는 새 페르소나 생성
3. 상단바에서 "페르소나 실행" 또는 "페르소나 생성" 모드 선택
4. 채팅 모드 선택 (텍스트↔텍스트, 음성↔음성, 텍스트→음성)
5. AI 페르소나와 대화 시작!

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **Authentication**: NextAuth.js (Google OAuth)
- **AI**: OpenAI GPT, ElevenLabs TTS
- **UI Components**: Radix UI, shadcn/ui
