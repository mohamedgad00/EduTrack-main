import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainProvider from "@/components/providers";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: "EduTrack",
  description: "A simple educational tracking app built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} antialiased`}
      >
        <MainProvider>
          {children}
        </MainProvider>
      </body>
    </html>
  );
}
