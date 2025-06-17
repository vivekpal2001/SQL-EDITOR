"use client"

import { useState } from "react"
import { Plus, Trash2, Eye, RefreshCw } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Slider } from "../components/ui/slider"
import { constraintTypes } from "../lib/sql-config"
import { previewFakerData } from "../lib/faker-data-generator"

export function TableCreator({ currentTable, setCurrentTable, getCurrentDialect, onSave, isLoading }) {
  const [rowCount, setRowCount] = useState([10])
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState([])

  const dataTypes = getCurrentDialect().dataTypes

  const addColumn = () => {
    setCurrentTable((prev) => ({
      ...prev,
      columns: [...prev.columns, { name: "", type: Object.keys(dataTypes)[0], constraints: [], range: null }],
    }))
  }

  const updateColumn = (index, field, value) => {
    setCurrentTable((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === index ? { ...col, [field]: value } : col)),
    }))
  }

  const removeColumn = (index) => {
    if (currentTable.columns.length > 1) {
      setCurrentTable((prev) => ({
        ...prev,
        columns: prev.columns.filter((_, i) => i !== index),
      }))
    }
  }

  const addConstraint = (columnIndex, constraint) => {
    setCurrentTable((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === columnIndex
          ? {
              ...col,
              constraints: [...col.constraints, constraint],
            }
          : col,
      ),
    }))
  }

  const removeConstraint = (columnIndex, constraintIndex) => {
    setCurrentTable((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === columnIndex
          ? {
              ...col,
              constraints: col.constraints.filter((_, ci) => ci !== constraintIndex),
            }
          : col,
      ),
    }))
  }

  const supportsRange = (type) => {
    const baseType = dataTypes[type] || "text"
    return ["number", "decimal", "date", "datetime"].includes(baseType)
  }

  const generatePreview = () => {
    if (currentTable.columns.some((col) => !col.name.trim())) {
      alert("Please fill in all column names before generating preview")
      return
    }

    const preview = previewFakerData(currentTable.columns, currentTable.name, 5)
    setPreviewData(preview)
    setShowPreview(true)
  }

  const handleSave = () => {
    onSave(rowCount[0])
  }

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Table Name</label>
        <Input
          type="text"
          value={currentTable.name}
          onChange={(e) => setCurrentTable((prev) => ({ ...prev, name: e.target.value }))}
          className="bg-slate-700 border-slate-600"
          placeholder="Enter table name (e.g., users, products, orders)"
        />
        <p className="text-xs text-slate-400 mt-1">💡 Table name helps generate more relevant dummy data</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Columns</h3>
        {currentTable.columns.map((column, index) => (
          <div key={index} className="mb-4 p-4 bg-slate-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Column Name</label>
                <Input
                  type="text"
                  value={column.name}
                  onChange={(e) => updateColumn(index, "name", e.target.value)}
                  className="bg-slate-600 border-slate-500"
                  placeholder="e.g., first_name, email, price"
                />
                <p className="text-xs text-slate-400 mt-1">💡 Column name affects dummy data type</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Type</label>
                <Select value={column.type} onValueChange={(value) => updateColumn(index, "type", value)}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(dataTypes).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => removeColumn(index)}
                  disabled={currentTable.columns.length === 1}
                  variant="destructive"
                  size="icon"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {/* Range Input for numeric/date types */}
            {supportsRange(column.type) && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Value Range (for dummy data)</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type={
                      dataTypes[column.type] === "date" || dataTypes[column.type] === "datetime" ? "date" : "number"
                    }
                    placeholder="Min value"
                    onChange={(e) => updateColumn(index, "range", { ...column.range, min: e.target.value })}
                    className="bg-slate-600 border-slate-500"
                  />
                  <Input
                    type={
                      dataTypes[column.type] === "date" || dataTypes[column.type] === "datetime" ? "date" : "number"
                    }
                    placeholder="Max value"
                    onChange={(e) => updateColumn(index, "range", { ...column.range, max: e.target.value })}
                    className="bg-slate-600 border-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Constraints */}
            <div>
              <label className="block text-sm font-medium mb-2">Constraints</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {column.constraints.map((constraint, cIndex) => (
                  <span key={cIndex} className="px-2 py-1 bg-blue-600 rounded text-sm flex items-center gap-1">
                    {constraint}
                    <button
                      onClick={() => removeConstraint(index, cIndex)}
                      className="ml-1 text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  if (value && !column.constraints.includes(value)) {
                    addConstraint(index, value)
                  }
                }}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500">
                  <SelectValue placeholder="Add constraint..." />
                </SelectTrigger>
                <SelectContent>
                  {constraintTypes.map((constraint) => (
                    <SelectItem key={constraint} value={constraint}>
                      {constraint}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <Button onClick={addColumn} variant="secondary" className="w-full flex items-center justify-center gap-2">
          <Plus size={16} />
          Add Column
        </Button>
      </div>

      {/* Row Count Configuration */}
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dummy Data Configuration</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Number of rows to generate: <span className="text-blue-400 font-bold">{rowCount[0]}</span>
          </label>
          <Slider value={rowCount} onValueChange={setRowCount} max={1000} min={1} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 row</span>
            <span>1000 rows</span>
          </div>
        </div>

      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full py-3 px-6 bg-green-600 hover:bg-green-700">
        {isLoading ? (
          <>
            <RefreshCw size={16} className="animate-spin mr-2" />
            Creating Table...
          </>
        ) : (
          `Create Table with ${rowCount[0]} Sample Rows`
        )}
      </Button>

      <p className="text-xs text-slate-400 mt-2 text-center">
        💡 Faker.js will generate realistic data based on your table and column names
      </p>
    </>
  )
}
