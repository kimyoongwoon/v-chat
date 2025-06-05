"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import ChatInterface from "@/components/chat-interface"
import PersonaCreator from "@/components/persona-creator"

// Message 타입을 chat-interface.tsx 와 동일하게 정의 (나중에 공통 타입으로 분리 가능)
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentMode, setCurrentMode] = useState<"chat" | "create">("chat")
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [personas, setPersonas] = useState<string[]>([])
  const [allChatHistories, setAllChatHistories] = useState<Record<string, Message[]>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchPersonas()
    }
  }, [user])

  const fetchPersonas = async () => {
    try {
      const response = await fetch("/api/personas")
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data = await response.json()
      const fetchedPersonas = data.personas || []
      setPersonas(fetchedPersonas)

      if (fetchedPersonas.length > 0 && !selectedPersona) {
        setSelectedPersona(fetchedPersonas[0])
      } else if (fetchedPersonas.length === 0 && selectedPersona) {
        setSelectedPersona("")
      }

      // 기존 채팅 기록 초기화 (선택 사항: 필요시 기존 기록 로드 로직 추가)
      const initialHistories: Record<string, Message[]> = {}
      fetchedPersonas.forEach((p: string) => {
        initialHistories[p] = [] // 각 페르소나에 대해 빈 배열로 초기화
      })
      setAllChatHistories(initialHistories)

    } catch (error) {
      console.error("Failed to fetch personas:", error)
      setPersonas([])
      setSelectedPersona("")
      setAllChatHistories({})
    }
  }

  const handlePersonaSelect = async (personaName: string) => {
    try {
      await fetch("/api/personas/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_name: personaName }),
      })
      setSelectedPersona(personaName)
    } catch (error) {
      console.error("Failed to select persona:", error)
    }
  }

  const handlePersonaCreated = () => {
    fetchPersonas()
    setCurrentMode("chat")
  }

  const handleMessagesUpdate = useCallback((updatedMessages: Message[]) => {
    if (selectedPersona) {
      setAllChatHistories(prevHistories => ({
        ...prevHistories,
        [selectedPersona]: updatedMessages,
      }))
    }
  }, [selectedPersona])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    // 로그인하지 않은 사용자는 아무것도 렌더링하지 않거나 로그인 페이지로 리디렉션할 수 있습니다.
    // useEffect에서 이미 처리하고 있으므로 null을 반환해도 괜찮습니다.
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentMode={currentMode} onModeChange={setCurrentMode} selectedPersona={selectedPersona} />

      <div className="flex">
        <Sidebar personas={personas} selectedPersona={selectedPersona} onPersonaSelect={handlePersonaSelect} />

        <main className="flex-1 ml-64">
          {currentMode === "chat" && selectedPersona ? (
            <ChatInterface
              key={selectedPersona} // 페르소나 변경 시 ChatInterface를 새로 마운트
              selectedPersona={selectedPersona}
              initialMessages={allChatHistories[selectedPersona] || []}
              onMessagesUpdate={handleMessagesUpdate}
            />
          ) : currentMode === "create" ? (
            <div className="min-h-screen bg-white pt-16">
              <PersonaCreator onPersonaCreated={handlePersonaCreated} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xl text-gray-500">페르소나를 선택해주세요.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
