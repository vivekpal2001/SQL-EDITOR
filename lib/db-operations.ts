// Create a table in the selected database
export async function createTable(dialect: string, tableDefinition: any, rowCount = 10) {
  try {
    const response = await fetch("/api/db/create-table", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dialect,
        table: tableDefinition,
        rowCount,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create table")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating table:", error)
    throw error
  }
}

// Execute a SQL query on the selected database
export async function executeQuery(dialect: string, query: string) {
  try {
    const response = await fetch("/api/db/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dialect,
        query,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Query execution failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error executing query:", error)
    throw error
  }
}

// Fetch tables from the selected database
export async function fetchTables(dialect: string) {
  try {
    const response = await fetch(`/api/db/tables?dialect=${dialect}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch tables")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching tables:", error)
    throw error
  }
}

// Fetch data for a specific table
export async function fetchTableData(dialect: string, tableName: string) {
  try {
    const response = await fetch(`/api/db/table-data?dialect=${dialect}&table=${tableName}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch table data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching table data:", error)
    throw error
  }
}

// Delete a table from the database
export async function deleteTableFromDb(dialect: string, tableName: string) {
  try {
    const response = await fetch("/api/db/delete-table", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dialect,
        tableName,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete table")
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting table:", error)
    throw error
  }
}
