import Link from "next/link";
import FooterFocusBar from "../components/FooterFocusBar";
import "./globals.css";

export const metadata = {
  title: "MindShift",
  description: "MindShift app",
};

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
      <body className={`antialiased`}>
        <header className="border-b">
          <nav className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg" aria-label="Go to Home">
              MindShift
            </Link>
            <div className="navbar-actions">
              <Link href="/leaderboard" className="nav-pill nav-pill--cyan">Leaderboard</Link>
              <Link href="/game" className="nav-pill nav-pill--cyan">Game</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
        <FooterFocusBar />
      </body>
    </html>
  );
}
