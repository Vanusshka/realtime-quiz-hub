const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Connect to databases
const initializeDatabases = async () => {
  try {
    // Connect to MongoDB (required)
    await connectDB();
    
    // Connect to Redis (optional - for caching)
    await connectRedis();
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Initialize databases
initializeDatabases().catch(error => {
  console.error('💥 Failed to initialize databases:', error);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/users', require('./routes/users'));
app.use('/api/gemini', require('./routes/gemini'));

// Test endpoint to verify deployment
app.get('/api/test-deployment', (req, res) => {
  res.json({ 
    message: 'New deployment working!', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    deployment: 'v2.0-updated',
    services: {}
  };

  // Check MongoDB connection
  try {
    const mongoose = require('mongoose');
    console.log('🔍 MongoDB readyState:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.mongodb = 'connected';
      console.log('✅ MongoDB health check passed');
    } else {
      health.services.mongodb = `disconnected (state: ${mongoose.connection.readyState})`;
      health.status = 'DEGRADED';
      console.log('❌ MongoDB not connected');
    }
  } catch (error) {
    health.services.mongodb = `error: ${error.message}`;
    health.status = 'DEGRADED';
    console.log('❌ MongoDB health check failed:', error.message);
  }

  // Check Redis connection
  try {
    const { getRedisClient } = require('./config/redis');
    const redisClient = getRedisClient();
    if (redisClient && redisClient.isReady) {
      health.services.redis = 'connected';
    } else {
      health.services.redis = 'not available';
    }
  } catch (error) {
    health.services.redis = 'not available';
  }

  // Check Gemini service
  try {
    const geminiService = require('./services/geminiService');
    health.services.gemini = geminiService.isEnabled ? 'enabled' : 'disabled';
  } catch (error) {
    health.services.gemini = 'error';
  }

  console.log('🏥 Health check result:', health);
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Socket.IO connection handling
const activeQuizzes = new Map();
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins a quiz room
  socket.on('join-quiz', ({ quizId, userId, userName, userType }) => {
    socket.join(quizId);
    
    if (!activeQuizzes.has(quizId)) {
      activeQuizzes.set(quizId, {
        participants: [],
        answers: new Map(),
        startTime: null
      });
    }

    const quiz = activeQuizzes.get(quizId);
    quiz.participants.push({ userId, userName, userType, socketId: socket.id });
    activeUsers.set(socket.id, { quizId, userId, userName });

    // Notify all participants
    io.to(quizId).emit('user-joined', {
      userId,
      userName,
      userType,
      totalParticipants: quiz.participants.length
    });

    console.log(`${userName} joined quiz ${quizId}`);
  });

  // Teacher starts quiz
  socket.on('start-quiz', ({ quizId, questions }) => {
    const quiz = activeQuizzes.get(quizId);
    if (quiz) {
      quiz.startTime = Date.now();
      io.to(quizId).emit('quiz-started', {
        startTime: quiz.startTime,
        questions
      });
      console.log(`Quiz ${quizId} started`);
    }
  });

  // Student submits answer
  socket.on('submit-answer', ({ quizId, userId, questionId, answer, timeSpent }) => {
    const quiz = activeQuizzes.get(quizId);
    if (quiz) {
      if (!quiz.answers.has(userId)) {
        quiz.answers.set(userId, []);
      }
      quiz.answers.get(userId).push({
        questionId,
        answer,
        timeSpent,
        timestamp: Date.now()
      });

      // Notify teacher of submission
      io.to(quizId).emit('answer-submitted', {
        userId,
        questionId,
        totalAnswers: quiz.answers.get(userId).length
      });
    }
  });

  // Get real-time leaderboard
  socket.on('get-leaderboard', ({ quizId }) => {
    const quiz = activeQuizzes.get(quizId);
    if (quiz) {
      const leaderboard = Array.from(quiz.answers.entries()).map(([userId, answers]) => {
        const participant = quiz.participants.find(p => p.userId === userId);
        return {
          userId,
          userName: participant?.userName || 'Unknown',
          score: answers.length * 10, // Simple scoring
          answersCount: answers.length
        };
      }).sort((a, b) => b.score - a.score);

      socket.emit('leaderboard-update', leaderboard);
    }
  });

  // End quiz
  socket.on('end-quiz', ({ quizId }) => {
    io.to(quizId).emit('quiz-ended', {
      endTime: Date.now()
    });
    console.log(`Quiz ${quizId} ended`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const { quizId, userName } = user;
      const quiz = activeQuizzes.get(quizId);
      
      if (quiz) {
        quiz.participants = quiz.participants.filter(p => p.socketId !== socket.id);
        io.to(quizId).emit('user-left', {
          userName,
          totalParticipants: quiz.participants.length
        });
      }
      
      activeUsers.delete(socket.id);
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: /api/health`);
});
