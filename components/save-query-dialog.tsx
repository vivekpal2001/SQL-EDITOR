"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SaveQueryDialog({ saveQueryName, setSaveQueryName, query, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Save Query</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Query Name</label>
          <Input
            type="text"
            value={saveQueryName}
            onChange={(e) => setSaveQueryName(e.target.value)}
            className="bg-slate-700 border-slate-600"
            placeholder="Enter a name for this query"
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Query Preview</label>
          <pre className="text-xs text-slate-300 bg-slate-700 p-3 rounded max-h-32 overflow-y-auto">{query}</pre>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Query</Button>
        </div>
      </div>
    </div>
  )
}
