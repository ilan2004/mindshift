import Link from "next/link";
import localFont from "next/font/local";
import FooterFocusBar from "../components/FooterFocusBar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ClientLayout from "../components/ClientLayout";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./globals.css";

export const metadata = {
  title: "MindShift",
  description: "MindShift app",
};

// Load Tanker font and expose as CSS variable --font-tanker
const tanker = localFont({
  src: [
    {
      path: "../../public/Tanker_Complete/Fonts/WEB/fonts/Tanker-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-tanker",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Viewport for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        {/* PWA: manifest and theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        {/* Mobile PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/next.svg" />
        {/* Google Fonts now loaded globally via pages/_document.js */}
      </head>
      <body className={`antialiased ${tanker.variable}`}>
        <ThemeProvider>
          <ClientLayout>
            <Navbar />
            {/* Global SVG symbols (placed once) */}
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
              <defs>
                <symbol id="chev-down" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </symbol>
              </defs>
            </svg>
            <main className="min-h-screen mx-auto px-4 md:px-6 py-6">{children}</main>
            <Footer />
            <FooterFocusBar />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
