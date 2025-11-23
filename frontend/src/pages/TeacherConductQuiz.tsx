import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Flag, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

const TeacherConductQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [studentResponses, setStudentResponses] = useState<any[]>([]);

  useEffect(() => {
    const quiz = localStorage.getItem("activeQuiz");
    if (!quiz) {
      navigate("/dashboard");
    } else {
      const quizData = JSON.parse(quiz);
      setActiveQuiz(quizData);
      setTimeLeft(quizData.timeLimit);
    }
  }, [navigate]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, quizStarted]);

  const startQuiz = () => {
    setQuizStarted(true);
    toast.success("Quiz started! Students can now join.");
  };

  const endQuiz = () => {
    toast.info("Quiz ended!");
    setQuizStarted(false);
  };

  const handleNext = () => {
    if (currentQuestion < activeQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeQuiz) return null;

  const progress = ((currentQuestion + 1) / activeQuiz.questions.length) * 100;
  const question = activeQuiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{activeQuiz.title}</h2>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        Question {currentQuestion + 1}/{activeQuiz.questions.length}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {activeQuiz.difficulty}
                      </Badge>
                      {quizStarted && (
                        <Badge variant="default" className="bg-success">
                          Live
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`} />
                    <span className={timeLeft < 60 ? 'text-destructive' : ''}>{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl leading-relaxed">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.options.map((option: string, index: number) => {
                  const isCorrect = index === (question.correctAnswer ?? question.correct);

                  return (
                    <div
                      key={index}
                      className={`w-full justify-start text-left h-auto py-4 px-6 text-base border-2 rounded-lg transition-all ${
                        isCorrect 
                          ? "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600" 
                          : "bg-card border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-lg flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                        <span className={`flex-1 break-words ${isCorrect ? "font-semibold text-green-700 dark:text-green-400" : ""}`}>{option}</span>
                        {isCorrect && (
                          <Badge className="ml-2 flex-shrink-0 bg-green-600 hover:bg-green-700 text-white">
                            ✓ Correct Answer
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {question.explanation && (
              <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">💡</span>
                    Answer Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">
                    {question.explanation}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentQuestion === activeQuiz.questions.length - 1}
                className="px-6"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Quiz Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!quizStarted ? (
                  <Button onClick={startQuiz} className="w-full" size="lg">
                    <Flag className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Button>
                ) : (
                  <Button onClick={endQuiz} variant="destructive" className="w-full" size="lg">
                    <Flag className="w-4 h-4 mr-2" />
                    End Quiz
                  </Button>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Active Students</span>
                    <Badge variant="secondary">{studentResponses.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Responses</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Score</span>
                    <Badge variant="outline">-</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold">{activeQuiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit</span>
                  <span className="font-semibold">{Math.floor(activeQuiz.timeLimit / 60)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <Badge variant="outline" className="capitalize">
                    {activeQuiz.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherConductQuiz;
