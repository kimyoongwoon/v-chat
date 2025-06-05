import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, url, voiceId, modelId } = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/personas/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        url,
        voice_id: voiceId || null,
        model_id: modelId || null,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create persona")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating persona:", error)
    return NextResponse.json({ success: false, error: "Failed to create persona" }, { status: 500 })
  }
}
