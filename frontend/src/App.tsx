import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Aurora from "./components/Aurora";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherQuizCreation from "./pages/TeacherQuizCreation";
import AIQuizGeneration from "./pages/AIQuizGeneration";
import TeacherConductQuiz from "./pages/TeacherConductQuiz";
import StudentList from "./pages/StudentList";
import LearningResources from "./pages/LearningResources";
import NotFound from "./pages/NotFound";
import "./styles/hologram.css";
import "./styles/theme.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#000000' }}>
      <Aurora
        colorStops={["#7cff67", "#b19eef", "#5227ff"]}
        blend={0.6}
        amplitude={1.2}
        speed={0.8}
      />
    </div>
    <div style={{ position: 'relative', zIndex: 1 }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-create-quiz" element={<TeacherQuizCreation />} />
          <Route path="/ai-quiz-generation" element={<AIQuizGeneration />} />
          <Route path="/teacher-conduct-quiz" element={<TeacherConductQuiz />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/learning-resources" element={<LearningResources />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    <Toaster />
    <Sonner />
    </div>
  </QueryClientProvider>
);

export default App;
