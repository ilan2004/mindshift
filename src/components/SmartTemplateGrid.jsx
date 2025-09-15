// Smart Template Grid - Personality-Aware Template Selection
// Intelligent template discovery with personality-based recommendations and filtering

import React, { useState, useEffect, useMemo } from 'react';
import { 
  getPersonalityTemplates, 
  getCompatibleTemplates, 
  getTemplatesByCategory,
  getTimeBasedTemplates,
  getTemplateInsights
} from '../lib/mbtiTemplates';
import { getCharacterDialogue } from '../lib/characterDialogue';

// Get personality type from localStorage
function getPersonalityType() {
  try {
    const profile = JSON.parse(localStorage.getItem('Nudge_user_profile') || '{}');
    return profile.personalityType || 'INFP';
  } catch {
    return 'INFP';
  }
}

// Template categories for filtering
const TEMPLATE_CATEGORIES = {
  'all': { name: 'All Templates', icon: '🎯', description: 'Every template available' },
  'recommended': { name: 'Recommended', icon: '⭐', description: 'Perfect for your personality' },
  'time_based': { name: 'Right Now', icon: '⏰', description: 'Ideal for current time' },
  'deep_work': { name: 'Deep Work', icon: '🏗️', description: 'Extended focus sessions' },
  'creative_flow': { name: 'Creative Flow', icon: '🎨', description: 'Artistic and innovative work' },
  'social_productivity': { name: 'Social Work', icon: '👥', description: 'People-centered productivity' },
  'structured_tasks': { name: 'Structured Tasks', icon: '📋', description: 'Organized, systematic work' },
  'exploration': { name: 'Exploration', icon: '🔍', description: 'Research and discovery' },
  'leadership': { name: 'Leadership', icon: '👑', description: 'Strategic guidance' },
  'reflection': { name: 'Reflection', icon: '🪞', description: 'Contemplative work' }
};

