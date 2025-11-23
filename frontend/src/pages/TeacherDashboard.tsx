import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, Trophy, BookOpen, Users, Play, Trash2, BarChart3, TrendingUp, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    topPerformers: [],
    recentActivity: []
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      loadQuizzesFromDB();
      loadStatsFromDB();
    }
  }, [navigate]);

  const loadStatsFromDB = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const response = await fetch('http://localhost:5000/api/users/dashboard-stats', {
          headers: {
            'x-auth-token': authToken,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadQuizzesFromDB = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const response = await fetch('http://localhost:5000/api/quiz', {
          headers: {
            'x-auth-token': authToken,
          },
        });

        if (response.ok) {
          const dbQuizzes = await response.json();
          console.log('✅ Loaded', dbQuizzes.length, 'quizzes from database');

          // Convert database format to frontend format
          const formattedQuizzes = dbQuizzes.map((dbQuiz: any) => ({
            id: dbQuiz._id,
            title: dbQuiz.title,
            difficulty: dbQuiz.difficulty,
            timeLimit: dbQuiz.timeLimit,
            questions: dbQuiz.questions,
            createdAt: dbQuiz.createdAt
          }));

          setQuizzes(formattedQuizzes);
          localStorage.setItem("teacherQuizzes", JSON.stringify(formattedQuizzes));
        }
      }
    } catch (error) {
      console.log('⚠️ Could not load quizzes from database');
      // Fallback to localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem("teacherQuizzes") || "[]");
      setQuizzes(savedQuizzes);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const conductQuiz = (quiz: any) => {
    localStorage.setItem("activeQuiz", JSON.stringify(quiz));
    localStorage.setItem("quizSettings", JSON.stringify({
      difficulty: quiz.difficulty,
      mode: "timed"
    }));
    navigate("/teacher-conduct-quiz");
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const authToken = localStorage.getItem('authToken');

      if (authToken) {
        const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': authToken,
          },
        });

        if (response.ok) {
          console.log('✅ Quiz deleted from database');
          const updatedQuizzes = quizzes.filter((q) => q.id !== quizId);
          setQuizzes(updatedQuizzes);
          localStorage.setItem("teacherQuizzes", JSON.stringify(updatedQuizzes));
          toast.success("Quiz deleted successfully");
        } else {
          toast.error("Failed to delete quiz");
        }
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error("Failed to delete quiz");
    }
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();



  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-white/10 backdrop-blur-sm p-6 space-y-6">
        {/* Profile Card */}
        <Card className="glass-card-light animate-slide-in-left" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}>
          <CardHeader className="text-center">
            <Avatar className="w-20 h-20 mx-auto border-2 border-accent mb-3">
              <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-white">{user.name}</CardTitle>
            <CardDescription className="text-sm text-white/80">{user.email}</CardDescription>
            <div className="flex gap-2 mt-3 justify-center">
              <Badge variant="secondary">Teacher</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card-light" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}>
          <CardHeader>
            <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              variant="hologram"
              onClick={() => navigate("/teacher-create-quiz")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => navigate("/ai-quiz-generation")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate Quiz
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate("/students")}
            >
              <Users className="w-4 h-4 mr-2" />
              View Students
            </Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Analytics Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
            <BarChart3 className="w-8 h-8" style={{ color: '#ffffff' }} />
            Student Analytics
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                    <p className="text-sm text-white/70">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.activeQuizzes}</p>
                    <p className="text-sm text-white/70">Active Quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.completedQuizzes}</p>
                    <p className="text-sm text-white/70">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.averageScore}</p>
                    <p className="text-sm text-white/70">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5 text-amber-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topPerformers.length === 0 ? (
                    <p className="text-center text-white/50 py-4">No data yet</p>
                  ) : (
                    stats.topPerformers.map((student: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{student.name}</p>
                            <p className="text-sm text-white/70">{student.quizzes} quizzes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-500">{student.score}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.length === 0 ? (
                    <p className="text-center text-white/50 py-4">No recent activity</p>
                  ) : (
                    stats.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-white">{activity.student}</p>
                          <Badge variant="secondary" className="bg-white text-gray-800">{activity.score}</Badge>
                        </div>
                        <p className="text-sm text-white/70">{activity.quiz}</p>
                        <p className="text-xs text-white/50 mt-1">{activity.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Quizzes Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
            <BookOpen className="w-8 h-8" style={{ color: '#ffffff' }} />
            My Quizzes
          </h2>

          {quizzes.length === 0 ? (
            <Card className="glass-card-light border-2 border-dashed border-white/20" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <h3 className="text-xl font-semibold mb-2 text-white">No quizzes yet</h3>
                <p className="text-white/70 mb-6">
                  Create your first quiz to get started
                </p>
                <Button variant="hologram" onClick={() => navigate("/teacher-create-quiz")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="glass-card-light hover:shadow-lg transition-all border-white/20" style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                }}>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2 text-white">{quiz.title}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-white text-gray-800 border-0">
                        {quiz.difficulty === 'easy' ? 'Easy' : 
                         quiz.difficulty === 'medium' ? 'Medium' : 
                         quiz.difficulty === 'hard' ? 'Hard' : quiz.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="bg-white text-gray-800">
                        {quiz.questions.length} Questions
                      </Badge>
                      <Badge variant="secondary" className="bg-white text-gray-800">
                        {Math.floor(quiz.timeLimit / 60)}min
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="hologram"
                        onClick={() => conductQuiz(quiz)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Conduct Quiz
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteQuiz(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
