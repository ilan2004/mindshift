// Simple debug test without imports
const MBTI_QUESTIONS_24 = [
  // E vs I (6) - first 6 questions
  "You gain energy from being around people and external activity.",
  "You prefer discussing ideas out loud rather than reflecting silently.",
  "You are quick to engage and speak up in group settings.",
  "You feel refreshed after spending time alone with your thoughts.",
  "You often think through an idea fully before sharing it.",
  "You prefer a few close friends over a wide circle of acquaintances.",
  // Rest are S/N, T/F, J/P questions...
  "You rely on concrete facts and past experience when solving problems.",
  "You are attentive to practical details in day-to-day tasks.",
  "You prefer step-by-step instructions over open-ended exploration.",
  "You're drawn to patterns, possibilities, and big-picture connections.",
  "You enjoy brainstorming novel ideas and future scenarios.",
  "You often interpret information beyond what is explicitly stated.",
  "You prioritize objective criteria over personal values when deciding.",
  "You feel comfortable giving candid, critical feedback when needed.",
  "In debates, you value accuracy more than maintaining harmony.",
  "You consider the impact on people as much as the logic of a decision.",
  "You strive to create consensus and preserve relationships.",
  "You tend to empathize and see multiple personal perspectives.",
  "You like to plan ahead and close decisions rather than keep options open.",
  "You feel satisfied when tasks are completed well before deadlines.",
  "You prefer clear structure, schedules, and defined expectations.",
  "You enjoy keeping options open and adapting plans as things change.",
  "You're productive in flexible, spontaneous bursts rather than steady routines.",
  "You're comfortable starting before everything is fully defined.",
];

const MBTI_QUESTIONS_24_META = [
  // 0..5 -> EI
  { dim: 'EI', side: 'E' },  // Question 0
  { dim: 'EI', side: 'E' },  // Question 1 
  { dim: 'EI', side: 'E' },  // Question 2
  { dim: 'EI', side: 'I' },  // Question 3
  { dim: 'EI', side: 'I' },  // Question 4
  { dim: 'EI', side: 'I' },  // Question 5
  // Rest...
  { dim: 'SN', side: 'S' },
  { dim: 'SN', side: 'S' },
  { dim: 'SN', side: 'S' },
  { dim: 'SN', side: 'N' },
  { dim: 'SN', side: 'N' },
  { dim: 'SN', side: 'N' },
  { dim: 'TF', side: 'T' },
  { dim: 'TF', side: 'T' },
  { dim: 'TF', side: 'T' },
  { dim: 'TF', side: 'F' },
  { dim: 'TF', side: 'F' },
  { dim: 'TF', side: 'F' },
  { dim: 'JP', side: 'J' },
  { dim: 'JP', side: 'J' },
  { dim: 'JP', side: 'J' },
  { dim: 'JP', side: 'P' },
  { dim: 'JP', side: 'P' },
  { dim: 'JP', side: 'P' },
];

function likertWeight(v) {
  const n = Number(v || 0);
  const centered = Math.max(1, Math.min(5, n)) - 3; // -2..+2
  return centered;
}

function scoreMbtiLocal(answersMap, orderedTexts) {
  const indexByText = new Map();
  MBTI_QUESTIONS_24.forEach((t, i) => indexByText.set(t, i));

  const sums = {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  };

  const DIM_SIDES = {
    EI: ['E', 'I'],
    SN: ['S', 'N'],
    TF: ['T', 'F'],
    JP: ['J', 'P'],
  };

  for (let i = 1; i <= 24; i++) {
    const id = `q${i}`;
    const text = orderedTexts[i - 1];
    if (!text) continue;
    
    const idx = indexByText.get(text);
    if (idx == null) continue;
    
    const meta = MBTI_QUESTIONS_24_META[idx];
    const dim = meta.dim;
    const side = meta.side;

    const val = answersMap[id];
    if (val == null) continue;
    const w = likertWeight(val);

    console.log(`${id}: "${text.substring(0,50)}..." -> ${val} -> w=${w} -> ${side} (${dim})`);

    if (w === 0) continue; // neutral
    
    if (w > 0) {
      // Agreeing with question -> add points to the question's side
      sums[dim][side] += Math.abs(w);
      console.log(`  AGREE: +${Math.abs(w)} to ${side}`);
    } else {
      // Disagreeing with question -> add points to the OPPOSITE side  
      const [a, b] = DIM_SIDES[dim];
      const opposite = side === a ? b : a;
      sums[dim][opposite] += Math.abs(w);
      console.log(`  DISAGREE: +${Math.abs(w)} to ${opposite} (opposite of ${side})`);
    }
  }

  // Decide letters per dimension
  const letters = [];
  (['EI','SN','TF','JP']).forEach(dim => {
    const [a, b] = DIM_SIDES[dim];
    const sa = sums[dim][a];
    const sb = sums[dim][b];
    console.log(`${dim}: ${a}=${sa}, ${b}=${sb}`);
    letters.push(sa > sb ? a : b);
  });

  const type = letters.join('');
  return { type, scores: sums };
}

console.log('=== TESTING EXTRAVERTED ANSWERS ===\n');

// Create strongly extraverted answers
const extravertAnswers = {};
for (let i = 1; i <= 24; i++) {
  const id = `q${i}`;
  if (i <= 3) {
    // E-leaning questions: strongly agree
    extravertAnswers[id] = 5;
  } else if (i <= 6) {
    // I-leaning questions: strongly disagree  
    extravertAnswers[id] = 1;
  } else {
    // Other dimensions: neutral
    extravertAnswers[id] = 3;
  }
}

const result = scoreMbtiLocal(extravertAnswers, MBTI_QUESTIONS_24);

console.log('\n=== FINAL RESULT ===');
console.log('Type:', result.type);
console.log('EI Scores:', result.scores.EI);
console.log('Expected: E should win, got:', result.type[0]);

if (result.type[0] === 'E') {
  console.log('✅ SUCCESS: Scoring worked correctly');
} else {
  console.log('❌ FAILURE: Should be E but got', result.type[0]);
}