// Template card component with personality-aware styling
const SmartTemplateCard = ({ template, personalityType, isRecommended, onSelect, isSelected }) => {
  const personality = personalityType.toUpperCase();
  
  // Personality-specific card styling
  const getCardStyle = (personality, isRecommended) => {
    const baseStyles = 'rounded-xl p-6 border backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer group';
    
    if (isSelected) {
      const selectedStyles = {
        INTJ: 'bg-gradient-to-br from-purple-600/30 to-slate-700/30 border-purple-400/50 shadow-purple-500/20 shadow-lg',
        INTP: 'bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border-cyan-400/50 shadow-cyan-500/20 shadow-lg',
        ENTJ: 'bg-gradient-to-br from-orange-600/30 to-red-700/30 border-orange-400/50 shadow-orange-500/20 shadow-lg',
        ENTP: 'bg-gradient-to-br from-pink-600/30 to-purple-700/30 border-pink-400/50 shadow-pink-500/20 shadow-lg',
        INFJ: 'bg-gradient-to-br from-indigo-600/30 to-purple-700/30 border-indigo-400/50 shadow-indigo-500/20 shadow-lg',
        INFP: 'bg-gradient-to-br from-purple-600/30 to-pink-700/30 border-purple-400/50 shadow-purple-500/20 shadow-lg',
        ENFJ: 'bg-gradient-to-br from-teal-600/30 to-green-700/30 border-teal-400/50 shadow-teal-500/20 shadow-lg',
        ENFP: 'bg-gradient-to-br from-yellow-600/30 to-orange-700/30 border-yellow-400/50 shadow-yellow-500/20 shadow-lg',
        ISTJ: 'bg-gradient-to-br from-blue-600/30 to-gray-700/30 border-blue-400/50 shadow-blue-500/20 shadow-lg',
        ISFJ: 'bg-gradient-to-br from-pink-600/30 to-rose-700/30 border-pink-400/50 shadow-pink-500/20 shadow-lg',
        ESTJ: 'bg-gradient-to-br from-red-600/30 to-yellow-700/30 border-red-400/50 shadow-red-500/20 shadow-lg',
        ESFJ: 'bg-gradient-to-br from-rose-600/30 to-pink-700/30 border-rose-400/50 shadow-rose-500/20 shadow-lg',
        ISTP: 'bg-gradient-to-br from-green-600/30 to-gray-700/30 border-green-400/50 shadow-green-500/20 shadow-lg',
        ISFP: 'bg-gradient-to-br from-purple-600/30 to-green-700/30 border-purple-400/50 shadow-purple-500/20 shadow-lg',
        ESTP: 'bg-gradient-to-br from-orange-600/30 to-red-700/30 border-orange-400/50 shadow-orange-500/20 shadow-lg',
        ESFP: 'bg-gradient-to-br from-yellow-600/30 to-pink-700/30 border-yellow-400/50 shadow-yellow-500/20 shadow-lg'
      };
      return `${baseStyles} ${selectedStyles[personality] || selectedStyles.INFP}`;
    }
    
    if (isRecommended) {
      return `${baseStyles} bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/30`;
    }
    
    return `${baseStyles} bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30 hover:border-gray-500/50`;
  };

  // Get compatibility score text
  const getCompatibilityText = (template, personality) => {
    if (template.source_personality === personality) {
      return 'Perfect Match';
    }
    if (template.compatibility_score >= 0.7) {
      return 'Great Fit';
    }
    return 'Compatible';
  };

  // Get difficulty/intensity indicator
  const getIntensityLevel = (duration) => {
    if (duration <= 30) return { level: 'Light', color: 'text-green-400', icon: '🟢' };
    if (duration <= 60) return { level: 'Moderate', color: 'text-yellow-400', icon: '🟡' };
    if (duration <= 90) return { level: 'Intensive', color: 'text-orange-400', icon: '🟠' };
    return { level: 'Marathon', color: 'text-red-400', icon: '🔴' };
  };

  const intensity = getIntensityLevel(template.duration);
  const compatibilityText = getCompatibilityText(template, personality);

  return (
    <div 
      className={getCardStyle(personality, isRecommended)}
      onClick={() => onSelect(template)}
    >
      <div className="space-y-4">
        {/* Header with icon and badges */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-white">
                {template.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">{template.duration} minutes</span>
                <span className={`text-xs ${intensity.color}`}>
                  {intensity.icon} {intensity.level}
                </span>
              </div>
            </div>
          </div>
          
          {isRecommended && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                ⭐ {compatibilityText}
              </span>
              {template.source_personality !== personality && (
                <span className="text-xs text-gray-500">
                  from {template.source_personality}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Action area */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400">
            Category: {template.category.replace('_', ' ')}
          </div>
          <div className="text-sm font-medium text-white group-hover:text-yellow-300 transition-colors">
            {isSelected ? 'Selected ✓' : 'Select Template'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Category filter tabs
const CategoryTabs = ({ activeCategory, onCategoryChange, templateCounts }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg overflow-x-auto scrollbar-thin">
      {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => {
        const count = templateCounts[key] || 0;
        const isActive = activeCategory === key;
        
        return (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
                       ${isActive 
                         ? 'bg-white/20 text-white shadow-sm' 
                         : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <span className="text-base">{category.icon}</span>
            <span>{category.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-700'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Personality insights panel
const PersonalityInsights = ({ personalityType }) => {
  const insights = getTemplateInsights(personalityType);
  
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-600/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <h3 className="text-lg font-bold text-white">Your Strengths</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-gray-400">Templates Available</div>
            <div className="text-2xl font-bold text-white">{insights.totalTemplates}</div>
          </div>
          <div className="space-y-2">
            <div className="text-gray-400">Avg Duration</div>
            <div className="text-2xl font-bold text-white">{insights.averageDuration}min</div>
          </div>
          <div className="space-y-2">
            <div className="text-gray-400">Focus Areas</div>
            <div className="text-sm text-white">
              {insights.dominantCategories.map(cat => cat.replace('_', ' ')).join(', ')}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-gray-400">Personality Strengths</div>
          <div className="flex flex-wrap gap-2">
            {insights.personalityStrengths.map((strength, index) => (
              <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                {strength}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Smart Template Grid component
const SmartTemplateGrid = ({ 
  onTemplateSelect, 
  selectedTemplate, 
  personalityType: propPersonalityType,
  className = "grid grid-cols-1 md:grid-cols-3 gap-3",
  cardStyle = "rounded-xl p-3",
  usePersonalityColors = false,
  showInsights = false,
  simplified = true 
}) => {
  const personalityType = propPersonalityType || getPersonalityType();
  const [activeCategory, setActiveCategory] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(selectedTemplate?.id || null);

  // Get all template categories
  const allTemplates = useMemo(() => getCompatibleTemplates(personalityType, true), [personalityType]);
  const personalityOnlyTemplates = useMemo(() => getPersonalityTemplates(personalityType), [personalityType]);
  const timeBasedTemplates = useMemo(() => getTimeBasedTemplates(personalityType), [personalityType]);

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let templates = [];
    
    switch (activeCategory) {
      case 'all':
        templates = allTemplates;
        break;
      case 'recommended':
        templates = allTemplates.filter(t => t.compatibility_score >= 0.7);
        break;
      case 'time_based':
        templates = timeBasedTemplates.map(t => ({ ...t, compatibility_score: 1.0, source_personality: personalityType }));
        break;
      default:
        templates = getTemplatesByCategory(personalityType, activeCategory).map(t => ({ 
          ...t, 
          compatibility_score: 1.0, 
          source_personality: personalityType 
        }));
        
        // Add compatible templates from other personalities for this category
        allTemplates.forEach(template => {
          if (template.source_personality !== personalityType && 
              (template.category === activeCategory || template.tags.includes(activeCategory))) {
            templates.push(template);
          }
        });
        break;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by compatibility score
    return templates.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
  }, [allTemplates, personalityOnlyTemplates, timeBasedTemplates, activeCategory, searchQuery, personalityType]);

  // Calculate template counts for each category
  const templateCounts = useMemo(() => {
    const counts = {};
    
    counts.all = allTemplates.length;
    counts.recommended = allTemplates.filter(t => t.compatibility_score >= 0.7).length;
    counts.time_based = timeBasedTemplates.length;
    
    // Count templates by category
    Object.keys(TEMPLATE_CATEGORIES).forEach(category => {
      if (!['all', 'recommended', 'time_based'].includes(category)) {
        const categoryTemplates = getTemplatesByCategory(personalityType, category);
        const compatibleFromOthers = allTemplates.filter(t => 
          t.source_personality !== personalityType && 
          (t.category === category || t.tags.includes(category))
        );
        counts[category] = categoryTemplates.length + compatibleFromOthers.length;
      }
    });
    
    return counts;
  }, [allTemplates, timeBasedTemplates, personalityType]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  // Get contextual message for current selection
  const getContextualMessage = () => {
    const time = new Date().getHours();
    const timeOfDay = time < 12 ? 'morning' : time < 18 ? 'afternoon' : 'evening';
    
    const messages = {
      recommended: `These templates are specifically designed for ${personalityType} personalities. They match your cognitive preferences and working style.`,
      time_based: `Based on the current time (${timeOfDay}), these templates are ideal for your ${personalityType} personality right now.`,
      deep_work: 'Extended focus sessions for complex work requiring sustained concentration and minimal interruption.',
      creative_flow: 'Templates designed to enhance creativity, innovation, and free-flowing ideation processes.',
      all: `Showing all ${allTemplates.length} available templates. Templates marked with ⭐ are specially recommended for your personality.`
    };
    
    return messages[activeCategory] || TEMPLATE_CATEGORIES[activeCategory]?.description || '';
  };

  // For simplified mode, return a design that matches your existing style
  if (simplified) {
    // Get top 3 personality-optimized templates
    const topTemplates = filteredTemplates.slice(0, 3);
    
    return (
      <div className={className}>
        {/* Work Sprint - Enhanced with personality intelligence */}
        <div 
          className={`${cardStyle}`}
          style={{ 
            background: usePersonalityColors ? "var(--color-mint-500)" : "var(--color-mint-500)", 
            border: "2px solid var(--color-green-900)", 
            boxShadow: "0 2px 0 var(--color-green-900)" 
          }}
        >
          <div className="text-sm font-semibold text-neutral-800">Work Sprint</div>
          <div className="text-xs text-neutral-700">25 min deep focus • 5 min recovery</div>
          {personalityType && (
            <div className="text-xs text-neutral-600 mt-1">
              ⭐ Perfect for {personalityType} personalities
            </div>
          )}
          <div className="mt-2">
            <button 
              className="nav-pill" 
              onClick={() => handleTemplateSelect({ id: "work_sprint", template: "work_sprint", duration: 25, break: 5 })}
            >
              Start 25m
            </button>
          </div>
        </div>

        {/* Deep Reading - Enhanced */}
        <div 
          className={`${cardStyle}`}
          style={{ 
            background: "var(--color-lilac-300)", 
            border: "2px solid var(--color-green-900)", 
            boxShadow: "0 2px 0 var(--color-green-900)" 
          }}
        >
          <div className="text-sm font-semibold text-neutral-800">Deep Reading</div>
          <div className="text-xs text-neutral-700">45 min immersive reading • optional source</div>
          {personalityType && (
            <div className="text-xs text-neutral-600 mt-1">
              💡 Great for {personalityType} learning style
            </div>
          )}
          <div className="mt-2">
            <button 
              className="nav-pill" 
              onClick={() => handleTemplateSelect({ id: "deep_reading", template: "deep_reading", duration: 45, url: "" })}
            >
              Start 45m
            </button>
          </div>
        </div>

        {/* Gym */}
        <div 
          className={`${cardStyle}`}
          style={{ 
            background: "var(--color-mint-500)", 
            border: "2px solid var(--color-green-900)", 
            boxShadow: "0 2px 0 var(--color-green-900)" 
          }}
        >
          <div className="text-sm font-semibold text-neutral-800">Gym</div>
          <div className="text-xs text-neutral-700">60 min training block</div>
          {personalityType && (
            <div className="text-xs text-neutral-600 mt-1">
              🏃 Energizes {personalityType} minds
            </div>
          )}
          <div className="mt-2">
            <button 
              className="nav-pill" 
              onClick={() => handleTemplateSelect({ id: "gym", template: "gym", duration: 60 })}
            >
              Start 60m
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full mode with all features
  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Choose Your Focus Template</h2>
          <div className="text-sm text-gray-400">
            {filteredTemplates.length} templates available
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-white/50 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-300 leading-relaxed">
          {getContextualMessage()}
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        templateCounts={templateCounts}
      />

      {/* Personality Insights */}
      {showInsights && activeCategory === 'recommended' && (
        <PersonalityInsights personalityType={personalityType} />
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <SmartTemplateCard
            key={template.id}
            template={template}
            personalityType={personalityType}
            isRecommended={template.compatibility_score >= 0.7}
            onSelect={handleTemplateSelect}
            isSelected={selectedTemplateId === template.id}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl">🔍</div>
          <div className="text-xl font-medium text-white">No templates found</div>
          <div className="text-gray-400">
            Try adjusting your search or selecting a different category.
          </div>
        </div>
      )}

      {/* Quick stats footer */}
      <div className="text-xs text-gray-500 text-center pt-6 border-t border-gray-700/50">
        Powered by MBTI personality science • {personalityType} optimized • 
        {allTemplates.filter(t => t.compatibility_score >= 0.7).length} perfect matches found
      </div>
    </div>
  );
};

export default SmartTemplateGrid;
export { SmartTemplateCard, CategoryTabs, PersonalityInsights };
