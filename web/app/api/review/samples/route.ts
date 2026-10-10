import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
  try {
    const res = await fetch(`${backendUrl}/review/requests/rev_req_igl_001/samples`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    // Backend offline, return fallback
  }

  // Fallback sample items
  return NextResponse.json({
    items: [
      {
        id: "sample-igl-001",
        record_id: "rec-001",
        input_text: "Good morning, how did you sleep?",
        expected_text: "Ọlọjọ kọla, amá kpe?",
        context: "Daily greetings & courtesy",
        flagged_reason: "Tone markings verification on 'amá'",
      },
      {
        id: "sample-igl-002",
        record_id: "rec-002",
        input_text: "Water is essential for life.",
        expected_text: "Ómi che n'uche kpaí ọma olé.",
        context: "General knowledge & biology",
        flagged_reason: "Check diacritics on 'Ómi' and apostrophe in 'n'uche'",
      },
      {
        id: "sample-igl-003",
        record_id: "rec-003",
        input_text: "The king is seated upon the ancestral throne.",
        expected_text: "Àtá d'ojí akpẹ́ ẹnẹwú.",
        context: "Traditional leadership & culture",
        flagged_reason: "Validate capitalization of royal title 'Àtá'",
      },
      {
        id: "sample-igl-004",
        record_id: "rec-004",
        input_text: "Welcome to our home.",
        expected_text: "Kú alẹwa kpaí olé wa.",
        context: "Hospitality & welcoming phrases",
        flagged_reason: "Potential dialectal variation",
      },
    ],
    total: 4,
    source: "Next.js proxy",
  });
}
