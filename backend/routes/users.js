const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');
const auth = require('../middleware/auth');

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const results = await Result.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalScore: { $sum: '$score' },
          quizzesTaken: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $sort: { totalScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const leaderboard = await User.populate(results, {
      path: '_id',
      select: 'name email rollNo'
    });

    res.json(leaderboard);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/results
// @desc    Get user's quiz results
// @access  Private
router.get('/results', auth, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('quizId', 'title difficulty')
      .sort({ completedAt: -1 });

    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/students
// @desc    Get all students (Teacher only)
// @access  Private
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.find({ userType: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics (Teacher only)
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const Quiz = require('../models/Quiz');

    // 1. Total Students
    const totalStudents = await User.countDocuments({ userType: 'student' });

    // 2. Active Quizzes (created by this teacher)
    // Note: In a real app, we might filter by teacherId: req.user.id
    // For now, we'll count all active quizzes to populate the dashboard
    const activeQuizzes = await Quiz.countDocuments({ isActive: true });

    // 3. Completed Quizzes (Total results)
    const completedQuizzes = await Result.countDocuments({});

    // 4. Average Score (across all results)
    const avgScoreResult = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" } // Score is absolute points
        }
      }
    ]);
    const averageScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // 5. Top Performers
    const topPerformers = await Result.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalScore: { $sum: "$score" },
          quizzesTaken: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $project: {
          name: "$student.name",
          score: "$totalScore", // Using total score as the metric
          quizzes: "$quizzesTaken"
        }
      }
    ]);

    // 6. Recent Activity
    const recentActivity = await Result.find()
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('studentId', 'name')
      .populate('quizId', 'title');

    const formattedActivity = recentActivity.map(activity => ({
      student: activity.studentId ? activity.studentId.name : 'Unknown Student',
      quiz: activity.quizId ? activity.quizId.title : 'Unknown Quiz',
      score: activity.score,
      time: new Date(activity.completedAt).toLocaleTimeString()
    }));

    res.json({
      totalStudents,
      activeQuizzes,
      completedQuizzes,
      averageScore,
      topPerformers,
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
