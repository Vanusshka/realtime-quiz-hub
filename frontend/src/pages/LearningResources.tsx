import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, ExternalLink, Clock, Target, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LearningResources = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    loadPersonalizedResources();
  }, []);

  const loadPersonalizedResources = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Get performance analysis
      const analysisResponse = await fetch(`http://localhost:5000/api/gemini/analyze-performance/${user.id}`, {
        headers: {
          'x-auth-token': authToken || '',
        },
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData.analysis);

        // Get learning resources based on weak topics
        if (analysisData.analysis.topicsToImprove.length > 0) {
          const resourcesResponse = await fetch('http://localhost:5000/api/gemini/learning-resources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken || '',
            },
            body: JSON.stringify({
              topics: analysisData.analysis.topicsToImprove,
              studentLevel: 'intermediate'
            }),
          });

          if (resourcesResponse.ok) {
            const resourcesData = await resourcesResponse.json();
            setResources(resourcesData.resources);
          }
        }
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Failed to load personalized resources");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="glass-card-light p-8" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}>
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Analyzing your performance and generating personalized resources...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")} 
            className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-2xl">
              Learning Resources
            </h1>
            <p className="text-xl text-white/90">
              Personalized recommendations based on your performance
            </p>
          </div>
        </div>

        {analysis && (
          <Card className="glass-card-light border-white/20 mb-8" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}>
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-green-400" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Strengths</h3>
                  <div className="space-y-2">
                    {analysis.strengths.map((strength: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Areas to Improve</h3>
                  <div className="space-y-2">
                    {analysis.topicsToImprove.map((topic: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-white/80 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {resources && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Personalized Learning Resources</h2>
            
            {resources.resources.map((resource: any, index: number) => (
              <Card key={index} className="glass-card-light border-white/20" style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              }}>
                <CardHeader>
                  <CardTitle className="text-xl text-white">{resource.topic}</CardTitle>
                  <CardDescription className="text-white/80 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated time: {resource.estimatedTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Key Concepts */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Key Concepts to Focus On</h4>
                      <div className="flex flex-wrap gap-2">
                        {resource.keyConcepts.map((concept: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-white border-white/30">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Study Materials */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Recommended Study Materials</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {resource.studyMaterials.map((material: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-white">{material.title}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {material.type}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-sm mb-3">{material.description}</p>
                            {material.url && (
                              <Button variant="outline" size="sm" className="text-white border-white/30" asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Resource
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practice Activities */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Practice Activities</h4>
                      <ul className="space-y-2">
                        {resource.practiceActivities.map((activity: string, idx: number) => (
                          <li key={idx} className="text-white/80 flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Study Tips */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Study Tips</h4>
                      <ul className="space-y-2">
                        {resource.studyTips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-white/80 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Study Plan */}
            {resources.studyPlan && (
              <Card className="glass-card-light border-white/20" style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              }}>
                <CardHeader>
                  <CardTitle className="text-xl text-white">Personalized Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/80 whitespace-pre-line">
                    {resources.studyPlan}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!resources && !loading && (
          <Card className="glass-card-light border-white/20 text-center py-12" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}>
            <CardContent>
              <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
              <p className="text-white/70 mb-6">
                Take some quizzes first to get personalized learning recommendations
              </p>
              <Button onClick={() => navigate("/dashboard")} className="bg-blue-500 hover:bg-blue-600">
                Browse Quizzes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearningResources;