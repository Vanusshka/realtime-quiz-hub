import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"student" | "teacher">("student");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const rollNo = userType === "student" ? (formData.get("rollNo") as string) : undefined;
    
    try {
      // Try to register/login with backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: email, // Using email as password for simplicity
          userType,
          rollNo,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store user data and token
        const userData = {
          name: data.user.name,
          email: data.user.email,
          rollNo: data.user.rollNo || null,
          userType: data.user.userType,
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem('authToken', data.token);
        console.log('✅ User authenticated successfully');
        
        navigate("/dashboard");
      } else {
        // If user exists, try to login
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: email,
          }),
        });
        
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          
          const userData = {
            name: data.user.name,
            email: data.user.email,
            rollNo: data.user.rollNo || null,
            userType: data.user.userType,
          };
          
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem('authToken', data.token);
          console.log('✅ User logged in successfully');
          
          navigate("/dashboard");
        } else {
          console.error('Login failed');
          // Fallback to localStorage only
          const userData = {
            name,
            email,
            rollNo: rollNo || null,
            userType,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fallback to localStorage only
      const userData = {
        name,
        email,
        rollNo: rollNo || null,
        userType,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-scale-in border-white/20 glass-card-light" style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      }}>
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
            QuizMaster
          </CardTitle>
          <CardDescription className="text-base text-white/90 drop-shadow-md">
            Welcome! Login to start your quiz journey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-white">
          <Tabs value={userType} onValueChange={(v) => setUserType(v as "student" | "teacher")}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 border-white/20">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input
                    id="student-name"
                    name="name"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email ID</Label>
                  <Input
                    id="student-email"
                    name="email"
                    type="email"
                    placeholder="your.email@school.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-roll">Roll Number</Label>
                  <Input
                    id="student-roll"
                    name="rollNo"
                    placeholder="Enter your roll number"
                    required
                  />
                </div>
                <Button type="submit" variant="hologram" className="w-full mt-6 h-11">
                  Login as Student
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="teacher">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Full Name</Label>
                  <Input
                    id="teacher-name"
                    name="name"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email ID</Label>
                  <Input
                    id="teacher-email"
                    name="email"
                    type="email"
                    placeholder="your.email@school.com"
                    required
                  />
                </div>
                <Button type="submit" variant="hologram" className="w-full mt-6 h-11">
                  Login as Teacher
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

      </Card>
    </div>
  );
};

export default Login;
