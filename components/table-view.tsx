"use client"

import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function TableView({ tables, isLoading, onDeleteTable, onQueryTable, selectedDialect }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full bg-slate-700" />
        <Skeleton className="h-24 w-full bg-slate-700" />
        <Skeleton className="h-24 w-full bg-slate-700" />
      </div>
    )
  }

  if (Object.keys(tables).length === 0) {
    return (
      <div className="text-center py-12">
        <Database size={64} className="mx-auto text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No Tables Found</h3>
        <p className="text-slate-500">Create your first table in the 'Create Tables' tab</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(tables).map(([tableName, table]) => (
        <div key={tableName} className="bg-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-blue-400">{tableName}</h3>
            <div className="flex gap-2">
              <Button onClick={() => onQueryTable(tableName)} variant="secondary" size="sm">
                Query
              </Button>
              <Button onClick={() => onDeleteTable(tableName)} variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>

          {/* Table Schema */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Schema:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-600 text-sm">
                <thead>
                  <tr className="bg-slate-600">
                    <th className="border border-slate-500 px-3 py-2 text-left">Column</th>
                    <th className="border border-slate-500 px-3 py-2 text-left">Type</th>
                    <th className="border border-slate-500 px-3 py-2 text-left">Nullable</th>
                    <th className="border border-slate-500 px-3 py-2 text-left">Key</th>
                    <th className="border border-slate-500 px-3 py-2 text-left">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns.map((column, index) => (
                    <tr key={index}>
                      <td className="border border-slate-500 px-3 py-2 font-mono">{column.name}</td>
                      <td className="border border-slate-500 px-3 py-2">{column.type}</td>
                      <td className="border border-slate-500 px-3 py-2">{column.nullable ? "YES" : "NO"}</td>
                      <td className="border border-slate-500 px-3 py-2">{column.key || ""}</td>
                      <td className="border border-slate-500 px-3 py-2">
                        {column.default === null ? <span className="text-slate-500">NULL</span> : column.default}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data */}
          {table.data && table.data.length > 0 ? (
            <div>
              <h4 className="font-semibold mb-2">Sample Data ({table.data.length} rows):</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-600 text-sm">
                  <thead>
                    <tr className="bg-slate-600">
                      {table.columns.map((column) => (
                        <th key={column.name} className="border border-slate-500 px-3 py-2 text-left">
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.data.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-600">
                        {table.columns.map((column) => (
                          <td key={column.name} className="border border-slate-500 px-3 py-2">
                            {row[column.name] === null ? (
                              <span className="text-slate-500">NULL</span>
                            ) : (
                              String(row[column.name])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.data.length > 5 && (
                <p className="text-slate-400 text-sm mt-2">Showing first {table.data.length} rows</p>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No data available</p>
          )}

          {/* SQL Definition */}
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold">
              View SQL Definition
            </summary>
            <pre className="mt-2 p-3 bg-slate-800 rounded border text-sm overflow-x-auto">
              <code>{table.createStatement}</code>
            </pre>
          </details>
        </div>
      ))}
    </div>
  )
}
