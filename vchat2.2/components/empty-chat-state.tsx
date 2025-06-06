"use client"

import { ChatMode } from './chat-config'

interface EmptyChatStateProps {
  selectedPersona: string
  chatMode: ChatMode
}

const getChatModeDisplay = (mode: ChatMode) => {
  switch (mode) {
    case "speech-to-speech":
      return { emoji: "🎤", title: "음성 채팅", subtitle: "음성 버튼을 눌러 말해보세요" }
    case "text-to-speech":
      return { emoji: "🎵", title: "하이브리드 채팅", subtitle: "텍스트를 입력하면 음성으로 들려드려요" }
    default:
      return { emoji: "💬", title: "텍스트 채팅", subtitle: "아래에 메시지를 입력하세요" }
  }
}

export default function EmptyChatState({ selectedPersona, chatMode }: EmptyChatStateProps) {
  const modeDisplay = getChatModeDisplay(chatMode)
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* 메인 아이콘 */}
        <div className="relative mb-8">
          <div className="text-8xl mb-4 animate-bounce">
            {modeDisplay.emoji}
          </div>
          {/* 반짝이는 효과 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-500/20 animate-pulse" />
          </div>
        </div>
        
        {/* 텍스트 */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {selectedPersona ? (
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {selectedPersona}
              </span>
            ) : (
              "페르소나를 선택해주세요"
            )}
          </h2>
          
          {selectedPersona && (
            <div className="space-y-2">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                와 대화를 시작해보세요!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                <span className="text-blue-500">{modeDisplay.emoji}</span>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {modeDisplay.title}
                </span>
              </div>
            </div>
          )}
          
          <p className="text-gray-500 dark:text-gray-400">
            {selectedPersona ? modeDisplay.subtitle : "사이드바에서 페르소나를 선택하거나 새로 생성하세요"}
          </p>
        </div>
        
        {/* 장식 요소 */}
        <div className="mt-12 flex justify-center gap-4">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  )
} 