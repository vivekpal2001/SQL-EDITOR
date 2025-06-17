import { faker } from "@faker-js/faker"

// Enhanced dummy data generator using faker.js
export function generateFakerData(columns: any[], rowCount = 10, tableName = "") {
  const rows = []

  // Set a seed for consistent data generation during development
  faker.seed(123)

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, any> = {}

    columns.forEach((column) => {
      row[column.name] = generateFakerValue(column, i, tableName)
    })

    rows.push(row)
  }

  return rows
}

function generateFakerValue(column: any, rowIndex: number, tableName = "") {
  const { type, constraints, name, range } = column
  const baseType = getBaseType(type)
  const lowerName = name.toLowerCase().replace(/[_\s-]/g, "")
  const lowerTableName = tableName.toLowerCase().replace(/[_\s-]/g, "")

  // Handle primary key constraints
  if (constraints?.includes("PRIMARY KEY")) {
    return rowIndex + 1
  }

  // Handle custom ranges first
  if (range && ["number", "decimal", "date", "datetime"].includes(baseType)) {
    return generateRangedValue(range, baseType)
  }

  // Table-specific patterns
  const tablePatterns = getTableSpecificPattern(lowerTableName, lowerName, baseType)
  if (tablePatterns) return tablePatterns

  // Column name patterns
  const columnPattern = getColumnNamePattern(lowerName, baseType)
  if (columnPattern) return columnPattern

  // Fallback to data type
  return getDataTypeDefault(baseType)
}

function getTableSpecificPattern(tableName: string, columnName: string, baseType: string) {
  // User/Person/Customer tables
  if (tableName.match(/user|person|customer|member|account/)) {
    if (columnName.match(/^(first|fname)name?$/)) return faker.person.firstName()
    if (columnName.match(/^(last|lname|surname)name?$/)) return faker.person.lastName()
    if (columnName.match(/^(full|complete)?name$/)) return faker.person.fullName()
    if (columnName.match(/email|mail/)) return faker.internet.email()
    if (columnName.match(/phone|mobile|tel/)) return faker.phone.number()
    if (columnName.match(/age/)) return faker.number.int({ min: 18, max: 80 })
    if (columnName.match(/gender|sex/)) return faker.person.sex()
    if (columnName.match(/avatar|photo|image/)) return faker.image.avatar()
    if (columnName.match(/bio|about|description/)) return faker.person.bio()
    if (columnName.match(/job|occupation|title/)) return faker.person.jobTitle()
    if (columnName.match(/department/)) return faker.person.jobArea()
  }

  // Product/Item tables
  if (tableName.match(/product|item|goods|inventory/)) {
    if (columnName.match(/^name$|title/)) return faker.commerce.productName()
    if (columnName.match(/description|desc/)) return faker.commerce.productDescription()
    if (columnName.match(/price|cost|amount/)) return faker.commerce.price()
    if (columnName.match(/category|type/)) return faker.commerce.department()
    if (columnName.match(/brand|manufacturer/)) return faker.company.name()
    if (columnName.match(/sku|code|barcode/)) return faker.string.alphanumeric(10).toUpperCase()
    if (columnName.match(/weight/)) return faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 })
    if (columnName.match(/color|colour/)) return faker.color.human()
    if (columnName.match(/material/)) return faker.commerce.productMaterial()
  }

  // Company/Organization tables
  if (tableName.match(/company|organization|business|firm/)) {
    if (columnName.match(/^name$/)) return faker.company.name()
    if (columnName.match(/description|about/)) return faker.company.catchPhrase()
    if (columnName.match(/industry|sector/)) return faker.company.buzzNoun()
    if (columnName.match(/website|url/)) return faker.internet.url()
    if (columnName.match(/email/)) return faker.internet.email()
    if (columnName.match(/phone/)) return faker.phone.number()
    if (columnName.match(/employees|size/)) return faker.number.int({ min: 1, max: 10000 })
  }

  // Address/Location tables
  if (tableName.match(/address|location|place/)) {
    if (columnName.match(/street|address1/)) return faker.location.streetAddress()
    if (columnName.match(/address2|apartment|apt|suite/)) return faker.location.secondaryAddress()
    if (columnName.match(/city/)) return faker.location.city()
    if (columnName.match(/state|province/)) return faker.location.state()
    if (columnName.match(/country/)) return faker.location.country()
    if (columnName.match(/zip|postal|postcode/)) return faker.location.zipCode()
    if (columnName.match(/latitude|lat/)) return faker.location.latitude()
    if (columnName.match(/longitude|lng|lon/)) return faker.location.longitude()
  }

  // Order/Transaction tables
  if (tableName.match(/order|transaction|payment|invoice/)) {
    if (columnName.match(/total|amount|price/)) return faker.commerce.price()
    if (columnName.match(/status/)) return faker.helpers.arrayElement(["pending", "completed", "cancelled", "refunded"])
    if (columnName.match(/currency/)) return faker.finance.currencyCode()
    if (columnName.match(/reference|ref|number/)) return faker.string.alphanumeric(8).toUpperCase()
  }

  // Event/Activity tables
  if (tableName.match(/event|activity|meeting|appointment/)) {
    if (columnName.match(/^name$|title/)) return faker.lorem.words(3)
    if (columnName.match(/description/)) return faker.lorem.paragraph()
    if (columnName.match(/location|venue/)) return faker.location.city()
    if (columnName.match(/duration/)) return faker.number.int({ min: 30, max: 480 }) // minutes
  }

  return null
}

