import { Resend } from "resend";

import { SiteInquiryEmail } from "@/emails/site-inquiry-email";
import { type InquiryPayload } from "@/lib/inquiry-form";

const EMAIL_ENV_KEYS = [
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
] as const;

type EmailEnvKey = (typeof EMAIL_ENV_KEYS)[number];

type SendInquiryEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "missing_config"; missing: EmailEnvKey[] }
  | { ok: false; reason: "send_failed" };

let resendClient: Resend | null = null;

function getMissingEmailConfig() {
  return EMAIL_ENV_KEYS.filter((key) => !String(process.env[key] || "").trim());
}

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendInquiryEmail(
  payload: InquiryPayload,
): Promise<SendInquiryEmailResult> {
  const missing = getMissingEmailConfig();

  if (missing.length > 0) {
    return {
      ok: false,
      reason: "missing_config",
      missing,
    };
  }

  const resend = getResendClient();

  if (!resend) {
    return {
      ok: false,
      reason: "missing_config",
      missing,
    };
  }

  try {
    const from = String(process.env.CONTACT_FROM_EMAIL || "").trim();
    const to = String(process.env.CONTACT_TO_EMAIL || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!from || to.length === 0) {
      return {
        ok: false,
        reason: "missing_config",
        missing,
      };
    }

    const response = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: `[${payload.formName}] New inquiry from ${payload.name}`,
      react: SiteInquiryEmail(payload),
    });

    return {
      ok: true,
      id: response.data?.id ?? null,
    };
  } catch (error) {
    console.error("Failed to send inquiry email.", error);

    return {
      ok: false,
      reason: "send_failed",
    };
  }
}
