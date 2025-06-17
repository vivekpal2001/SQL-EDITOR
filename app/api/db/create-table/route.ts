import { type NextRequest, NextResponse } from "next/server"
import { getMySQLConnection, getPgConnection } from "../../../../lib/db-connections"
import { generateDummyData } from "../../../../lib/dummy-data-generator"

export async function POST(request: NextRequest) {
  try {
    const { dialect, table } = await request.json()

    if (!dialect || !table) {
      return NextResponse.json({ error: "Dialect and table definition are required" }, { status: 400 })
    }

    if (dialect === "mysql") {
      return await createMySQLTable(table)
    } else if (dialect === "postgresql") {
      return await createPostgreSQLTable(table)
    } else {
      return NextResponse.json({ error: "Unsupported dialect" }, { status: 400 })
    }
  } catch (error) {
    console.error("Create table error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function createMySQLTable(table: any) {
  const pool = await getMySQLConnection()

  try {
    // Build CREATE TABLE statement
    let sql = `CREATE TABLE \`${table.name}\` (\n`

    const columnDefinitions = table.columns.map((col: any) => {
      let def = `  \`${col.name}\` ${col.type}`

      if (col.constraints.includes("NOT NULL")) {
        def += " NOT NULL"
      }

      if (col.constraints.includes("PRIMARY KEY")) {
        def += " PRIMARY KEY"
        if (col.type.includes("INT")) {
          def += " AUTO_INCREMENT"
        }
      }

      if (col.constraints.includes("UNIQUE")) {
        def += " UNIQUE"
      }

      return def
    })

    sql += columnDefinitions.join(",\n")
    sql += "\n);"

    // Execute CREATE TABLE
    await pool.execute(sql)

    // Generate and insert dummy data
    const dummyData = generateDummyData(table.columns, 10)

    if (dummyData.length > 0) {
      const columns = table.columns.map((col: any) => `\`${col.name}\``).join(", ")
      const placeholders = table.columns.map(() => "?").join(", ")
      const insertSql = `INSERT INTO \`${table.name}\` (${columns}) VALUES (${placeholders})`

      for (const row of dummyData) {
        const values = table.columns.map((col: any) => row[col.name])
        await pool.execute(insertSql, values)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Table '${table.name}' created successfully with ${dummyData.length} sample rows`,
      sql,
    })
  } catch (error) {
    throw new Error(`MySQL error: ${error.message}`)
  }
}

async function createPostgreSQLTable(table: any) {
  const pool = await getPgConnection()
  const client = await pool.connect()

  try {
    // Build CREATE TABLE statement
    let sql = `CREATE TABLE "${table.name}" (\n`

    const columnDefinitions = table.columns.map((col: any) => {
      let def = `  "${col.name}" ${convertToPostgreSQLType(col.type)}`

      if (col.constraints.includes("PRIMARY KEY")) {
        if (col.type.includes("INT") || col.type === "SERIAL") {
          def = `  "${col.name}" SERIAL PRIMARY KEY`
        } else {
          def += " PRIMARY KEY"
        }
      } else if (col.constraints.includes("NOT NULL")) {
        def += " NOT NULL"
      }

      if (col.constraints.includes("UNIQUE")) {
        def += " UNIQUE"
      }

      return def
    })

    sql += columnDefinitions.join(",\n")
    sql += "\n);"

    // Execute CREATE TABLE
    await client.query(sql)

    // Generate and insert dummy data
    const dummyData = generateDummyData(table.columns, 10)

    if (dummyData.length > 0) {
      const columns = table.columns.map((col: any) => `"${col.name}"`).join(", ")
      const placeholders = table.columns.map((_, index) => `$${index + 1}`).join(", ")
      const insertSql = `INSERT INTO "${table.name}" (${columns}) VALUES (${placeholders})`

      for (const row of dummyData) {
        const values = table.columns.map((col: any) => row[col.name])
        await client.query(insertSql, values)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Table '${table.name}' created successfully with ${dummyData.length} sample rows`,
      sql,
    })
  } catch (error) {
    throw new Error(`PostgreSQL error: ${error.message}`)
  } finally {
    client.release()
  }
}

function convertToPostgreSQLType(mysqlType: string): string {
  const typeMap: Record<string, string> = {
    "VARCHAR(50)": "VARCHAR(50)",
    "VARCHAR(100)": "VARCHAR(100)",
    "VARCHAR(255)": "VARCHAR(255)",
    TEXT: "TEXT",
    LONGTEXT: "TEXT",
    INT: "INTEGER",
    BIGINT: "BIGINT",
    TINYINT: "SMALLINT",
    SMALLINT: "SMALLINT",
    "DECIMAL(10,2)": "NUMERIC(10,2)",
    FLOAT: "REAL",
    DOUBLE: "DOUBLE PRECISION",
    DATE: "DATE",
    DATETIME: "TIMESTAMP",
    TIMESTAMP: "TIMESTAMP",
    BOOLEAN: "BOOLEAN",
    "TINYINT(1)": "BOOLEAN",
  }

  return typeMap[mysqlType] || mysqlType
}
