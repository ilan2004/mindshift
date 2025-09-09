// Comprehensive MBTI Personality Data
// Used for About pages, comparisons, and personality profiles

export const PERSONALITY_TYPES = {
  INTJ: {
    title: "The Architect",
    cluster: "analysts",
    traits: ["I", "N", "T", "J"],
    highlights: [
      "Strategic long-term thinker with clear vision",
      "Thrives in deep, uninterrupted focus sessions",
      "Masters complex problems through systematic analysis",
      "Builds efficient systems and optimized workflows",
      "Values intellectual growth and competence"
    ],
    strengths: ["Strategic Planning", "Independent Work", "Complex Analysis", "Systems Thinking"],
    focusStyle: "Prefers 45-90 minute deep work blocks with minimal interruptions",
    motivation: "Achieving mastery and implementing innovative solutions",
    bestTemplates: ["deep_reading", "analysis_sprint", "system_design"],
    idealSessionLength: "60-90 minutes",
    breakCadence: "15-20 minute breaks between long sessions",
    growthTips: [
      "Schedule buffer time for unexpected deep dives",
      "Use content-gated sessions to maintain focus quality",
      "Block calendar time for strategic thinking"
    ],
    watchOut: [
      "Perfectionism can delay completion",
      "May neglect breaks during intense focus",
      "Can become isolated during long work sessions"
    ],
    imageKeys: { male: "INTJM.475Z.png", female: "INTJW.png" },
    tone: "logic"
  },

  INTP: {
    title: "The Thinker",
    cluster: "analysts", 
    traits: ["I", "N", "T", "P"],
    highlights: [
      "Curious explorer of ideas and theoretical concepts",
      "Flexible approach to focus with burst-style productivity", 
      "Connects disparate concepts into innovative solutions",
      "Values intellectual freedom and autonomous learning",
      "Adapts quickly when new information changes direction"
    ],
    strengths: ["Conceptual Thinking", "Adaptability", "Problem Solving", "Research Skills"],
    focusStyle: "Variable session lengths based on interest and energy flow",
    motivation: "Understanding complex systems and exploring new ideas", 
    bestTemplates: ["research_dive", "concept_mapping", "flexible_focus"],
    idealSessionLength: "25-60 minutes (varies by task)",
    breakCadence: "Natural breaks when curiosity shifts",
    growthTips: [
      "Use multiple shorter sessions for different topics",
      "Set loose time boundaries to maintain some structure", 
      "Follow your curiosity but capture key insights"
    ],
    watchOut: [
      "Can get lost in rabbit holes of interesting tangents",
      "May abandon projects when they become routine",
      "Struggles with rigid scheduling and deadlines"
    ],
    imageKeys: { male: "INTPM.896Z.png", female: "INTPW.512Z.png" },
    tone: "logic"
  },

  ENTJ: {
    title: "The Commander", 
    cluster: "analysts",
    traits: ["E", "N", "T", "J"],
    highlights: [
      "Natural leader who organizes people and resources efficiently",
      "Goal-oriented with strong drive to achieve results",
      "Thinks strategically while executing tactically",
      "Energized by challenges and competitive environments",
      "Builds systems that scale and improve over time"
    ],
    strengths: ["Leadership", "Strategic Execution", "Goal Setting", "Resource Management"],
    focusStyle: "Structured sessions with clear objectives and measurable outcomes",
    motivation: "Leading successful initiatives and driving organizational growth",
    bestTemplates: ["leadership_sprint", "goal_planning", "team_coordination"],
    idealSessionLength: "45-75 minutes", 
    breakCadence: "Short breaks to maintain momentum",
    growthTips: [
      "Set specific, measurable goals for each session",
      "Use productivity tracking to measure progress",
      "Schedule regular review sessions for course correction"
    ],
    watchOut: [
      "May push too hard and experience burnout",
      "Can become impatient with detailed work",
      "Might neglect personal needs for achievement"
    ],
    imageKeys: { male: "ENTJM.jpeg", female: "ENTJW.jpeg" },
    tone: "logic"
  },

  ENTP: {
    title: "The Debater",
    cluster: "analysts",
    traits: ["E", "N", "T", "P"], 
    highlights: [
      "Innovative thinker who generates creative solutions",
      "Energized by brainstorming and collaborative ideation",
      "Adapts quickly to changing priorities and opportunities", 
      "Connects ideas across different domains and disciplines",
      "Thrives in dynamic environments with variety and challenge"
    ],
    strengths: ["Creative Problem Solving", "Adaptability", "Innovation", "Networking"],
    focusStyle: "Varied sessions with room for creative exploration and pivoting",
    motivation: "Exploring possibilities and creating innovative solutions",
    bestTemplates: ["creative_sprint", "brainstorm_session", "innovation_time"],
    idealSessionLength: "30-60 minutes",
    breakCadence: "Frequent short breaks to maintain creative energy", 
    growthTips: [
      "Mix structured work with open exploration time",
      "Use collaboration tools even in solo sessions",
      "Capture ideas quickly before they disappear"
    ],
    watchOut: [
      "Can become bored with routine implementation tasks",
      "May start too many projects without finishing them",
      "Struggles with detailed follow-through"
    ],
    imageKeys: { male: "ENTPM.364Z.png", female: "ENTPW.982Z.png" },
    tone: "logic"
  },

  INFJ: {
    title: "The Advocate",
    cluster: "diplomats",
    traits: ["I", "N", "F", "J"],
    highlights: [
      "Visionary who works toward meaningful long-term impact",
      "Deep focus capability when aligned with personal values",
      "Integrates insights from multiple sources into coherent vision",
      "Motivated by helping others and creating positive change",
      "Balances idealism with practical implementation steps"
    ],
    strengths: ["Empathy", "Vision", "Deep Focus", "Meaning-Making"],
    focusStyle: "Extended focused sessions on personally meaningful work",
    motivation: "Creating positive impact and helping others grow",
    bestTemplates: ["meaningful_project", "reflection_session", "helping_others"],
    idealSessionLength: "60-120 minutes",
    breakCadence: "Longer breaks for reflection and processing",
    growthTips: [
      "Connect daily tasks to larger purpose and vision",
      "Use quiet environments for maximum focus quality",
      "Schedule reflection time to process insights"
    ],
    watchOut: [
      "Can become overwhelmed by others' emotions and needs", 
      "May neglect practical details while pursuing ideals",
      "Prone to perfectionism and self-criticism"
    ],
    imageKeys: { male: "INFJM.984Z.png", female: "INFJW.285Z.png" },
    tone: "meaningful"
  },

  INFP: {
    title: "The Mediator", 
    cluster: "diplomats",
    traits: ["I", "N", "F", "P"],
    highlights: [
      "Creative individual driven by personal values and authenticity",
      "Deep focus when working on personally meaningful projects",
      "Adapts flexibly while maintaining core principles",
      "Generates original ideas and unique perspectives",
      "Values harmony and seeks to understand different viewpoints"
    ],
    strengths: ["Creativity", "Authenticity", "Flexibility", "Value-Driven"],
    focusStyle: "Variable session lengths based on inspiration and energy",
    motivation: "Expressing creativity and living according to personal values", 
    bestTemplates: ["creative_expression", "value_exploration", "flexible_creation"],
    idealSessionLength: "Variable (20-90 minutes)",
    breakCadence: "Natural breaks based on creative flow",
    growthTips: [
      "Align tasks with personal values for better focus",
      "Create inspiring environments that fuel creativity",
      "Allow flexibility in timing and approach"
    ],
    watchOut: [
      "Can struggle with tasks that feel meaningless",
      "May procrastinate on practical or mundane tasks",
      "Sensitive to criticism and conflict"
    ],
    imageKeys: { male: "INFPM.716Z.png", female: "INFPW.504Z.png" },
    tone: "meaningful"
  },

  ENFJ: {
    title: "The Protagonist",
    cluster: "diplomats", 
    traits: ["E", "N", "F", "J"],
    highlights: [
      "Natural mentor who helps others reach their potential",
      "Organized approach to creating positive change",
      "Energized by meaningful connections and collaboration",
      "Balances individual growth with community impact",
      "Intuitive understanding of group dynamics and motivation"
    ],
    strengths: ["Leadership", "Empathy", "Organization", "Inspiration"],
    focusStyle: "Structured sessions with breaks for connecting with others",
    motivation: "Helping others grow and creating positive communities",
    bestTemplates: ["mentoring_session", "community_building", "growth_planning"],
    idealSessionLength: "45-75 minutes",
    breakCadence: "Social breaks to recharge through connection", 
    growthTips: [
      "Incorporate collaboration even in focused work",
      "Schedule regular check-ins with others",
      "Use productivity tracking to model good habits"
    ],
    watchOut: [
      "May sacrifice personal needs to help others",
      "Can become overwhelmed by others' problems", 
      "Struggles to maintain boundaries around time and energy"
    ],
    imageKeys: { male: "ENFJM.png", female: "ENFJW.439Z.png" },
    tone: "meaningful"
  },

  ENFP: {
    title: "The Campaigner",
    cluster: "diplomats",
    traits: ["E", "N", "F", "P"],
    highlights: [
      "Enthusiastic innovator who inspires and energizes others",
      "Flexible approach with bursts of intense creative energy",
      "Connects people and ideas in unexpected ways", 
      "Motivated by possibilities and human potential",
      "Brings passion and authenticity to every project"
    ],
    strengths: ["Enthusiasm", "Creativity", "People Skills", "Adaptability"],
    focusStyle: "Variable sessions with high energy and collaborative elements",
    motivation: "Exploring human potential and inspiring positive change",
    bestTemplates: ["inspiration_session", "people_connecting", "creative_collaboration"],
    idealSessionLength: "30-60 minutes",
    breakCadence: "Frequent social breaks to maintain energy",
    growthTips: [
      "Mix solo focus time with collaborative sessions",
      "Use variety and novelty to maintain interest", 
      "Connect work to impact on people and relationships"
    ],
    watchOut: [
      "Can become scattered across too many interests",
      "May struggle with routine implementation tasks",
      "Sensitive to criticism and negative feedback"
    ],
    imageKeys: { male: "ENFPM.357Z.png", female: "ENFPW.964Z.png" },
    tone: "meaningful"
  },

  ISTJ: {
    title: "The Logistician",
    cluster: "achievers",
    traits: ["I", "S", "T", "J"],
    highlights: [
      "Reliable executor who delivers consistent, quality results",
      "Methodical approach to tasks with attention to detail",
      "Values proven systems and established best practices",
      "Strong sense of duty and commitment to responsibilities", 
      "Builds sustainable habits and maintains long-term focus"
    ],
    strengths: ["Reliability", "Organization", "Attention to Detail", "Consistency"],
    focusStyle: "Consistent, structured sessions with proven methodologies",
    motivation: "Fulfilling responsibilities and maintaining high standards",
    bestTemplates: ["structured_work", "detail_focus", "systematic_approach"],
    idealSessionLength: "45-90 minutes",
    breakCadence: "Regular scheduled breaks to maintain consistency",
    growthTips: [
      "Establish consistent daily routines and stick to them",
      "Use proven productivity methods rather than experimenting",
      "Break large projects into manageable, sequential steps"
    ],
    watchOut: [
      "Can become rigid and resistant to change",
      "May get stuck in perfectionism on details",
      "Struggles with ambiguous or rapidly changing priorities"
    ],
    imageKeys: { male: "ISTJM.502Z.png", female: "ISTJW.369Z.png" },
    tone: "social"
  },

  ISFJ: {
    title: "The Protector", 
    cluster: "achievers",
    traits: ["I", "S", "F", "J"],
    highlights: [
      "Supportive helper who ensures others' needs are met",
      "Attentive to details that impact people's well-being",
      "Steady, reliable approach to completing important tasks",
      "Values harmony and seeks to reduce stress for others",
      "Remembers important details about people and their preferences"
    ],
    strengths: ["Supportiveness", "Attention to Detail", "Reliability", "Empathy"],
    focusStyle: "Gentle, supportive sessions with consideration for others' needs",
    motivation: "Supporting others and maintaining group harmony",
    bestTemplates: ["supportive_work", "helping_others", "care_taking"],
    idealSessionLength: "30-60 minutes", 
    breakCadence: "Regular breaks to check on others and recharge",
    growthTips: [
      "Schedule focus time when others won't interrupt",
      "Use gentle accountability rather than pressure",
      "Connect tasks to how they help or support others"
    ],
    watchOut: [
      "May prioritize others' needs over their own productivity",
      "Can become overwhelmed by trying to help everyone",
      "Struggles with self-promotion and celebrating achievements"
    ],
    imageKeys: { male: "ISFJM.077Z.png", female: "ISFJW.211Z.png" },
    tone: "social"
  },

  ESTJ: {
    title: "The Executive",
    cluster: "achievers", 
    traits: ["E", "S", "T", "J"],
    highlights: [
      "Efficient organizer who gets things done through structure",
      "Natural leader who coordinates people and resources effectively",
      "Focus on practical results and measurable outcomes", 
      "Values tradition, proven methods, and systematic approaches",
      "Energized by productivity and achieving concrete goals"
    ],
    strengths: ["Organization", "Leadership", "Efficiency", "Results-Focus"],
    focusStyle: "Highly structured sessions with clear goals and metrics",
    motivation: "Leading successful projects and achieving measurable results",
    bestTemplates: ["executive_sprint", "team_coordination", "results_focus"],
    idealSessionLength: "60-90 minutes",
    breakCadence: "Short, efficient breaks to maintain momentum",
    growthTips: [
      "Set specific, measurable goals for each session",
      "Use productivity tracking and leaderboards for motivation",
      "Schedule regular progress reviews and adjustments"
    ],
    watchOut: [
      "Can become impatient with theoretical or abstract work", 
      "May push too hard and neglect work-life balance",
      "Struggles with ambiguous or constantly changing priorities"
    ],
    imageKeys: { male: "ESTJM.161Z.png", female: "ESTJW.604Z.png" },
    tone: "social"
  },

  ESFJ: {
    title: "The Consul",
    cluster: "achievers",
    traits: ["E", "S", "F", "J"],
    highlights: [
      "Supportive collaborator who brings out the best in teams",
      "Organized approach to helping others succeed", 
      "Attuned to group dynamics and individual needs",
      "Values harmony and seeks consensus in group settings",
      "Energized by positive social interactions and shared success"
    ],
    strengths: ["Collaboration", "Organization", "Empathy", "Team Building"],
    focusStyle: "Social focus sessions with breaks for connecting with others",
    motivation: "Supporting team success and maintaining group harmony",
    bestTemplates: ["collaborative_work", "team_support", "social_productivity"],
    idealSessionLength: "45-75 minutes",
    breakCadence: "Social breaks to connect and recharge with others",
    growthTips: [
      "Include social elements even in individual work sessions",
      "Use group accountability and shared goals for motivation",
      "Schedule regular team check-ins and celebration moments"
    ],
    watchOut: [
      "May sacrifice personal productivity to help others",
      "Can become distracted by social interactions during focus time",
      "Struggles with conflict and difficult feedback conversations"
    ],
    imageKeys: { male: "ESFJM.978Z.png", female: "ESFJW.059Z.png" },
    tone: "social"
  },

  ISTP: {
    title: "The Virtuoso",
    cluster: "explorers",
    traits: ["I", "S", "T", "P"],
    highlights: [
      "Practical problem-solver who learns through hands-on experience",
      "Flexible and adaptable with excellent troubleshooting skills",
      "Values efficiency and gets to the core of issues quickly",
      "Independent worker who prefers minimal oversight",
      "Calm under pressure with logical approach to challenges"
    ],
    strengths: ["Problem Solving", "Adaptability", "Independence", "Practical Skills"],
    focusStyle: "Flexible sessions that adapt to the problem at hand",
    motivation: "Solving practical problems and mastering useful skills",
    bestTemplates: ["problem_solving", "hands_on_learning", "skill_building"],
    idealSessionLength: "Variable based on problem complexity",
    breakCadence: "Natural breaks when problems are solved or next steps are clear",
    growthTips: [
      "Focus on practical, immediately applicable tasks",
      "Use hands-on learning and experimentation",
      "Allow flexibility in timing and approach"
    ],
    watchOut: [
      "Can become bored with theoretical or abstract work",
      "May procrastinate on tasks without immediate practical value",
      "Struggles with long-term planning and abstract goals"
    ],
    imageKeys: { male: "ISTPM.560Z.png", female: "ISTPW.866Z.png" },
    tone: "fun"
  },

  ISFP: {
    title: "The Adventurer", 
    cluster: "explorers",
    traits: ["I", "S", "F", "P"],
    highlights: [
      "Creative individual who values authenticity and personal expression",
      "Gentle, flexible approach with strong aesthetic sense",
      "Motivated by personal values and meaningful experiences",
      "Adapts well to changing circumstances while staying true to self",
      "Creates harmony through beauty, art, and authentic connections"
    ],
    strengths: ["Creativity", "Adaptability", "Authenticity", "Aesthetic Sense"],
    focusStyle: "Flexible, creative sessions in inspiring environments",
    motivation: "Creating beauty and expressing authentic self",
    bestTemplates: ["creative_expression", "aesthetic_work", "value_driven_tasks"],
    idealSessionLength: "Variable based on creative flow",
    breakCadence: "Natural breaks to absorb inspiration and recharge",
    growthTips: [
      "Create beautiful, inspiring work environments",
      "Connect tasks to personal values and aesthetic preferences", 
      "Allow plenty of flexibility in timing and creative process"
    ],
    watchOut: [
      "Can struggle with criticism of creative work",
      "May procrastinate on tasks that feel inauthentic or ugly",
      "Sensitive to stress and negative work environments"
    ],
    imageKeys: { male: "ISFPM.696Z.png", female: "ISFPW.131Z.png" },
    tone: "fun"
  },

  ESTP: {
    title: "The Entrepreneur",
    cluster: "explorers", 
    traits: ["E", "S", "T", "P"],
    highlights: [
      "Action-oriented individual who thrives in dynamic environments",
      "Excellent at reading situations and adapting quickly",
      "Energized by new challenges and immediate results",
      "Practical problem-solver who learns by doing",
      "Natural ability to motivate and energize others"
    ],
    strengths: ["Action Orientation", "Adaptability", "Crisis Management", "Motivation"],
    focusStyle: "High-energy, action-packed sessions with immediate results",
    motivation: "Taking action, seeing immediate results, and energizing others",
    bestTemplates: ["action_sprint", "challenge_mode", "high_energy_work"],
    idealSessionLength: "25-45 minutes (shorter, intense bursts)",
    breakCadence: "Frequent active breaks to maintain energy",
    growthTips: [
      "Focus on tasks with immediate, visible results",
      "Use competitive elements and challenges for motivation",
      "Include physical movement and variety in work sessions"
    ],
    watchOut: [
      "Can become restless with long-term, theoretical projects",
      "May rush through details in favor of quick action",
      "Struggles with extensive planning and preparation phases"
    ],
    imageKeys: { male: "ESTPM.258Z.png", female: "ESTPW.031Z.png" },
    tone: "fun"
  },

  ESFP: {
    title: "The Entertainer",
    cluster: "explorers",
    traits: ["E", "S", "F", "P"], 
    highlights: [
      "Enthusiastic motivator who brings joy and energy to work",
      "People-focused with natural ability to inspire and encourage",
      "Flexible and spontaneous while maintaining positive outlook",
      "Values fun, creativity, and positive human connections",
      "Excellent at reading people and adapting to social dynamics"
    ],
    strengths: ["Enthusiasm", "People Skills", "Positivity", "Adaptability"],
    focusStyle: "Social, energetic sessions with variety and positive reinforcement",
    motivation: "Having fun, connecting with people, and spreading positivity",
    bestTemplates: ["social_productivity", "fun_challenges", "people_focused_work"],
    idealSessionLength: "30-60 minutes with variety",
    breakCadence: "Frequent social breaks to connect and recharge with others",
    growthTips: [
      "Include social elements and variety in work sessions",
      "Use positive reinforcement and celebration of small wins",
      "Connect work to impact on people and relationships"
    ],
    watchOut: [
      "Can become distracted by social interactions during focus time",
      "May struggle with criticism or negative feedback",
      "Difficulty with long-term planning and abstract goals"
    ],
    imageKeys: { male: "ESFPM.jpeg", female: "ESFPW.png" },
    tone: "fun"
  }
};

