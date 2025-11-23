const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// Test available models
router.get('/test-models', auth, async (req, res) => {
  try {
    const models = await geminiService.listModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate quiz using Gemini AI
router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { topic, difficulty, questionCount } = req.body;

    if (!topic || !difficulty || !questionCount) {
      return res.status(400).json({ message: 'Topic, difficulty, and question count are required' });
    }

    // Generate quiz using Gemini
    const generatedQuiz = await geminiService.generateQuiz(topic, difficulty, questionCount);

    // Save to database
    const quiz = new Quiz({
      title: generatedQuiz.title,
      difficulty: difficulty.toLowerCase(),
      timeLimit: questionCount * 60, // 1 minute per question
      questions: generatedQuiz.questions,
      teacherId: req.user.id,
      isAIGenerated: true,
      topic: topic
    });

    await quiz.save();

    res.json({
      message: 'Quiz generated successfully',
      quiz: quiz
    });

  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
  }
});

// Get learning resources for student
router.post('/learning-resources', auth, async (req, res) => {
  try {
    const { topics, studentLevel } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ message: 'Topics array is required' });
    }

    const resources = await geminiService.generateLearningResources(topics, studentLevel);

    res.json({
      message: 'Learning resources generated successfully',
      resources: resources
    });

  } catch (error) {
    console.error('Generate resources error:', error);
    res.status(500).json({ message: 'Failed to generate learning resources', error: error.message });
  }
});

// Analyze student performance and suggest improvements
router.get('/analyze-performance/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get recent quiz results for the student
    const results = await Result.find({ studentId })
      .populate('quizId', 'title topic questions')
      .sort({ submittedAt: -1 })
      .limit(10);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No quiz results found for analysis' });
    }

    // Extract topics and performance data
    const topics = [...new Set(results.map(r => r.quizId.topic).filter(Boolean))];
    const performanceData = results.map(r => ({
      quizTitle: r.quizId.title,
      score: r.score,
      totalQuestions: r.quizId.questions.length,
      answers: r.answers,
      topic: r.quizId.topic
    }));

    const analysis = await geminiService.analyzeQuizPerformance(performanceData, topics);

    res.json({
      message: 'Performance analysis completed',
      analysis: analysis,
      recentResults: performanceData
    });

  } catch (error) {
    console.error('Analyze performance error:', error);
    res.status(500).json({ message: 'Failed to analyze performance', error: error.message });
  }
});

// List available models (for debugging)
router.get('/models', async (req, res) => {
  try {
    const models = await geminiService.listAvailableModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personalized study plan
router.post('/study-plan', auth, async (req, res) => {
  try {
    const { weakTopics, goals, timeAvailable } = req.body;

    if (!weakTopics || !Array.isArray(weakTopics)) {
      return res.status(400).json({ message: 'Weak topics array is required' });
    }

    const prompt = `
Create a personalized study plan for a student with these details:
- Weak topics: ${weakTopics.join(', ')}
- Goals: ${goals || 'Improve overall understanding'}
- Time available: ${timeAvailable || '1 hour per day'}

Generate a structured study plan with:
1. Daily/weekly schedule
2. Priority topics
3. Specific learning objectives
4. Progress milestones
5. Assessment checkpoints

Format as JSON with a clear structure.
`;

    const studyPlan = await geminiService.model.generateContent(prompt);
    const response = await studyPlan.response;
    const text = response.text();

    res.json({
      message: 'Study plan generated successfully',
      studyPlan: text
    });

  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
});

// Generate explanation for a question
router.post('/explain-question', auth, async (req, res) => {
  try {
    const { question, correctAnswer, userAnswer } = req.body;

    if (!question || correctAnswer === undefined) {
      return res.status(400).json({ message: 'Question and correct answer are required' });
    }

    const explanation = await geminiService.generateQuestionExplanation(question, correctAnswer, userAnswer);

    if (!explanation) {
      return res.status(500).json({ message: 'Failed to generate explanation' });
    }

    res.json({
      explanation: explanation
    });

  } catch (error) {
    console.error('Generate explanation error:', error);
    res.status(500).json({ message: 'Failed to generate explanation', error: error.message });
  }
});

module.exports = router;