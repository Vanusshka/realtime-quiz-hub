import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Trophy, LogOut, Zap, Brain, Users as UsersIcon, BookOpen } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.userType === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        loadQuizzes();
      }
    }
  }, [navigate]);

  const loadQuizzes = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const response = await fetch('http://localhost:5000/api/quiz', {
          headers: {
            'x-auth-token': authToken,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
          console.log('✅ Loaded', data.length, 'quizzes from database');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const startQuiz = (quizId: string, difficulty: string, timeLimit: number) => {
    localStorage.setItem("quizSettings", JSON.stringify({ 
      quizId, 
      difficulty, 
      mode: "timed",
      timeLimit 
    }));
    navigate("/quiz");
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
            <Avatar className="w-20 h-20 mx-auto border-2 border-primary mb-3">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-white">{user.name}</CardTitle>
            <CardDescription className="text-sm text-white/80">{user.email}</CardDescription>
            <div className="flex gap-2 mt-3 justify-center">
              <Badge variant="default">Student</Badge>
              {user.rollNo && <Badge variant="outline" className="text-white border-white/40">Roll: {user.rollNo}</Badge>}
            </div>
          </CardHeader>
        </Card>

        {/* Leaderboard Card */}
        <Card 
          className="glass-card-light cursor-pointer hover:shadow-lg transition-all" 
          onClick={() => navigate("/leaderboard")}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </CardTitle>
            <CardDescription className="text-sm text-white/80">
              View rankings
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Learning Resources Card */}
        <Card 
          className="glass-card-light cursor-pointer hover:shadow-lg transition-all" 
          onClick={() => navigate("/learning-resources")}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <BookOpen className="w-5 h-5" />
              AI Learning Resources
            </CardTitle>
            <CardDescription className="text-sm text-white/80">
              Personalized study materials
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Difficulty Level Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
            <Target className="w-8 h-8" style={{ color: '#ffffff' }} />
            Choose Difficulty Level
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card-light hover:shadow-lg transition-all cursor-pointer border-2 border-white/20 hover:border-green-400 group" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardHeader>
                <Brain className="w-10 h-10 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl text-white">Easy</CardTitle>
                <CardDescription className="text-white/80">Perfect for beginners</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card-light hover:shadow-lg transition-all cursor-pointer border-2 border-white/20 hover:border-yellow-400 group" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl text-white">Medium</CardTitle>
                <CardDescription className="text-white/80">Moderate challenge</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card-light hover:shadow-lg transition-all cursor-pointer border-2 border-white/20 hover:border-red-400 group" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardHeader>
                <Trophy className="w-10 h-10 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl text-white">Hard</CardTitle>
                <CardDescription className="text-white/80">Expert level</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Available Quizzes Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
            <Zap className="w-8 h-8" style={{ color: '#ffffff' }} />
            Available Quizzes
          </h2>
          
          {loading ? (
            <Card className="glass-card-light" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-white">Loading quizzes...</p>
              </CardContent>
            </Card>
          ) : quizzes.length === 0 ? (
            <Card className="glass-card-light border-2 border-dashed border-white/20" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <h3 className="text-xl font-semibold mb-2 text-white">No quizzes available</h3>
                <p className="text-white/70">
                  Check back later for new quizzes from your teachers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const difficultyColors = {
                  easy: 'text-green-500',
                  medium: 'text-yellow-500',
                  hard: 'text-red-500'
                };
                const iconColor = difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || 'text-blue-500';
                
                return (
                  <Card 
                    key={quiz._id}
                    className="glass-card-light hover:shadow-lg transition-all cursor-pointer group border-white/20"
                    onClick={() => startQuiz(quiz._id, quiz.difficulty, quiz.timeLimit)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(40px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    }}
                  >
                    <CardHeader>
                      <Brain className={`w-12 h-12 ${iconColor} mb-3 group-hover:scale-110 transition-transform`} />
                      <CardTitle className="text-xl text-white">{quiz.title}</CardTitle>
                      <CardDescription className="text-white/80">
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Badge className="bg-white text-gray-800 border-0">
                            {quiz.difficulty === 'easy' ? 'Easy' : 
                             quiz.difficulty === 'medium' ? 'Medium' : 
                             quiz.difficulty === 'hard' ? 'Hard' : quiz.difficulty}
                          </Badge>
                          <Badge className="bg-white text-gray-800 border-0">
                            {quiz.questions.length} Questions
                          </Badge>
                          <Badge className="bg-white text-gray-800 border-0">
                            {Math.floor(quiz.timeLimit / 60)}min
                          </Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="hologram">
                        <Clock className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
