import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";

import { BackToTopButton } from "@/components/site/back-to-top-button";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allico Industries - Heavy-Duty Towing & Cargo Solutions",
  description:
    "Allico Industries delivers heavy-duty towing, recovery, and cargo control equipment for commercial fleets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${roboto.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}
