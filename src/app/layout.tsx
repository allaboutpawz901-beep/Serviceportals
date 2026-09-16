import type { Metadata } from "next";
import { Montserrat, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* Montserrat Medium — sidebar + topbar (--font-bar) */
const montserrat = Montserrat({
  variable: "--font-bar",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/* Hanken Grotesk — canvas / content (--font-sans + --font-display)
 * NOTE: The client spec calls for Laski Sans Regular, which is a commercial
 * font (Type Network, not on Google Fonts). Hanken Grotesk is the closest
 * free humanist sans-serif alternative. If the client has a Laski Sans
 * license, drop the .woff2 files into /public/fonts/ and replace this
 * import with a local @font-face declaration. */
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "All About Pawz OS - Dashboard",
  description:
    "Pet grooming operations management, appointment scheduling, staff capacity, revenue analytics, and client records for All About Pawz.",
  openGraph: {
    title: "All About Pawz OS - Dashboard",
    description:
      "Pet grooming operations management, appointment scheduling, staff capacity, revenue analytics, and client records for All About Pawz.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All About Pawz OS - Dashboard",
    description:
      "Pet grooming operations management, appointment scheduling, staff capacity, revenue analytics, and client records for All About Pawz.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${hankenGrotesk.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
