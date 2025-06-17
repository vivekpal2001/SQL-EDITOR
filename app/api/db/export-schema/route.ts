import { type NextRequest, NextResponse } from "next/server"
import { getMySQLConnection, getPgConnection } from "../../../../lib/db-connections"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dialect = searchParams.get("dialect")

  if (!dialect) {
    return NextResponse.json({ error: "Dialect parameter is required" }, { status: 400 })
  }

  try {
    if (dialect === "mysql") {
      return await exportMySQLSchema()
    } else if (dialect === "postgresql") {
      return await exportPostgreSQLSchema()
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }
  } catch (error) {
    console.error("Export schema error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function exportMySQLSchema() {
  const pool = await getMySQLConnection()

  try {
    const [tables] = (await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    )) as any[]

    let schema = `-- MySQL Schema Export\n-- Generated on ${new Date().toISOString()}\n\n`

    for (const table of tables) {
      const tableName = table.TABLE_NAME
      const [createResult] = (await pool.execute(`SHOW CREATE TABLE \`${tableName}\``)) as any[]
      schema += `${createResult[0]["Create Table"]};\n\n`
    }

    return new Response(schema, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": 'attachment; filename="mysql_schema.sql"',
      },
    })
  } catch (error) {
    throw new Error(`MySQL error: ${error.message}`)
  }
}

async function exportPostgreSQLSchema() {
  const pool = await getPgConnection()
  const client = await pool.connect()

  try {
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
    )

    let schema = `-- PostgreSQL Schema Export\n-- Generated on ${new Date().toISOString()}\n\n`

    for (const table of tablesResult.rows) {
      const tableName = table.table_name

      // Get column definitions
      const columnsResult = await client.query(
        `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName],
      )

      schema += `CREATE TABLE "${tableName}" (\n`

      const columnDefs = columnsResult.rows.map((col: any) => {
        let def = `  "${col.column_name}" ${col.data_type}`

        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`
        }

        if (col.is_nullable === "NO") {
          def += " NOT NULL"
        }

        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`
        }

        return def
      })

      schema += columnDefs.join(",\n")
      schema += "\n);\n\n"
    }

    return new Response(schema, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": 'attachment; filename="postgresql_schema.sql"',
      },
    })
  } catch (error) {
    throw new Error(`PostgreSQL error: ${error.message}`)
  } finally {
    client.release()
  }
}
