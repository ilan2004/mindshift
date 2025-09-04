import Link from "next/link";
import localFont from "next/font/local";
import FooterFocusBar from "../components/FooterFocusBar";
import Navbar from "../components/Navbar";
import ClientLayout from "../components/ClientLayout";
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Homemade+Apple&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased ${tanker.variable}`}>
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
          <main className="mx-auto px-4 md:px-6 py-6">{children}</main>
          <FooterFocusBar />
        </ClientLayout>
      </body>
    </html>
  );
}
