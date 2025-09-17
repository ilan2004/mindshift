// Debug script to test MBTI scoring
import { scoreMbtiLocal } from './src/lib/mbtiLocalScoring.js';
import { MBTI_QUESTIONS_24 } from './src/lib/mbtiQuestions24.js';

console.log('=== DEBUGGING MBTI SCORING ===\n');

// Create answers that should heavily favor Extraversion
const extravertAnswers = {};
const orderedTexts = MBTI_QUESTIONS_24;

// Let's answer all E-questions with 5 (strongly agree) 
// and all I-questions with 1 (strongly disagree)
for (let i = 1; i <= 24; i++) {
  const questionText = MBTI_QUESTIONS_24[i - 1];
  const id = `q${i}`;
  
  // Questions 0,1,2 are E-leaning (should answer 5)
  // Questions 3,4,5 are I-leaning (should answer 1) 
  if (i <= 3) {
    extravertAnswers[id] = 5; // Strongly agree with E questions
    console.log(`${id}: "${questionText}" -> AGREE (5) -> Should increase E`);
  } else if (i <= 6) {
    extravertAnswers[id] = 1; // Strongly disagree with I questions  
    console.log(`${id}: "${questionText}" -> DISAGREE (1) -> Should increase E`);
  } else {
    // For other dimensions, use neutral
    extravertAnswers[id] = 3;
  }
}

console.log('\n=== SCORING RESULT ===');
const result = scoreMbtiLocal(extravertAnswers, orderedTexts);

console.log('Final Type:', result.type);
console.log('Scores:', result.scores);

console.log('\n=== EXPECTED vs ACTUAL ===');
console.log('Expected EI result: E should win heavily');
console.log('Actual EI result:', result.scores.EI);
console.log('E score:', result.scores.EI.E);
console.log('I score:', result.scores.EI.I);

if (result.type[0] === 'E') {
  console.log('✅ SUCCESS: Got E as expected');
} else {
  console.log('❌ FAILURE: Got I instead of E');
  console.log('This indicates a scoring bug!');
}
