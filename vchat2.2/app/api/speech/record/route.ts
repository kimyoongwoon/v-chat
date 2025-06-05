import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/speech/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    })

    if (!response.ok) {
      throw new Error("Failed to handle speech recording")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in speech recording:", error)
    return NextResponse.json({ success: false, error: "Failed to handle speech recording" }, { status: 500 })
  }
}
