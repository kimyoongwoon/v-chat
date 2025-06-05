import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, mode, persona } = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        mode,
        persona,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get chat response")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json({ success: false, error: "Failed to get chat response" }, { status: 500 })
  }
}
