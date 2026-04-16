import type { Metadata } from "next";

import { ContactPage } from "@/components/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact Us | Allico Industries",
  description:
    "Contact Allico Industries for cargo control, towing products, and related equipment inquiries.",
};

export default function ContactRoutePage() {
  return <ContactPage />;
}
