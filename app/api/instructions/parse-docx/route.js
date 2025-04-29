import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import mammoth from "mammoth"

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the uploaded file from the request
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ message: "Only .docx files are supported" }, { status: 400 })
    }

    // Convert the file to a buffer
    const buffer = await file.arrayBuffer()

    try {
      // Use mammoth to extract text from the Word document
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value

      return NextResponse.json({ text })
    } catch (error) {
      console.error("Error parsing Word document:", error)
      return NextResponse.json({ message: "Failed to parse Word document" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
