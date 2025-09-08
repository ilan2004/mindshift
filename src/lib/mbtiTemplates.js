// MBTI Template Registry - Personality-Specific Focus Templates
// Each personality gets 4-5 templates matching their cognitive preferences and working style

// Template categories and their personality alignments
const TEMPLATE_CATEGORIES = {
  DEEP_WORK: "deep_work",
  CREATIVE_FLOW: "creative_flow", 
  SOCIAL_PRODUCTIVITY: "social_productivity",
  STRUCTURED_TASKS: "structured_tasks",
  EXPLORATION: "exploration",
  MAINTENANCE: "maintenance",
  LEADERSHIP: "leadership",
  REFLECTION: "reflection"
};

// Base template structure
const createTemplate = (id, name, duration, description, tags, personality_fit, icon) => ({
  id,
  name,
  duration,
  description,
  tags,
  personality_fit,
  icon,
  category: tags[0] // Primary category
});

// Comprehensive MBTI Template Registry
export const MBTI_TEMPLATES = {
  // ========== ANALYSTS (NT) ==========
  INTJ: [
    createTemplate(
      "intj_strategic_deep",
      "Strategic Deep Work",
      90,
      "Extended focus session for complex analysis and system building. Perfect for your architectural mind.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "analysis", "planning"],
      ["INTJ", "INTP"],
      "🏗️"
    ),
    createTemplate(
      "intj_system_optimization", 
      "System Optimization",
      60,
      "Methodical review and refinement of existing processes. Your efficiency expertise applied.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "optimization", "review"],
      ["INTJ", "ENTJ"],
      "⚙️"
    ),
    createTemplate(
      "intj_vision_planning",
      "Vision & Strategy Planning", 
      75,
      "Long-term strategic thinking and masterplan development. Where architects excel.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "strategy", "planning"],
      ["INTJ", "ENTJ"],
      "🎯"
    ),
    createTemplate(
      "intj_knowledge_synthesis",
      "Knowledge Integration",
      45,
      "Connect disparate information into cohesive understanding. Feed your synthesizing mind.",
      [TEMPLATE_CATEGORIES.REFLECTION, "learning", "synthesis"],
      ["INTJ", "INTP"],
      "🧠"
    ),
    createTemplate(
      "intj_implementation_sprint",
      "Implementation Sprint",
      50,
      "Execute your strategic plans with focused determination. Turn vision into reality.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "execution", "building"],
      ["INTJ", "ENTJ"],
      "🚀"
    )
  ],

  INTP: [
    createTemplate(
      "intp_theory_exploration",
      "Theory Deep Dive",
      120,
      "Extended exploration of complex concepts and ideas. Let your curiosity run free.",
      [TEMPLATE_CATEGORIES.EXPLORATION, "research", "theory"],
      ["INTP", "INTJ"],
      "🔍"
    ),
    createTemplate(
      "intp_concept_connection",
      "Concept Mapping",
      75,
      "Connect ideas across domains and build mental models. Perfect for pattern recognition.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "connections", "modeling"],
      ["INTP", "ENFP"],
      "🕸️"
    ),
    createTemplate(
      "intp_experimental_thinking",
      "Experimental Analysis",
      60,
      "Test theories and explore 'what if' scenarios. Your analytical playground.",
      [TEMPLATE_CATEGORIES.EXPLORATION, "experimentation", "analysis"],
      ["INTP", "ENTP"],
      "🧪"
    ),
    createTemplate(
      "intp_problem_deconstruction",
      "Problem Deconstruction", 
      45,
      "Break down complex problems into manageable components. Systematic thinking applied.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "analysis", "problem-solving"],
      ["INTP", "INTJ"],
      "🔧"
    ),
    createTemplate(
      "intp_quiet_contemplation",
      "Contemplative Focus",
      30,
      "Gentle focus for reflection and idea processing. Honor your need for mental space.",
      [TEMPLATE_CATEGORIES.REFLECTION, "contemplation", "processing"],
      ["INTP", "INFP"],
      "🌙"
    )
  ],

  ENTJ: [
    createTemplate(
      "entj_leadership_planning",
      "Leadership Strategy",
      80,
      "Plan initiatives and organize resources for maximum impact. Command your domain.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "strategy", "organization"],
      ["ENTJ", "ESTJ"],
      "👑"
    ),
    createTemplate(
      "entj_execution_blitz",
      "Execution Blitz",
      50,
      "High-energy implementation of strategic plans. Turn vision into victory.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "execution", "results"],
      ["ENTJ", "ESTP"],
      "⚡"
    ),
    createTemplate(
      "entj_system_building",
      "Empire Building",
      90,
      "Construct systems and processes that scale. Your commanding vision realized.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "systems", "scaling"],
      ["ENTJ", "INTJ"],
      "🏛️"
    ),
    createTemplate(
      "entj_decision_matrix",
      "Strategic Decisions",
      40,
      "Analyze options and make high-impact decisions. Leadership in action.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "decisions", "analysis"],
      ["ENTJ", "INTJ"],
      "⚖️"
    ),
    createTemplate(
      "entj_competitive_push",
      "Competitive Sprint",
      60,
      "Channel competitive drive into focused achievement. Dominate your goals.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "competition", "achievement"],
      ["ENTJ", "ESTP"],
      "🏆"
    )
  ],

  ENTP: [
    createTemplate(
      "entp_innovation_storm",
      "Innovation Brainstorm",
      75,
      "Generate and explore breakthrough ideas. Your creative mind unleashed.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "innovation", "brainstorming"],
      ["ENTP", "ENFP"],
      "💡"
    ),
    createTemplate(
      "entp_possibility_exploration",
      "Possibility Mapping",
      60,
      "Explore multiple angles and potential solutions. Embrace your versatile thinking.",
      [TEMPLATE_CATEGORIES.EXPLORATION, "possibilities", "versatility"],
      ["ENTP", "ENFP"],
      "🌟"
    ),
    createTemplate(
      "entp_rapid_prototyping",
      "Rapid Prototyping",
      45,
      "Quick iteration and testing of concepts. Build to learn and learn to build.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "prototyping", "iteration"],
      ["ENTP", "ESTP"],
      "🔄"
    ),
    createTemplate(
      "entp_debate_preparation",
      "Argument Development",
      50,
      "Structure compelling arguments and anticipate counterpoints. Sharpen your rhetoric.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "argumentation", "preparation"],
      ["ENTP", "ENTJ"],
      "🎤"
    ),
    createTemplate(
      "entp_connection_making",
      "Cross-Pollination",
      40,
      "Connect ideas from different fields and domains. Your pattern-recognition superpower.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "connections", "patterns"],
      ["ENTP", "INTP"],
      "🌐"
    )
  ],

  // ========== DIPLOMATS (NF) ==========
  INFJ: [
    createTemplate(
      "infj_vision_crafting",
      "Vision Development",
      75,
      "Deep work on meaningful projects that align with your values and long-term vision.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "vision", "meaning"],
      ["INFJ", "INTJ"],
      "🔮"
    ),
    createTemplate(
      "infj_mindful_focus",
      "Mindful Productivity",
      60,
      "Gentle, sustained focus with regular mindfulness check-ins. Honor your sensitive nature.",
      [TEMPLATE_CATEGORIES.REFLECTION, "mindfulness", "gentle"],
      ["INFJ", "ISFJ"],
      "🧘"
    ),
    createTemplate(
      "infj_synthesis_session",
      "Insight Integration",
      50,
      "Process and integrate insights from various sources into coherent understanding.",
      [TEMPLATE_CATEGORIES.REFLECTION, "synthesis", "insight"],
      ["INFJ", "INTP"],
      "🌊"
    ),
    createTemplate(
      "infj_purposeful_creation",
      "Purposeful Creation",
      90,
      "Extended creative work on projects that serve your higher purpose and values.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "purpose", "creation"],
      ["INFJ", "INFP"],
      "✨"
    ),
    createTemplate(
      "infj_quiet_planning",
      "Contemplative Planning",
      35,
      "Quiet time for planning and organizing thoughts. Your introverted intuition needs space.",
      [TEMPLATE_CATEGORIES.REFLECTION, "planning", "quiet"],
      ["INFJ", "ISFJ"],
      "📝"
    )
  ],

  INFP: [
    createTemplate(
      "infp_authentic_creation",
      "Authentic Expression",
      80,
      "Create work that truly represents your values and authentic self. Honor your inner truth.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "authenticity", "expression"],
      ["INFP", "ISFP"],
      "🎨"
    ),
    createTemplate(
      "infp_value_alignment",
      "Values-Driven Work",
      60,
      "Focus on projects that deeply align with your personal values and beliefs.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "values", "alignment"],
      ["INFP", "INFJ"],
      "💎"
    ),
    createTemplate(
      "infp_gentle_flow",
      "Gentle Flow State",
      45,
      "Soft, natural rhythm focus that respects your need for organic productivity.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "gentle", "natural"],
      ["INFP", "ISFP"],
      "🌸"
    ),
    createTemplate(
      "infp_inspiration_capture",
      "Inspiration Sessions",
      30,
      "Short bursts to capture fleeting inspiration and creative insights when they strike.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "inspiration", "capture"],
      ["INFP", "ENFP"],
      "💫"
    ),
    createTemplate(
      "infp_meaningful_reflection",
      "Meaningful Reflection",
      40,
      "Process experiences and extract personal meaning. Feed your reflective nature.",
      [TEMPLATE_CATEGORIES.REFLECTION, "meaning", "processing"],
      ["INFP", "INFJ"],
      "🪞"
    )
  ],

  ENFJ: [
    createTemplate(
      "enfj_people_focused",
      "People-Centered Work",
      70,
      "Focus on projects that directly benefit and serve others. Channel your helping nature.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "service", "people"],
      ["ENFJ", "ESFJ"],
      "🤝"
    ),
    createTemplate(
      "enfj_inspirational_creation",
      "Inspirational Content",
      60,
      "Create content, materials, or experiences that will inspire and guide others.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "inspiration", "guidance"],
      ["ENFJ", "ENFP"],
      "🌟"
    ),
    createTemplate(
      "enfj_mentoring_prep",
      "Mentoring Preparation",
      45,
      "Prepare for teaching, mentoring, or guiding others. Your natural leadership applied.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "mentoring", "preparation"],
      ["ENFJ", "ENTJ"],
      "🎓"
    ),
    createTemplate(
      "enfj_community_building",
      "Community Projects",
      80,
      "Work on initiatives that bring people together and strengthen communities.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "community", "connection"],
      ["ENFJ", "ESFJ"],
      "🏘️"
    ),
    createTemplate(
      "enfj_growth_facilitation",
      "Growth Facilitation",
      50,
      "Focus on creating environments and systems that help others grow and develop.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "growth", "facilitation"],
      ["ENFJ", "ESFJ"],
      "🌱"
    )
  ],

  ENFP: [
    createTemplate(
      "enfp_creative_explosion",
      "Creative Explosion",
      60,
      "High-energy creative session where ideas flow freely. Let your inspiration run wild!",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "energy", "inspiration"],
      ["ENFP", "ESFP"],
      "🎆"
    ),
    createTemplate(
      "enfp_possibility_exploration",
      "Possibility Adventure",
      75,
      "Explore multiple exciting possibilities and potential directions. Embrace your versatility!",
      [TEMPLATE_CATEGORIES.EXPLORATION, "possibilities", "adventure"],
      ["ENFP", "ENTP"],
      "🚀"
    ),
    createTemplate(
      "enfp_people_connection",
      "Connection Building",
      45,
      "Work on projects that connect you with others and build meaningful relationships.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "connection", "relationships"],
      ["ENFP", "ESFP"],
      "💕"
    ),
    createTemplate(
      "enfp_enthusiasm_sprint",
      "Enthusiasm Sprint", 
      40,
      "Ride the wave of excitement on projects that genuinely energize you. Passion-driven focus!",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "enthusiasm", "passion"],
      ["ENFP", "ESFP"],
      "⚡"
    ),
    createTemplate(
      "enfp_variety_mix",
      "Variety Mix Session",
      50,
      "Work on multiple different aspects of projects. Perfect for your need for variety.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "variety", "diversity"],
      ["ENFP", "ESFP"],
      "🎭"
    )
  ],

  // ========== SENTINELS (SJ) ==========
  ISTJ: [
    createTemplate(
      "istj_methodical_progress",
      "Methodical Progress",
      90,
      "Steady, systematic work through well-defined tasks. Your reliability in action.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "methodical", "systematic"],
      ["ISTJ", "ISFJ"],
      "📋"
    ),
    createTemplate(
      "istj_detail_perfection",
      "Detail Excellence",
      60,
      "Careful attention to details and quality control. Your thoroughness ensures excellence.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "details", "quality"],
      ["ISTJ", "ISFJ"],
      "🔍"
    ),
    createTemplate(
      "istj_routine_maintenance",
      "Routine Maintenance",
      45,
      "Regular maintenance of systems, files, and processes. Keep everything running smoothly.",
      [TEMPLATE_CATEGORIES.MAINTENANCE, "routine", "organization"],
      ["ISTJ", "ESTJ"],
      "🧰"
    ),
    createTemplate(
      "istj_planning_session",
      "Strategic Planning",
      50,
      "Thorough planning and scheduling for upcoming projects. Your organizational strength.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "planning", "scheduling"],
      ["ISTJ", "ESTJ"],
      "📅"
    ),
    createTemplate(
      "istj_deep_focus",
      "Uninterrupted Focus",
      75,
      "Extended concentration on important tasks without distractions. Your focused nature thrives.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "concentration", "uninterrupted"],
      ["ISTJ", "INTJ"],
      "🎯"
    )
  ],

  ISFJ: [
    createTemplate(
      "isfj_caring_productivity",
      "Caring Productivity",
      70,
      "Gentle, sustainable productivity that honors your need to help and support others.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "caring", "sustainable"],
      ["ISFJ", "ESFJ"],
      "💝"
    ),
    createTemplate(
      "isfj_supportive_work",
      "Supportive Service",
      60,
      "Focus on work that directly supports and benefits others. Your nurturing nature applied.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "support", "service"],
      ["ISFJ", "ENFJ"],
      "🤗"
    ),
    createTemplate(
      "isfj_gentle_structure",
      "Gentle Structure",
      45,
      "Organized productivity with built-in flexibility and self-care. Balance achievement with well-being.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "gentle", "balance"],
      ["ISFJ", "ISFP"],
      "🌺"
    ),
    createTemplate(
      "isfj_detail_care",
      "Thoughtful Details",
      50,
      "Careful attention to the small things that make a big difference for others.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "thoughtful", "care"],
      ["ISFJ", "ISTJ"],
      "✨"
    ),
    createTemplate(
      "isfj_harmony_building",
      "Harmony Creation",
      40,
      "Work on projects that create harmony, peace, and positive environments for others.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "harmony", "peace"],
      ["ISFJ", "ESFJ"],
      "☮️"
    )
  ],

  ESTJ: [
    createTemplate(
      "estj_executive_power",
      "Executive Power Hour",
      80,
      "High-productivity session for organizing, planning, and driving results. Leadership in action.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "executive", "results"],
      ["ESTJ", "ENTJ"],
      "💼"
    ),
    createTemplate(
      "estj_efficiency_optimization",
      "Efficiency Drive",
      60,
      "Streamline processes and maximize productivity. Your organizational excellence applied.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "efficiency", "optimization"],
      ["ESTJ", "ISTJ"],
      "⚙️"
    ),
    createTemplate(
      "estj_goal_crushing",
      "Goal Destroyer",
      50,
      "Aggressive focus on achieving specific, measurable objectives. Your determination unleashed.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "goals", "achievement"],
      ["ESTJ", "ENTJ"],
      "🎯"
    ),
    createTemplate(
      "estj_team_coordination",
      "Team Coordination",
      45,
      "Organize team efforts and coordinate collaborative projects. Your leadership organizes chaos.",
      [TEMPLATE_CATEGORIES.LEADERSHIP, "coordination", "teamwork"],
      ["ESTJ", "ENFJ"],
      "👥"
    ),
    createTemplate(
      "estj_system_building",
      "System Architecture",
      70,
      "Build and refine organizational systems that create order and drive results.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "systems", "organization"],
      ["ESTJ", "ENTJ"],
      "🏗️"
    )
  ],

  ESFJ: [
    createTemplate(
      "esfj_harmony_productivity",
      "Harmony & Achievement",
      65,
      "Productive work that maintains team harmony and supports collective success.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "harmony", "collective"],
      ["ESFJ", "ENFJ"],
      "🌈"
    ),
    createTemplate(
      "esfj_people_first",
      "People-First Focus",
      55,
      "Center your productivity around helping others succeed and feel valued.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "people-first", "support"],
      ["ESFJ", "ISFJ"],
      "👫"
    ),
    createTemplate(
      "esfj_collaborative_creation",
      "Collaborative Magic",
      70,
      "Work with others to create something beautiful and meaningful together.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "collaboration", "creation"],
      ["ESFJ", "ENFJ"],
      "🤝"
    ),
    createTemplate(
      "esfj_caring_organization",
      "Caring Organization", 
      50,
      "Organize with heart - create systems that work for people, not just efficiency.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "caring", "people-centered"],
      ["ESFJ", "ISFJ"],
      "💖"
    ),
    createTemplate(
      "esfj_celebration_prep",
      "Celebration Preparation",
      40,
      "Prepare for events, celebrations, or activities that bring joy to others.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "celebration", "joy"],
      ["ESFJ", "ESFP"],
      "🎉"
    )
  ],

  // ========== EXPLORERS (SP) ==========
  ISTP: [
    createTemplate(
      "istp_hands_on_building",
      "Hands-On Building",
      75,
      "Practical, tangible work where you build, fix, or create something real. Your craftsmanship shines.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "building", "practical"],
      ["ISTP", "ESTP"],
      "🔨"
    ),
    createTemplate(
      "istp_problem_solving",
      "Problem Solving Mode",
      60,
      "Tackle complex problems with your analytical and practical approach. Logic meets action.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "problem-solving", "analytical"],
      ["ISTP", "INTP"],
      "🧩"
    ),
    createTemplate(
      "istp_skill_mastery",
      "Skill Development",
      90,
      "Deep practice and refinement of technical skills. Your expertise grows through deliberate practice.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "skills", "mastery"],
      ["ISTP", "ISFP"],
      "⚡"
    ),
    createTemplate(
      "istp_efficient_execution",
      "Efficient Execution",
      45,
      "No-nonsense, efficient completion of necessary tasks. Get it done with minimal fuss.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "efficiency", "execution"],
      ["ISTP", "ISTJ"],
      "✅"
    ),
    createTemplate(
      "istp_exploration_testing",
      "Testing & Exploration",
      50,
      "Experiment with new approaches and test different solutions. Your curiosity in action.",
      [TEMPLATE_CATEGORIES.EXPLORATION, "testing", "experimentation"],
      ["ISTP", "ENTP"],
      "🔬"
    )
  ],

  ISFP: [
    createTemplate(
      "isfp_artistic_flow",
      "Artistic Flow State",
      80,
      "Pure creative expression where your artistic soul can flow freely. Beauty through authenticity.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "artistic", "expression"],
      ["ISFP", "INFP"],
      "🎨"
    ),
    createTemplate(
      "isfp_gentle_creation",
      "Gentle Creation",
      60,
      "Soft, natural creative work that honors your sensitive and aesthetic nature.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "gentle", "aesthetic"],
      ["ISFP", "INFP"],
      "🌸"
    ),
    createTemplate(
      "isfp_value_expression",
      "Value Expression",
      50,
      "Create work that authentically expresses your personal values and beliefs.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "values", "authenticity"],
      ["ISFP", "INFP"],
      "💎"
    ),
    createTemplate(
      "isfp_sensory_craft",
      "Sensory Crafting",
      70,
      "Hands-on creative work that engages your senses and creates tangible beauty.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "sensory", "crafting"],
      ["ISFP", "ISTP"],
      "🏺"
    ),
    createTemplate(
      "isfp_peaceful_focus",
      "Peaceful Focus",
      40,
      "Calm, meditative work in a harmonious environment. Your sensitive nature honored.",
      [TEMPLATE_CATEGORIES.REFLECTION, "peaceful", "meditative"],
      ["ISFP", "ISFJ"],
      "🕊️"
    )
  ],

  ESTP: [
    createTemplate(
      "estp_action_burst",
      "Action Burst",
      35,
      "High-energy, dynamic work session. Channel your natural momentum into focused achievement!",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "action", "dynamic"],
      ["ESTP", "ESFP"],
      "💥"
    ),
    createTemplate(
      "estp_competitive_sprint",
      "Competitive Sprint",
      45,
      "Turn productivity into a game! Compete against time, goals, or previous performance.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "competitive", "gamification"],
      ["ESTP", "ENTJ"],
      "🏁"
    ),
    createTemplate(
      "estp_variety_power",
      "Variety Power Hour",
      60,
      "Mix different types of tasks to keep your versatile mind engaged and energized.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "variety", "versatility"],
      ["ESTP", "ENFP"],
      "🎯"
    ),
    createTemplate(
      "estp_social_productivity",
      "Social Energy Focus",
      50,
      "Productive work that involves interaction with others. Your people energy channeled.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "interaction", "energy"],
      ["ESTP", "ESFP"],
      "⚡"
    ),
    createTemplate(
      "estp_immediate_impact",
      "Immediate Impact",
      40,
      "Work on tasks with quick, visible results. See your efforts pay off immediately!",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "immediate", "visible"],
      ["ESTP", "ESTJ"],
      "🚀"
    )
  ],

  ESFP: [
    createTemplate(
      "esfp_joyful_creation",
      "Joyful Creation",
      55,
      "Create with happiness and enthusiasm! Let your natural joy infuse your work.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "joyful", "enthusiasm"],
      ["ESFP", "ENFP"],
      "🌟"
    ),
    createTemplate(
      "esfp_people_powered",
      "People-Powered Focus",
      60,
      "Work that connects you with others and spreads positive energy. Your warmth as productivity fuel.",
      [TEMPLATE_CATEGORIES.SOCIAL_PRODUCTIVITY, "connection", "positivity"],
      ["ESFP", "ENFP"],
      "☀️"
    ),
    createTemplate(
      "esfp_celebration_mode",
      "Celebration Mode",
      45,
      "Turn productivity into a celebration! Make work feel like a party worth attending.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "celebration", "fun"],
      ["ESFP", "ENFP"],
      "🎉"
    ),
    createTemplate(
      "esfp_spontaneous_burst",
      "Spontaneous Energy",
      30,
      "Ride the wave of spontaneous motivation when it strikes. Your natural rhythm honored.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "spontaneous", "natural"],
      ["ESFP", "ISFP"],
      "🌊"
    ),
    createTemplate(
      "esfp_harmony_building",
      "Harmony & Beauty",
      50,
      "Create beautiful, harmonious environments and experiences for yourself and others.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "harmony", "beauty"],
      ["ESFP", "ISFP"],
      "🎭"
    )
  ]
};

