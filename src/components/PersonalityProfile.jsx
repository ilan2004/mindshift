"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const personalityData = {
  analysts: {
    title: "You are an Analyst",
    points: [
      "You are a strategic thinker, with a plan for everything.",
      "You value logic and reason above all else.",
      "You are driven by a desire for knowledge and self-improvement.",
      "You can sometimes be seen as detached or overly critical.",
    ],
  },
  diplomats: {
    title: "You are a Diplomat",
    points: [
      "You are an idealist, always striving to make the world a better place.",
      "You are guided by your principles and values.",
      "You are empathetic and caring, with a deep understanding of others.",
      "You may struggle with making difficult decisions that conflict with your values.",
    ],
  },
  achievers: {
    title: "You are an Achiever",
    points: [
      "You are a natural leader, with a talent for organizing people and resources.",
      "You are driven by success and achieving your goals.",
      "You thrive in social situations and enjoy being part of a team.",
      "You might feel restless when you are not productive.",
    ],
  },
  explorers: {
    title: "You are an Explorer",
    points: [
      "You are spontaneous and adaptable, always ready for a new adventure.",
      "You live in the moment and enjoy new experiences.",
      "You are a quick thinker and an excellent problem-solver.",
      "You may get bored with routine and long-term planning.",
    ],
  },
};

export default function PersonalityProfile({ cluster, onDone }) {
  const [isVisible, setIsVisible] = useState(false);
  const data = personalityData[cluster] || personalityData.achievers;

  useEffect(() => {
    if (cluster) {
      const timer = setTimeout(() => setIsVisible(true), 100); // Short delay for transition
      return () => clearTimeout(timer);
    }
  }, [cluster]);

  const handleClose = () => {
    setIsVisible(false);
    // Delay closing to allow for animation
    setTimeout(() => {
      if (onDone) {
        onDone();
      }
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`card transform transition-all duration-300 max-w-md w-full ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)",
          padding: "1.5rem"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="h2 text-green font-tanker">{data.title}</h2>
          <button 
            onClick={handleClose}
            className="nav-icon-btn"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <ul className="space-y-4 text-lg" style={{ color: "var(--text-default)" }}>
          {data.points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-xl" style={{ color: "var(--accent)" }}>•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <button
            onClick={handleClose}
            className="nav-pill nav-pill--primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
