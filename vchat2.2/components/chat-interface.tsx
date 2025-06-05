"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Mic, MicOff, Volume2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  selectedPersona: string
}

export default function ChatInterface({ selectedPersona }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<"text-to-text" | "speech-to-speech" | "text-to-speech">("text-to-text")
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

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
      const response = await fetch("/api/chat", {
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
          const audio = new Audio(data.audio_url)
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
      setIsRecording(false)
      // 음성 녹음 중지 및 처리
      try {
        const response = await fetch("/api/speech/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stop" }),
        })

        const data = await response.json()
        if (data.success && data.transcription) {
          handleTextSubmit(data.transcription)
        }
      } catch (error) {
        console.error("Voice recording error:", error)
      }
    } else {
      setIsRecording(true)
      // 음성 녹음 시작
      try {
        await fetch("/api/speech/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        })
      } catch (error) {
        console.error("Voice recording start error:", error)
        setIsRecording(false)
      }
    }
  }

  const playLastResponse = () => {
    const lastAssistantMessage = messages.filter((m) => m.type === "assistant").pop()
    if (lastAssistantMessage) {
      // TTS API 호출
      fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastAssistantMessage.content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.audio_url) {
            const audio = new Audio(data.audio_url)
            audio.play()
          }
        })
        .catch((error) => console.error("TTS error:", error))
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      {/* 모드 선택 */}
      <div className="mb-4">
        <Select value={chatMode} onValueChange={(value: any) => setChatMode(value)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="대화 모드 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-to-text">텍스트 → 텍스트</SelectItem>
            <SelectItem value="speech-to-speech">음성 → 음성</SelectItem>
            <SelectItem value="text-to-speech">텍스트 → 음성</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 채팅 영역 */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">
                  {selectedPersona ? `${selectedPersona}와 대화를 시작해보세요!` : "페르소나를 선택해주세요"}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.type === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 입력 영역 */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                chatMode === "speech-to-speech"
                  ? "음성 버튼을 눌러 말해보세요..."
                  : `${selectedPersona}에게 메시지를 입력하세요...`
              }
              disabled={isLoading || chatMode === "speech-to-speech"}
              className="flex-1"
            />

            {chatMode === "speech-to-speech" ? (
              <Button
                type="button"
                onClick={handleVoiceRecord}
                disabled={isLoading}
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}

            {(chatMode === "text-to-speech" || chatMode === "speech-to-speech") && (
              <Button
                type="button"
                onClick={playLastResponse}
                variant="outline"
                disabled={messages.filter((m) => m.type === "assistant").length === 0}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </Card>
    </div>
  )
}
