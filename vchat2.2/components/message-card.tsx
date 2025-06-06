"use client"

import { Message } from './chat-config'
import { formatTime } from '@/lib/utils'

interface MessageCardProps {
  message: Message
  isUser: boolean
}

export default function MessageCard({ message, isUser }: MessageCardProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`max-w-[80%] md:max-w-[70%] group`}>
        {/* 말풍선 */}
        <div
          className={`
            relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-300
            ${isUser 
              ? `
                bg-gradient-to-br from-pink-500 to-purple-600 text-white
                rounded-br-lg shadow-pink-200 dark:shadow-pink-900/50
                hover:shadow-xl hover:scale-[1.02]
              ` 
              : `
                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                border-2 border-gray-100 dark:border-gray-700
                rounded-bl-lg shadow-gray-200 dark:shadow-gray-900/50
                hover:shadow-xl hover:scale-[1.02] hover:border-pink-200 dark:hover:border-pink-700
              `
            }
          `}
        >
          {/* 말풍선 꼬리 */}
          <div
            className={`
              absolute bottom-0 w-4 h-4 transform rotate-45
              ${isUser 
                ? `
                  -right-1 bg-gradient-to-br from-pink-500 to-purple-600
                ` 
                : `
                  -left-1 bg-white dark:bg-gray-800 border-l-2 border-b-2 
                  border-gray-100 dark:border-gray-700
                `
              }
            `}
          />
          
          {/* 메시지 내용 */}
          <div className="relative z-10">
            <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {message.content}
            </p>
          </div>
          
          {/* 시간 표시 */}
          <div className={`
            flex items-center gap-2 mt-3 pt-2 text-xs
            ${isUser 
              ? 'text-pink-100 border-t border-pink-400/30' 
              : 'text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600'
            }
          `}>
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-pink-200"></div>
                <div className="w-1 h-1 rounded-full bg-pink-200"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* 호버 효과 */}
        <div className={`
          absolute inset-0 rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none
          ${isUser 
            ? 'bg-gradient-to-br from-pink-400/20 to-purple-500/20' 
            : 'bg-gradient-to-br from-blue-400/10 to-indigo-500/10'
          }
        `} />
      </div>
    </div>
  )
} 