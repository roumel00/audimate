import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function callDeepSeek(systemPrompt, userPrompt) {
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    // model: "deepseek-reasoner",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return { 
    message: completion.choices[0].message.content,
    usage: { 
      input: completion.usage.prompt_tokens,
      output: completion.usage.completion_tokens
    }
  };
}
