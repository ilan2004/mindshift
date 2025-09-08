// Content Parser Service for Quiz Generation
// Handles YouTube video transcripts and PDF text extraction

// Mock AI service for quiz generation (replace with actual AI service)
class QuizGenerator {
  static async generateQuestions(content, options = {}) {
    const { count = 3, difficulty = 'medium' } = options;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract key concepts and generate questions
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions = [];
    
    for (let i = 0; i < Math.min(count, sentences.length) && questions.length < count; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 30) continue;
      
      // Generate different question types
      const questionType = Math.random();
      
      if (questionType < 0.4) {
        // Fill-in-the-blank style question
        const words = sentence.split(' ');
        const keyWord = words.find(w => w.length > 4 && !['that', 'which', 'where', 'when'].includes(w.toLowerCase()));
        if (keyWord) {
          const questionText = sentence.replace(keyWord, '____');
          questions.push({
            q: `Complete the statement: "${questionText}"`,
            choices: [keyWord, this.generateDistractor(keyWord), this.generateDistractor(keyWord), 'None of the above'],
            a: 0
          });
        }
      } else if (questionType < 0.7) {
        // Comprehension question
        questions.push({
          q: `Based on the content, which statement is most accurate?`,
          choices: [
            sentence.slice(0, 60) + '...',
            this.generateDistractorSentence(),
            this.generateDistractorSentence(),
            'The content doesn\'t address this topic'
          ],
          a: 0
        });
      } else {
        // Concept-based question
        const concepts = this.extractConcepts(sentence);
        if (concepts.length > 0) {
          questions.push({
            q: `What is the main concept discussed in this part of the content?`,
            choices: [concepts[0], this.generateDistractor(concepts[0]), this.generateDistractor(concepts[0]), 'This topic is not covered'],
            a: 0
          });
        }
      }
    }
    
    return questions.slice(0, count);
  }
  
  static generateDistractor(word) {
    const distractors = [
      'productivity', 'efficiency', 'optimization', 'strategy', 'methodology',
      'implementation', 'framework', 'analysis', 'development', 'innovation',
      'collaboration', 'integration', 'evaluation', 'assessment', 'planning'
    ];
    return distractors[Math.floor(Math.random() * distractors.length)];
  }
  
  static generateDistractorSentence() {
    const sentences = [
      'This approach focuses on individual performance metrics',
      'The methodology emphasizes collaborative team dynamics',
      'This strategy prioritizes long-term sustainable growth',
      'The framework centers on data-driven decision making'
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  }
  
  static extractConcepts(text) {
    const concepts = text.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    return [...new Set(concepts)].slice(0, 3);
  }
}

// YouTube content extractor
class YouTubeParser {
  static async extractContent(url) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) throw new Error('Invalid YouTube URL');
      
      // Mock transcript extraction (replace with actual YouTube API)
      const transcript = await this.mockGetTranscript(videoId);
      
      return {
        type: 'youtube',
        videoId,
        url,
        content: transcript,
        title: `YouTube Video: ${videoId}`,
        duration: '10:30', // Mock duration
        success: true
      };
    } catch (error) {
      return {
        type: 'youtube',
        url,
        success: false,
        error: error.message
      };
    }
  }
  
  static extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  
  static async mockGetTranscript(videoId) {
    // Mock transcript - replace with actual YouTube API call
    const mockTranscripts = {
      'default': `Welcome to this comprehensive guide on productivity and focus. 
      In today's fast-paced world, maintaining concentration has become increasingly challenging. 
      Research shows that deep work, a concept popularized by Cal Newport, is essential for achieving meaningful results.
      Deep work is the ability to focus without distraction on cognitively demanding tasks. 
      This skill allows you to quickly master complicated information and produce better results in less time.
      To develop deep work habits, you must eliminate distractions and create structured time blocks for focused activity.
      Studies indicate that it takes an average of 23 minutes to regain focus after an interruption.
      Therefore, protecting your attention is crucial for productivity. 
      Techniques like the Pomodoro Technique, time blocking, and meditation can help build focus muscles.
      The key is to treat concentration as a skill that requires deliberate practice and improvement over time.`
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockTranscripts['default'];
  }
}

