"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, UserPlus, LogOut } from "lucide-react"

interface HeaderProps {
  currentMode: "chat" | "create"
  onModeChange: (mode: "chat" | "create") => void
  selectedPersona: string
}

export default function Header({ currentMode, onModeChange, selectedPersona }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            VChat
          </h1>

          <div className="flex space-x-2">
            <Button
              variant={currentMode === "chat" ? "default" : "outline"}
              onClick={() => onModeChange("chat")}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>페르소나 실행</span>
            </Button>

            <Button
              variant={currentMode === "create" ? "default" : "outline"}
              onClick={() => onModeChange("create")}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>페르소나 생성</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedPersona && (
            <div className="text-sm text-gray-600">
              현재 페르소나: <span className="font-medium text-purple-600">{selectedPersona}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                  <AvatarFallback>{user?.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
