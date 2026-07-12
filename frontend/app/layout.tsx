import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EcoSphere - ESG Management Portal",
  description: "Measure, Manage, and Improve your ESG impact interactively.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body overflow-x-hidden antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
