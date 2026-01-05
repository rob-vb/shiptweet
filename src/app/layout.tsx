import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShipTweet - Build in Public, Effortlessly",
  description:
    "Turn your GitHub commits into engaging tweets. Ship code, we'll write the tweet.",
  keywords: ["indie hacker", "build in public", "twitter", "github", "developer tools"],
  openGraph: {
    title: "ShipTweet - Build in Public, Effortlessly",
    description: "Turn your GitHub commits into engaging tweets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
