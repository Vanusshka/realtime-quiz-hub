const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    console.log('Gemini API Key loaded:', apiKey.substring(0, 10) + '...');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async listAvailableModels() {
    try {
      const models = await this.genAI.listModels();
      console.log('Available models:', models);
      return models;
    } catch (error) {
      console.error('Error listing models:', error);
    }
  }

  async listModels() {
    try {
      const models = await this.genAI.listModels();
      console.log('Available models:', models.map(m => m.name));
      return models;
    } catch (error) {
      console.error('Error listing models:', error);
    }
  }

  async generateQuiz(topic, difficulty, questionCount) {
    const prompt = `
Generate a quiz about "${topic}" with the following specifications:
- Difficulty: ${difficulty}
- Number of questions: ${questionCount}
- Each question should have 4 multiple choice options
- Only one correct answer per question
- Include a mix of conceptual and practical questions
- Provide a clear explanation for why the correct answer is correct

Format the response as a JSON object with this structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and why other options are incorrect"
    }
  ]
}

Make sure the JSON is valid and properly formatted.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Error details:', error.message);
      console.error('Error status:', error.status);
      
      // Temporary fallback while debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using fallback data due to API error');
        return {
          title: `${topic} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
          questions: Array.from({ length: questionCount }, (_, i) => ({
            question: `Sample question ${i + 1} about ${topic}?`,
            options: [
              `Correct answer for ${topic}`,
              `Incorrect option A`,
              `Incorrect option B`,
              `Incorrect option C`
            ],
            correctAnswer: 0
          }))
        };
      }
      
      throw new Error('Failed to generate quiz');
    }
  }

  async generateLearningResources(weakTopics, studentLevel = 'intermediate') {
    const prompt = `
A student is struggling with these topics: ${weakTopics.join(', ')}
Student level: ${studentLevel}

Generate personalized learning resources and recommendations including:
1. Key concepts to focus on
2. Recommended study materials (books, websites, videos)
3. Practice exercises or activities
4. Study tips specific to these topics
5. Estimated time to master each topic

Format as JSON:
{
  "summary": "Brief analysis of learning gaps",
  "resources": [
    {
      "topic": "Topic name",
      "keyConcepts": ["concept1", "concept2"],
      "studyMaterials": [
        {
          "type": "video|article|book|course",
          "title": "Resource title",
          "url": "URL if available",
          "description": "Brief description"
        }
      ],
      "practiceActivities": ["activity1", "activity2"],
      "studyTips": ["tip1", "tip2"],
      "estimatedTime": "X hours/days"
    }
  ],
  "studyPlan": "Suggested learning sequence and timeline"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate learning resources');
    }
  }

  async analyzeQuizPerformance(quizResults, topics) {
    const prompt = `
Analyze this student's quiz performance:
Quiz Results: ${JSON.stringify(quizResults)}
Topics covered: ${topics.join(', ')}

Provide analysis including:
1. Strengths and weaknesses
2. Topics that need improvement
3. Specific recommendations
4. Next steps for learning

Format as JSON:
{
  "overallScore": "percentage",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "topicsToImprove": ["topic1", "topic2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "nextSteps": "Detailed next steps"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to analyze performance');
    }
  }

  async generateQuestionExplanation(question, correctAnswer, userAnswer) {
    const prompt = `
Explain why the correct answer is right for this quiz question:

Question: ${question.question}
Options: ${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}
Correct Answer: ${String.fromCharCode(65 + correctAnswer)}. ${question.options[correctAnswer]}
${userAnswer !== null && userAnswer !== correctAnswer ? `Student's Answer: ${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}` : ''}

Provide a clear, concise explanation (2-3 sentences) that:
1. Explains why the correct answer is right
2. If the student answered incorrectly, briefly explain why their answer was wrong
3. Helps the student learn and understand the concept

Return only the explanation text, no JSON or formatting.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return null;
    }
  }

  async generateQuizRecommendations(quizTitle, quizTopic, score, totalQuestions, incorrectQuestions) {
    const performanceLevel = score / totalQuestions;
    const needsImprovement = performanceLevel < 0.7;
    
    const prompt = `
A student just completed a quiz with the following details:
- Quiz Title: ${quizTitle}
- Topic: ${quizTopic || quizTitle}
- Score: ${score}/${totalQuestions} (${(performanceLevel * 100).toFixed(0)}%)
${incorrectQuestions.length > 0 ? `- Questions they got wrong: ${incorrectQuestions.join(', ')}` : ''}

Generate personalized learning recommendations to help them ${needsImprovement ? 'improve their understanding' : 'deepen their knowledge'} of this topic.

Provide:
1. 5-7 YouTube video recommendations (use realistic video titles that would exist for this topic)
2. 3-5 helpful website/article links (use realistic URLs from educational sites like Khan Academy, MDN, W3Schools, GeeksforGeeks, freeCodeCamp, etc.)
3. A brief motivational message

Format as JSON:
{
  "message": "Brief personalized message based on their performance",
  "youtubeVideos": [
    {
      "title": "Video title",
      "channel": "Channel name",
      "searchQuery": "exact search query to find this video on YouTube",
      "description": "Why this video will help"
    }
  ],
  "websites": [
    {
      "title": "Resource title",
      "url": "Full URL",
      "description": "What they'll learn from this resource"
    }
  ],
  "studyTips": ["tip1", "tip2", "tip3"]
}

Make sure all YouTube search queries are specific and realistic. For websites, use actual educational platforms.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback recommendations
      return {
        message: "Great effort! Keep learning and practicing to improve your skills.",
        youtubeVideos: [
          {
            title: `${quizTopic || quizTitle} - Complete Tutorial`,
            channel: "Educational Channel",
            searchQuery: `${quizTopic || quizTitle} tutorial`,
            description: "Comprehensive overview of the topic"
          }
        ],
        websites: [
          {
            title: "Learn More",
            url: `https://www.google.com/search?q=${encodeURIComponent(quizTopic || quizTitle)}`,
            description: "Search for more resources on this topic"
          }
        ],
        studyTips: [
          "Review the questions you got wrong",
          "Practice regularly to reinforce concepts",
          "Take notes while studying"
        ]
      };
    }
  }
}

module.exports = new GeminiService();