/**
 * Parse a CSV file and return an array of contact objects
 *  – Tolerates many header spellings (name, full_name, first, firstname, last, surname …)
 *  – Can populate first/last name from one “Name / Full Name” column
 *  – Normalises AU phone numbers to E.164 (e.g. "(+61) 481 325 000" → "+61481325000")
 *
 * @param {File} file –  The CSV file selected in an <input type="file">
 * @returns {Promise<Array>}  Promise resolving to an array of {firstName,lastName,phone,email,additionalFields}
 */
export async function parseCSV(file) {
  const headerMap = {
    firstName:  /^(first[\s_]?name|first|given|forename)$/i,
    lastName:   /^(last[\s_]?name|surname|family)$/i,
    fullName:   /^(name|full[\s_]?name)$/i,
    phone:      /^(phone|mobile|phone[\s_]?number|contact[\s_]?no|tel|telephone)$/i,
    email:      /^(e[-\s_]?mail|email[\s_]?address|mail)$/i,
  };

  const normalisePhone = (raw = "") => {
    if (!raw) return "";
    let cleaned = raw.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) {
      cleaned = "+" + cleaned.slice(1).replace(/\D/g, "");
    } else {
      cleaned = cleaned.replace(/\D/g, "");
      if (cleaned.startsWith("0")) cleaned = "+61" + cleaned.slice(1);
      else cleaned = "+" + cleaned;
    }
    return cleaned;
  };

  const splitFullName = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return { first: "", last: "" };
    if (parts.length === 1) return { first: parts[0], last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") };
  };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Error reading file"));

    reader.onload = () => {
      try {
        const csvText = reader.result;
        const lines = csvText.split(/\r?\n/).filter(Boolean);

        if (!lines.length) throw new Error("CSV is empty");

        const rawHeaders = lines[0]
          .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
          .map(h => h.trim().replace(/^"|"$/g, ""));

        const columnToField = rawHeaders.map(header => {
          for (const [field, regex] of Object.entries(headerMap)) {
            if (regex.test(header)) return field;
          }
          return null;
        });

        if (!columnToField.some(f => ["firstName","lastName","fullName","phone","email"].includes(f)))
          throw new Error(
            'CSV must contain at least one column named like "First Name", "Last Name", "Name", "Phone", or "Email"'
          );

        const contacts = [];

        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i];
          if (!rawLine.trim()) continue;

          const values = rawLine
            .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map(v => v.trim().replace(/^"|"$/g, ""));

          const obj = { firstName: "", lastName: "", phone: "", email: "" };
          const additional = [];

          values.forEach((val, idx) => {
            switch (columnToField[idx]) {
              case "firstName":
                obj.firstName = val;
                break;
              case "lastName":
                obj.lastName = val;
                break;
              case "fullName": {
                const { first, last } = splitFullName(val);
                if (!obj.firstName) obj.firstName = first;
                if (!obj.lastName) obj.lastName = last;
                break;
              }
              case "phone":
                obj.phone = normalisePhone(val);
                break;
              case "email":
                obj.email = val.toLowerCase();
                break;
              default:
                additional.push({
                  field: rawHeaders[idx].toLowerCase(),
                  value: val,
                });
            }
          });

          if (additional.length) obj.additionalFields = additional;
          contacts.push(obj);
        }

        resolve(contacts);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsText(file);
  });
}