// Helper functions for working with personality data
export function getPersonalityData(type) {
  const upperType = type?.toUpperCase();
  return PERSONALITY_TYPES[upperType] || null;
}

export function getClusterTypes(cluster) {
  return Object.entries(PERSONALITY_TYPES)
    .filter(([_, data]) => data.cluster === cluster)
    .map(([type, data]) => ({ type, ...data }));
}

export function getAllTypes() {
  return Object.entries(PERSONALITY_TYPES)
    .map(([type, data]) => ({ type, ...data }));
}

export function getClusterInfo(cluster) {
  const clusterData = {
    analysts: {
      name: "Analysts",
      description: "Strategic thinkers who focus on systems, logic, and competence",
      color: "purple"
    },
    diplomats: {
      name: "Diplomats", 
      description: "Empathetic idealists who focus on people, values, and potential",
      color: "blue"
    },
    achievers: {
      name: "Achievers",
      description: "Reliable organizers who focus on results, structure, and responsibility",
      color: "green"  
    },
    explorers: {
      name: "Explorers",
      description: "Adaptable experimenters who focus on action, variety, and experience",
      color: "orange"
    }
  };
  
  return clusterData[cluster] || null;
}

export function getImagePath(type, gender = 'male') {
  const data = getPersonalityData(type);
  if (!data) return null;
  
  const genderKey = gender === 'female' ? 'female' : 'male';
  return `/images/${data.imageKeys[genderKey]}`;
}

// MBTI trait mappings
export const TRAIT_DESCRIPTIONS = {
  E: { name: "Extraverted", description: "Energized by interaction and external world" },
  I: { name: "Introverted", description: "Energized by reflection and inner world" },
  N: { name: "Intuitive", description: "Focuses on patterns, possibilities, and future potential" },
  S: { name: "Sensing", description: "Focuses on facts, details, and present reality" },
  T: { name: "Thinking", description: "Makes decisions based on logic and objective analysis" },
  F: { name: "Feeling", description: "Makes decisions based on values and people impact" },
  J: { name: "Judging", description: "Prefers structure, planning, and closure" },
  P: { name: "Perceiving", description: "Prefers flexibility, spontaneity, and open options" }
};
