import mysql from "mysql2/promise"
import pg from "pg"

// MySQL connection pool
let mysqlPool: mysql.Pool | null = null

// PostgreSQL connection pool
let pgPool: pg.Pool | null = null

// Get MySQL connection
export async function getMySQLConnection() {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER || "sqluser",
      password: process.env.MYSQL_PASSWORD || "sqlpassword",
      database: process.env.MYSQL_DATABASE || "sqleditor",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    })
  }

  return mysqlPool
}

// Get PostgreSQL connection
export async function getPgConnection() {
  if (!pgPool) {
    pgPool = new pg.Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
      user: process.env.POSTGRES_USER || "sqluser",
      password: process.env.POSTGRES_PASSWORD || "sqlpassword",
      database: process.env.POSTGRES_DATABASE || "sqleditor",
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    // Handle pool errors
    pgPool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err)
    })
  }

  return pgPool
}

// Check MySQL connection
export async function checkMySQLConnection() {
  try {
    const pool = await getMySQLConnection()
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("MySQL connection successful")
    return true
  } catch (error) {
    console.error("MySQL connection error:", error.message)
    return false
  }
}

// Check PostgreSQL connection
export async function checkPgConnection() {
  try {
    const pool = await getPgConnection()
    const client = await pool.connect()

    // Test the connection with a simple query
    await client.query("SELECT 1")
    client.release()

    console.log("PostgreSQL connection successful")
    return true
  } catch (error) {
    console.error("PostgreSQL connection error:", error.message)

    // If connection fails, reset the pool
    if (pgPool) {
      try {
        await pgPool.end()
      } catch (e) {
        console.error("Error closing PostgreSQL pool:", e)
      }
      pgPool = null
    }

    return false
  }
}

// Close all connections
export async function closeConnections() {
  try {
    if (mysqlPool) {
      await mysqlPool.end()
      mysqlPool = null
    }

    if (pgPool) {
      await pgPool.end()
      pgPool = null
    }
  } catch (error) {
    console.error("Error closing database connections:", error)
  }
}
