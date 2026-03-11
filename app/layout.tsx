import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Frontra - Intern system",
  description: "Intern system för Frontra - checklista, arbetstidslogg och schema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">
        <SessionProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
