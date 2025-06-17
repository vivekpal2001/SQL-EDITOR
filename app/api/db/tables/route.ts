import { type NextRequest, NextResponse } from "next/server"
import { getMySQLConnection, getPgConnection } from "@/lib/db-connections"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dialect = searchParams.get("dialect")

  if (!dialect) {
    return NextResponse.json({ error: "Dialect parameter is required" }, { status: 400 })
  }

  try {
    if (dialect === "mysql") {
      return await getMySQLTables()
    } else if (dialect === "postgresql") {
      return await getPostgreSQLTables()
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }
  } catch (error) {
    console.error("Get tables error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getMySQLTables() {
  const pool = await getMySQLConnection()

  try {
    // Get table names
    const [tables] = (await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    )) as any[]

    const result: Record<string, any> = {}

    for (const table of tables) {
      const tableName = table.TABLE_NAME

      // Get column information
      const [columns] = (await pool.execute(
        `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, COLUMN_TYPE
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [tableName],
      )) as any[]

      // Get sample data
      const [data] = (await pool.execute(`SELECT * FROM \`${tableName}\` LIMIT 10`)) as any[]

      // Get CREATE TABLE statement
      const [createResult] = (await pool.execute(`SHOW CREATE TABLE \`${tableName}\``)) as any[]
      const createStatement = createResult[0]["Create Table"]

      result[tableName] = {
        columns: columns.map((col: any) => ({
          name: col.COLUMN_NAME,
          type: col.COLUMN_TYPE,
          nullable: col.IS_NULLABLE === "YES",
          key: col.COLUMN_KEY,
          default: col.COLUMN_DEFAULT,
        })),
        data: data,
        createStatement: createStatement,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    throw new Error(`MySQL error: ${error.message}`)
  }
}

async function getPostgreSQLTables() {
  const pool = await getPgConnection()
  const client = await pool.connect()

  try {
    // First, test the connection
    await client.query("SELECT 1")

    // Get table names
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    )

    const result: Record<string, any> = {}

    for (const table of tablesResult.rows) {
      const tableName = table.table_name

      try {
        // Get column information
        const columnsResult = await client.query(
          `SELECT 
             c.column_name, 
             c.data_type, 
             c.is_nullable, 
             c.column_default,
             CASE 
               WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'PRI' 
               WHEN tc.constraint_type = 'UNIQUE' THEN 'UNI'
               ELSE '' 
             END as column_key
           FROM information_schema.columns c
           LEFT JOIN information_schema.key_column_usage kcu 
             ON c.table_name = kcu.table_name 
             AND c.column_name = kcu.column_name
             AND c.table_schema = kcu.table_schema
           LEFT JOIN information_schema.table_constraints tc 
             ON kcu.constraint_name = tc.constraint_name
             AND kcu.table_schema = tc.table_schema
           WHERE c.table_schema = 'public' AND c.table_name = $1
           ORDER BY c.ordinal_position`,
          [tableName],
        )

        // Get sample data
        const dataResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 10`)

        // Get CREATE TABLE statement (simplified for PostgreSQL)
        const createStatement = `-- Table: ${tableName}\n-- Use \\d+ ${tableName} in psql for full details`

        result[tableName] = {
          columns: columnsResult.rows.map((col: any) => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === "YES",
            key: col.column_key,
            default: col.column_default,
          })),
          data: dataResult.rows,
          createStatement: createStatement,
        }
      } catch (tableError) {
        console.error(`Error processing table ${tableName}:`, tableError)
        // Skip this table and continue with others
        continue
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("PostgreSQL tables error:", error)
    throw new Error(`PostgreSQL error: ${error.message}`)
  } finally {
    client.release()
  }
}
