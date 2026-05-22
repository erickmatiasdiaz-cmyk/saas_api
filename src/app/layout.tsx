import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApiGestor Chile | SaaS Apicola",
  description: "Gestion apicola con inspecciones rapidas, trazabilidad, ventas y respaldo SAG/SIPEC."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
