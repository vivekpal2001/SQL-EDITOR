import { type NextRequest, NextResponse } from "next/server"
import { checkMySQLConnection, checkPgConnection } from "@/lib/db-connections"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dialect = searchParams.get("dialect")

  if (!dialect) {
    return NextResponse.json({ error: "Dialect parameter is required" }, { status: 400 })
  }

  try {
    let connected = false
    const error = null

    if (dialect === "mysql") {
      connected = await checkMySQLConnection()
    } else if (dialect === "postgresql") {
      connected = await checkPgConnection()
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }

    return NextResponse.json({
      connected,
      dialect,
      timestamp: new Date().toISOString(),
      ...(error && { error }),
    })
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error.message,
        dialect,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
