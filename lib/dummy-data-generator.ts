import { dataPatterns } from "./sql-config"

// Generate dummy data based on column type and name patterns
export function generateDummyData(columns: any[], rowCount = 10) {
  const rows = []

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, any> = {}

    columns.forEach((column) => {
      row[column.name] = generateDummyValue(column, i)
    })

    rows.push(row)
  }

  return rows
}

function generateDummyValue(column: any, rowIndex: number) {
  const { type, constraints, name } = column
  const baseType = getBaseType(type)
  const lowerName = name.toLowerCase().replace(/[_\s]/g, "")

  if (constraints?.includes("PRIMARY KEY")) {
    return rowIndex + 1
  }

  if (column.range && ["number", "decimal", "date", "datetime"].includes(baseType)) {
    const { min, max } = column.range

    if (baseType === "number") {
      const minVal = Number.parseInt(min) || 1
      const maxVal = Number.parseInt(max) || 1000
      return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal
    }

    if (baseType === "decimal") {
      const minVal = Number.parseFloat(min) || 0
      const maxVal = Number.parseFloat(max) || 1000
      return (Math.random() * (maxVal - minVal) + minVal).toFixed(2)
    }

    if (baseType === "date") {
      const startDate = min ? new Date(min) : new Date(2020, 0, 1)
      const endDate = max ? new Date(max) : new Date()
      const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      return new Date(randomTime).toISOString().split("T")[0]
    }
  }

  const getRandomFromArray = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

  // Pattern matching for intelligent dummy data
  if (lowerName.match(/^(first|fname)name?$/)) {
    return getRandomFromArray(dataPatterns.first_name)
  }
  if (lowerName.match(/^(last|lname|surname)name?$/)) {
    return getRandomFromArray(dataPatterns.last_name)
  }
  if (lowerName.match(/^(full|complete)?name$/) || lowerName.match(/^(customer|user|person)name$/)) {
    return getRandomFromArray(dataPatterns.full_name)
  }
  if (lowerName.match(/email|mail/)) {
    const firstName = getRandomFromArray(dataPatterns.first_name).toLowerCase()
    const domain = getRandomFromArray(dataPatterns.email_domains)
    return `${firstName}${Math.floor(Math.random() * 100)}@${domain}`
  }
  if (lowerName.match(/company|corporation|business/)) {
    return getRandomFromArray(dataPatterns.companies)
  }
  if (lowerName.match(/city|town/)) {
    return getRandomFromArray(dataPatterns.cities)
  }
  if (lowerName.match(/status|state|condition/)) {
    return getRandomFromArray(dataPatterns.statuses)
  }
  if (lowerName.match(/description|desc|details/) || baseType === "longtext") {
    return getRandomFromArray(dataPatterns.descriptions)
  }
  if (lowerName.match(/^age$/)) {
    return Math.floor(Math.random() * 60) + 18
  }

  // Generate based on data type (fallback)
  switch (baseType) {
    case "number":
      return Math.floor(Math.random() * 1000) + 1
    case "decimal":
      return (Math.random() * 1000).toFixed(2)
    case "date":
      const start = new Date(2020, 0, 1)
      const end = new Date()
      const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      return randomDate.toISOString().split("T")[0]
    case "datetime":
      const randomDateTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      return randomDateTime.toISOString().slice(0, 19).replace("T", " ")
    case "boolean":
      return Math.random() > 0.5
    default:
      const genericTexts = ["Sample A", "Sample B", "Sample C", "Sample D"]
      return genericTexts[Math.floor(Math.random() * genericTexts.length)]
  }
}

function getBaseType(type: string) {
  type = type.toUpperCase()

  if (type.includes("VARCHAR") || type.includes("CHAR") || type.includes("TEXT")) {
    return type.includes("LONG") ? "longtext" : "text"
  }

  if (type.includes("INT") || type.includes("SERIAL")) {
    return "number"
  }

  if (
    type.includes("DECIMAL") ||
    type.includes("NUMERIC") ||
    type.includes("FLOAT") ||
    type.includes("DOUBLE") ||
    type.includes("REAL")
  ) {
    return "decimal"
  }

  if (type === "DATE") {
    return "date"
  }

  if (type.includes("TIME") || type === "DATETIME") {
    return "datetime"
  }

  if (type === "BOOLEAN" || (type.includes("TINYINT") && type.includes("(1)"))) {
    return "boolean"
  }

  return "text"
}
