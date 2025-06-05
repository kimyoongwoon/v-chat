import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { persona_name } = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/personas/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ persona_name }),
    })

    if (!response.ok) {
      throw new Error("Failed to select persona")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error selecting persona:", error)
    return NextResponse.json({ success: false, error: "Failed to select persona" }, { status: 500 })
  }
}
