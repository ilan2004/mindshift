"use client";

import { useTutorial } from "@/contexts/TutorialContext";
import { Lightbulb, Check } from "lucide-react";

export default function HelpBulb({ 
  tutorialId, 
  title = "Learn about this", 
  className = "",
  position = "top-2 right-2",
  variant = "subtle" // "subtle", "accent", or "minimal"
}) {
  const { startTutorial, completedTutorials, userPreferences } = useTutorial();

  const completed = completedTutorials?.has?.(tutorialId);

  // Don't show if user has disabled tooltips
  if (!userPreferences.showTooltips) {
    return null;
  }

  // Variant styles for different integration levels - all relative positioned
  const variants = {
    subtle: {
      base: "relative z-10 inline-flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 group cursor-pointer",
      size: "w-6 h-6 sm:w-7 sm:h-7",
      colors: completed 
        ? "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300"
        : "bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300",
      icon: "w-3.5 h-3.5 sm:w-4 sm:h-4",
      shadow: "shadow-sm hover:shadow-md"
    },
    accent: {
      base: "relative z-10 inline-flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group cursor-pointer",
      size: "w-7 h-7 sm:w-8 sm:h-8",
      colors: completed
        ? "bg-gray-200 hover:bg-gray-300 text-gray-700 border-2 border-gray-400"
        : "bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-300 hover:border-gray-400",
      icon: "w-4 h-4 sm:w-4.5 sm:h-4.5",
      shadow: "shadow-md hover:shadow-lg"
    },
    minimal: {
      base: "relative z-10 inline-flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 group cursor-pointer",
      size: "w-5 h-5 sm:w-6 sm:h-6",
      colors: completed
        ? "bg-transparent hover:bg-gray-100 text-gray-500 border border-transparent hover:border-gray-200"
        : "bg-transparent hover:bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200",
      icon: "w-3 h-3 sm:w-3.5 sm:h-3.5",
      shadow: "hover:shadow-sm"
    }
  };

  const style = variants[variant] || variants.subtle;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Starting tutorial:', tutorialId);
        startTutorial(tutorialId);
      }}
      className={`${style.base} ${style.size} ${style.colors} ${style.shadow} ${className}`}
      aria-label={title}
      title={title}
    >
      {completed ? (
        <Check className={`${style.icon} transition-transform duration-200`} strokeWidth={1.5} />
      ) : (
        <Lightbulb className={`${style.icon} transition-transform duration-200 group-hover:rotate-12`} strokeWidth={1} />
      )}
      
      {/* Subtle pulse indicator for incomplete tutorials */}
      {!completed && variant !== 'minimal' && (
        <div 
          className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gray-400 rounded-full animate-pulse opacity-75"
        />
      )}
      
      {/* Hover tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        {completed ? "Tutorial completed" : "Click for tutorial"}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
      </div>
    </button>
  );
}
