"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Volume2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  selectedPersona: string
  initialMessages: Message[]
  onMessagesUpdate: (messages: Message[]) => void
}

export default function ChatInterface({
  selectedPersona,
  initialMessages,
  onMessagesUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"text-to-text" | "speech-to-speech" | "text-to-speech">("text-to-text")
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // messages 상태가 변경될 때마다 부모에게 알림
    onMessagesUpdate(messages)
  }, [messages, onMessagesUpdate])

  const addMessage = (type: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleTextSubmit = async (text: string) => {
    if (!text.trim() || !selectedPersona) return

    addMessage("user", text)
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: chatMode,
          persona: selectedPersona,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addMessage("assistant", data.response)

        // TTS 모드인 경우 음성 재생
        if (chatMode === "text-to-speech" && data.audio_url) {
          const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL}${data.audio_url}`)
          audio.play()
        }
      } else {
        addMessage("assistant", "죄송해요, 응답을 생성하는데 문제가 발생했어요.")
      }
    } catch (error) {
      console.error("Chat error:", error)
      addMessage("assistant", "네트워크 오류가 발생했어요. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleTextSubmit(inputValue)
    setInputValue("")
  }

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // 녹음 중지
      setIsRecording(false)
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    } else {
      // 녹음 시작
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        })
        
        audioChunksRef.current = []
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        })
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }
        
        mediaRecorder.onstop = async () => {
          // 스트림 정리
          stream.getTracks().forEach(track => track.stop())
          
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            await uploadAudioForTranscription(audioBlob)
          }
        }
        
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start(1000) // 1초마다 데이터 수집
        setIsRecording(true)
        
      } catch (error) {
        console.error("마이크 접근 권한이 필요합니다:", error)
        alert("마이크 접근 권한을 허용해주세요.")
      }
    }
  }

  const uploadAudioForTranscription = async (audioBlob: Blob) => {
    try {
      setIsLoading(true)
      console.log('🎤 음성 파일 업로드 시작:', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      console.log('📡 Backend URL:', `${backendUrl}/api/speech/upload`)
      
      const response = await fetch(`${backendUrl}/api/speech/upload`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      console.log('📝 STT 결과:', data)
      
      if (data.success && data.transcription) {
        // 음성 인식 결과를 텍스트로 표시하고 AI 응답 요청
        console.log('✅ 음성 인식 성공:', data.transcription)
        addMessage("user", `🎤 ${data.transcription}`)
        
        // AI 응답 요청
        const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: data.transcription,
            mode: chatMode,
            persona: selectedPersona,
          }),
        })

        const chatData = await chatResponse.json()

        if (chatData.success) {
          addMessage("assistant", chatData.response)

          // 음성 모드인 경우 TTS 재생
          if (chatMode === "speech-to-speech" && chatData.audio_url) {
            const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL}${chatData.audio_url}`)
            audio.play()
          }
        } else {
          addMessage("assistant", "죄송해요, 응답을 생성하는데 문제가 발생했어요.")
        }
      } else {
        console.error("음성 인식 실패:", data)
        addMessage("assistant", "음성을 인식하지 못했어요. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error("음성 업로드 오류:", error)
      addMessage("assistant", "음성 처리 중 오류가 발생했어요. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const playLastResponse = () => {
    const lastAssistantMessage = messages.filter((m) => m.type === "assistant").pop()
    if (lastAssistantMessage) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/speech/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastAssistantMessage.content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.audio_url) {
            const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL}${data.audio_url}`)
            audio.play()
          }
        })
        .catch((error) => console.error("TTS error:", error))
    }
  }

  return (
    <div className="flex flex-col h-screen pt-20 pb-4 pr-6 pl-6">
      {/* 헤더 높이만큼 패딩 추가 (pt-20 = 80px) */}
      
      {/* 모드 선택 */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대화 모드 선택
        </label>
        <select 
          value={chatMode} 
          onChange={(e) => setChatMode(e.target.value as any)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="text-to-text">📝 텍스트 → 텍스트</option>
          <option value="speech-to-speech">🎤 음성 → 음성</option>
          <option value="text-to-speech">📝 텍스트 → 🔊 음성</option>
        </select>
        <p className="text-sm text-gray-600 mt-2">
          {chatMode === "text-to-text" && "텍스트로 입력하고 텍스트로 응답받기"}
          {chatMode === "speech-to-speech" && "음성으로 입력하고 음성으로 응답받기"}
          {chatMode === "text-to-speech" && "텍스트로 입력하고 음성으로 응답받기"}
        </p>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm min-h-0">
        <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">
                  {chatMode === "text-to-text" ? "📝" : 
                   chatMode === "speech-to-speech" ? "🎤" : "🔊"}
                </div>
                <p className="text-lg font-medium mb-2">
                  {selectedPersona ? `${selectedPersona}와 대화를 시작해보세요!` : "페르소나를 선택해주세요"}
                </p>
                <p className="text-sm text-gray-400">
                  {chatMode === "speech-to-speech" ? "음성 버튼을 눌러 말해보세요" : "아래에 메시지를 입력하세요"}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                    message.type === "user" 
                      ? "bg-purple-600 text-white" 
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="border-t bg-gray-50 p-4 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  chatMode === "speech-to-speech"
                    ? "음성 버튼을 눌러 말해보세요..."
                    : `${selectedPersona || '페르소나'}에게 메시지를 입력하세요...`
                }
                disabled={isLoading || chatMode === "speech-to-speech"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-500"
              />
              {isRecording && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">녹음중</span>
                  </div>
                </div>
              )}
            </div>

            {chatMode === "speech-to-speech" ? (
              <button
                type="button"
                onClick={handleVoiceRecord}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isRecording 
                    ? "bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-lg" 
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRecording ? "녹음 중지 및 전송" : "음성 녹음 시작"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span className="text-sm">중지</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span className="text-sm">녹음</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            )}

            {(chatMode === "text-to-speech" || chatMode === "speech-to-speech") && (
              <button
                type="button"
                onClick={playLastResponse}
                disabled={messages.filter((m) => m.type === "assistant").length === 0}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                title="마지막 응답 다시 듣기"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            )}
          </form>
          
          {/* 도움말 텍스트 */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {chatMode === "speech-to-speech" && "🎤 음성 버튼을 눌러 말하고, 다시 눌러서 전송하세요"}
              {chatMode === "text-to-speech" && "📝 입력한 텍스트를 음성으로 들을 수 있어요"}
              {chatMode === "text-to-text" && "💬 Enter 키를 눌러서 메시지를 전송하세요"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}