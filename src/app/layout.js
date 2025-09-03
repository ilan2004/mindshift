import { Inter, Homemade_Apple } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const homemade = Homemade_Apple({
  weight: "400",
  variable: "--font-accent",
  subsets: ["latin"],
});

export const metadata = {
  title: "MindShift",
  description: "MindShift app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${homemade.variable} antialiased`}
      >
        <header className="border-b">
          <nav className="nav mx-auto max-w-5xl px-6 py-3">
            <Link href="/" className="nav-btn nav-btn--outline" aria-label="Go to Home">
              MindShift
            </Link>

            <Link href="/" className="nav-btn">Home</Link>

            <button className="nav-icon-btn" aria-label="Open menu" type="button">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <Link href="/leaderboard" className="nav-btn">Leaderboard</Link>

            <a href="#get-app" className="nav-btn nav-btn--primary">Get the app</a>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
