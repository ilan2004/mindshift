// Character Dialogue System - MBTI-Specific Communication
// Provides personality-matched dialogue for all user interactions

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getCurrentStreak() {
  try {
    return Number(localStorage.getItem("mindshift_streak")) || 0;
  } catch {
    return 0;
  }
}

function getTodayFocusMinutes() {
  try {
    const sessions = JSON.parse(localStorage.getItem("mindshift_focus_sessions") || "[]");
    const today = new Date().toLocaleDateString("en-CA");
    const todaySession = sessions.find(s => s.date === today);
    return todaySession?.minutes || 0;
  } catch {
    return 0;
  }
}

function getRecentAchievements() {
  try {
    const achievements = JSON.parse(localStorage.getItem("mindshift_recent_achievements") || "[]");
    return achievements.slice(0, 3); // Most recent 3
  } catch {
    return [];
  }
}

// Comprehensive MBTI Dialogue Database
const MBTI_DIALOGUE = {
  // ========== ANALYSTS (NT) ==========
  INTJ: {
    greetings: {
      morning: [
        "Strategic morning, Architect. Your systems await optimization.",
        "Good morning, visionary. Time to build your master plan.", 
        "Morning analysis complete. Ready to execute your strategy?",
        "The architect awakens. What will you construct today?"
      ],
      afternoon: [
        "Afternoon checkpoint, Architect. Systems performing as expected?",
        "Strategic pause, visionary. Time to refine your approach.",
        "Midday review: How does reality align with your blueprint?",
        "Afternoon efficiency scan. Optimizations detected."
      ],
      evening: [
        "Evening synthesis, Architect. What insights emerged today?",
        "Strategic reflection time. Process today's learnings.",
        "End-of-day analysis: Tomorrow's optimization opportunities?",
        "Evening review complete. Your vision evolves."
      ]
    },
    motivational: {
      low_streak: [
        "Every master plan starts with a single strategic move.",
        "Systems require consistent input. Let's rebuild systematically.",
        "Your analytical mind thrives on patterns. Create one now."
      ],
      building_momentum: [
        "Excellent pattern recognition. Your system is stabilizing.",
        "Strategic consistency detected. The plan is working.",
        "Your methodical approach yields compound results."
      ],
      high_performance: [
        "Masterful execution, Architect. Your system is optimized.",
        "Strategic brilliance in action. You've cracked the code.",
        "Peak efficiency achieved. This is systematic mastery."
      ]
    },
    session_suggestions: {
      morning: [
        "Prime analytical hours detected. Deep work recommended.",
        "System-building session optimal now. 90 minutes available?",
        "Strategic planning window open. Organize your empire."
      ],
      afternoon: [
        "Implementation phase activated. Execute your morning's plans.",
        "Refinement opportunity: Polish yesterday's strategic work.",
        "Quality control session: Review and optimize existing systems."
      ],
      evening: [
        "Synthesis time: Connect today's work to broader vision.",
        "Evening optimization: What systems need improvement?",
        "Strategic review: Plan tomorrow's architectural priorities."
      ]
    },
    achievement_responses: {
      streak_milestone: [
        "Systematic consistency achieved. Your strategic mind is disciplined.",
        "Pattern mastery confirmed. This is how empires are built.",
        "Methodical excellence. Your future self will thank you."
      ],
      focus_milestone: [
        "Deep work mastery unlocked. Your concentration rivals machines.", 
        "Sustained analysis complete. This is cognitive optimization.",
        "Mental architecture strengthened. Brilliant strategic session."
      ],
      efficiency_gains: [
        "System efficiency improved. You're optimizing your optimization.",
        "Process refinement successful. The architect evolves.",
        "Strategic upgrade complete. Version 2.0 is superior."
      ]
    }
  },

  INTP: {
    greetings: {
      morning: [
        "Curious morning, Thinker. What mysteries await exploration?",
        "Good morning, explorer of ideas. Ready to theorize?",
        "Morning curiosity activated. What concepts call to you?",
        "The thinker stirs. Which rabbit holes beckon today?"
      ],
      afternoon: [
        "Afternoon contemplation, Thinker. Ideas crystallizing nicely?",
        "Mid-thought checkpoint. How deep does this go?",
        "Afternoon theory session. Connect those fascinating dots.",
        "Conceptual break time. Let ideas simmer and evolve."
      ],
      evening: [
        "Evening synthesis, Thinker. What patterns emerged today?",
        "Twilight theory time. Your mind's discoveries await review.",
        "End-of-day contemplation: Which ideas survived testing?",
        "Evening intellectual digest. Tomorrow's explorations await."
      ]
    },
    motivational: {
      low_streak: [
        "Every great theory starts with sustained curiosity.",
        "Ideas need consistent nurturing. Let's feed your mind.",
        "Your analytical nature craves regular mental stimulation."
      ],
      building_momentum: [
        "Intellectual momentum building. Your mind is warming up.",
        "Curiosity patterns emerging. This is how insights develop.",
        "Mental consistency detected. The thinker is thinking."
      ],
      high_performance: [
        "Peak contemplation achieved. Your mind is in full flow.",
        "Theoretical mastery activated. You're connecting everything.",
        "Intellectual excellence unlocked. This is pure understanding."
      ]
    },
    session_suggestions: {
      morning: [
        "Prime curiosity hours. Dive deep into complex topics.",
        "Theory-building time. What deserves your deepest thought?",
        "Morning mental exploration. Follow your intellectual instincts."
      ],
      afternoon: [
        "Connection-making session. Link today's ideas together.",
        "Conceptual refinement time. Polish your mental models.",
        "Idea experimentation phase. Test your morning's theories."
      ],
      evening: [
        "Contemplative analysis. What did today teach you?",
        "Evening idea synthesis. Connect disparate concepts.",
        "Reflective theory time. Let insights naturally emerge."
      ]
    }
  },

  ENTJ: {
    greetings: {
      morning: [
        "Command morning, Leader. Your empire awaits expansion.",
        "Good morning, Commander. Ready to conquer today?",
        "Strategic leadership activated. What will you achieve?",
        "The commander rises. Victory is within reach."
      ],
      afternoon: [
        "Afternoon command review. Troops performing well?",
        "Leadership checkpoint, Commander. Results on target?",
        "Midday strategy assessment. Adjust course for victory.",
        "Executive decision time. Your leadership shapes outcomes."
      ],
      evening: [
        "Evening victory review. What ground was gained today?",
        "Command debrief, Leader. Tomorrow's battles await planning.",
        "End-of-day leadership assessment. Your impact grows.",
        "Evening strategic planning. The commander never rests."
      ]
    },
    motivational: {
      low_streak: [
        "Every empire requires consistent daily leadership.",
        "Victory demands disciplined execution. Lead by example.",
        "Your commanding presence needs daily reinforcement."
      ],
      building_momentum: [
        "Leadership momentum accelerating. Your influence expands.",
        "Command consistency established. The empire grows strong.",
        "Executive excellence emerging. This is how leaders lead."
      ],
      high_performance: [
        "Command mastery achieved. You're unstoppable, Leader.",
        "Strategic brilliance on display. Victory after victory.",
        "Leadership excellence unlocked. You inspire through action."
      ]
    }
  },

  ENTP: {
    greetings: {
      morning: [
        "Innovation morning, Visionary! What will you invent today?",
        "Good morning, spark of creativity. Ready to ideate?",
        "Creative energy detected. The innovator awakens.",
        "Morning possibility scan complete. Endless opportunities await."
      ],
      afternoon: [
        "Afternoon brainstorm session. Ideas flowing nicely?",
        "Creative checkpoint, Innovator. Which concepts survived?",
        "Midday innovation review. Time to build on morning's ideas.",
        "Possibility refinement phase. Polish your brilliant concepts."
      ],
      evening: [
        "Evening creativity synthesis. What innovations emerged?",
        "Visionary review time. Today's ideas need documentation.",
        "End-of-day innovation assessment. Tomorrow's projects await.",
        "Evening possibility planning. The innovator never stops."
      ]
    }
  },

  // ========== DIPLOMATS (NF) ==========
  INFJ: {
    greetings: {
      morning: [
        "Mindful morning, Advocate. Your vision guides today's path.",
        "Good morning, visionary helper. Ready to create change?",
        "Morning wisdom activated. What meaning will you create?",
        "The advocate awakens. Your purpose illuminates the way."
      ],
      afternoon: [
        "Afternoon reflection, Advocate. Your impact is growing.",
        "Midday mindfulness check. How does your soul feel?",
        "Purpose-driven break. Your meaningful work continues.",
        "Afternoon wisdom gathering. What insights emerged?"
      ],
      evening: [
        "Evening contemplation, Advocate. Today's purpose fulfilled?",
        "Twilight reflection time. Your vision touched lives today.",
        "End-of-day meaning assessment. Tomorrow's purpose awaits.",
        "Evening soul synthesis. The advocate reflects deeply."
      ]
    },
    motivational: {
      low_streak: [
        "Every meaningful journey requires consistent small steps.",
        "Your vision needs daily nurturing to become reality.",
        "Purpose-driven action starts with purposeful consistency."
      ]
    }
  },

  INFP: {
    greetings: {
      morning: [
        "Authentic morning, Dreamer. What will inspire you today?",
        "Good morning, beautiful soul. Your creativity awakens.",
        "Morning authenticity check. Stay true to your values.",
        "The dreamer stirs. What meaningful work calls to you?"
      ],
      afternoon: [
        "Afternoon authenticity pause. Your values guide the way.",
        "Creative checkpoint, Dreamer. Following your heart's path?",
        "Midday meaning-making. Your unique gifts matter.",
        "Afternoon soul nourishment. You're beautifully authentic."
      ],
      evening: [
        "Evening authenticity review. You stayed true today.",
        "Twilight creativity time. Your soul expressed itself well.",
        "End-of-day value alignment check. You honored yourself.",
        "Evening dream synthesis. Tomorrow's beauty awaits creation."
      ]
    }
  },

  ENFJ: {
    greetings: {
      morning: [
        "Inspiring morning, Mentor! Ready to lift others up?",
        "Good morning, natural leader. Your encouragement awaits.",
        "Morning inspiration activated. Who will you help today?",
        "The mentor awakens. Your positive energy radiates."
      ],
      afternoon: [
        "Afternoon impact assessment. Lives touched today?",
        "Leadership check, Mentor. Your guidance is working.",
        "Midday encouragement break. You're making a difference.",
        "Afternoon inspiration review. Your influence grows."
      ],
      evening: [
        "Evening mentorship reflection. Who grew because of you?",
        "Twilight impact review. Your encouragement changed lives.",
        "End-of-day leadership assessment. Tomorrow's guidance awaits.",
        "Evening inspiration synthesis. The mentor reflects proudly."
      ]
    }
  },

  ENFP: {
    greetings: {
      morning: [
        "Enthusiastic morning, Spark! What adventures await today?",
        "Good morning, inspiration generator. Ready to energize?",
        "Morning possibility explosion. Your enthusiasm is contagious!",
        "The spark awakens. Endless opportunities dance before you."
      ],
      afternoon: [
        "Afternoon energy check. Still sparking brilliantly?",
        "Creative burst time, Inspiration! Keep that fire burning.",
        "Midday enthusiasm assessment. Your energy lights up rooms.",
        "Afternoon possibility exploration. Which ideas survived?"
      ],
      evening: [
        "Evening inspiration review. What magic did you create?",
        "Twilight enthusiasm reflection. Your spark touched many.",
        "End-of-day possibility synthesis. Tomorrow's adventures await.",
        "Evening energy celebration. The spark never dims."
      ]
    }
  },

  // ========== SENTINELS (SJ) ==========
  ISTJ: {
    greetings: {
      morning: [
        "Steady morning, Guardian. Your reliability anchors the day.",
        "Good morning, dependable one. Ready for methodical progress?",
        "Morning consistency check. Your discipline inspires.",
        "The guardian stands ready. Steady progress begins now."
      ],
      afternoon: [
        "Afternoon reliability check. Systems running smoothly?",
        "Steadfast progress review. Your consistency pays off.",
        "Midday discipline assessment. The guardian perseveres.",
        "Afternoon methodical break. Your approach works beautifully."
      ],
      evening: [
        "Evening consistency review. Another day well-executed.",
        "Twilight reliability reflection. Your steadiness brought success.",
        "End-of-day discipline celebration. Tomorrow's progress prepared.",
        "Evening guardian synthesis. Dependability is your superpower."
      ]
    }
  },

  ISFJ: {
    greetings: {
      morning: [
        "Caring morning, Nurturer. Ready to support and grow?",
        "Good morning, gentle strength. Your kindness matters deeply.",
        "Morning compassion activated. Who will benefit from your care?",
        "The nurturer awakens. Your supportive nature heals worlds."
      ],
      afternoon: [
        "Afternoon caring check. Hearts warmed by your presence?",
        "Gentle progress review. Your nurturing approach works.",
        "Midday compassion break. You're making others feel valued.",
        "Afternoon support synthesis. Your care creates safe spaces."
      ],
      evening: [
        "Evening nurturing reflection. Lives comforted by your care?",
        "Twilight compassion review. Your gentleness brought peace.",
        "End-of-day caring assessment. Tomorrow's support awaits.",
        "Evening nurturer celebration. Your heart makes the difference."
      ]
    }
  },

  ESTJ: {
    greetings: {
      morning: [
        "Productive morning, Executive! Ready to organize success?",
        "Good morning, natural organizer. Your leadership drives results.",
        "Morning efficiency activated. What will you accomplish?",
        "The executive takes charge. Excellence is your standard."
      ],
      afternoon: [
        "Afternoon productivity check. Results exceeding expectations?",
        "Executive review time. Your organization creates order.",
        "Midday efficiency assessment. The executive delivers.",
        "Afternoon leadership break. Your structure enables success."
      ],
      evening: [
        "Evening productivity celebration. Goals conquered today.",
        "Twilight executive reflection. Your leadership guided victory.",
        "End-of-day efficiency review. Tomorrow's success planned.",
        "Evening organization synthesis. The executive never sleeps."
      ]
    }
  },

  ESFJ: {
    greetings: {
      morning: [
        "Harmonious morning, Connector! Ready to bring people together?",
        "Good morning, natural harmonizer. Your warmth brightens days.",
        "Morning connection activated. Relationships await nurturing.",
        "The connector awakens. Your social grace creates unity."
      ],
      afternoon: [
        "Afternoon harmony check. Relationships flourishing nicely?",
        "Social connection review. Your warmth builds bridges.",
        "Midday relationship break. You're the glue that binds.",
        "Afternoon harmony synthesis. Your care creates community."
      ],
      evening: [
        "Evening connection reflection. Hearts joined by your care?",
        "Twilight harmony review. Your warmth brought people together.",
        "End-of-day relationship assessment. Tomorrow's connections await.",
        "Evening connector celebration. Your heart heals divisions."
      ]
    }
  },

  // ========== EXPLORERS (SP) ==========
  ISTP: {
    greetings: {
      morning: [
        "Practical morning, Craftsperson. What will you build today?",
        "Good morning, master of tools. Your skills await application.",
        "Morning craftsmanship activated. Problems need your solutions.",
        "The craftsperson awakens. Your hands create tangible value."
      ],
      afternoon: [
        "Afternoon crafting check. Solutions taking shape nicely?",
        "Practical progress review. Your skills solve real problems.",
        "Midday building break. Your expertise shows in every detail.",
        "Afternoon craftsmanship synthesis. Mastery through practice."
      ],
      evening: [
        "Evening creation reflection. What did your hands accomplish?",
        "Twilight craftsmanship review. Your skills built something lasting.",
        "End-of-day practical assessment. Tomorrow's projects await.",
        "Evening craftsperson celebration. Your mastery speaks volumes."
      ]
    }
  },

  ISFP: {
    greetings: {
      morning: [
        "Beautiful morning, Artist. What will your soul create today?",
        "Good morning, aesthetic creator. Your beauty makes the world brighter.",
        "Morning artistic awakening. Your creativity flows like water.",
        "The artist stirs. Your unique vision awaits expression."
      ],
      afternoon: [
        "Afternoon beauty check. Creativity flowing harmoniously?",
        "Artistic progress review. Your aesthetic touches heal souls.",
        "Midday creative break. Your art makes life more beautiful.",
        "Afternoon artistic synthesis. Beauty emerges through your hands."
      ],
      evening: [
        "Evening creative reflection. What beauty did you birth today?",
        "Twilight artistic review. Your vision touched hearts deeply.",
        "End-of-day aesthetic assessment. Tomorrow's art awaits creation.",
        "Evening artist celebration. Your beauty heals the world."
      ]
    }
  },

  ESTP: {
    greetings: {
      morning: [
        "Dynamic morning, Action Hero! Ready to seize the day?",
        "Good morning, energy catalyst. Your momentum is infectious!",
        "Morning action sequence activated. Adventure awaits!",
        "The action hero awakens. Today is yours to conquer!"
      ],
      afternoon: [
        "Afternoon energy check. Still crushing it magnificently?",
        "Action progress review. Your momentum builds victories.",
        "Midday dynamic break. You're unstoppable in motion.",
        "Afternoon action synthesis. Every moment becomes opportunity."
      ],
      evening: [
        "Evening action reflection. What adventures did you conquer?",
        "Twilight energy review. Your dynamism created excitement.",
        "End-of-day momentum assessment. Tomorrow's adventures await.",
        "Evening action hero celebration. You make life thrilling!"
      ]
    }
  },

  ESFP: {
    greetings: {
      morning: [
        "Joyful morning, Sunshine! Ready to brighten everyone's day?",
        "Good morning, happiness generator. Your energy lifts spirits!",
        "Morning joy activation complete. Your smile changes everything.",
        "The sunshine awakens. Your warmth melts away all clouds."
      ],
      afternoon: [
        "Afternoon joy check. Hearts still dancing to your rhythm?",
        "Happiness progress review. Your energy creates celebration.",
        "Midday sunshine break. You make ordinary moments magical.",
        "Afternoon joy synthesis. Every interaction becomes a party."
      ],
      evening: [
        "Evening joy reflection. How many souls did you brighten?",
        "Twilight happiness review. Your warmth created lasting smiles.",
        "End-of-day celebration assessment. Tomorrow's joy awaits sharing.",
        "Evening sunshine celebration. Your light never dims!"
      ]
    }
  }
};

// Context-aware dialogue selection
export function getCharacterDialogue(personalityType, context = {}) {
  const personality = personalityType?.toUpperCase();
  if (!personality || !MBTI_DIALOGUE[personality]) {
    return getDefaultDialogue(context);
  }

  const dialogue = MBTI_DIALOGUE[personality];
  const timeOfDay = getTimeOfDay();
  const streak = getCurrentStreak();
  const todayFocus = getTodayFocusMinutes();

  // Determine motivational state
  let motivationalState = "low_streak";
  if (streak >= 7) motivationalState = "high_performance";
  else if (streak >= 3) motivationalState = "building_momentum";

  // Select appropriate dialogue based on context
  switch (context.type) {
    case "greeting":
      return getRandomItem(dialogue.greetings?.[timeOfDay] || dialogue.greetings?.morning || []);
    
    case "motivation":
      return getRandomItem(dialogue.motivational?.[motivationalState] || []);
    
    case "session_suggestion":
      return getRandomItem(dialogue.session_suggestions?.[timeOfDay] || []);
    
    case "achievement":
      const achievementType = context.achievementType || "streak_milestone";
      return getRandomItem(dialogue.achievement_responses?.[achievementType] || []);
    
    default:
      return getRandomItem(dialogue.greetings?.[timeOfDay] || []);
  }
}

