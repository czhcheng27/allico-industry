import type { Metadata } from "next";

import { ReturnsWarrantyPage } from "@/components/returns-and-warranty/returns-warranty-page";

export const metadata: Metadata = {
  title: "Returns and Warranty | Allico Industries",
  description:
    "Learn about returns, warranty support, and customer assistance at Allico Industries.",
};

export default function ReturnsWarrantyRoutePage() {
  return <ReturnsWarrantyPage />;
}
