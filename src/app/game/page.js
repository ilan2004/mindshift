"use client";

import { useEffect, useState } from 'react';

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timer to hide the loading state after 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-start justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-xl text-[rgb(3,89,77)] font-medium">Loading your game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 pt-8">
        <div className="max-w-4xl mx-auto bg-[rgb(252,205,220)] rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border-4 border-black">
          <h1 className="text-2xl font-bold mb-4">Game</h1>
          <div className="border-4 border-black rounded p-6 min-h-[400px] flex items-center justify-center bg-[#ffff94]">
            <p className="text-4xl text-[#03594d] font-sans font-extrabold tracking-wider leading-none" style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              lineHeight: 1
            }}>BRUH!!! ARE YOU NUTS !!! HUH?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
