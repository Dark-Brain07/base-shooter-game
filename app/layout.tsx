import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base Shooter - Bubble Shooter on Base Blockchain",
  description: "Play bubble shooter and save your high scores on Base blockchain. Compete on the leaderboard!",
  metadataBase: new URL("https://base-shooter-game.vercel.app"),
  openGraph: {
    title: "Base Shooter - Blockchain Bubble Shooter",
    description: "Play bubble shooter and save scores on Base blockchain",
    images: ["/og-image.png"],
    url: "https://base-shooter-game.vercel.app",
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://base-shooter-game.vercel.app/og-image.png",
    "fc:frame:button:1": "Play Game",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://base-shooter-game.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