// Get templates for a specific personality type
export function getPersonalityTemplates(personalityType) {
  const personality = personalityType?.toUpperCase();
  if (!personality || !MBTI_TEMPLATES[personality]) {
    return getDefaultTemplates();
  }
  
  return MBTI_TEMPLATES[personality];
}

// Get templates that fit multiple personality types (for variety)
export function getCompatibleTemplates(personalityType, includeSecondary = true) {
  const personality = personalityType?.toUpperCase();
  if (!personality) return getDefaultTemplates();
  
  // Get primary templates
  const primaryTemplates = MBTI_TEMPLATES[personality] || [];
  
  if (!includeSecondary) {
    return primaryTemplates;
  }
  
  // Find templates from other personalities that list this personality as compatible
  const compatibleTemplates = [];
  
  Object.entries(MBTI_TEMPLATES).forEach(([type, templates]) => {
    if (type !== personality) {
      templates.forEach(template => {
        if (template.personality_fit.includes(personality)) {
          compatibleTemplates.push({
            ...template,
            source_personality: type,
            compatibility_score: 0.7 // Secondary compatibility
          });
        }
      });
    }
  });
  
  // Mark primary templates with full compatibility
  const primaryMarked = primaryTemplates.map(template => ({
    ...template,
    source_personality: personality,
    compatibility_score: 1.0
  }));
  
  return [...primaryMarked, ...compatibleTemplates];
}

