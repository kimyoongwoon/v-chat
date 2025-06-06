import { useState, useCallback } from 'react'
import { Message, ChatMode, ChatResponse } from '@/components/chat-config'

interface UseChatProps {
  selectedPersona: string
  onMessagesUpdate: (messages: Message[]) => void
}

export function useChat({ selectedPersona, onMessagesUpdate }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((type: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => {
      const updated = [...prev, newMessage]
      onMessagesUpdate(updated)
      return updated
    })
  }, [onMessagesUpdate])

  const sendMessage = useCallback(async (text: string, mode: ChatMode) => {
    if (!text.trim() || !selectedPersona) return

    addMessage("user", text)
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode,
          persona: selectedPersona,
        }),
      })

      const data: ChatResponse = await response.json()

      if (data.success && data.response) {
        addMessage("assistant", data.response)

        // TTS 모드인 경우 음성 재생
        const shouldPlayAudio = (mode === "text-to-speech" || mode === "speech-to-speech") && data.audio_url
        if (shouldPlayAudio) {
          const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL}${data.audio_url}`)
          audio.play().catch(console.error)
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
  }, [selectedPersona, addMessage])

  const playLastResponse = useCallback(async () => {
    const lastAssistantMessage = messages.filter((m) => m.type === "assistant").pop()
    if (!lastAssistantMessage) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/speech/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastAssistantMessage.content }),
      })

      const data = await response.json()
      if (data.success && data.audio_url) {
        const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL}${data.audio_url}`)
        audio.play().catch(console.error)
      }
    } catch (error) {
      console.error("TTS error:", error)
    }
  }, [messages])

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    playLastResponse,
    hasAssistantMessages: messages.some(m => m.type === "assistant")
  }
} 