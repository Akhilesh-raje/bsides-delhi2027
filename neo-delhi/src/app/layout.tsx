import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConsoleSignal } from "@/components/layout/ConsoleSignal";
import { SoundToggle } from "@/components/layout/SoundToggle";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "BSides Delhi 2027 | Neo-Delhi",
    template: "%s | BSides Delhi 2027",
  },
  description:
    "BSides Delhi 2027 — India's premier community-driven cybersecurity conference. Two days of talks, workshops, CTF, and networking in the heart of New Delhi.",
  keywords: [
    "BSides Delhi",
    "cybersecurity conference",
    "infosec",
    "CTF",
    "New Delhi",
    "security",
    "hacking",
  ],
  openGraph: {
    title: "BSides Delhi 2027 | Neo-Delhi",
    description:
      "India's premier community-driven cybersecurity conference. February 13-14, 2027.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads; ignore those mismatches. */}
      <body className="min-h-full flex flex-col bg-obsidian text-silver" suppressHydrationWarning>
        {/* Skip to content (accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-signal focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>

        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <ConsoleSignal />
        <SoundToggle />
      </body>
    </html>
  );
}
