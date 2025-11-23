import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, RotateCcw, Home, CheckCircle2, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const resultsData = localStorage.getItem("quizResults");
    if (!resultsData) {
      navigate("/dashboard");
    } else {
      setResults(JSON.parse(resultsData));
    }
  }, [navigate]);

  const handleRetry = () => {
    navigate("/quiz");
  };

  const handleNewQuiz = () => {
    navigate("/dashboard");
  };

  if (!results) return null;

  const percentage = (results.score / results.total) * 100;
  const wrongAnswers = results.total - results.score;

  const pieData = [
    { name: "Correct", value: results.score, color: "hsl(var(--success))" },
    { name: "Wrong", value: wrongAnswers, color: "hsl(var(--destructive))" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quiz Complete!
          </h1>
          <p className="text-xl text-muted-foreground">Here's how you performed</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Your Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  {percentage.toFixed(0)}%
                </div>
                <Progress value={percentage} className="h-3 mb-4" />
                <p className="text-2xl font-semibold">
                  {results.score} / {results.total} Correct
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-semibold">Correct Answers</span>
                  </div>
                  <span className="text-2xl font-bold text-success">{results.score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold">Wrong Answers</span>
                  </div>
                  <span className="text-2xl font-bold text-destructive">{wrongAnswers}</span>
                </div>
                {results.timeTaken !== null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Time Taken</span>
                    </div>
                    <span className="text-2xl font-bold">{formatTime(results.timeTaken)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Visual Performance</CardTitle>
            <CardDescription>Distribution of correct vs wrong answers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetry} size="lg" variant="default" className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Retry Quiz
          </Button>
          <Button onClick={handleNewQuiz} size="lg" variant="outline" className="gap-2">
            <Home className="w-5 h-5" />
            Choose New Quiz
          </Button>
          <Button onClick={() => navigate("/leaderboard")} size="lg" variant="secondary" className="gap-2">
            <Trophy className="w-5 h-5" />
            View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