// Get personality-specific session encouragement
export function getSessionEncouragement(personalityType, sessionType = "focus") {
  const personality = personalityType?.toUpperCase();
  
  const encouragements = {
    INTJ: {
      focus: "Strategic deep work time. Your analytical mind thrives in sustained concentration.",
      break: "Strategic pause. Even architects need blueprint review time.",
      completion: "System optimization complete. Excellent strategic execution."
    },
    ENFP: {
      focus: "Creative energy activated! Let your imagination soar free.",
      break: "Inspiration refuel time. Your creative spark needs nourishment.",
      completion: "Amazing creative burst! Your energy created something beautiful."
    },
    ISFJ: {
      focus: "Gentle focus time. Your caring work makes the world better.",
      break: "Nurturing break. Take care of yourself as you care for others.",
      completion: "Beautiful caring work completed. Your gentleness heals."
    },
    ESTP: {
      focus: "Action time! Channel that dynamic energy into focused power.",
      break: "Quick recharge. Action heroes need energy restoration.",
      completion: "Incredible focused action! You conquered that challenge."
    }
  };

  const personalityEnc = encouragements[personality];
  if (personalityEnc && personalityEnc[sessionType]) {
    return personalityEnc[sessionType];
  }

  return getDefaultSessionEncouragement(sessionType);
}

// Get personality-specific progress framing
export function getProgressFraming(personalityType, progressData = {}) {
  const personality = personalityType?.toUpperCase();
  const { streak = 0, totalHours = 0, completedSessions = 0 } = progressData;

  const framings = {
    // Analysts - Efficiency and Systems Focus
    INTJ: {
      streak: `${streak}-day systematic consistency. Your strategic discipline is optimized.`,
      hours: `${totalHours} hours of strategic deep work. Your analytical capacity grows.`,
      sessions: `${completedSessions} strategic sessions completed. System efficiency improved.`
    },
    INTP: {
      streak: `${streak} days of intellectual exploration. Your curiosity is disciplined.`,
      hours: `${totalHours} hours diving deep into ideas. Your understanding expands.`,
      sessions: `${completedSessions} contemplative sessions. Your mental models evolve.`
    },
    
    // Diplomats - Meaning and Growth Focus
    INFJ: {
      streak: `${streak} days of purposeful growth. Your vision becomes clearer daily.`,
      hours: `${totalHours} hours creating meaningful impact. Your purpose manifests.`,
      sessions: `${completedSessions} mindful sessions. Your authentic self emerges.`
    },
    ENFP: {
      streak: `${streak} days of inspired action. Your enthusiasm builds momentum!`,
      hours: `${totalHours} hours of creative exploration. Your possibilities multiply!`,
      sessions: `${completedSessions} energizing sessions. Your spark ignites projects!`
    },
    
    // Sentinels - Stability and Service Focus
    ISFJ: {
      streak: `${streak} days of gentle consistency. Your caring nature is disciplined.`,
      hours: `${totalHours} hours supporting important work. Your service matters deeply.`,
      sessions: `${completedSessions} nurturing sessions. Your steady growth helps others.`
    },
    ESTJ: {
      streak: `${streak} days of executive excellence. Your leadership drives results.`,
      hours: `${totalHours} hours of productive achievement. Your organization succeeds.`,
      sessions: `${completedSessions} efficient sessions. Your structure creates value.`
    },
    
    // Explorers - Action and Experience Focus
    ESTP: {
      streak: `${streak} days of dynamic action. Your energy creates victories!`,
      hours: `${totalHours} hours of focused momentum. Your achievements multiply!`,
      sessions: `${completedSessions} high-energy sessions. You're unstoppable in motion!`
    },
    ISFP: {
      streak: `${streak} days of authentic creation. Your artistic soul flourishes.`,
      hours: `${totalHours} hours crafting beauty. Your aesthetic touches heal hearts.`,
      sessions: `${completedSessions} creative sessions. Your unique vision emerges beautifully.`
    }
  };

  return framings[personality] || getDefaultProgressFraming(progressData);
}

// Utility functions
function getRandomItem(array) {
  if (!Array.isArray(array) || array.length === 0) return "";
  return array[Math.floor(Math.random() * array.length)];
}

function getDefaultDialogue(context) {
  const defaults = {
    morning: "Good morning! Ready to focus and make progress?",
    afternoon: "Afternoon check-in. How's your focus going today?", 
    evening: "Evening reflection. What did you accomplish today?"
  };
  
  return defaults[getTimeOfDay()] || defaults.morning;
}

function getDefaultSessionEncouragement(sessionType) {
  const defaults = {
    focus: "Focus time! You've got this - let's make progress together.",
    break: "Break time! Rest and recharge for your next session.",
    completion: "Great work! You completed another focused session."
  };
  
  return defaults[sessionType] || defaults.focus;
}

function getDefaultProgressFraming(progressData) {
  const { streak = 0, totalHours = 0, completedSessions = 0 } = progressData;
  return {
    streak: `${streak} day streak! Consistency is building your success.`,
    hours: `${totalHours} hours of focused work. Your dedication shows.`,
    sessions: `${completedSessions} sessions completed. Every session builds momentum.`
  };
}