// Get templates by category for a personality type
export function getTemplatesByCategory(personalityType, category) {
  const templates = getPersonalityTemplates(personalityType);
  return templates.filter(template => 
    template.category === category || template.tags.includes(category)
  );
}

// Get recommended templates based on time of day and personality
export function getTimeBasedTemplates(personalityType) {
  const hour = new Date().getHours();
  const templates = getPersonalityTemplates(personalityType);
  const personality = personalityType?.toUpperCase();
  
  // Personality-specific time preferences
  const timePreferences = {
    // Introverts generally prefer morning deep work
    INTJ: { morning: ["deep_work", "analysis"], afternoon: ["structured_tasks"], evening: ["reflection"] },
    INTP: { morning: ["exploration", "theory"], afternoon: ["creative_flow"], evening: ["reflection"] },
    INFJ: { morning: ["deep_work", "vision"], afternoon: ["creative_flow"], evening: ["reflection"] },
    INFP: { morning: ["creative_flow"], afternoon: ["reflection"], evening: ["creative_flow"] },
    ISTJ: { morning: ["structured_tasks"], afternoon: ["structured_tasks"], evening: ["maintenance"] },
    ISFJ: { morning: ["structured_tasks"], afternoon: ["social_productivity"], evening: ["reflection"] },
    ISTP: { morning: ["deep_work"], afternoon: ["structured_tasks"], evening: ["exploration"] },
    ISFP: { morning: ["creative_flow"], afternoon: ["creative_flow"], evening: ["reflection"] },
    
    // Extroverts may prefer varied timing
    ENTJ: { morning: ["leadership", "structured_tasks"], afternoon: ["leadership"], evening: ["deep_work"] },
    ENTP: { morning: ["creative_flow", "exploration"], afternoon: ["creative_flow"], evening: ["exploration"] },
    ENFJ: { morning: ["leadership", "social_productivity"], afternoon: ["social_productivity"], evening: ["creative_flow"] },
    ENFP: { morning: ["creative_flow"], afternoon: ["social_productivity"], evening: ["creative_flow"] },
    ESTJ: { morning: ["leadership", "structured_tasks"], afternoon: ["structured_tasks"], evening: ["structured_tasks"] },
    ESFJ: { morning: ["social_productivity"], afternoon: ["social_productivity"], evening: ["structured_tasks"] },
    ESTP: { morning: ["structured_tasks"], afternoon: ["social_productivity"], evening: ["structured_tasks"] },
    ESFP: { morning: ["social_productivity"], afternoon: ["social_productivity"], evening: ["creative_flow"] }
  };
  
  // Determine time period
  let timePeriod = "evening";
  if (hour >= 6 && hour < 12) timePeriod = "morning";
  else if (hour >= 12 && hour < 18) timePeriod = "afternoon";
  
  // Get preferred categories for this time and personality
  const preferredCategories = timePreferences[personality]?.[timePeriod] || [];
  
  if (preferredCategories.length === 0) {
    return templates.slice(0, 3); // Default to first 3 templates
  }
  
  // Filter templates by preferred categories
  const timeAppropriate = templates.filter(template => 
    preferredCategories.some(category => 
      template.category === category || template.tags.includes(category)
    )
  );
  
  return timeAppropriate.length > 0 ? timeAppropriate : templates.slice(0, 3);
}

