import { type NextRequest, NextResponse } from "next/server"
import { getMySQLConnection, getPgConnection } from "@/lib/db-connections"

export async function DELETE(request: NextRequest) {
  try {
    const { dialect, tableName } = await request.json()

    if (!dialect || !tableName) {
      return NextResponse.json({ error: "Dialect and table name are required" }, { status: 400 })
    }

    if (dialect === "mysql") {
      return await deleteMySQLTable(tableName)
    } else if (dialect === "postgresql") {
      return await deletePostgreSQLTable(tableName)
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete table error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function deleteMySQLTable(tableName: string) {
  const pool = await getMySQLConnection()

  try {
    await pool.execute(`DROP TABLE IF EXISTS \`${tableName}\``)

    return NextResponse.json({
      success: true,
      message: `Table '${tableName}' deleted successfully`,
    })
  } catch (error) {
    throw new Error(`MySQL error: ${error.message}`)
  }
}

async function deletePostgreSQLTable(tableName: string) {
  const pool = await getPgConnection()
  const client = await pool.connect()

  try {
    await client.query(`DROP TABLE IF EXISTS "${tableName}"`)

    return NextResponse.json({
      success: true,
      message: `Table '${tableName}' deleted successfully`,
    })
  } catch (error) {
    throw new Error(`PostgreSQL error: ${error.message}`)
  } finally {
    client.release()
  }
}
