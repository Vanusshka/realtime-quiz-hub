# 🎯 QuizMaster - Real-Time Quiz Application

A full-stack real-time quiz application built with React, Node.js, Express, MongoDB, and Socket.IO. Teachers can create quizzes, and students can attempt them with real-time scoring and result tracking.

## ✨ Features

### For Teachers
- 📝 Create custom quizzes with multiple-choice questions
- 🎚️ Set difficulty levels (Easy, Medium, Hard)
- ⏱️ Configure time limits for quizzes
- 📊 View all created quizzes
- 🗑️ Delete quizzes
- 👥 Automatic visibility to all students

### For Students
- 📚 Browse available quizzes from database
- 🔍 View quiz details (difficulty, questions, time limit)
- ✍️ Attempt quizzes with countdown timer
- 📈 Automatic score calculation
- 📊 View detailed results and breakdown

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

# Edit .env with your MongoDB connection string
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start the backend server
npm run dev
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
- `DELETE /api/quiz/:id` - Delete quiz (teacher only)
- `POST /api/quiz/:id/submit` - Submit quiz answers (student only)

### Results
- `GET /api/result/student/:studentId` - Get student's results
- `GET /api/result/quiz/:quizId` - Get all results for a quiz

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

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27018/quizmaster
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

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

## 📚 Documentation

Additional documentation available:
- `backend/QUICK_START.md` - Backend setup guide
- `backend/MONGODB_SETUP.md` - MongoDB configuration
- `TESTING_GUIDE.md` - Comprehensive testing scenarios
- `IMPLEMENTATION_SUMMARY.md` - Feature implementation details

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
