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
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(sampleQuestions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSettings, setQuizSettings] = useState<any>(null);

  useEffect(() => {
    const settings = localStorage.getItem("quizSettings");
    if (!settings) {
      navigate("/dashboard");
    } else {
      setQuizSettings(JSON.parse(settings));
    }
  }, [navigate]);

  useEffect(() => {
    if (quizSettings?.mode === "timed" && timeLeft > 0) {
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
  }, [timeLeft, quizSettings]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    if (quizSettings?.mode === "practice") {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
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

  const handleSubmit = () => {
    const correctAnswers = selectedAnswers.filter((ans, idx) => ans === sampleQuestions[idx].correct).length;
    const results = {
      score: correctAnswers,
      total: sampleQuestions.length,
      timeTaken: quizSettings?.mode === "timed" ? 300 - timeLeft : null,
      answers: selectedAnswers,
    };
    localStorage.setItem("quizResults", JSON.stringify(results));
    navigate("/results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;
  const question = sampleQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];

  if (!quizSettings) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-base px-3 py-1">
                  Question {currentQuestion + 1}/{sampleQuestions.length}
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
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showCorrectAnswer = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 px-6 text-base transition-all ${
                    showCorrectAnswer ? "bg-success hover:bg-success border-success" : ""
                  } ${showIncorrect ? "bg-destructive hover:bg-destructive border-destructive" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {showFeedback && (
          <Card className="mb-6 border-2 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-lg font-semibold mb-2">
                {selectedAnswer === question.correct ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-muted-foreground">
                The correct answer is: <strong>{question.options[question.correct]}</strong>
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
            disabled={currentQuestion === sampleQuestions.length - 1}
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
