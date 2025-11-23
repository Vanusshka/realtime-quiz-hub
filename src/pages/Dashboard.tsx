import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Trophy, LogOut, Zap, Brain, Users as UsersIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const startQuiz = (difficulty: string, mode: string) => {
    localStorage.setItem("quizSettings", JSON.stringify({ difficulty, mode }));
    navigate("/quiz");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              QuizMaster
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant={user.userType === "student" ? "default" : "secondary"}>
                  {user.userType === "student" ? "Student" : "Teacher"}
                </Badge>
                {user.rollNo && <Badge variant="outline">Roll: {user.rollNo}</Badge>}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Choose Difficulty Level
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-success group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Brain className="w-5 h-5" />
                  Easy
                </CardTitle>
                <CardDescription>Perfect for beginners and practice</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-accent group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Zap className="w-5 h-5" />
                  Medium
                </CardTitle>
                <CardDescription>Challenge yourself with moderate questions</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-destructive group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trophy className="w-5 h-5" />
                  Hard
                </CardTitle>
                <CardDescription>Expert level for quiz masters</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            Select Quiz Mode
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
              onClick={() => startQuiz("medium", "timed")}
            >
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Timed Quiz</CardTitle>
                <CardDescription>Race against the clock!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Start Timed Quiz
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-accent group"
              onClick={() => startQuiz("medium", "practice")}
            >
              <CardHeader>
                <Brain className="w-8 h-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Practice Mode</CardTitle>
                <CardDescription>Learn at your own pace</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Start Practice
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-success group"
              onClick={() => startQuiz("medium", "competition")}
            >
              <CardHeader>
                <Trophy className="w-8 h-8 text-success mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Competition</CardTitle>
                <CardDescription>Compete with others!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Join Competition
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-2 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate("/leaderboard")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-primary" />
              View Leaderboard
            </CardTitle>
            <CardDescription>See how you rank against other quiz takers</CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
