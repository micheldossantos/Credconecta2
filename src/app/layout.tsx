import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CredConecta - Sistema de Empréstimos",
  description: "Sistema mobile para gestão de empréstimos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}