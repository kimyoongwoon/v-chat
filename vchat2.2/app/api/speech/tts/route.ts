import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/speech/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error("Failed to convert text to speech")
    }

    const data = await response.json()
    
    // 중요: 백엔드 URL을 포함한 전체 경로로 변환
    if (data.success && data.audio_url) {
      data.audio_url = `${BACKEND_URL}${data.audio_url}`;
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in TTS:", error)
    return NextResponse.json({ success: false, error: "Failed to convert text to speech" }, { status: 500 })
  }
}