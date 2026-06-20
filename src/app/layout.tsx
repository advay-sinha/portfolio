import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Oxanium } from "next/font/google";

import { IDENTITY } from "@/content/identity";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { MotionBoundary } from "@/motion/MotionBoundary";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${IDENTITY.name}`,
    // Dossier routes set their own full titles; everything else inherits.
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${IDENTITY.name}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${IDENTITY.name}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${oxanium.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <MotionBoundary>{children}</MotionBoundary>
      </body>
    </html>
  );
}
