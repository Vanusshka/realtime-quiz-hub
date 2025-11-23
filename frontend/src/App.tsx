import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ColorBends from "./components/ColorBends";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherQuizCreation from "./pages/TeacherQuizCreation";
import TeacherConductQuiz from "./pages/TeacherConductQuiz";
import StudentList from "./pages/StudentList";
import NotFound from "./pages/NotFound";
import "./styles/hologram.css";
import "./styles/theme.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ColorBends
      colors={["#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe", "#43e97b"]}
      rotation={30}
      speed={0.3}
      scale={0.5}
      frequency={1.5}
      warpStrength={1.8}
      mouseInfluence={1.0}
      parallax={0.7}
      noise={0.03}
      transparent={false}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
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
          <Route path="/teacher-conduct-quiz" element={<TeacherConductQuiz />} />
          <Route path="/students" element={<StudentList />} />
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
