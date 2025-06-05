"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface PersonaCreatorProps {
  onPersonaCreated: () => void
}

export default function PersonaCreator({ onPersonaCreated }: PersonaCreatorProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    voiceId: "",
    modelId: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.url.trim()) {
      setStatus("error")
      setMessage("이름과 URL은 필수 입력 항목입니다.")
      return
    }

    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/personas/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(`${formData.name} 페르소나가 성공적으로 생성되었습니다!`)
        setFormData({ name: "", url: "", voiceId: "", modelId: "" })
        onPersonaCreated()
      } else {
        setStatus("error")
        setMessage(data.error || "페르소나 생성에 실패했습니다.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("네트워크 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (status !== "idle") {
      setStatus("idle")
      setMessage("")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">새 페르소나 생성</CardTitle>
          <CardDescription>웹페이지 URL을 통해 새로운 AI 페르소나를 생성합니다.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">페르소나 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="예: 둥그레, 릴파, 아이네..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">참조 URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://namu.wiki/w/..."
                disabled={isLoading}
              />
              <p className="text-sm text-gray-600">페르소나 정보가 있는 웹페이지 URL을 입력하세요 (나무위키 등)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voiceId">Voice ID (선택사항)</Label>
                <Input
                  id="voiceId"
                  value={formData.voiceId}
                  onChange={(e) => handleInputChange("voiceId", e.target.value)}
                  placeholder="기본값 사용"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelId">Model ID (선택사항)</Label>
                <Input
                  id="modelId"
                  value={formData.modelId}
                  onChange={(e) => handleInputChange("modelId", e.target.value)}
                  placeholder="기본값 사용"
                  disabled={isLoading}
                />
              </div>
            </div>

            {status !== "idle" && (
              <Alert className={status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={status === "success" ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  페르소나 생성 중...
                </>
              ) : (
                "페르소나 생성"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 생성 팁</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 나무위키나 공식 프로필 페이지 URL을 사용하면 더 정확한 페르소나가 생성됩니다</li>
              <li>• 생성 과정은 1-2분 정도 소요될 수 있습니다</li>
              <li>• Voice ID와 Model ID는 고급 설정이므로 비워두셔도 됩니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
