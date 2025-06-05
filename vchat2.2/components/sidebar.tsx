"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "lucide-react"

interface SidebarProps {
  personas: string[]
  selectedPersona: string
  onPersonaSelect: (persona: string) => void
}

export default function Sidebar({ personas, selectedPersona, onPersonaSelect }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-40">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">페르소나 목록</h2>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {personas.map((persona) => (
              <Button
                key={persona}
                variant={selectedPersona === persona ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onPersonaSelect(persona)}
              >
                <User className="mr-2 h-4 w-4" />
                {persona}
              </Button>
            ))}

            {personas.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>생성된 페르소나가 없습니다</p>
                <p className="text-sm">페르소나를 생성해보세요</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
