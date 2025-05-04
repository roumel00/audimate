import ExcelJS from "exceljs"

const headerMap = {
  firstName: /^(first[\s_]?name|first|given|forename)$/i,
  lastName: /^(last[\s_]?name|surname|family)$/i,
  fullName: /^(name|full[\s_]?name)$/i,
  phone: /^(phone|mobile|phone[\s_]?number|contact[\s_]?no|tel|telephone)$/i,
  email: /^(e[-\s_]?mail|email[\s_]?address|mail)$/i,
}

const normalisePhone = (raw = "") => {
  if (!raw) return ""
  let cleaned = raw.replace(/[^\d+]/g, "")
  if (cleaned.startsWith("+")) {
    cleaned = "+" + cleaned.slice(1).replace(/\D/g, "")
  } else {
    cleaned = cleaned.replace(/\D/g, "")
    if (cleaned.startsWith("0")) cleaned = "+61" + cleaned.slice(1)
    else cleaned = "+" + cleaned
  }
  return cleaned
}

const splitFullName = (name = "") => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return { first: "", last: "" }
  if (parts.length === 1) return { first: parts[0], last: "" }
  return { first: parts[0], last: parts.slice(1).join(" ") }
}

/**
 * Parse an Excel *.xlsx* file selected in <input type="file"> and
 * return   [{ firstName, lastName, phone, email, additionalFields }]
 *
 * @param   {File} file  – XLSX file from <input>
 * @returns {Promise<Array>}
 */
export async function parseXLSX(file) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())

  const ws = wb.worksheets.find((w) => !w.state || w.state === "visible")
  if (!ws) throw new Error("Workbook contains no visible worksheets")

  const headerRow = ws.getRow(1).values.slice(1) // values[0] is null
  const columnToField = headerRow.map((h) => {
    const hdr = String(h || "").trim()
    for (const [field, regex] of Object.entries(headerMap)) {
      if (regex.test(hdr)) return field
    }
    return null
  })

  if (!columnToField.some((f) => ["firstName", "lastName", "fullName", "phone", "email"].includes(f))) {
    throw new Error(
      'Worksheet must contain at least one column named like "First Name", "Last Name", "Name", "Phone", or "Email"',
    )
  }

  const contacts = []

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const obj = { firstName: "", lastName: "", phone: "", email: "" }
    const additional = []

    row.values.slice(1).forEach((val, idx) => {
      const cell = (val ?? "").toString().trim()

      switch (columnToField[idx]) {
        case "firstName":
          obj.firstName = cell
          break
        case "lastName":
          obj.lastName = cell
          break
        case "fullName": {
          const { first, last } = splitFullName(cell)
          if (!obj.firstName) obj.firstName = first
          if (!obj.lastName) obj.lastName = last
          break
        }
        case "phone":
          obj.phone = normalisePhone(cell)
          break
        case "email":
          obj.email = cell.toLowerCase()
          break
        default:
          if (columnToField[idx] === null && headerRow[idx]) {
            additional.push({
              field: headerRow[idx].toString().toLowerCase(),
              value: cell,
            })
          }
      }
    })

    if (additional.length) obj.additionalFields = additional
    if (Object.values(obj).some((v) => v)) contacts.push(obj)
  })

  return contacts
}
