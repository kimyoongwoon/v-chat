"use client"

import { ANIMATION_CONFIG } from './chat-config'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[80%] md:max-w-[70%]">
        <div className="
          relative px-6 py-4 rounded-3xl rounded-bl-lg
          bg-white dark:bg-gray-800 
          border-2 border-gray-100 dark:border-gray-700
          shadow-lg transition-all duration-300
          animate-pulse
        ">
          {/* 말풍선 꼬리 */}
          <div className="
            absolute bottom-0 -left-1 w-4 h-4 transform rotate-45
            bg-white dark:bg-gray-800 border-l-2 border-b-2 
            border-gray-100 dark:border-gray-700
          " />
          
          {/* 타이핑 애니메이션 */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-bounce"
                style={{ animationDelay: `${ANIMATION_CONFIG.BOUNCE_DELAY_INCREMENT_MS}ms` }}
              />
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-bounce"
                style={{ animationDelay: `${ANIMATION_CONFIG.BOUNCE_DELAY_INCREMENT_MS * 2}ms` }}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              AI가 답변을 생성하고 있어요...
            </span>
          </div>
          
          {/* 반짝이는 효과 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
} 