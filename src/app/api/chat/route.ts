import { NextResponse } from "next/server";
import { generateChatWithGemini } from "@/lib/ai";
import { corsHeaders, withCors } from "@/lib/cors";
import { chatRequestSchema, chatResponseSchema } from "@/lib/schemas";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = chatRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid chat request." },
      withCors({ status: 400 }),
    );
  }

  const { situation, report, messages } = parsed.data;
  const fastApiUrl = process.env.FASTAPI_URL;

  if (fastApiUrl) {
    try {
      const response = await fetch(`${fastApiUrl.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, report, messages }),
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const valid = chatResponseSchema.safeParse(data);
        if (valid.success) return NextResponse.json(valid.data, withCors());
      }
    } catch {
      // The Next route can call Gemini directly when the Python service is not running.
    }
  }

  return NextResponse.json(await generateChatWithGemini(situation, report, messages), withCors());
}
