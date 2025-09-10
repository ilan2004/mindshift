"use client";

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTutorial } from '../contexts/TutorialContext';
import { ChevronLeft, ChevronRight, X, Play, SkipForward } from 'lucide-react';

export default function TutorialModal() {
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
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP animations for modal entrance/exit
  useGSAP(() => {
    if (!modalRef.current || !isActive) return;

    // Animate modal entrance
    gsap.fromTo(overlayRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(contentRef.current,
      { 
        opacity: 0,
        scale: 0.8,
        y: 50
      },
      { 
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      }
    );
  }, [isActive, currentStep]);

  const handleClose = () => {
    if (!modalRef.current) return;
    
    // Animate modal exit
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    });

    gsap.to(contentRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.2,
      ease: "power2.in",
      onComplete: skipTutorial
    });
  };

  const handleNext = () => {
    if (!contentRef.current) return;
    
    // Animate step transition
    gsap.to(contentRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        nextStep();
        gsap.fromTo(contentRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  const handlePrevious = () => {
    if (!contentRef.current) return;
    
    gsap.to(contentRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        previousStep();
        gsap.fromTo(contentRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  // Don't render on server or when not active
  if (!mounted || !isActive || !currentTutorial || !currentStepData) {
    return null;
  }

  // Ensure document.body is available before creating portal
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-content"
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-2xl mx-auto"
      >
        {/* Main Modal Card using MindShift styles */}
        <div className="retro-console rounded-3xl p-4 md:p-8 max-h-[90vh] overflow-y-auto relative">
          {/* Close Button - Absolute positioned to top-right */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 md:top-5 md:right-5 flex items-center justify-center shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-10"
            style={{ color: 'var(--text-default)' }}
            aria-label="Close tutorial"
          >
            <X size={16} className="md:hidden" />
            <X size={20} className="hidden md:block" />
          </button>
          
          {/* Header */}
          <div className="mb-4 md:mb-6 pr-10">
            {/* Tutorial Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
              <div className="nav-pill nav-pill--cyan text-xs font-bold uppercase tracking-wider">
                Tutorial
              </div>
              <div className="nav-pill nav-pill--outline text-xs">
                Step {currentStep + 1} of {totalSteps}
              </div>
            </div>
            
            {/* Tutorial Title */}
            <h1 
              id="tutorial-title"
              className="text-xl md:text-2xl font-tanker text-mbti-primary mb-1 md:mb-2 leading-tight"
            >
              {currentStepData.title}
            </h1>
            
            {/* Tutorial Series Name */}
            <p className="text-mbti-secondary text-xs md:text-sm font-medium uppercase tracking-wide">
              {currentTutorial.title}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="stat-bar">
              <div 
                className="stat-bar__fill transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, var(--mbti-primary), var(--mbti-secondary))`
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <div 
              id="tutorial-content"
              className="component-surface rounded-2xl p-6 text-consistent text-base leading-relaxed"
              style={{ backgroundColor: 'var(--mbti-surface)' }}
            >
              {currentStepData.content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Previous/Skip Button */}
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="nav-pill nav-pill--outline flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="nav-pill nav-pill--outline text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <SkipForward size={14} />
                Skip Tutorial
              </button>
            </div>

            {/* Next/Complete Button */}
            <div className="flex items-center gap-3">
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="nav-pill nav-pill--primary flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={completeTutorial}
                  className="nav-pill nav-pill--primary flex items-center gap-2"
                >
                  <Play size={16} />
                  Get Started
                </button>
              )}
            </div>
          </div>

          {/* Decorative DNA Elements */}
          <div className="flex justify-center items-center mt-6 w-full opacity-60" aria-hidden="true">
            <div className="flex items-center justify-center w-full gap-3 px-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="dna-node"
                  style={{ 
                    backgroundColor: 'var(--mbti-primary)',
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
