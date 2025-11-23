import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AIQuizGeneration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "",
    questionCount: 5,
    additionalContext: ""
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic || !formData.difficulty) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/gemini/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken || '',
        },
        body: JSON.stringify({
          topic: formData.topic,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          context: formData.additionalContext
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Quiz generated successfully!");
        navigate("/teacher-dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to generate quiz");
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/teacher-dashboard")} 
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-10 animate-slide-in-left">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl animate-scale-in">
              <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-2xl tracking-tight">
              AI Quiz Generator
            </h1>
            <p className="text-xl text-white/90 drop-shadow-lg">
              Generate quizzes instantly with AI
            </p>
          </div>
        </div>

        <Card className="glass-card-light border-white/20 animate-slide-in-right shadow-2xl" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}>
          <CardHeader>
            <CardTitle className="text-3xl text-white font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Generate Quiz
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Let AI create a customized quiz based on your topic and requirements
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-white font-semibold">
                    Topic *
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., JavaScript Fundamentals, World History, Biology"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-white font-semibold">
                    Difficulty *
                  </Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData({...formData, difficulty: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionCount" className="text-white font-semibold">
                  Number of Questions
                </Label>
                <Select 
                  value={formData.questionCount.toString()} 
                  onValueChange={(value) => setFormData({...formData, questionCount: parseInt(value)})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context" className="text-white font-semibold">
                  Additional Context (Optional)
                </Label>
                <Textarea
                  id="context"
                  placeholder="Provide any specific requirements, focus areas, or context for the quiz..."
                  value={formData.additionalContext}
                  onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Quiz with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* AI Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="glass-card-light border-white/20" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Questions</h3>
              <p className="text-white/70 text-sm">AI generates contextually relevant questions</p>
            </CardContent>
          </Card>

          <Card className="glass-card-light border-white/20" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Instant Creation</h3>
              <p className="text-white/70 text-sm">Generate complete quizzes in seconds</p>
            </CardContent>
          </Card>

          <Card className="glass-card-light border-white/20" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Adaptive Difficulty</h3>
              <p className="text-white/70 text-sm">Questions tailored to your chosen difficulty</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIQuizGeneration;