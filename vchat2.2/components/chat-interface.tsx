"use client"

import { useState, useRef, useEffect } from "react"
import { ChatInterfaceProps, ChatMode, UI_CONFIG } from './chat-config'
import { useChat } from '@/hooks/use-chat'
import { useVoiceRecording } from '@/hooks/use-voice-recording'
import ChatModeSelector from './chat-mode-selector'
import MessageCard from './message-card'
import TypingIndicator from './typing-indicator'
import ChatInput from './chat-input'
import EmptyChatState from './empty-chat-state'

export default function ChatInterface({
  selectedPersona,
  initialMessages,
  onMessagesUpdate,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [chatMode, setChatMode] = useState<ChatMode>("text-to-text")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 커스텀 훅들
  const { 
    messages, 
    setMessages, 
    isLoading, 
    sendMessage, 
    playLastResponse, 
    hasAssistantMessages 
  } = useChat({ selectedPersona, onMessagesUpdate })

  const { 
    isRecording, 
    toggleRecording 
  } = useVoiceRecording()

  // 초기 메시지 설정
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages, setMessages])

  // 자동 스크롤
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // 텍스트 메시지 전송
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    await sendMessage(inputValue, chatMode)
    setInputValue("")
  }

  // 음성 녹음 토글
  const handleVoiceToggle = async () => {
    const transcription = await toggleRecording()
    
    if (transcription) {
      await sendMessage(`🎤 ${transcription}`, chatMode)
    } else if (transcription === null && !isRecording) {
      // 녹음 실패 처리는 이미 useVoiceRecording에서 처리됨
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* 버튜버 스타일 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-pink-50/50 dark:from-blue-900/10 dark:to-pink-900/10" />
      
      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col h-full pt-20 pb-4 px-6">
        {/* 채팅 모드 선택 */}
        <div className="mb-6">
          <ChatModeSelector 
            chatMode={chatMode} 
            onModeChange={setChatMode} 
          />
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 flex flex-col backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl min-h-0 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto" ref={scrollAreaRef}>
            {!hasMessages ? (
              <EmptyChatState 
                selectedPersona={selectedPersona} 
                chatMode={chatMode} 
              />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    isUser={message.type === "user"}
                  />
                ))}

                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={handleTextSubmit}
            onVoiceToggle={handleVoiceToggle}
            onPlayLast={playLastResponse}
            chatMode={chatMode}
            selectedPersona={selectedPersona}
            isLoading={isLoading}
            isRecording={isRecording}
            hasAssistantMessages={hasAssistantMessages}
          />
        </div>
      </div>

      {/* 장식 요소들 */}
      <div className="absolute top-32 left-8 w-4 h-4 rounded-full bg-pink-300/30 animate-pulse" />
      <div className="absolute top-48 right-12 w-3 h-3 rounded-full bg-purple-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-16 w-2 h-2 rounded-full bg-indigo-300/30 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-48 right-8 w-5 h-5 rounded-full bg-blue-300/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}