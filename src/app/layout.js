import Link from "next/link";
import localFont from "next/font/local";
import FooterFocusBar from "../components/FooterFocusBar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ClientLayout from "../components/ClientLayout";
import NotificationManager from "../components/NotificationManager";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TutorialProvider } from "../contexts/TutorialContext";
import TutorialManager from "../components/TutorialManager";
import "./globals.css";
import "../styles/personality-colors.css";

export const metadata = {
  title: "Nudge – Gentle Guidance. Better Habits.",
  description: "Nudge - Your personality-driven focus toolkit. Gentle nudges toward better productivity habits with AI-driven insights and smart blocking tools.",
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
        {/* Theme initialization script - must run BEFORE React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                function getPersonalityType() {
                  try { return localStorage.getItem('nudge_personality_type') || 'INFP'; } catch { return 'INFP'; }
                }
                function getGender() {
                  try {
                    const gender = localStorage.getItem('ms_gender');
                    return gender === 'W' ? 'female' : gender === 'M' ? 'male' : null;
                  } catch { return null; }
                }
                function getThemePreference() {
                  try { return localStorage.getItem('nudge_theme_mode') || 'personality'; } catch { return 'personality'; }
                }
                const MBTI_COLORS = {
                  'INTJ': { primary: 'var(--color-purple-400)', text: 'var(--color-green-900)' },
                  'INTP': { primary: 'var(--color-cyan-200)', text: 'var(--color-green-900)' },
                  'ENTJ': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
                  'ENTP': { primary: 'var(--color-pink-500)', text: 'var(--color-cream)' },
                  'INFJ': { primary: 'var(--color-purple-400)', text: 'var(--color-green-900)' },
                  'INFP': { primary: 'var(--color-lilac-300)', text: 'var(--color-green-900)' },
                  'ENFJ': { primary: 'var(--color-teal-300)', text: 'var(--color-green-900)' },
                  'ENFP': { primary: 'var(--color-yellow-200)', text: 'var(--color-green-900)' },
                  'ISTJ': { primary: 'var(--color-blue-400)', text: 'var(--color-cream)' },
                  'ISFJ': { primary: 'var(--color-pink-200)', text: 'var(--color-green-900)' },
                  'ESTJ': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
                  'ESFJ': { primary: 'var(--color-pink-500)', text: 'var(--color-cream)' },
                  'ISTP': { primary: 'var(--color-teal-300)', text: 'var(--color-green-900)' },
                  'ISFP': { primary: 'var(--color-lilac-300)', text: 'var(--color-green-900)' },
                  'ESTP': { primary: 'var(--color-orange-500)', text: 'var(--color-cream)' },
                  'ESFP': { primary: 'var(--color-yellow-200)', text: 'var(--color-green-900)' }
                };
                function getGenderAwareColors(personalityType, gender) {
                  if (!gender) return MBTI_COLORS[personalityType] || MBTI_COLORS['INFP'];
                  const type = personalityType.toUpperCase();
                  const groups = {
                    'INTJ': 'analyst', 'INTP': 'analyst', 'ENTJ': 'analyst', 'ENTP': 'analyst',
                    'INFJ': 'diplomat', 'INFP': 'diplomat', 'ENFJ': 'diplomat', 'ENFP': 'diplomat',
                    'ISTJ': 'sentinel', 'ISFJ': 'sentinel', 'ESTJ': 'sentinel', 'ESFJ': 'sentinel',
                    'ISTP': 'explorer', 'ISFP': 'explorer', 'ESTP': 'explorer', 'ESFP': 'explorer'
                  };
                  const group = groups[type] || 'diplomat';
                  const suffix = gender === 'female' ? '-fem' : '-masc';
                  const textColors = {
                    'analyst-fem': 'rgb(91, 33, 182)', 'analyst-masc': 'rgb(76, 29, 149)',
                    'diplomat-fem': 'rgb(154, 52, 18)', 'diplomat-masc': 'rgb(154, 52, 18)',
                    'sentinel-fem': 'rgb(101, 67, 33)', 'sentinel-masc': 'rgb(45, 69, 28)',
                    'explorer-fem': 'rgb(161, 98, 7)', 'explorer-masc': 'rgb(153, 27, 27)'
                  };
                  return {
                    primary: 'var(--color-' + group + suffix + '-primary)',
                    text: textColors[group + suffix] || 'var(--color-green-900)'
                  };
                }
                function applyImmediateTheme() {
                  const themeMode = getThemePreference();
                  const root = document.documentElement;
                  const body = document.body;
                  if (themeMode === 'mint') {
                    root.style.setProperty('--mbti-primary', 'var(--color-mint-500)');
                    root.style.setProperty('--mbti-secondary', 'var(--color-green-900)');
                    root.style.setProperty('--mbti-accent', 'var(--color-pink-500)');
                    root.style.setProperty('--mbti-text-primary', 'var(--color-green-900)');
                    root.style.setProperty('--mbti-surface', 'var(--color-cream)');
                    root.style.setProperty('--mbti-progress', 'var(--color-mint-500)');
                    root.style.setProperty('--mbti-bg-pattern', 'var(--color-mint-500)');
                    body.className = body.className.replace(/mbti-\\w+/g, '') + ' mbti-default';
                  } else {
                    const personalityType = getPersonalityType();
                    const gender = getGender();
                    const colors = getGenderAwareColors(personalityType, gender);
                    root.style.setProperty('--mbti-primary', colors.primary);
                    root.style.setProperty('--mbti-secondary', colors.primary);
                    root.style.setProperty('--mbti-accent', colors.primary);
                    root.style.setProperty('--mbti-text-primary', colors.text);
                    root.style.setProperty('--mbti-surface', 'var(--color-cream)');
                    root.style.setProperty('--mbti-progress', colors.primary);
                    root.style.setProperty('--mbti-bg-pattern', colors.primary);
                    body.className = body.className.replace(/mbti-\\w+/g, '') + ' mbti-' + personalityType.toLowerCase();
                    if (gender) body.className += ' mbti-' + (gender === 'female' ? 'feminine' : 'masculine');
                  }
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyImmediateTheme);
                } else {
                  applyImmediateTheme();
                }
                window.__THEME_INITIALIZED__ = true;
                
                // Global function to refresh theme (called after personality updates)
                window.refreshTheme = function() {
                  applyImmediateTheme();
                };
              })();
            `
          }}
        />
        {/* Mobile PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/next.svg" />
        {/* Google Fonts now loaded globally via pages/_document.js */}
      </head>
      <body className={`antialiased ${tanker.variable}`} style={{ transition: 'all 0.2s ease-in-out' }}>
        <ThemeProvider>
          <TutorialProvider>
            <NotificationManager>
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
                <TutorialManager />
              </ClientLayout>
            </NotificationManager>
          </TutorialProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