// Fallback templates for unknown personality types
function getDefaultTemplates() {
  return [
    createTemplate(
      "default_focus",
      "Focus Session",
      50,
      "A balanced focus session for productive work. Adaptable to your current needs.",
      [TEMPLATE_CATEGORIES.DEEP_WORK, "general", "balanced"],
      ["ALL"],
      "🎯"
    ),
    createTemplate(
      "default_creative",
      "Creative Time",
      60,
      "Open-ended creative work session. Let your ideas flow and take shape.",
      [TEMPLATE_CATEGORIES.CREATIVE_FLOW, "general", "creative"],
      ["ALL"],
      "✨"
    ),
    createTemplate(
      "default_structured",
      "Structured Tasks",
      45,
      "Organized approach to completing specific tasks and objectives.",
      [TEMPLATE_CATEGORIES.STRUCTURED_TASKS, "general", "organized"],
      ["ALL"],
      "📋"
    )
  ];
}

// Get template statistics and insights
export function getTemplateInsights(personalityType) {
  const templates = getPersonalityTemplates(personalityType);
  
  // Calculate category distribution
  const categoryCount = {};
  templates.forEach(template => {
    categoryCount[template.category] = (categoryCount[template.category] || 0) + 1;
  });
  
  // Find dominant categories
  const dominantCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category);
  
  return {
    totalTemplates: templates.length,
    averageDuration: Math.round(templates.reduce((sum, t) => sum + t.duration, 0) / templates.length),
    dominantCategories,
    categoryDistribution: categoryCount,
    personalityStrengths: getPersonalityStrengths(personalityType)
  };
}

