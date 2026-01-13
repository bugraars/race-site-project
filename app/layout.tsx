import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympos Hard Enduro",
  description: "Olympos Hard Enduro Official Race Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
