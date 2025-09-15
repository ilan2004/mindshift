"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllTypes } from '@/lib/personalityData';

const QUIZ_QUESTIONS = [
  {
    q: "When facing a complex problem, you prefer to:",
    choices: [
      "Think it through systematically before acting",
      "Jump in and figure it out as you go",
      "Discuss it with others to get different perspectives",
      "Research all available information first"
    ],
    weights: { 0: { J: 2, T: 1 }, 1: { P: 2, S: 1 }, 2: { E: 2, F: 1 }, 3: { I: 1, N: 1 } }
  },
  {
    q: "In social situations, you typically:",
    choices: [
      "Feel energized and seek out conversations",
      "Prefer smaller groups or one-on-one interactions", 
      "Find them draining and need alone time after",
      "Enjoy them but prefer familiar faces"
    ],
    weights: { 0: { E: 3 }, 1: { I: 1, E: 1 }, 2: { I: 3 }, 3: { I: 1, S: 1 } }
  },
  {
    q: "When making decisions, you rely most on:",
    choices: [
      "Logical analysis and objective facts",
      "How it will affect people and relationships",
      "What feels right in your gut",
      "Past experience and proven methods"
    ],
    weights: { 0: { T: 3 }, 1: { F: 3 }, 2: { F: 1, N: 1 }, 3: { S: 2, J: 1 } }
  },
  {
    q: "You prefer to:",
    choices: [
      "Have a clear plan and stick to it",
      "Keep your options open and adapt as needed",
      "Make quick decisions and move forward",
      "Carefully weigh all possibilities"
    ],
    weights: { 0: { J: 3 }, 1: { P: 3 }, 2: { J: 1, E: 1 }, 3: { P: 1, I: 1 } }
  },
  {
    q: "You're more interested in:",
    choices: [
      "Practical, real-world applications",
      "Theoretical concepts and possibilities", 
      "How things work in detail",
      "The bigger picture and future potential"
    ],
    weights: { 0: { S: 2, T: 1 }, 1: { N: 2, T: 1 }, 2: { S: 3 }, 3: { N: 3 } }
  }
];

export default function RetakeQuizModal({ onClose }) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [loading, setLoading] = useState(false);

  const handleAnswer = (choiceIndex) => {
    const question = QUIZ_QUESTIONS[currentQ];
    const weights = question.weights[choiceIndex] || {};
    
    // Add weights to scores
    const newScores = { ...scores };
    Object.entries(weights).forEach(([trait, weight]) => {
      newScores[trait] += weight;
    });
    setScores(newScores);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Quiz complete - calculate result
      finishQuiz(newScores);
    }
  };

  const finishQuiz = (finalScores) => {
    setLoading(true);
    
    // Calculate personality type
    const result = 
      (finalScores.E > finalScores.I ? 'E' : 'I') +
      (finalScores.S > finalScores.N ? 'S' : 'N') +
      (finalScores.T > finalScores.F ? 'T' : 'F') +
      (finalScores.J > finalScores.P ? 'J' : 'P');

    console.log('Quiz result:', result, 'Scores:', finalScores);

    // Save to localStorage
    try {
      localStorage.setItem('Nudge_personality_type', result);
      localStorage.setItem('Nudge_profile_seen', 'false'); // Show profile again
      
      // Navigate to new type page
      setTimeout(() => {
        router.push(`/about/${result.toLowerCase()}`);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      setLoading(false);
    }
  };

  const question = QUIZ_QUESTIONS[currentQ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div 
        className="rounded-xl max-w-md w-full p-6"
        style={{ 
          background: "var(--surface)", 
          border: "2px solid var(--color-green-900)", 
          boxShadow: "0 4px 0 var(--color-green-900)" 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-tanker text-2xl tracking-widest text-green" style={{ lineHeight: 1 }}>
            Personality Quiz
          </h3>
          {!loading && (
            <button className="nav-pill" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-sm text-neutral-600">Calculating your personality type...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>{Math.round(((currentQ + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-900 transition-all duration-300"
                  style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-800 mb-4">
                {question.q}
              </h4>
              <div className="space-y-2">
                {question.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="block w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-green-900 transition-colors"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-neutral-600 text-center">
              This quick quiz will update your personality type and redirect you to your new profile page.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
