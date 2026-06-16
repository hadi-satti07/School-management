import type { Metadata } from "next";
import "./globals.css";

// ❌ Google Font ka import aur configuration humne yahan se hata di hai 
// taaki network error ki wajah se Turbopack crash na ho.

export const metadata: Metadata = {
  title: "EduCore - School Management",
  description: "Modern School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 📝 Inter ki jagah humne premium fallback sans-serif lagaya hai jo default super fast chalega */}
      <body style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}