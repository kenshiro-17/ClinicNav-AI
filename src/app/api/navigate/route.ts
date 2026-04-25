import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/ai";
import { corsHeaders, withCors } from "@/lib/cors";
import { buildNavigationResult, detectRisk } from "@/lib/navigationRules";
import { navigationResultSchema, navigateRequestSchema } from "@/lib/schemas";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = navigateRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      withCors({ status: 400 }),
    );
  }

  const input = parsed.data;
  const risk = detectRisk(input);

  if (risk.riskLevel === "emergency") {
    return NextResponse.json(buildNavigationResult(input, "rules"), withCors());
  }

  const fastApiUrl = process.env.FASTAPI_URL;
  if (fastApiUrl) {
    try {
      const response = await fetch(`${fastApiUrl.replace(/\/$/, "")}/navigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const valid = navigationResultSchema.safeParse(data);
        if (valid.success) return NextResponse.json(valid.data, withCors());
      }
    } catch {
      // Keep the demo reliable if the Python service is not running.
    }
  }

  const result = await generateWithGemini(input);
  return NextResponse.json(result, withCors());
}
