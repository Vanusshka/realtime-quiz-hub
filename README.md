# 🎯 QuizMaster - Real-Time Quiz Application

A full-stack real-time quiz application built with React, Node.js, Express, MongoDB, and Socket.IO. Teachers can create quizzes, and students can attempt them with real-time scoring and result tracking.

## ✨ Features

### For Teachers
- 📝 Create custom quizzes with multiple-choice questions
- 🤖 **AI-Powered Quiz Generation** with Google Gemini
- 🎚️ Set difficulty levels (Easy, Medium, Hard)
- ⏱️ Configure time limits for quizzes
- 📊 View all created quizzes with correct answers highlighted
- 💡 View AI-generated explanations for each question
- 🗑️ Delete quizzes
- 👥 Automatic visibility to all students

### For Students
- 📚 Browse available quizzes from database
- 🔍 View quiz details (difficulty, questions, time limit)
- ✍️ Attempt quizzes with countdown timer
- 📈 Automatic score calculation
- 📊 View detailed results with question-by-question analysis
- 💡 **Get AI explanations** for incorrect answers
- 🎯 Learn from mistakes with personalized feedback

### System Features
- 🔐 JWT-based authentication
- 👤 Role-based access control (Teacher/Student)
- 💾 MongoDB persistent storage
- ⚡ Real-time data synchronization
- 🔄 Offline fallback with localStorage
- ⏲️ Time tracking for quiz attempts
- ✅ Answer validation

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** React Query
- **Routing:** React Router v6
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Real-time:** Socket.IO
- **Validation:** express-validator
- **AI Integration:** Google Gemini API

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd realtime-quiz
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure Environment Variables:**

1. **Generate a JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use it as your `JWT_SECRET` in `.env`

2. **Get a Gemini API Key** (Required for AI quiz generation):
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key and paste it in your `.env` file as `GEMINI_API_KEY`
   - The API has a free tier!

3. **Setup MongoDB:**
   - **Local MongoDB:** Use `mongodb://localhost:27018/quizmaster`
   - **MongoDB Atlas (Cloud):**
     1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
     2. Create a cluster
     3. Get connection string
     4. Update `MONGODB_URI` in `.env`

4. **Your `.env` should look like:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27018/quizmaster
   JWT_SECRET=<your_generated_secret_from_step_1>
   GEMINI_API_KEY=<your_gemini_api_key_from_step_2>
   ```

**Start the backend server:**
```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8081`

### 4. MongoDB Setup (Optional - Using Docker)

```bash
# From project root
docker-compose up -d
```

This will start MongoDB on port `27018`

## 📁 Project Structure

```
realtime-quiz/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Quiz.js            # Quiz model
│   │   └── Result.js          # Result model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── quiz.js            # Quiz CRUD routes
│   │   └── result.js          # Result routes
│   ├── .env                   # Environment variables
│   ├── server.js              # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/
│   │   │   ├── Login.tsx      # Login/Register page
│   │   │   ├── Dashboard.tsx  # Student dashboard
│   │   │   ├── Quiz.tsx       # Quiz attempt page
│   │   │   ├── Results.tsx    # Results display page
│   │   │   ├── TeacherDashboard.tsx
│   │   │   └── TeacherQuizCreation.tsx
│   │   ├── lib/               # Utility functions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml         # MongoDB Docker setup
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### Quiz Management
- `GET /api/quiz` - Get all quizzes (filtered by user role)
- `GET /api/quiz/:id` - Get specific quiz by ID
- `POST /api/quiz` - Create new quiz (teacher only)
- `PUT /api/quiz/:id` - Update quiz (teacher only)
- `DELETE /api/quiz/:id` - Delete quiz (teacher only)
- `POST /api/quiz/:id/submit` - Submit quiz answers (student only)
- `GET /api/quiz/:id/results` - Get quiz results

### AI Features (Gemini)
- `POST /api/gemini/generate-quiz` - Generate AI quiz (teacher only)
- `POST /api/gemini/explain-question` - Get AI explanation for a question
- `POST /api/gemini/learning-resources` - Get personalized learning resources
- `GET /api/gemini/analyze-performance/:studentId` - Analyze student performance

