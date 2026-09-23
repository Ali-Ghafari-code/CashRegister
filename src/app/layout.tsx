import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "کش‌رجیستر | سامانه صندوق فروش سازمانی",
  description:
    "سامانه یکپارچه صندوق فروش، مدیریت انبار، مشتری، وفاداری و گزارش‌گیری سازمانی",
  applicationName: "CashRegister POS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="font-sans bg-surface text-slate-800 antialiased selection:bg-brand-200/70">
        {children}
      </body>
    </html>
  );
}
