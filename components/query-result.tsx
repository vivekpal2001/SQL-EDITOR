import { CheckCircle, AlertCircle } from "lucide-react"

export function QueryResult({ result }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {result.success ? (
          <CheckCircle className="text-green-400" size={20} />
        ) : (
          <AlertCircle className="text-red-400" size={20} />
        )}
        Query Result
      </h3>

      <div
        className={`p-4 rounded-lg border ${
          result.success ? "bg-green-900/50 border-green-600" : "bg-red-900/50 border-red-600"
        }`}
      >
        <p className={`mb-3 ${result.success ? "text-green-300" : "text-red-300"}`}>{result.message}</p>

        {result.data && result.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-600">
              <thead>
                <tr className="bg-slate-700">
                  {Object.keys(result.data[0]).map((column) => (
                    <th key={column} className="border border-slate-600 px-4 py-2 text-left">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-700">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="border border-slate-600 px-4 py-2">
                        {value === null ? <span className="text-slate-500">NULL</span> : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rowCount && (
              <p className="text-slate-400 text-sm mt-2">
                {result.rowCount} {result.rowCount === 1 ? "row" : "rows"} returned
                {result.rowCount > result.data.length && ` (showing first ${result.data.length})`}
              </p>
            )}
          </div>
        )}

        {result.affectedRows !== undefined && (
          <p className="text-green-300 mt-2">
            {result.affectedRows} {result.affectedRows === 1 ? "row" : "rows"} affected
          </p>
        )}
      </div>
    </div>
  )
}
