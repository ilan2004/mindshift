// src/lib/mbtiLocalScoring.js
// Local scoring helper for the 24-item bank.
// Input: answers map from TestRunner: { [questionId]: 1..5 }
//        displayed texts array in order (length 24)
// Output: { type: 'INTJ', scores: { EI: {E,I}, SN: {S,N}, TF: {T,F}, JP: {J,P} } }

import { MBTI_QUESTIONS_24, MBTI_QUESTIONS_24_META } from '@/lib/mbtiQuestions24';

const DIM_SIDES = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Map Likert 1..5 to a signed weight relative to agreement with the item side
// 1 -> -2 (strongly disagree), 2 -> -1, 3 -> 0, 4 -> +1, 5 -> +2
function likertWeight(v) {
  const n = Number(v || 0);
  const centered = clamp(n, 1, 5) - 3; // -2..+2
  return centered;
}

export function scoreMbtiLocal(answersMap, orderedTexts) {
  // Build index map from displayed text to index in canonical 24 list to align with META
  const indexByText = new Map();
  MBTI_QUESTIONS_24.forEach((t, i) => indexByText.set(t, i));

  // Initialize cumulative scores per dimension sides
  const sums = {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  };

  // Iterate questions as displayed to the user
  orderedTexts.forEach((text, pageIndex) => {
    const idx = indexByText.has(text) ? indexByText.get(text) : -1;
    if (idx < 0 || idx >= MBTI_QUESTIONS_24_META.length) return;
    const meta = MBTI_QUESTIONS_24_META[idx];
    const dim = meta.dim;
    const side = meta.side; // E/S/T/J or I/N/F/P

    // Answers map keys are q1..q24 in TestRunner, but we just need value
    // We'll search for the answer value by matching orderedTexts position back to TestRunner ids
    // The caller should pass orderedTexts aligned with ids q1..qN to be safe.
  });

  // Alternative: Walk answersMap using id order and map to text list
  const textsByIdOrder = [];
  for (let i = 1; i <= 24; i++) {
    const id = `q${i}`;
    const text = orderedTexts[i - 1];
    if (!text) continue;
    const idx = indexByText.has(text) ? indexByText.get(text) : -1;
    if (idx < 0) continue;
    const meta = MBTI_QUESTIONS_24_META[idx];
    const dim = meta.dim;
    const side = meta.side;

    const val = answersMap[id];
    if (val == null) continue;
    const w = likertWeight(val);

    if (w === 0) continue; // neutral, no contribution
    
    // FIXED LOGIC: If w > 0 (agree), add points to the question's stated side
    // If w < 0 (disagree), add points to the OPPOSITE side
    if (w > 0) {
      // Agreeing with question -> add points to the side the question represents
      sums[dim][side] += Math.abs(w);
    } else {
      // Disagreeing with question -> add points to the OPPOSITE side
      const [a, b] = DIM_SIDES[dim];
      const opposite = side === a ? b : a;
      sums[dim][opposite] += Math.abs(w);
    }
  }

  // Decide letters per dimension
  const letters = [];
  (['EI','SN','TF','JP']).forEach(dim => {
    const [a, b] = DIM_SIDES[dim];
    const sa = sums[dim][a];
    const sb = sums[dim][b];
    if (sa === sb) {
      // tie-break: use balanced random selection to avoid systematic bias
      const options = [a, b];
      const randomChoice = options[Math.floor(Math.random() * options.length)];
      letters.push(randomChoice);
    } else {
      letters.push(sa > sb ? a : b);
    }
  });

  const type = letters.join('');
  return { type, scores: sums };
}

