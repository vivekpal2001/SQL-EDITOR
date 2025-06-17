"use client"

export function QueryHistoryPanel({ savedQueries, queryHistory, onLoadQuery, onDeleteSavedQuery, onClearHistory }) {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="mb-6 bg-slate-700 rounded-lg p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Queries */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-blue-400">Saved Queries ({savedQueries.length})</h4>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedQueries.length === 0 ? (
              <p className="text-slate-400 text-sm">No saved queries yet</p>
            ) : (
              savedQueries.map((savedQuery) => (
                <div key={savedQuery.id} className="bg-slate-600 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-white">{savedQuery.name}</h5>
                    <button
                      onClick={() => onDeleteSavedQuery(savedQuery.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    {savedQuery.dialect.toUpperCase()} • {formatTimestamp(savedQuery.createdAt)}
                  </p>
                  <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded mb-2 overflow-x-auto">
                    {savedQuery.query.length > 100 ? savedQuery.query.substring(0, 100) + "..." : savedQuery.query}
                  </pre>
                  <button
                    onClick={() => onLoadQuery(savedQuery)}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Load Query
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Query History */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-green-400">Query History ({queryHistory.length})</h4>
            {queryHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queryHistory.length === 0 ? (
              <p className="text-slate-400 text-sm">No query history yet</p>
            ) : (
              queryHistory.map((historyItem) => (
                <div key={historyItem.id} className="bg-slate-600 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {historyItem.success ? (
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      )}
                      <span className={`text-xs ${historyItem.success ? "text-green-400" : "text-red-400"}`}>
                        {historyItem.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatTimestamp(historyItem.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    {historyItem.dialect.toUpperCase()} • {historyItem.message}
                  </p>
                  <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded mb-2 overflow-x-auto">
                    {historyItem.query.length > 100 ? historyItem.query.substring(0, 100) + "..." : historyItem.query}
                  </pre>
                  <button
                    onClick={() => onLoadQuery(historyItem)}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                  >
                    Load Query
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
