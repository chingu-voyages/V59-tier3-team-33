import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { AuthInitializer } from "@/components/AuthInitializer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JoyRoute",
  description: "Turn your destinations into the most efficient routes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={twMerge("bg-gray-50 min-h-dvh flex flex-col", inter.className)}>
        <AuthInitializer />
        <Navigation />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
