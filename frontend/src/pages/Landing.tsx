import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, Trophy } from "lucide-react";
import RotatingGlobe from "@/components/RotatingGlobe";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        {/* 3D Rotating Globe with QuizMaster Text */}
        <div className="mb-12 animate-scale-in">
          <RotatingGlobe />
        </div>

        {/* Subtitle */}
        <div className="space-y-4 animate-slide-in-left">
          <p
            className="text-xl md:text-2xl"
            style={{
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            The Ultimate Interactive Quiz Platform
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 animate-slide-in-right">
          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
            <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
            >
              Real-Time Quizzes
            </h3>
            <p
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 5px rgba(0, 0, 0, 0.8)' }}
            >
              Engage in live quiz competitions
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
            <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
            >
              Collaborative Learning
            </h3>
            <p
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 5px rgba(0, 0, 0, 0.8)' }}
            >
              Learn together with peers
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
            >
              Track Progress
            </h3>
            <p
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 5px rgba(0, 0, 0, 0.8)' }}
            >
              Monitor your performance
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 animate-scale-in">
          <Button
            onClick={() => navigate("/login")}
            variant="hologram"
            size="lg"
            className="text-lg px-8 py-6 group"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#000000',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}
          >
            Go to Login Page
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Tagline */}
        <p
          className="text-sm mt-8"
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            textShadow: '0 1px 5px rgba(0, 0, 0, 0.8)'
          }}
        >
          Empowering education through interactive assessments
        </p>
      </div>
    </div>
  );
};

export default Landing;
