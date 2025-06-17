import { type NextRequest, NextResponse } from "next/server"
import { getMySQLConnection, getPgConnection } from "@/lib/db-connections"

export async function POST(request: NextRequest) {
  try {
    const { dialect, query } = await request.json()

    if (!dialect || !query) {
      return NextResponse.json({ error: "Dialect and query are required" }, { status: 400 })
    }

    if (dialect === "mysql") {
      return await executeMySQLQuery(query)
    } else if (dialect === "postgresql") {
      return await executePostgreSQLQuery(query)
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }
  } catch (error) {
    console.error("Execute query error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function executeMySQLQuery(query: string) {
  const pool = await getMySQLConnection()

  try {
    const [results, fields] = await pool.execute(query)

    if (Array.isArray(results)) {
      return NextResponse.json({
        success: true,
        data: results,
        rowCount: results.length,
        message: `Query executed successfully. ${results.length} rows returned.`,
      })
    } else {
      return NextResponse.json({
        success: true,
        affectedRows: (results as any).affectedRows,
        message: `Query executed successfully. ${(results as any).affectedRows} rows affected.`,
      })
    }
  } catch (error) {
    throw new Error(`MySQL error: ${error.message}`)
  }
}

async function executePostgreSQLQuery(query: string) {
  const pool = await getPgConnection()
  const client = await pool.connect()

  try {
    const result = await client.query(query)

    if (result.rows) {
      return NextResponse.json({
        success: true,
        data: result.rows,
        rowCount: result.rowCount,
        message: `Query executed successfully. ${result.rowCount} rows returned.`,
      })
    } else {
      return NextResponse.json({
        success: true,
        affectedRows: result.rowCount,
        message: `Query executed successfully. ${result.rowCount} rows affected.`,
      })
    }
  } catch (error) {
    throw new Error(`PostgreSQL error: ${error.message}`)
  } finally {
    client.release()
  }
}
