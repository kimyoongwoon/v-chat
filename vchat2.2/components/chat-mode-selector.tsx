"use client"

import { ChatMode } from './chat-config'

interface ChatModeSelectorProps {
  chatMode: ChatMode
  onModeChange: (mode: ChatMode) => void
  compact?: boolean
}

const CHAT_MODE_OPTIONS = [
  {
    value: "text-to-text" as const,
    label: "📝 텍스트 채팅",
    description: "텍스트로 입력하고 텍스트로 응답받기",
    emoji: "💬",
    shortLabel: "텍스트"
  },
  {
    value: "speech-to-speech" as const,
    label: "🎤 음성 채팅",
    description: "음성으로 입력하고 음성으로 응답받기",
    emoji: "🗣️",
    shortLabel: "음성"
  },
  {
    value: "text-to-speech" as const,
    label: "🔊 하이브리드",
    description: "텍스트로 입력하고 음성으로 응답받기",
    emoji: "🎵",
    shortLabel: "하이브리드"
  }
]

export default function ChatModeSelector({ chatMode, onModeChange, compact = false }: ChatModeSelectorProps) {
  if (compact) {
    return (
      <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 p-3 rounded-xl shadow-md border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse"></div>
          <h3 className="text-xs font-medium text-gray-800 dark:text-gray-200">
            채팅 모드
          </h3>
        </div>
        
        <div className="flex gap-1">
          {CHAT_MODE_OPTIONS.map((option) => {
            const isSelected = chatMode === option.value
            return (
              <button
                key={option.value}
                onClick={() => onModeChange(option.value)}
                className={`
                  relative px-2 py-1.5 rounded-lg transition-all duration-300 text-center
                  border group hover:scale-[1.02]
                  ${isSelected 
                    ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-pink-300 dark:hover:border-pink-600'
                  }
                `}
                title={option.description}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-500/10 rounded-lg animate-pulse"></div>
                )}
                
                <div className="relative z-10 flex items-center gap-1">
                  <span className="text-sm">{option.emoji}</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {option.shortLabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-4 rounded-2xl shadow-md border border-white/20 dark:border-gray-700/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse"></div>
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
          채팅 모드
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {CHAT_MODE_OPTIONS.map((option) => {
          const isSelected = chatMode === option.value
          return (
            <button
              key={option.value}
              onClick={() => onModeChange(option.value)}
              className={`
                relative p-3 rounded-xl transition-all duration-300 text-center
                border group hover:scale-[1.02] hover:shadow-md
                ${isSelected 
                  ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-pink-300 dark:hover:border-pink-600'
                }
              `}
              title={option.description}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-500/10 rounded-xl animate-pulse"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {option.label.split(' ')[1]}
                  </span>
                  {isSelected && (
                    <div className="w-1 h-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}