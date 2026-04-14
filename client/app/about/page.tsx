import type { Metadata } from "next";

import { AboutPage } from "@/components/about/about-page";

export const metadata: Metadata = {
  title: "About Us | Allico Industries",
  description:
    "Learn how Allico Industries supports customers across Canada and the United States with cargo control, towing products, and dependable service.",
};

export default function AboutRoutePage() {
  return <AboutPage />;
}
