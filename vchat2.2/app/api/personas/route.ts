import { NextResponse } from "next/server"

export async function GET() {
  try {
    // FastAPI 백엔드 호출
    const response = await fetch(`${process.env.BACKEND_URL}/api/personas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch personas")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching personas:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch personas" }, { status: 500 })
  }
}
