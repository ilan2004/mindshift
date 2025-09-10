"use client";

import TutorialModal from './TutorialModal';
import TutorialHighlight from './TutorialHighlight';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * TutorialManager - Orchestrates the tutorial system
 * 
 * This component decides which tutorial UI to show:
 * - TutorialModal: For steps without specific targets (general introductions)
 * - TutorialHighlight: For steps that target specific UI elements
 * 
 * Usage: Add this component once in your app layout, after TutorialProvider
 */
export default function TutorialManager() {
  const { isActive, currentStepData } = useTutorial();

  if (!isActive) {
    return null;
  }

  // If the current step has a target, show highlight tutorial
  // Otherwise, show the modal tutorial
  if (currentStepData?.target) {
    return <TutorialHighlight />;
  }

  return <TutorialModal />;
}
