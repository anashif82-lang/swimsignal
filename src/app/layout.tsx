import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SwimSignal – Signal Your Next Level Swimming",
    template: "%s | SwimSignal",
  },
  description:
    "Premium performance platform for competitive swimmers and coaches. Track training, analyze results, identify trends, and improve with data.",
  keywords: [
    "swimming analytics",
    "swim training",
    "competitive swimming",
    "swim coach platform",
    "swimming performance",
  ],
  openGraph: {
    title: "SwimSignal",
    description: "Signal your next level swimming.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030d1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
