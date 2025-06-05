import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET() {
    try {
        console.log(`🔗 Connecting to backend: ${BACKEND_URL}/api/personas`);

        const response = await fetch(`${BACKEND_URL}/api/personas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000), // 10초 타임아웃
        });

        if (!response.ok) {
            throw new Error(
                `Backend responded with ${response.status}: ${response.statusText}`
            );
        }

        const data = await response.json();
        console.log(
            `✅ Successfully fetched ${data.personas?.length || 0} personas`
        );
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("❌ Failed to fetch personas:", error.message);

        // 연결 거부 에러의 경우 특별한 메시지 반환
        if (
            error.message.includes("ECONNREFUSED") ||
            error.code === "ECONNREFUSED"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Backend server is not running. Please start the Python backend first.",
                    details: `Cannot connect to ${BACKEND_URL}`,
                },
                { status: 503 } // Service Unavailable
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch personas",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
