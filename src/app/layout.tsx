import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OASIS Payroll Intelligence Platform | OASIS Insurance Brokers Pvt. Ltd.",
  description: "Enterprise SaaS Payroll & Attendance Automation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
