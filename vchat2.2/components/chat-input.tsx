"use client"

import { Send, Mic, MicOff, Volume2 } from "lucide-react"
import { ChatMode } from './chat-config'

interface ChatInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onVoiceToggle: () => void
  onPlayLast: () => void
  chatMode: ChatMode
  selectedPersona: string
  isLoading: boolean
  isRecording: boolean
  hasAssistantMessages: boolean
}

const getChatModeInfo = (mode: ChatMode) => {
  switch (mode) {
    case "speech-to-speech":
      return {
        placeholder: "음성 버튼을 눌러 말해보세요...",
        helpText: "🎤 음성 버튼을 눌러 말하고, 다시 눌러서 전송하세요",
        emoji: "🗣️"
      }
    case "text-to-speech":
      return {
        placeholder: "",
        helpText: "📝 입력한 텍스트를 음성으로 들을 수 있어요",
        emoji: "🎵"
      }
    default:
      return {
        placeholder: "",
        helpText: "💬 Enter 키를 눌러서 메시지를 전송하세요",
        emoji: "💬"
      }
  }
}

export default function ChatInput({
  inputValue,
  onInputChange,
  onSubmit,
  onVoiceToggle,
  onPlayLast,
  chatMode,
  selectedPersona,
  isLoading,
  isRecording,
  hasAssistantMessages
}: ChatInputProps) {
  const isSpeechMode = chatMode === "speech-to-speech"
  const hasAudioOutput = chatMode === "text-to-speech" || chatMode === "speech-to-speech"
  const modeInfo = getChatModeInfo(chatMode)
  
  const actualPlaceholder = modeInfo.placeholder || 
    `${selectedPersona || '페르소나'}에게 메시지를 입력하세요...`

  return (
    <div className="
      backdrop-blur-md bg-white/90 dark:bg-gray-900/90 
      border-t border-white/20 dark:border-gray-700/30 
      p-6 rounded-b-3xl
    ">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* 입력 영역 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={actualPlaceholder}
              disabled={isLoading || isSpeechMode}
              className="
                w-full px-6 py-4 rounded-2xl text-sm md:text-base
                bg-white/80 dark:bg-gray-800/80 
                border-2 border-gray-200 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                disabled:bg-gray-100 dark:disabled:bg-gray-700
                disabled:text-gray-500 dark:disabled:text-gray-400
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                transition-all duration-300
                hover:border-pink-300 dark:hover:border-pink-600
              "
            />
            
            {/* 녹음 상태 표시 */}
            {isRecording && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">녹음중</span>
                </div>
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex gap-2">
            {/* 음성/텍스트 전송 버튼 */}
            {isSpeechMode ? (
              <button
                type="button"
                onClick={onVoiceToggle}
                disabled={isLoading}
                className={`
                  px-6 py-4 rounded-2xl font-medium transition-all duration-300 
                  flex items-center gap-2 min-w-[100px] justify-center
                  shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                  ${isRecording 
                    ? `
                      bg-gradient-to-r from-red-500 to-red-600 text-white 
                      hover:from-red-600 hover:to-red-700 animate-pulse scale-105
                    ` 
                    : `
                      bg-gradient-to-r from-pink-500 to-purple-600 text-white
                      hover:from-pink-600 hover:to-purple-700 hover:scale-105
                    `
                  }
                `}
                title={isRecording ? "녹음 중지 및 전송" : "음성 녹음 시작"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>중지</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>녹음</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="
                  px-6 py-4 rounded-2xl font-medium transition-all duration-300
                  bg-gradient-to-r from-pink-500 to-purple-600 text-white
                  hover:from-pink-600 hover:to-purple-700 hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl
                  flex items-center justify-center min-w-[60px]
                "
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            )}

            {/* 음성 재생 버튼 */}
            {hasAudioOutput && (
              <button
                type="button"
                onClick={onPlayLast}
                disabled={!hasAssistantMessages}
                className="
                  px-4 py-4 rounded-2xl transition-all duration-300
                  bg-white/80 dark:bg-gray-800/80 
                  border-2 border-gray-200 dark:border-gray-600
                  hover:bg-white dark:hover:bg-gray-700
                  hover:border-pink-300 dark:hover:border-pink-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-md hover:shadow-lg hover:scale-105
                  text-gray-600 dark:text-gray-400
                "
                title="마지막 응답 다시 듣기"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* 도움말 텍스트 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
            <span className="text-sm">{modeInfo.emoji}</span>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {modeInfo.helpText}
            </p>
          </div>
        </div>
      </form>
    </div>
  )
} 