// PDF content extractor
class PDFParser {
  static async extractContent(url) {
    try {
      // Mock PDF extraction (replace with actual PDF parsing)
      const content = await this.mockExtractPDFText(url);
      
      return {
        type: 'pdf',
        url,
        content,
        title: 'PDF Document',
        pageCount: 15, // Mock page count
        success: true
      };
    } catch (error) {
      return {
        type: 'pdf',
        url,
        success: false,
        error: error.message
      };
    }
  }
  
  static async mockExtractPDFText(url) {
    // Mock PDF content - replace with actual PDF parsing
    const mockContent = `
    Understanding Focus and Productivity in the Digital Age
    
    Introduction
    The modern workplace presents unprecedented challenges to maintaining focus and productivity. 
    Digital distractions, constant notifications, and multitasking demands have fundamentally altered how we work.
    
    The Science of Attention
    Cognitive research demonstrates that sustained attention is a finite resource that requires strategic management.
    Neuroplasticity studies show that focus can be strengthened through deliberate practice and environmental design.
    The prefrontal cortex, responsible for executive function, becomes fatigued when overloaded with switching costs.
    
    Strategies for Deep Work
    Creating distraction-free environments is essential for achieving flow states and peak performance.
    Time blocking allows for dedicated periods of uninterrupted work on high-value tasks.
    The two-minute rule helps manage small tasks without derailing deeper work sessions.
    Regular breaks and physical movement support cognitive recovery and sustained performance.
    
    Measuring Progress
    Objective metrics like hours of deep work and distraction frequency provide valuable feedback.
    Subjective assessments of focus quality and satisfaction complement quantitative measures.
    Long-term tracking reveals patterns and enables continuous improvement in work habits.
    `;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return mockContent.trim();
  }
}

// Main content parser service
export class ContentParser {
  static async parseContent(url) {
    if (!url || url.trim() === '') {
      throw new Error('URL is required');
    }
    
    const cleanUrl = url.trim();
    
    // Determine content type and parse accordingly
    if (this.isYouTubeUrl(cleanUrl)) {
      return await YouTubeParser.extractContent(cleanUrl);
    } else if (this.isPDFUrl(cleanUrl)) {
      return await PDFParser.extractContent(cleanUrl);
    } else {
      throw new Error('Unsupported content type. Please provide a YouTube video or PDF URL.');
    }
  }
  
  static async generateQuiz(url, options = {}) {
    try {
      const parsedContent = await this.parseContent(url);
      
      if (!parsedContent.success) {
        throw new Error(parsedContent.error || 'Failed to parse content');
      }
      
      const questions = await QuizGenerator.generateQuestions(parsedContent.content, options);
      
      return {
        success: true,
        questions,
        metadata: {
          type: parsedContent.type,
          title: parsedContent.title,
          url: parsedContent.url,
          questionCount: questions.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackQuestions(url)
      };
    }
  }
  
  static isYouTubeUrl(url) {
    return /(?:youtube\.com|youtu\.be)/i.test(url);
  }
  
  static isPDFUrl(url) {
    return /\.pdf$/i.test(url) || /pdf/i.test(url);
  }
  
  static getFallbackQuestions(url) {
    // Fallback questions when parsing fails
    return [
      { 
        q: "What is your primary goal for this focus session?", 
        choices: ["Deep learning and comprehension", "Quick overview", "Entertainment", "Multitasking"], 
        a: 0 
      },
      { 
        q: "How much time will you dedicate to focused engagement with this content?", 
        choices: ["The full session duration", "Half the session", "Just browsing", "Background listening"], 
        a: 0 
      }
    ];
  }
}

export { QuizGenerator, YouTubeParser, PDFParser };
