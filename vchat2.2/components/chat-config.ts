// 오디오 설정 상수들
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNEL_COUNT: 1,
  RECORDING_INTERVAL_MS: 1000,
  MIME_TYPE: 'audio/webm;codecs=opus'
} as const

// 애니메이션 상수들
export const ANIMATION_CONFIG = {
  TYPING_INDICATOR_DELAY_MS: 100,
  BOUNCE_DELAY_INCREMENT_MS: 100,
  SCROLL_BEHAVIOR: 'smooth' as const
} as const

// UI 상수들
export const UI_CONFIG = {
  MAX_MESSAGE_WIDTH_PERCENT: 70,
  HEADER_HEIGHT_PX: 80,
  MESSAGE_TIMESTAMP_FORMAT: 'HH:mm'
} as const

// 메시지 타입
export interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

// 채팅 모드 타입
export type ChatMode = "text-to-text" | "speech-to-speech" | "text-to-speech"

// 채팅 인터페이스 Props 타입
export interface ChatInterfaceProps {
  selectedPersona: string
  initialMessages: Message[]
  onMessagesUpdate: (messages: Message[]) => void
}

// API 응답 타입
export interface ChatResponse {
  success: boolean
  response?: string
  audio_url?: string
  error?: string
}

export interface STTResponse {
  success: boolean
  transcription?: string
  error?: string
} 