export type InquiryPayload = {
  formName: string;
  source: string;
  name: string;
  email: string;
  description: string;
};

type InquiryParseResult =
  | { success: true; data: InquiryPayload }
  | { success: false; errors: string[] };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

export function parseInquiryPayload(raw: unknown): InquiryParseResult {
  if (!raw || typeof raw !== "object") {
    return {
      success: false,
      errors: ["Invalid request body."],
    };
  }

  const input = raw as Record<string, unknown>;
  const data: InquiryPayload = {
    formName: readText(input, "formName") || "Website Inquiry",
    source: readText(input, "source") || "website",
    name: readText(input, "name"),
    email: readText(input, "email"),
    description: readText(input, "description"),
  };

  const errors: string[] = [];

  if (!data.name) {
    errors.push("Name is required.");
  }

  if (!data.email) {
    errors.push("Email is required.");
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!data.description) {
    errors.push("Description is required.");
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data,
  };
}
