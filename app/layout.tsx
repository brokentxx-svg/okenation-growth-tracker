import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Okenation Growth Room",
  description: "A private evidence-bounded growth tracker for the Okenation creator world.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
