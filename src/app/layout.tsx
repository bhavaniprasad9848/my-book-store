import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { Providers } from "@/components/Providers";
import { LibraryLight } from "@/components/LibraryLight";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--ff-sans",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--ff-serif",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "My Book Store",
  description: "Second-hand books in good reading condition, with secure checkout.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <LibraryLight />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
