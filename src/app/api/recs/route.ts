import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, llmMethod } = await req.json();
    let reply = "";

    if (llmMethod === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a music recommendation assistant." },
            { role: "user", content: prompt },
          ],
        }),
      });
      const data = await response.json();
      reply = data?.choices?.[0]?.message?.content || "";
    }

    if (llmMethod === "huggingface") {
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HF_API_KEY || ""}`,
        },
        body: JSON.stringify({ inputs: prompt }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ HuggingFace returned non-JSON:", text);
        return NextResponse.json({ error: "HuggingFace returned HTML or error page" }, { status: 500 });
      }

      reply = data?.[0]?.generated_text || "";

    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