### User Management
- `GET /api/users/me` - Get current user
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/results` - Get user's quiz results

### Results
- `GET /api/result/student/:studentId` - Get student's results
- `GET /api/result/quiz/:quizId` - Get all results for a quiz

## 🔄 Socket.IO Events

### Client to Server
- `join-quiz` - Join a quiz room
- `start-quiz` - Start quiz (Teacher only)
- `submit-answer` - Submit answer
- `get-leaderboard` - Request leaderboard update
- `end-quiz` - End quiz (Teacher only)

### Server to Client
- `user-joined` - User joined quiz
- `user-left` - User left quiz
- `quiz-started` - Quiz has started
- `answer-submitted` - Answer was submitted
- `leaderboard-update` - Leaderboard data
- `quiz-ended` - Quiz has ended

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  userType: String (enum: ['teacher', 'student']),
  rollNo: String (optional, for students)
}
```

### Quizzes Collection
```javascript
{
  title: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  timeLimit: Number (minutes),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }],
  teacherId: ObjectId (ref: User)
}
```

### Results Collection
```javascript
{
  quizId: ObjectId (ref: Quiz),
  studentId: ObjectId (ref: User),
  answers: [Number],
  score: Number,
  timeTaken: Number (seconds),
  submittedAt: Date
}
```

## 🧪 Testing

### Test as Teacher
1. Navigate to `http://localhost:8081/`
2. Register/Login as teacher
3. Create a quiz with questions
4. View created quizzes in dashboard
5. Verify quiz appears in MongoDB

### Test as Student
1. Logout and login as student
2. View available quizzes on dashboard
3. Click "Start Quiz" on any quiz
4. Answer questions within time limit
5. Submit and view results
6. Verify result saved in MongoDB

## 🔐 Security & Best Practices

### Environment Variables
All sensitive data should be in `backend/.env` (never commit this file!):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27018/quizmaster
JWT_SECRET=<generated_secure_random_string>
GEMINI_API_KEY=<your_gemini_api_key>
```

### Security Checklist
- ✅ `.env` is in `.gitignore`
- ✅ Generate unique JWT_SECRET for each deployment
- ✅ Use HTTPS in production
- ✅ Enable CORS only for trusted origins
- ✅ Implement rate limiting for API endpoints
- ✅ Validate and sanitize all user inputs
- ✅ Each developer gets their own Gemini API key

## 📦 Available Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## 🎨 UI Components

Built with Radix UI and styled with Tailwind CSS:
- Buttons, Cards, Dialogs
- Forms with validation
- Toast notifications
- Progress bars
- Tabs and navigation
- Responsive design

## 🔄 Data Flow

### Quiz Creation Flow
```
Teacher Dashboard → Create Quiz Form → Fill Details → Save Quiz
→ POST /api/quiz → MongoDB → Quiz ID Returned → Dashboard Updated
```

### Quiz Attempt Flow
```
Student Dashboard → GET /api/quiz → Display Quizzes → Start Quiz
→ GET /api/quiz/:id → Display Questions → Answer & Submit
→ POST /api/quiz/:id/submit → MongoDB → Results Page
```

## 🚧 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Check port 5000 is not in use

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Clear browser cache and localStorage

### Authentication issues
- Check JWT_SECRET is set in `.env`
- Verify token is stored in localStorage as `authToken`
- Check token expiration (default: 24 hours)

## 🤖 AI Features

This project uses **Google Gemini AI** for:
- **Automated Quiz Generation**: Generate quizzes on any topic with customizable difficulty
- **Smart Explanations**: Get detailed explanations for correct and incorrect answers
- **Personalized Learning**: AI-powered feedback to help students understand concepts

To use AI features, you need a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

QuizMaster Development Team

## 🙏 Acknowledgments

- Radix UI for accessible components
- Tailwind CSS for styling
- Socket.IO for real-time capabilities
- MongoDB for database solution

---

**Built with ❤️ for education**
