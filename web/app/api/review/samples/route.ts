import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("request_id");

  if (!requestId) {
    return NextResponse.json(
      { detail: "Missing required request_id query parameter." },
      { status: 400 },
    );
  }

  const rawBaseURL = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://yim-n-atlas-language-foundry.onrender.com/api/v1"
  ).replace(/\/+$/, "");
  const backendUrl = rawBaseURL.endsWith("/api/v1") ? rawBaseURL : `${rawBaseURL}/api/v1`;

  try {
    const res = await fetch(
      `${backendUrl}/review/requests/${encodeURIComponent(requestId)}/samples`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to connect to backend review endpoint.";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
