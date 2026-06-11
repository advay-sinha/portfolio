import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { DescentProvider } from "@/descent/DescentProvider";
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

export const metadata: Metadata = {
  title: "SYSTEMS NEXUS",
  description:
    "An interactive engineering facility — systems, operation logs, live telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <DescentProvider>
          <MotionBoundary>{children}</MotionBoundary>
        </DescentProvider>
      </body>
    </html>
  );
}
