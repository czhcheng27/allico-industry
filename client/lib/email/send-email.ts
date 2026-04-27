import { Resend } from "resend";

import { InquiryConfirmationEmail } from "@/emails/inquiry-confirmation-email";
import { SiteInquiryEmail } from "@/emails/site-inquiry-email";
import { type InquiryPayload } from "@/lib/inquiry-form";

const EMAIL_ENV_KEYS = [
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
] as const;

type EmailEnvKey = (typeof EMAIL_ENV_KEYS)[number];

type SendInquiryEmailResult =
  | {
      ok: true;
      id: string | null;
      confirmation: {
        ok: boolean;
        id: string | null;
      };
    }
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

async function sendEmail(
  resend: Resend,
  options: Parameters<Resend["emails"]["send"]>[0],
) {
  const response = await resend.emails.send(options);

  if (response.error) {
    throw new Error(response.error.message || "Resend returned an error.");
  }

  return response.data?.id ?? null;
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
    const internalRecipients = String(process.env.CONTACT_TO_EMAIL || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!from || internalRecipients.length === 0) {
      return {
        ok: false,
        reason: "missing_config",
        missing,
      };
    }

    const internalEmailId = await sendEmail(resend, {
      from,
      to: internalRecipients,
      replyTo: payload.email,
      subject: `[${payload.formName}] New inquiry from ${payload.name}`,
      react: SiteInquiryEmail(payload),
    });

    let confirmation = {
      ok: true,
      id: null as string | null,
    };

    try {
      const confirmationId = await sendEmail(resend, {
        from,
        to: payload.email,
        subject: `We received your ${payload.formName} inquiry`,
        react: InquiryConfirmationEmail(payload),
      });

      confirmation = {
        ok: true,
        id: confirmationId,
      };
    } catch (error) {
      console.error("Failed to send inquiry confirmation email.", error);
      confirmation = {
        ok: false,
        id: null,
      };
    }

    return {
      ok: true,
      id: internalEmailId,
      confirmation,
    };
  } catch (error) {
    console.error("Failed to send inquiry email.", error);

    return {
      ok: false,
      reason: "send_failed",
    };
  }
}
