"use client";

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTutorial } from '../contexts/TutorialContext';
import { ChevronLeft, ChevronRight, X, Play, Target } from 'lucide-react';

export default function TutorialHighlight() {
  const {
    isActive,
    currentTutorial,
    currentStepData,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
  } = useTutorial();

  const [mounted, setMounted] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, position: 'bottom' });
  
  const highlightRef = useRef(null);
  const tooltipRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find and position the highlight around the target element
  useEffect(() => {
    if (!isActive || !currentStepData?.target) {
      setTargetElement(null);
      return;
    }

    const findTarget = () => {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        setTargetElement(element);
        updatePositions(element);
      } else {
        // Target not found, try again after a short delay
        setTimeout(findTarget, 100);
      }
    };

    findTarget();
  }, [isActive, currentStepData?.target, currentStep]);

  const updatePositions = (element) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const padding = 8;

    // Highlight position (around the target element)
    setHighlightPosition({
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + (padding * 2),
      height: rect.height + (padding * 2)
    });

    // Always center all tutorial tooltips for optimal user experience
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(320, viewportWidth - 32); // Responsive width with 16px margin on each side
    const tooltipHeight = 240; // Increased height for better content fit
    
    // Force center positioning for ALL tooltips
    const centerY = Math.max(50, Math.min(viewportHeight * 0.4, (viewportHeight - tooltipHeight) / 2));
    let tooltipX = (viewportWidth / 2) - (tooltipWidth / 2);
    let tooltipY = centerY;
    let position = 'center';
    
    // Ensure tooltip stays within viewport bounds with generous margins
    const horizontalMargin = viewportWidth < 640 ? 16 : 20; // Smaller margins on mobile
    const verticalMargin = viewportHeight < 640 ? 20 : 50; // Smaller vertical margins on mobile
    
    tooltipX = Math.max(horizontalMargin, Math.min(tooltipX, viewportWidth - tooltipWidth - horizontalMargin));
    tooltipY = Math.max(verticalMargin, Math.min(tooltipY, viewportHeight - tooltipHeight - verticalMargin));
    
    // For very small screens, adjust positioning
    if (viewportHeight < 600) {
      tooltipY = Math.max(20, Math.min(80, (viewportHeight - tooltipHeight) / 2));
    }

    setTooltipPosition({ x: tooltipX, y: tooltipY, position });
  };

  // Update positions on scroll/resize
  useEffect(() => {
    if (!targetElement) return;

    const handleUpdate = () => updatePositions(targetElement);
    
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement]);

  // GSAP animations
  useGSAP(() => {
    if (!isActive || !targetElement || !highlightRef.current || !tooltipRef.current) return;

    // Animate highlight entrance
    gsap.fromTo(highlightRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
    );

    // Animate tooltip entrance with delay
    gsap.fromTo(tooltipRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.2, ease: "power3.out" }
    );

    // Pulsing animation for the highlight
    gsap.to(highlightRef.current, {
      scale: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

  }, [isActive, targetElement, currentStep]);

  const handleNext = () => {
    if (!tooltipRef.current) return;
    
    gsap.to(tooltipRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        nextStep();
        gsap.fromTo(tooltipRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  const handlePrevious = () => {
    if (!tooltipRef.current) return;
    
    gsap.to(tooltipRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        previousStep();
        gsap.fromTo(tooltipRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  const handleClose = () => {
    if (highlightRef.current && tooltipRef.current) {
      gsap.to([highlightRef.current, tooltipRef.current], {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: "power2.in",
        onComplete: skipTutorial
      });
    } else {
      skipTutorial();
    }
  };

  // Don't render if not active, no target, or no step data
  if (!mounted || !isActive || !currentStepData?.target || !targetElement) {
    return null;
  }

  // Ensure document.body is available before creating portal
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return createPortal(
    <>
      {/* Dark overlay with cut-out for highlighted element */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998]"
        style={{
          background: `
            radial-gradient(
              ellipse ${highlightPosition.width + 40}px ${highlightPosition.height + 40}px 
              at ${highlightPosition.x + highlightPosition.width/2}px ${highlightPosition.y + highlightPosition.height/2}px,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, 0.7) 70%
            )
          `
        }}
        onClick={handleClose}
      />

      {/* Highlight border around target element */}
      <div
        ref={highlightRef}
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: `${highlightPosition.x}px`,
          top: `${highlightPosition.y}px`,
          width: `${highlightPosition.width}px`,
          height: `${highlightPosition.height}px`,
          border: '3px solid var(--mbti-primary)',
          borderRadius: '12px',
          boxShadow: `
            0 0 0 2px white,
            0 0 20px var(--mbti-primary),
            inset 0 0 20px rgba(255, 255, 255, 0.1)
          `
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-80 max-w-[calc(100vw-2rem)] sm:max-w-sm"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
        }}
      >
        {/* Tooltip pointer - only show for non-center positioned tooltips */}
        {tooltipPosition.position !== 'center' && (
          <div
            className="absolute w-3 h-3 bg-mbti-surface border-2 border-mbti-primary transform rotate-45 z-10"
            style={{
              [tooltipPosition.position === 'top' ? 'bottom' : 'top']: '-7px',
              left: '50%',
              marginLeft: '-6px',
            }}
          />
        )}

        {/* Tooltip content */}
        <div 
          className={`retro-console rounded-2xl p-4 sm:p-6 shadow-2xl relative ${tooltipPosition.position === 'center' ? 'border-4 border-mbti-primary' : ''}`}
          style={tooltipPosition.position === 'center' ? { 
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 4px var(--mbti-surface), 0 0 20px var(--mbti-primary)' 
          } : {}}
        >
          {/* Close button - absolutely positioned in top-right */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 nav-icon-btn opacity-75 hover:opacity-100 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mbti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-mbti-surface w-10 h-10 sm:w-8 sm:h-8 z-10"
            aria-label="Close tutorial"
          >
            <X size={16} />
          </button>
          
          {/* Header */}
          <div className="mb-3 sm:mb-4 pr-12 sm:pr-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="nav-pill nav-pill--cyan text-xs font-bold">
                <Target size={12} className="mr-1" />
                {currentStep + 1}/{totalSteps}
              </div>
            </div>
            
            <h3 className="h3 font-tanker text-mbti-primary mb-1">
              {currentStepData.title}
            </h3>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="stat-bar h-1">
              <div 
                className="stat-bar__fill transition-all duration-300"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: `var(--mbti-primary)`
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-4 sm:mb-6">
            <p className="text-consistent text-sm leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="nav-pill nav-pill--outline nav-pill--compact flex items-center gap-1"
                >
                  <ChevronLeft size={12} />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="nav-pill nav-pill--primary nav-pill--compact flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={12} />
                </button>
              ) : (
                <button
                  onClick={completeTutorial}
                  className="nav-pill nav-pill--primary nav-pill--compact flex items-center gap-1"
                >
                  <Play size={12} />
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
