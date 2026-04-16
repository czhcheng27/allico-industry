import type { Metadata } from "next";

import { ContactPage } from "@/components/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact Us | Allico Industries",
  description:
    "Contact Allico Industries for cargo control, towing products, and related equipment inquiries.",
};

type ContactRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSingleValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactRoutePage({
  searchParams,
}: ContactRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const intent = toSingleValue(resolvedSearchParams.intent);

  return <ContactPage showCustomOrderNotice={intent === "custom-order"} />;
}
