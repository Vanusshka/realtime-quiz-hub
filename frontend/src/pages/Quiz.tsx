import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { toast } from "sonner";

const sampleQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2,
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    id: 3,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    correct: 1,
  },
  {
    id: 4,
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correct: 3,
  },
  {
    id: 5,
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correct: 2,
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSettings, setQuizSettings] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settings = localStorage.getItem("quizSettings");
    if (!settings) {
      navigate("/dashboard");
      return;
    }
    
    const parsedSettings = JSON.parse(settings);
    setQuizSettings(parsedSettings);
    
    if (parsedSettings.quizId) {
      loadQuizFromDatabase(parsedSettings.quizId, parsedSettings.timeLimit);
    } else {
      // Fallback to sample questions
      setQuiz({ questions: sampleQuestions, timeLimit: 300 });
      setSelectedAnswers(new Array(sampleQuestions.length).fill(null));
      setLoading(false);
    }
  }, [navigate]);

  const loadQuizFromDatabase = async (quizId: string, timeLimit: number) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
        headers: {
          'x-auth-token': authToken,
        },
      });

      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        setSelectedAnswers(new Array(quizData.questions.length).fill(null));
        setTimeLeft(quizData.timeLimit);
        console.log('✅ Loaded quiz from database:', quizData.title);
      } else {
        console.error('Failed to load quiz');
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizSettings?.mode === "timed" && timeLeft > 0 && !loading && quiz) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, quizSettings, loading, quiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    if (quizSettings?.mode === "practice") {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    const questions = quiz?.questions || sampleQuestions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmit = async () => {
    const questions = quiz?.questions || sampleQuestions;
    const correctAnswers = selectedAnswers.filter((ans, idx) => {
      const correctAnswer = quiz ? questions[idx].correctAnswer : questions[idx].correct;
      return ans === correctAnswer;
    }).length;
    
    const initialTime = quiz?.timeLimit || 300;
    const timeTaken = quizSettings?.mode === "timed" ? initialTime - timeLeft : null;
    
    const results = {
      score: correctAnswers,
      total: questions.length,
      timeTaken,
      answers: selectedAnswers,
      quizTitle: quiz?.title || "Sample Quiz",
      questions: questions,
      quizData: quiz,
    };
    
    localStorage.setItem("quizResults", JSON.stringify(results));
    
    // Submit to backend if it's a database quiz
    if (quiz && quizSettings?.quizId) {
      try {
        const authToken = localStorage.getItem('authToken');
        
        if (authToken) {
          const answersForBackend = selectedAnswers.map((answer, idx) => ({
            questionId: idx,
            selectedAnswer: answer !== null ? answer : -1,
            isCorrect: answer === questions[idx].correctAnswer,
            timeSpent: timeTaken ? Math.floor(timeTaken / questions.length) : 0
          }));
          
          const response = await fetch(`http://localhost:5000/api/quiz/${quizSettings.quizId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken,
            },
            body: JSON.stringify({
              answers: answersForBackend,
              timeTaken: timeTaken || 0,
            }),
          });
          
          if (response.ok) {
            console.log('✅ Quiz results saved to database');
          }
        }
      } catch (error) {
        console.error('Error saving results:', error);
      }
    }
    
    navigate("/results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="hologram-card">
          <CardContent className="py-12 text-center">
            <p className="text-lg">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizSettings) return null;

  const questions = quiz?.questions || sampleQuestions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const correctAnswerIndex = quiz ? question.correctAnswer : question.correct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-base px-3 py-1">
                  Question {currentQuestion + 1}/{questions.length}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {quizSettings.mode}
                </Badge>
              </div>
              {quizSettings.mode === "timed" && (
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`} />
                  <span className={timeLeft < 60 ? 'text-destructive' : ''}>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === correctAnswerIndex;
              const showCorrectAnswer = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 px-6 text-base transition-all whitespace-normal ${
                    showCorrectAnswer ? "bg-success hover:bg-success border-success" : ""
                  } ${showIncorrect ? "bg-destructive hover:bg-destructive border-destructive" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                >
                  <span className="font-semibold mr-3 flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                  <span className="break-words">{option}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {showFeedback && (
          <Card className="mb-6 border-2 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-lg font-semibold mb-2">
                {selectedAnswer === correctAnswerIndex ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-muted-foreground">
                The correct answer is: <strong>{question.options[correctAnswerIndex]}</strong>
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
            variant="default"
            onClick={handleSubmit}
            className="px-6"
          >
            <Flag className="w-4 h-4 mr-2" />
            Submit Quiz
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="px-6"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
