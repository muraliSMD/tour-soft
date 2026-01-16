import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata = {
  title: "TorSoft | Premium Tournament Management",
  description: "The ultimate platform for organizing and managing multi-sport tournaments with ease and style.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-text-main antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
