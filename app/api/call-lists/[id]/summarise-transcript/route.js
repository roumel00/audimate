import { callDeepSeek } from "@/lib/deepseek";
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const {transcription } = await request.json();

    const systemPrompt = `
      You are “Call-Scout,” an AI analyst who reviews outbound sales (cold-call) conversations.  
      When given a raw transcript, produce a concise **plain-text summary** (no JSON, no markdown fences) that covers:
      
      • Prospect profile  
      • Call purpose  
      • Key needs / pain points (max 3)  
      • Objections raised (if any)  
      • Outcome of the call  
      • Recommended next steps for the rep  
      • Overall sentiment (positive / neutral / negative)  
      • 1-2 quotable moments (≤120 characters each)
      
      Formatting rules:  
      1. Use short labeled sections in the above order, each on its own line (e.g., “Prospect profile: …”).  
      2. Keep the entire summary under 200 words.  
      3. Do **not** invent details—derive everything from the transcript.      
    `.trim();

    const userPrompt = `
      Here is the raw transcript of a cold call between our sales rep and a prospect:

      ${transcription}
      
      Please summarise it following the exact section headings and rules provided by Call-Scout.
    `.trim();

    const transcriptionSummary = await callDeepSeek(systemPrompt, userPrompt)
    console.log(transcriptionSummary.usage)

    return NextResponse.json({ result: transcriptionSummary.message }, { status: 200 });
  } catch (error) {
    console.error("Error generating syllabus:", error);
    return NextResponse.json({ error: "Failed to generate syllabus" }, { status: 500 });
  }
}