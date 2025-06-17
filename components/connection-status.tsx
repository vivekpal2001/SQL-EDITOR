import { Server, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function ConnectionStatus({ status, dialect }) {
  const getStatusDisplay = () => {
    switch (status) {
      case "connected":
        return {
          icon: <CheckCircle size={16} className="text-green-400" />,
          text: "Connected",
          color: "text-green-400",
        }
      case "error":
        return {
          icon: <XCircle size={16} className="text-red-400" />,
          text: "Connection Error",
          color: "text-red-400",
        }
      case "connecting":
        return {
          icon: <Server size={16} className="text-yellow-400 animate-pulse" />,
          text: "Connecting...",
          color: "text-yellow-400",
        }
      default:
        return {
          icon: <AlertCircle size={16} className="text-slate-400" />,
          text: "Unknown Status",
          color: "text-slate-400",
        }
    }
  }

  const { icon, text, color } = getStatusDisplay()

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-sm font-medium ${color}`}>
        {text} ({dialect === "postgresql" ? "PostgreSQL" : "MySQL"})
      </span>
    </div>
  )
}
