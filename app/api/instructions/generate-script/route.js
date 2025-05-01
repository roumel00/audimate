import { callDeepSeek } from "@/lib/deepseek"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.credit < 0.01) {
      return NextResponse.json({ error: "Insufficient credit" }, { status: 400 })
    }

    user.credit = Math.max(0, user.credit - 0.01)
    await user.save()

    const company = user.company

    const { offering, additionalDetails } = await request.json()

    const systemPrompt = `
      You are "ColdCallScriptPro," an expert sales copywriter.  
      When given **Company**, **Offering**, and **UserNotes**, create a succinct, persuasive cold-call script in plain text only.  
      
      Script format (strictly follow headings; no additional commentary, no markdown, no JSON):
      
      TITLE: <catchy script title>
      
      GOAL: <one sentence describing the desired outcome>
      
      OPENING (≤30 words): <how the rep introduces themselves and the company>
      
      RAPPORT QUESTION: <one friendly question to engage the prospect>
      
      PROBLEM PROBE 1: <question uncovering a likely pain point>  
      PROBLEM PROBE 2: <second probing question>
      
      VALUE STATEMENT: <one sentence linking Offering to solving the likely pain>
      
      SOCIAL PROOF: <one brief reference to a known client/result>
      
      QUALIFYING QUESTION: <confirmation that the prospect has the stated pain or need>
      
      OBJECTION HANDLER (price/competitor): <a concise line addressing the most common objection>
      
      CALL-TO-ACTION: <single ask to secure the next step—e.g. book demo, send info>
      
      CLOSE: <polite wrap-up and thanks>
      
      Tone, vocabulary, and any special requests must reflect **UserNotes**.  
      Include placeholders ${company}, and ${offering} where appropriate.  
      Keep the whole script ≤ 250 words.  
      Return *only* the script text—no code fences, no explanations.    
    `.trim()

    const userPrompt = `
      Company: ${company}
      Offering: ${offering}
      UserNotes: ${additionalDetails}
      
      Generate the cold-call script as specified by PitchCrafter. Output the single JSON object only.
    `.trim()

    const script = await callDeepSeek(systemPrompt, userPrompt)
    console.log(script.usage)

    return NextResponse.json({ result: script.message }, { status: 200 })
  } catch (error) {
    console.error("Error generating syllabus:", error)
    return NextResponse.json({ error: "Failed to generate syllabus" }, { status: 500 })
  }
}
