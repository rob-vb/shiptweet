import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Commeet - Build in Public, Effortlessly",
  description:
    "Turn your GitHub commits into engaging tweets. Commit + Tweet = Commeet.",
  keywords: ["indie hacker", "build in public", "twitter", "github", "developer tools"],
  openGraph: {
    title: "Commeet - Build in Public, Effortlessly",
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
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
