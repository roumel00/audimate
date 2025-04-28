/**
 * Parse a CSV file and return an array of contact objects
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} - Array of contact objects
 */
export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csv = event.target.result
        const lines = csv.split(/\r\n|\n/)

        // Extract headers (first line)
        const headers = lines[0].split(",").map((header) => header.trim().toLowerCase().replace(/["']/g, ""))

        // Identify required headers
        const requiredHeaders = ["firstname", "lastname", "phone", "email"]

        // Map column indices
        const firstNameIndex = headers.indexOf("firstname")
        const lastNameIndex = headers.indexOf("lastname")
        const phoneIndex = headers.indexOf("phone")
        const emailIndex = headers.indexOf("email")

        // Check if at least one required header exists
        if (firstNameIndex === -1 && lastNameIndex === -1 && phoneIndex === -1 && emailIndex === -1) {
          throw new Error("CSV must contain at least one of these columns: firstname, lastname, phone, email")
        }

        // Parse data rows
        const contacts = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue // Skip empty lines

          // Handle quoted values with commas inside
          const values = []
          let inQuotes = false
          let currentValue = ""

          for (let j = 0; j < line.length; j++) {
            const char = line[j]

            if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              values.push(currentValue.trim().replace(/^"|"$/g, ""))
              currentValue = ""
            } else {
              currentValue += char
            }
          }

          // Add the last value
          values.push(currentValue.trim().replace(/^"|"$/g, ""))

          // Create contact object
          const contact = {
            firstName: firstNameIndex >= 0 ? values[firstNameIndex] || "" : "",
            lastName: lastNameIndex >= 0 ? values[lastNameIndex] || "" : "",
            phone: phoneIndex >= 0 ? values[phoneIndex] || "" : "",
            email: emailIndex >= 0 ? values[emailIndex] || "" : "",
          }

          // Add all non-standard fields as additional fields
          const additionalFields = []
          headers.forEach((header, index) => {
            if (!requiredHeaders.includes(header)) {
              additionalFields.push({
                field: header,
                value: values[index] || "",
              })
            }
          })

          if (additionalFields.length > 0) {
            contact.additionalFields = additionalFields
          }

          contacts.push(contact)
        }

        resolve(contacts)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}