function getColumnNamePattern(columnName: string, baseType: string) {
  // Personal Information
  if (columnName.match(/^(first|fname)name?$/)) return faker.person.firstName()
  if (columnName.match(/^(last|lname|surname)name?$/)) return faker.person.lastName()
  if (columnName.match(/^(full|complete)?name$/)) return faker.person.fullName()
  if (columnName.match(/^(middle|mname)name?$/)) return faker.person.middleName()
  if (columnName.match(/prefix|title/)) return faker.person.prefix()
  if (columnName.match(/suffix/)) return faker.person.suffix()

  // Contact Information
  if (columnName.match(/email|mail/)) return faker.internet.email()
  if (columnName.match(/phone|mobile|tel/)) return faker.phone.number()
  if (columnName.match(/website|url|homepage/)) return faker.internet.url()
  if (columnName.match(/username|login/)) return faker.internet.userName()

  // Address Information
  if (columnName.match(/street|address1/)) return faker.location.streetAddress()
  if (columnName.match(/address2|apartment|apt|suite/)) return faker.location.secondaryAddress()
  if (columnName.match(/city|town/)) return faker.location.city()
  if (columnName.match(/state|province|region/)) return faker.location.state()
  if (columnName.match(/country|nation/)) return faker.location.country()
  if (columnName.match(/zip|postal|postcode/)) return faker.location.zipCode()
  if (columnName.match(/latitude|lat/)) return faker.location.latitude()
  if (columnName.match(/longitude|lng|lon/)) return faker.location.longitude()

  // Business Information
  if (columnName.match(/company|corporation|business|firm/)) return faker.company.name()
  if (columnName.match(/department|division/)) return faker.person.jobArea()
  if (columnName.match(/job|position|role|occupation/)) return faker.person.jobTitle()
  if (columnName.match(/industry|sector/)) return faker.company.buzzNoun()

  // Financial Information
  if (columnName.match(/price|cost|amount|fee|charge/)) return faker.commerce.price()
  if (columnName.match(/salary|wage|income/)) return faker.number.int({ min: 30000, max: 200000 })
  if (columnName.match(/currency/)) return faker.finance.currencyCode()
  if (columnName.match(/account|iban/)) return faker.finance.iban()
  if (columnName.match(/credit|card/)) return faker.finance.creditCardNumber()

  // Product Information
  if (columnName.match(/product|item/) && columnName.match(/name|title/)) return faker.commerce.productName()
  if (columnName.match(/brand|manufacturer/)) return faker.company.name()
  if (columnName.match(/category|type|kind/)) return faker.commerce.department()
  if (columnName.match(/sku|code|barcode/)) return faker.string.alphanumeric(10).toUpperCase()
  if (columnName.match(/color|colour/)) return faker.color.human()
  if (columnName.match(/size/)) return faker.helpers.arrayElement(["XS", "S", "M", "L", "XL", "XXL"])
  if (columnName.match(/weight/)) return faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 })
  if (columnName.match(/material/)) return faker.commerce.productMaterial()

  // Text Content
  if (columnName.match(/title|heading|subject/)) return faker.lorem.words(faker.number.int({ min: 2, max: 6 }))
  if (columnName.match(/description|desc|summary/)) return faker.lorem.paragraph()
  if (columnName.match(/content|body|text/)) return faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }))
  if (columnName.match(/comment|note|remark/)) return faker.lorem.sentence()
  if (columnName.match(/tag|keyword/)) return faker.lorem.word()

  // Status and Categories
  if (columnName.match(/status|state/))
    return faker.helpers.arrayElement(["active", "inactive", "pending", "completed", "cancelled"])
  if (columnName.match(/priority/)) return faker.helpers.arrayElement(["low", "medium", "high", "urgent"])
  if (columnName.match(/level|grade/))
    return faker.helpers.arrayElement(["beginner", "intermediate", "advanced", "expert"])
  if (columnName.match(/type|kind|category/)) return faker.lorem.word()

  // Identifiers
  if (columnName.match(/uuid|guid/)) return faker.string.uuid()
  if (columnName.match(/slug|permalink/)) return faker.lorem.slug()
  if (columnName.match(/hash|token/)) return faker.string.alphanumeric(32)
  if (columnName.match(/reference|ref/)) return faker.string.alphanumeric(8).toUpperCase()

  // Measurements
  if (columnName.match(/age/)) return faker.number.int({ min: 18, max: 80 })
  if (columnName.match(/height/)) return faker.number.int({ min: 150, max: 200 }) // cm
  if (columnName.match(/width|length/)) return faker.number.float({ min: 1, max: 100, fractionDigits: 2 })
  if (columnName.match(/score|rating/)) return faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
  if (columnName.match(/count|quantity|qty/)) return faker.number.int({ min: 1, max: 100 })

  // Time-related
  if (columnName.match(/duration/)) return faker.number.int({ min: 1, max: 480 }) // minutes
  if (columnName.match(/year/)) return faker.date.recent().getFullYear()
  if (columnName.match(/month/)) return faker.date.month()
  if (columnName.match(/day/)) return faker.number.int({ min: 1, max: 31 })

  // Images and Media
  if (columnName.match(/image|photo|picture|avatar/)) return faker.image.url()
  if (columnName.match(/video/)) return faker.internet.url() + "/video.mp4"
  if (columnName.match(/audio|sound/)) return faker.internet.url() + "/audio.mp3"
  if (columnName.match(/file|document/)) return faker.system.fileName()

  // Boolean-like fields
  if (columnName.match(/active|enabled|visible|published|featured/)) return faker.datatype.boolean()
  if (columnName.match(/verified|confirmed|approved/)) return faker.datatype.boolean()

  return null
}