// Get personality strengths reflected in templates
function getPersonalityStrengths(personalityType) {
  const strengthsMap = {
    INTJ: ["Strategic thinking", "System building", "Long-term vision"],
    INTP: ["Theoretical analysis", "Pattern recognition", "Conceptual thinking"],
    ENTJ: ["Leadership", "Strategic execution", "Goal achievement"], 
    ENTP: ["Innovation", "Possibility exploration", "Creative problem-solving"],
    INFJ: ["Visionary insight", "Meaningful work", "Synthetic thinking"],
    INFP: ["Authentic expression", "Value-driven work", "Creative flow"],
    ENFJ: ["People development", "Inspirational leadership", "Community building"],
    ENFP: ["Creative enthusiasm", "Possibility thinking", "People connection"],
    ISTJ: ["Methodical execution", "Detail excellence", "Reliable consistency"],
    ISFJ: ["Caring support", "Gentle productivity", "Harmonious service"],
    ESTJ: ["Executive leadership", "Efficient organization", "Goal achievement"],
    ESFJ: ["People-centered productivity", "Collaborative harmony", "Caring organization"],
    ISTP: ["Practical problem-solving", "Hands-on building", "Skill mastery"],
    ISFP: ["Artistic expression", "Authentic creation", "Aesthetic sensitivity"],
    ESTP: ["Dynamic action", "Competitive achievement", "Immediate impact"],
    ESFP: ["Joyful creation", "People-powered energy", "Spontaneous enthusiasm"]
  };
  
  return strengthsMap[personalityType?.toUpperCase()] || ["Focused work", "Creative thinking", "Goal achievement"];
}
