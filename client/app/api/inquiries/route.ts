import { NextResponse } from "next/server";

import { sendInquiryEmail } from "@/lib/email/send-email";
import { parseInquiryPayload } from "@/lib/inquiry-form";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsed = parseInquiryPayload(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.errors[0],
        errors: parsed.errors,
      },
      { status: 400 },
    );
  }

  const result = await sendInquiryEmail(parsed.data);

  if (!result.ok && result.reason === "missing_config") {
    return NextResponse.json(
      {
        message:
          "Email sending is not configured yet. Add RESEND_API_KEY, CONTACT_FROM_EMAIL, and CONTACT_TO_EMAIL to enable delivery.",
        missing: result.missing,
      },
      { status: 503 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        message:
          "We couldn't send your message right now. Please try again later.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Your message has been sent successfully.",
    id: result.id,
  });
}
