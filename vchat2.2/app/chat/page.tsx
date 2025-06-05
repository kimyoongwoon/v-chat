"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import ChatInterface from "@/components/chat-interface"
import PersonaCreator from "@/components/persona-creator"

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentMode, setCurrentMode] = useState<"chat" | "create">("chat")
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [personas, setPersonas] = useState<string[]>([])

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
      const data = await response.json()
      setPersonas(data.personas || [])
      if (data.personas.length > 0 && !selectedPersona) {
        setSelectedPersona(data.personas[0])
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentMode={currentMode} onModeChange={setCurrentMode} selectedPersona={selectedPersona} />

      <div className="flex">
        <Sidebar personas={personas} selectedPersona={selectedPersona} onPersonaSelect={handlePersonaSelect} />

        <main className="flex-1 ml-64">
          {currentMode === "chat" ? (
            <ChatInterface selectedPersona={selectedPersona} />
          ) : (
            <div className="min-h-screen bg-white pt-16">
              <PersonaCreator onPersonaCreated={handlePersonaCreated} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
