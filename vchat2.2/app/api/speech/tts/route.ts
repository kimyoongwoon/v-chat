import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/speech/tts`, {
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
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in TTS:", error)
    return NextResponse.json({ success: false, error: "Failed to convert text to speech" }, { status: 500 })
  }
}
