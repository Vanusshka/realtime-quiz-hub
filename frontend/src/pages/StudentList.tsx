import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Mail, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Student {
    _id: string;
    name: string;
    email: string;
    rollNo: string;
    userType: string;
}

const StudentList = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const { data: students, isLoading, error } = useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const res = await fetch("http://localhost:5000/api/users/students", {
                headers: {
                    "x-auth-token": token || "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch students");
            return res.json() as Promise<Student[]>;
        },
    });

    return (
        <div className="min-h-screen p-4 animate-fade-in">
            <div className="container mx-auto max-w-5xl py-8">
                <div className="mb-8">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate("/teacher-dashboard")} 
                        className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all hover:scale-105 hover:shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="text-center mb-10 animate-slide-in-left">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl animate-scale-in transform hover:rotate-6 transition-transform">
                            <Users className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-2xl tracking-tight">
                            Student List
                        </h1>
                        <p className="text-xl text-white/90 drop-shadow-lg">Registered Students</p>
                    </div>
                </div>

                <Card className="glass-card-light border-white/20 animate-slide-in-right shadow-2xl" style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                }}>
                    <CardHeader>
                        <CardTitle className="text-3xl text-white font-bold">All Students</CardTitle>
                        <CardDescription className="text-white/90 text-lg">Total registered students: {students?.length || 0}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-8 text-white">Loading students...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-400">Error loading students</div>
                        ) : students?.length === 0 ? (
                            <div className="text-center py-8 text-white/70">No students registered yet.</div>
                        ) : (
                            students?.map((student, index) => (
                                <div
                                    key={student._id}
                                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/15 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slide-in-left"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Avatar className="w-14 h-14 border-2 border-white/40 shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 text-white text-xl font-bold">
                                            {student.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <h3 className="font-bold text-xl text-white drop-shadow-md">{student.name}</h3>
                                            <p className="text-sm text-white/60 md:hidden">Name</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-white">
                                            <Mail className="w-5 h-5 text-cyan-400" />
                                            <span className="text-sm text-white drop-shadow-sm">{student.email}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-white">
                                            <Hash className="w-5 h-5 text-pink-400" />
                                            <span className="text-sm font-mono text-white drop-shadow-sm">{student.rollNo}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentList;