function generateRangedValue(range: any, baseType: string) {
  const { min, max } = range

  switch (baseType) {
    case "number":
      const minVal = Number.parseInt(min) || 1
      const maxVal = Number.parseInt(max) || 1000
      return faker.number.int({ min: minVal, max: maxVal })

    case "decimal":
      const minFloat = Number.parseFloat(min) || 0
      const maxFloat = Number.parseFloat(max) || 1000
      return faker.number.float({ min: minFloat, max: maxFloat, fractionDigits: 2 })

    case "date":
      const startDate = min ? new Date(min) : faker.date.past()
      const endDate = max ? new Date(max) : faker.date.future()
      return faker.date.between({ from: startDate, to: endDate }).toISOString().split("T")[0]

    case "datetime":
      const startDateTime = min ? new Date(min) : faker.date.past()
      const endDateTime = max ? new Date(max) : faker.date.future()
      return faker.date.between({ from: startDateTime, to: endDateTime }).toISOString().slice(0, 19).replace("T", " ")

    default:
      return null
  }
}

function getDataTypeDefault(baseType: string) {
  switch (baseType) {
    case "number":
      return faker.number.int({ min: 1, max: 1000 })
    case "decimal":
      return faker.number.float({ min: 0, max: 1000, fractionDigits: 2 })
    case "date":
      return faker.date.recent().toISOString().split("T")[0]
    case "datetime":
      return faker.date.recent().toISOString().slice(0, 19).replace("T", " ")
    case "boolean":
      return faker.datatype.boolean()
    case "longtext":
      return faker.lorem.paragraphs(2)
    default:
      return faker.lorem.words(2)
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

// Preview function to show sample data
export function previewFakerData(columns: any[], tableName = "", sampleCount = 3) {
  return generateFakerData(columns, sampleCount, tableName)
}
