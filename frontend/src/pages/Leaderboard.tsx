import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/users/leaderboard", {
        headers: {
          "x-auth-token": token || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-accent" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-xl font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-accent to-accent/80";
      case 2:
        return "from-gray-400 to-gray-500";
      case 3:
        return "from-amber-500 to-amber-600";
      default:
        return "from-primary to-primary/80";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground">Top Quiz Masters</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Rankings</CardTitle>
            <CardDescription>See how you compare with other quiz takers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No data available yet.</div>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry._id._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${rank <= 3 ? "bg-gradient-to-r " + getRankColor(rank) + " text-white border-transparent" : "bg-card"
                      }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(rank)}
                    </div>

                    <Avatar className="w-12 h-12 border-2">
                      <AvatarFallback className={rank <= 3 ? "bg-white/20 text-white" : "bg-gradient-to-br from-primary to-accent text-primary-foreground"}>
                        {entry._id.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${rank <= 3 ? "text-white" : ""}`}>
                        {entry._id.name}
                      </h3>
                      <p className={`text-sm ${rank <= 3 ? "text-white/80" : "text-muted-foreground"}`}>
                        Quizzes: {entry.quizzesTaken}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-bold ${rank <= 3 ? "text-white" : "text-primary"}`}>
                        {entry.totalScore}
                      </div>
                      <p className={`text-sm ${rank <= 3 ? "text-white/80" : "text-muted-foreground"}`}>
                        points
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
