import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/speech/record`, {
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