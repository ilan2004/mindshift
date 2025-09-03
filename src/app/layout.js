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
          <nav className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg" aria-label="Go to Home">
              MindShift
            </Link>
            <div className="navbar-actions">
              <Link href="/leaderboard" className="nav-pill nav-pill--cyan">Leaderboard</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
