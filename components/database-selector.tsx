"use client"

import { dialectConfigs } from "@/lib/sql-config"

export function DatabaseSelector({ selectedDialect, onDialectChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-300">Database Engine:</span>
      <div className="bg-slate-700 rounded-lg p-1 flex gap-1">
        {Object.entries(dialectConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onDialectChange(key)}
            className={`px-3 py-1 rounded-md transition-all text-sm ${
              selectedDialect === key ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-600"
            }`}
          >
            {config.name}
          </button>
        ))}
      </div>
    </div>
  )
}
