import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, RotateCcw, Home, CheckCircle2, XCircle, Youtube, ExternalLink, Lightbulb, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [explanations, setExplanations] = useState<{ [key: number]: string }>({});
  const [loadingExplanations, setLoadingExplanations] = useState<{ [key: number]: boolean }>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const resultsData = localStorage.getItem("quizResults");
    if (!resultsData) {
      navigate("/dashboard");
    } else {
      const parsedResults = JSON.parse(resultsData);
      setResults(parsedResults);
      
      // Fetch recommendations for students
      // Check both localStorage.userType and user.userType
      let userType = localStorage.getItem('userType');
      if (!userType) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userType = user.userType;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }
      
      if (userType === 'student') {
        fetchRecommendations(parsedResults);
      }
    }
  }, [navigate]);

  const fetchRecommendations = async (resultsData: any) => {
    setLoadingRecommendations(true);
    try {
      const authToken = localStorage.getItem('authToken');
      let userType = localStorage.getItem('userType');
      
      // Try to get userType from user object if not directly available
      if (!userType) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userType = user.userType;
          } catch (e) {
            console.error('Error parsing user:', e);
          }
        }
      }

      // Get incorrect questions
      const incorrectQuestions = resultsData.questions
        .map((q: any, idx: number) => {
          const userAnswer = resultsData.answers[idx];
          const correctAnswer = q.correctAnswer ?? q.correct;
          if (userAnswer !== correctAnswer) {
            return q.question;
          }
          return null;
        })
        .filter((q: any) => q !== null);

      const requestBody = {
        quizTitle: resultsData.quizTitle || 'Quiz',
        quizTopic: resultsData.quizData?.topic || resultsData.quizTitle,
        score: resultsData.score,
        totalQuestions: resultsData.total,
        incorrectQuestions: incorrectQuestions,
      };

      // Use demo endpoint if no auth token, otherwise use authenticated endpoint
      const endpoint = authToken 
        ? 'http://localhost:5000/api/gemini/quiz-recommendations'
        : 'http://localhost:5000/api/gemini/quiz-recommendations-demo';
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['x-auth-token'] = authToken;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        console.error('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchExplanation = async (questionIndex: number, question: any, correctAnswer: number, userAnswer: number) => {
    console.log('Fetching explanation for question:', questionIndex);
    setLoadingExplanations(prev => ({ ...prev, [questionIndex]: true }));
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:5000/api/gemini/explain-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken,
        },
        body: JSON.stringify({
          question,
          correctAnswer,
          userAnswer,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setExplanations(prev => ({ ...prev, [questionIndex]: data.explanation }));
        console.log('Explanation set successfully');
      } else {
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Error fetching explanation:', error);
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

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
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Quiz Complete!
          </h1>
          <p className="text-xl text-white/80">Here's how you performed</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border border-white/20 backdrop-blur-md bg-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Your Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4">
                  {percentage.toFixed(0)}%
                </div>
                <Progress value={percentage} className="h-3 mb-4" />
                <p className="text-2xl font-semibold text-white">
                  {results.score} / {results.total} Correct
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/20 backdrop-blur-md bg-transparent shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">Correct Answers</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">{results.score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-white">Wrong Answers</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{wrongAnswers}</span>
                </div>
                {results.timeTaken !== null && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Time Taken</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{formatTime(results.timeTaken)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border border-white/20 backdrop-blur-md bg-transparent shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Visual Performance</CardTitle>
            <CardDescription className="text-white/70">Distribution of correct vs wrong answers</CardDescription>
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

        {recommendations && (
          <Card className="mb-6 border border-white/20 backdrop-blur-sm bg-black/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                Personalized Learning Recommendations
              </CardTitle>
              <CardDescription className="text-white/70">
                {recommendations.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* YouTube Videos */}
              {recommendations.youtubeVideos && recommendations.youtubeVideos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    Recommended YouTube Videos
                  </h3>
                  <div className="space-y-3">
                    {recommendations.youtubeVideos.map((video: any, index: number) => (
                      <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-3">
                          <Youtube className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white font-semibold hover:text-blue-400 transition-colors"
                            >
                              {video.title}
                            </a>
                            <p className="text-sm text-white/60 mt-1">by {video.channel}</p>
                            <p className="text-sm text-white/80 mt-2">{video.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website Resources */}
              {recommendations.websites && recommendations.websites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Helpful Websites & Articles
                  </h3>
                  <div className="space-y-3">
                    {recommendations.websites.map((website: any, index: number) => (
                      <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-3">
                          <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white font-semibold hover:text-blue-400 transition-colors"
                            >
                              {website.title}
                            </a>
                            <p className="text-xs text-white/50 mt-1 break-all">{website.url}</p>
                            <p className="text-sm text-white/80 mt-2">{website.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Tips */}
              {recommendations.studyTips && recommendations.studyTips.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Study Tips
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.studyTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-white">
                        <span className="text-yellow-400 flex-shrink-0">•</span>
                        <span className="text-white">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loadingRecommendations && (
          <Card className="mb-6 border border-white/20 backdrop-blur-sm bg-black/30 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white/80">Generating personalized recommendations...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {results.questions && (
          <Card className="mb-6 border border-white/20 backdrop-blur-sm bg-black/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">📝 Question-by-Question Analysis</CardTitle>
              <CardDescription className="text-white/70">Review your answers and learn from mistakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {results.questions.map((question: any, index: number) => {
                const userAnswer = results.answers[index];
                const correctAnswer = question.correctAnswer ?? question.correct;
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div key={index} className="border border-white/10 rounded-lg p-4 bg-black/40">
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Question {index + 1}: {question.question}
                        </h3>
                        
                        <div className="space-y-2 mb-3">
                          {question.options.map((option: string, optIndex: number) => {
                            const isUserAnswer = userAnswer === optIndex;
                            const isCorrectOption = correctAnswer === optIndex;
                            
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectOption
                                    ? "bg-green-500/20 border-green-400"
                                    : isUserAnswer && !isCorrect
                                    ? "bg-red-500/20 border-red-400"
                                    : "bg-white/5 border-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span className="text-white flex-1">{option}</span>
                                  {isCorrectOption && (
                                    <span className="text-green-400 text-sm font-semibold">✓ Correct</span>
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <span className="text-red-400 text-sm font-semibold">Your Answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                            <p className="text-sm font-semibold text-blue-300 mb-1">💡 Explanation:</p>
                            <p className="text-white/90 text-sm leading-relaxed">{question.explanation}</p>
                          </div>
                        )}

                        {!isCorrect && !question.explanation && (
                          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                            <p className="text-sm text-white mb-2">
                              The correct answer is: <strong className="text-green-300">{question.options[correctAnswer]}</strong>
                            </p>
                            
                            {!explanations[index] && !loadingExplanations[index] && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchExplanation(index, question, correctAnswer, userAnswer)}
                                className="mt-2 text-xs"
                              >
                                💡 Get AI Explanation
                              </Button>
                            )}
                            
                            {loadingExplanations[index] && (
                              <p className="text-xs text-white/70 mt-2">Generating explanation...</p>
                            )}
                            
                            {explanations[index] && (
                              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-400/30 rounded">
                                <p className="text-xs font-semibold text-blue-300 mb-1">💡 AI Explanation:</p>
                                <p className="text-white/90 text-xs leading-relaxed">{explanations[index]}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

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
