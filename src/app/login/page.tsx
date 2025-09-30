"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserCircle, Users, Shield, BookOpen } from "lucide-react";
import { mockTeachers, mockMentors, mockStudents } from "@/lib/mockData";

export default function LoginPage() {
  const [role, setRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const roles = [
    { value: "admin", label: "Admin", icon: Shield, color: "text-purple-500" },
    { value: "hod", label: "HOD", icon: GraduationCap, color: "text-blue-500" },
    { value: "mentor", label: "Mentor", icon: Users, color: "text-green-500" },
    { value: "teacher", label: "Teacher", icon: BookOpen, color: "text-orange-500" },
    { value: "student", label: "Student", icon: UserCircle, color: "text-pink-500" },
  ];

  const getUserOptions = () => {
    switch (role) {
      case "teacher":
        return mockTeachers.map(t => ({ value: t.id, label: t.name }));
      case "mentor":
        return mockMentors.map(m => ({ value: m.id, label: m.name }));
      case "student":
        return mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.rollNumber})` }));
      default:
        return [];
    }
  };

  const handleLogin = () => {
    if (!role) return;
    if ((role === "teacher" || role === "mentor" || role === "student") && !userId) return;
    
    // Store role and userId in localStorage
    localStorage.setItem("userRole", role);
    if (userId) {
      localStorage.setItem("userId", userId);
    }
    
    // Navigate based on role
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "hod":
        router.push("/hod");
        break;
      case "mentor":
        router.push("/mentor");
        break;
      case "teacher":
        router.push("/teacher");
        break;
      case "student":
        router.push("/student");
        break;
    }
  };

  const userOptions = getUserOptions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">ResQEd</CardTitle>
          <CardDescription>Early Intervention System for Student Dropout Prevention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((roleOption) => {
                const Icon = roleOption.icon;
                return (
                  <button
                    key={roleOption.value}
                    onClick={() => {
                      setRole(roleOption.value);
                      setUserId("");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      role === roleOption.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${roleOption.color}`} />
                    <p className="text-sm font-medium">{roleOption.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {userOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="user">Select {role === "teacher" ? "Teacher" : role === "mentor" ? "Mentor" : "Student"}</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${role}...`} />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
            disabled={!role || (userOptions.length > 0 && !userId)}
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo: Select role and user, any email/password works</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}