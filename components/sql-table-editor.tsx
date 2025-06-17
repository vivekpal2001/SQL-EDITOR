"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Database, Table, Eye, Code, Download, RefreshCw } from "lucide-react"
import { DatabaseSelector } from "./database-selector"
import { createTable, executeQuery, fetchTables, deleteTableFromDb } from "@/lib/db-operations"
import { dialectConfigs } from "@/lib/sql-config"
import { ConnectionStatus } from "./connection-status"
import { QueryHistoryPanel } from "./query-history-panel"
import { SaveQueryDialog } from "./save-query-dialog"
import { QueryResult } from "./query-result"
import { TableView } from "./table-view"
import { TableCreator } from "./table-creator"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SQLTableEditor() {
  const [tables, setTables] = useState({})
  const [currentTable, setCurrentTable] = useState({
    name: "",
    columns: [{ name: "", type: "VARCHAR(50)", constraints: [], range: null }],
  })
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState(null)
  const [activeTab, setActiveTab] = useState("create")
  const [selectedDialect, setSelectedDialect] = useState("mysql")
  const [querySuggestions, setQuerySuggestions] = useState([])
  const [queryHistory, setQueryHistory] = useState([])
  const [savedQueries, setSavedQueries] = useState([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveQueryName, setSaveQueryName] = useState("")
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    mysql: "unknown",
    postgresql: "unknown",
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const getCurrentDialect = () => dialectConfigs[selectedDialect]

  // Load saved queries from localStorage
  useEffect(() => {
    const savedQueriesFromStorage = localStorage.getItem("savedQueries")
    if (savedQueriesFromStorage) {
      try {
        setSavedQueries(JSON.parse(savedQueriesFromStorage))
      } catch (e) {
        console.error("Failed to parse saved queries:", e)
      }
    }
  }, [])

  // Save queries to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedQueries", JSON.stringify(savedQueries))
  }, [savedQueries])

  // Check database connections on load and dialect change
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus((prev) => ({
          ...prev,
          [selectedDialect]: "connecting",
        }))

        const response = await fetch(`/api/db/status?dialect=${selectedDialect}`)
        const data = await response.json()

        setConnectionStatus((prev) => ({
          ...prev,
          [selectedDialect]: data.connected ? "connected" : "error",
        }))

        if (data.connected) {
          loadTables()
        }
      } catch (error) {
        console.error("Connection check failed:", error)
        setConnectionStatus((prev) => ({
          ...prev,
          [selectedDialect]: "error",
        }))
      }
    }

    checkConnection()
  }, [selectedDialect, refreshTrigger])

  // Load tables from the selected database
  const loadTables = async () => {
    try {
      setIsLoading(true)
      const tablesData = await fetchTables(selectedDialect)
      setTables(tablesData)
    } catch (error) {
      console.error("Failed to load tables:", error)
      toast({
        title: "Error loading tables",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialectChange = (dialect) => {
    setSelectedDialect(dialect)
  }

  const handleRefreshConnection = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSaveTable = async (rowCount = 10) => {
    if (!currentTable.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a table name",
        variant: "destructive",
      })
      return
    }

    if (currentTable.columns.some((col) => !col.name.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all column names",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await createTable(selectedDialect, currentTable, rowCount)

      toast({
        title: "Success",
        description: `Table "${currentTable.name}" created successfully with ${rowCount} realistic sample rows!`,
      })

      // Reset form
      setCurrentTable({
        name: "",
        columns: [{ name: "", type: Object.keys(getCurrentDialect().dataTypes)[0], constraints: [], range: null }],
      })

      // Refresh tables list
      loadTables()
    } catch (error) {
      console.error("Failed to create table:", error)
      toast({
        title: "Error creating table",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTable = async (tableName) => {
    if (confirm(`Are you sure you want to delete table "${tableName}"?`)) {
      try {
        setIsLoading(true)
        await deleteTableFromDb(selectedDialect, tableName)

        toast({
          title: "Success",
          description: `Table "${tableName}" deleted successfully!`,
        })

        // Refresh tables list
        loadTables()
      } catch (error) {
        console.error("Failed to delete table:", error)
        toast({
          title: "Error deleting table",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Validation Error",
        description: "Query cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await executeQuery(selectedDialect, query)

      setQueryResult(result)

      // Add to history
      const historyEntry = {
        id: Date.now(),
        query: query.trim(),
        dialect: selectedDialect,
        timestamp: new Date().toISOString(),
        success: true,
        message: result.message || "Query executed successfully",
      }

      setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 49)])

      // Refresh tables if the query might have changed the schema
      if (query.toUpperCase().match(/^(CREATE|DROP|ALTER)/)) {
        loadTables()
      }
    } catch (error) {
      console.error("Query execution failed:", error)

      setQueryResult({
        success: false,
        message: error.message || "Query execution failed",
      })

      // Add failed query to history
      const historyEntry = {
        id: Date.now(),
        query: query.trim(),
        dialect: selectedDialect,
        timestamp: new Date().toISOString(),
        success: false,
        message: error.message || "Query execution failed",
      }

      setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 49)])
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuery = () => {
    if (!query.trim()) {
      toast({
        title: "Validation Error",
        description: "Cannot save an empty query",
        variant: "destructive",
      })
      return
    }

    if (!saveQueryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the query",
        variant: "destructive",
      })
      return
    }

    const newSavedQuery = {
      id: Date.now(),
      name: saveQueryName.trim(),
      query: query.trim(),
      dialect: selectedDialect,
      createdAt: new Date().toISOString(),
    }

    setSavedQueries((prev) => [newSavedQuery, ...prev])
    setSaveQueryName("")
    setShowSaveDialog(false)

    toast({
      title: "Success",
      description: `Query "${saveQueryName}" saved successfully!`,
    })
  }

  const loadSavedQuery = (savedQuery) => {
    setQuery(savedQuery.query)
    setSelectedDialect(savedQuery.dialect)
    setShowHistoryPanel(false)
  }

  const deleteSavedQuery = (queryId) => {
    if (confirm("Are you sure you want to delete this saved query?")) {
      setSavedQueries((prev) => prev.filter((q) => q.id !== queryId))
    }
  }

  const clearQueryHistory = () => {
    if (confirm("Are you sure you want to clear all query history?")) {
      setQueryHistory([])
    }
  }

  const exportSchema = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/db/export-schema?dialect=${selectedDialect}`)

      if (!response.ok) {
        throw new Error("Failed to export schema")
      }

      const schema = await response.text()

      const blob = new Blob([schema], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `schema_${selectedDialect}.sql`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export schema:", error)
      toast({
        title: "Error exporting schema",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            SQL Table Editor & Query Validator
          </h1>
          <p className="text-slate-300">
            Create tables with realistic faker.js data, execute queries, and explore SQL across different database
            engines
          </p>
        </div>

        {/* Database Selector and Connection Status */}
        <div className="mb-6">
          <div className="bg-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <DatabaseSelector selectedDialect={selectedDialect} onDialectChange={handleDialectChange} />

            <div className="flex items-center gap-4">
              <ConnectionStatus status={connectionStatus[selectedDialect]} dialect={selectedDialect} />
              <Button variant="secondary" size="sm" onClick={handleRefreshConnection} disabled={isLoading}>
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus size={16} />
              Create Tables
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Play size={16} />
              Query Editor
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye size={16} />
              View Tables
            </TabsTrigger>
          </TabsList>

          {/* Create Table Tab */}
          <TabsContent value="create">
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="text-blue-400" />
                Create New Table 
              </h2>

              <TableCreator
                currentTable={currentTable}
                setCurrentTable={setCurrentTable}
                getCurrentDialect={getCurrentDialect}
                onSave={handleSaveTable}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          {/* Query Editor Tab */}
          <TabsContent value="query">
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code className="text-green-400" />
                SQL Query Editor
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Write your SQL query</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-40 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`SELECT * FROM your_table_name;`}
                />
              </div>

              {/* Query Actions */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!query.trim() || isLoading}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Database size={16} />
                  Save Query
                </Button>
                <Button
                  onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Eye size={16} />
                  {showHistoryPanel ? "Hide" : "Show"} History & Saved
                </Button>
                <Button onClick={() => setQuery("")} variant="secondary">
                  Clear
                </Button>
              </div>

              {/* History and Saved Queries Panel */}
              {showHistoryPanel && (
                <QueryHistoryPanel
                  savedQueries={savedQueries}
                  queryHistory={queryHistory}
                  onLoadQuery={loadSavedQuery}
                  onDeleteSavedQuery={deleteSavedQuery}
                  onClearHistory={clearQueryHistory}
                />
              )}

              {/* Save Query Dialog */}
              {showSaveDialog && (
                <SaveQueryDialog
                  saveQueryName={saveQueryName}
                  setSaveQueryName={setSaveQueryName}
                  query={query}
                  onSave={saveQuery}
                  onCancel={() => {
                    setShowSaveDialog(false)
                    setSaveQueryName("")
                  }}
                />
              )}

              <Button
                onClick={handleExecuteQuery}
                disabled={!query.trim() || isLoading || connectionStatus[selectedDialect] !== "connected"}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                Execute Query
              </Button>

              {/* Query Results */}
              {queryResult && <QueryResult result={queryResult} />}
            </div>
          </TabsContent>

          {/* View Tables Tab */}
          <TabsContent value="view">
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Table className="text-purple-400" />
                  Database Tables
                </h2>
                {Object.keys(tables).length > 0 && (
                  <Button
                    onClick={exportSchema}
                    disabled={isLoading}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Schema
                  </Button>
                )}
              </div>

              <TableView
                tables={tables}
                isLoading={isLoading}
                onDeleteTable={handleDeleteTable}
                onQueryTable={(tableName) => {
                  setQuery(`SELECT * FROM ${tableName} LIMIT 100;`)
                  setActiveTab("query")
                }}
                selectedDialect={selectedDialect}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>
            SQL Table Editor with faker.js integration - Generate realistic test data for {getCurrentDialect().name}
          </p>
        </div>
      </div>
    </div>
  )
}
