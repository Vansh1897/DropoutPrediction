"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Award, 
  AlertTriangle,
  Calendar,
  FileText,
  Edit,
  Save,
  X,
  TrendingDown,
  TrendingUp,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { calculateRisk, getRiskColor, getRiskLevelDisplay, type StudentRiskData } from "@/lib/riskCalculator";
import { mockStudents, mockMentors, mockTeachers } from "@/lib/mockData";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  year?: string;
  rollNumber?: string;
  department?: string;
  // Student-specific fields
  attendance30d?: number;
  currentSemesterMarks?: number;
  previousSemesterMarks?: number;
  backlogs?: number;
  attemptsExhausted?: number;
  feeOverdueDays?: number;
  sgpa?: number;
  // Teacher/Mentor fields
  subjects?: string[];
  classes?: string[];
  experience?: number;
}

interface CounselingRecord {
  id: string;
  date: string;
  mentorName?: string;
  studentName?: string;
  feedbackText: string;
  riskFactors?: string;
  recommendations?: string;
  followUpRequired: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [counselingHistory, setCounselingHistory] = useState<CounselingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  // Risk assessment state (for students)
  const [riskAssessment, setRiskAssessment] = useState<ReturnType<typeof calculateRisk> | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    if (!userId || !userRole) {
      router.push("/login");
      return;
    }

    loadUserProfile(userId, userRole);
  }, [router]);

  const loadUserProfile = (userId: string, userRole: string) => {
    setIsLoading(true);
    
    try {
      // Load from mock data based on role and userId
      let userData: UserProfile | null = null;

      if (userRole === "student") {
        const student = mockStudents.find(s => s.id === userId);
        if (student) {
          userData = {
            id: student.id,
            name: student.name,
            email: student.email,
            role: userRole,
            phone: "+91 98765 43210",
            year: student.year,
            rollNumber: student.rollNumber,
            department: "Computer Engineering",
            attendance30d: student.attendance30d,
            currentSemesterMarks: student.currentSemesterMarks,
            previousSemesterMarks: student.previousSemesterMarks,
            backlogs: student.backlogs,
            attemptsExhausted: student.attemptsExhausted,
            feeOverdueDays: student.feeOverdueDays,
            sgpa: 7.2 + Math.random() * 2,
          };

          // Calculate risk for students
          const riskData: StudentRiskData = {
            attendance30d: student.attendance30d,
            currentSemesterMarks: student.currentSemesterMarks,
            backlogs: student.backlogs,
            attemptsExhausted: student.attemptsExhausted,
            feeOverdueDays: student.feeOverdueDays,
            previousSemesterMarks: student.previousSemesterMarks,
          };

          const assessment = calculateRisk(riskData);
          setRiskAssessment(assessment);
        }
      } else if (userRole === "mentor") {
        const mentor = mockMentors.find(m => m.id === userId);
        if (mentor) {
          userData = {
            id: mentor.id,
            name: mentor.name,
            email: mentor.email,
            role: userRole,
            phone: "+91 98765 43211",
            department: "Computer Engineering",
            subjects: ["Data Structures", "Algorithms", "DBMS"],
            classes: ["FE", "SE", "TE"],
            experience: 5 + Math.floor(Math.random() * 10),
          };
        }
      } else if (userRole === "teacher") {
        const teacher = mockTeachers.find(t => t.id === userId);
        if (teacher) {
          userData = {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            role: userRole,
            phone: "+91 98765 43212",
            department: "Computer Engineering",
            subjects: teacher.subject ? [teacher.subject] : ["Computer Science"],
            classes: teacher.classCoordinator ? [teacher.classCoordinator] : ["FE", "SE"],
            experience: 3 + Math.floor(Math.random() * 12),
          };
        }
      } else if (userRole === "hod") {
        userData = {
          id: "HOD-01",
          name: "Dr. Suresh Choudhary",
          email: "suresh.choudhary@college.edu",
          role: userRole,
          phone: "+91 98765 43213",
          department: "Computer Engineering",
          subjects: ["Department Management", "Academic Planning"],
          experience: 20,
        };
      } else if (userRole === "admin") {
        userData = {
          id: "ADMIN-01",
          name: "Principal Ramesh Kulkarni",
          email: "admin@college.edu",
          role: userRole,
          phone: "+91 98765 43214",
          department: "Administration",
          experience: 25,
        };
      }

      if (!userData) {
        toast.error("User profile not found");
        router.push("/login");
        return;
      }

      setUserProfile(userData);
      setEditedProfile(userData);

      // Load counseling history for students and mentors
      if (userRole === "student" || userRole === "mentor") {
        loadCounselingHistory(userId, userRole);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
      setIsLoading(false);
    }
  };

  const loadCounselingHistory = (userId: string, userRole: string) => {
    // Mock counseling history
    const mockHistory: CounselingRecord[] = [
      {
        id: "C-001",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        mentorName: "Dr. Rajiv Malhotra",
        studentName: userRole === "mentor" ? "Aarav Sharma" : undefined,
        feedbackText: "Student showing signs of improvement. Discussed study schedule and time management.",
        riskFactors: "Attendance still below threshold, needs monitoring",
        recommendations: "Continue regular check-ins, focus on attendance improvement",
        followUpRequired: true,
      },
      {
        id: "C-002",
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        mentorName: "Dr. Rajiv Malhotra",
        studentName: userRole === "mentor" ? "Diya Patel" : undefined,
        feedbackText: "Initial counseling session. Student facing personal challenges affecting academics.",
        riskFactors: "Low attendance, declining marks, family issues",
        recommendations: "Provide academic support, refer to counselor if needed",
        followUpRequired: false,
      },
    ];

    setCounselingHistory(mockHistory);
  };

  const handleSave = async () => {
    if (!editedProfile || !userProfile) return;

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const isStudent = userProfile.role === "student";

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Risk Assessment Banner (Students Only) */}
      {isStudent && riskAssessment && (
        <Card className={`mb-6 border-l-4 ${
          riskAssessment.riskLevel === "critical" ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" :
          riskAssessment.riskLevel === "moderate" ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" :
          "border-l-green-500 bg-green-50 dark:bg-green-950/20"
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-6 w-6 ${
                  riskAssessment.riskLevel === "critical" ? "text-red-500" :
                  riskAssessment.riskLevel === "moderate" ? "text-yellow-500" :
                  "text-green-500"
                }`} />
                <div>
                  <CardTitle className="text-xl">Dropout Risk Assessment</CardTitle>
                  <CardDescription>AI-powered prediction based on multiple factors</CardDescription>
                </div>
              </div>
              <Badge className={`${getRiskColor(riskAssessment.riskLevel)} text-white text-lg px-4 py-2`}>
                {getRiskLevelDisplay(riskAssessment.riskLevel)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Risk Factors Identified
                </h3>
                <ul className="space-y-2">
                  {riskAssessment.riskFactors.map((factor, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <p className="text-sm font-medium">Risk Score: {(riskAssessment.riskScore * 100).toFixed(0)}%</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getRiskColor(riskAssessment.riskLevel)}`}
                      style={{ width: `${riskAssessment.riskScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {riskAssessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
                {riskAssessment.requiresImmediateIntervention && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      ⚠️ Immediate intervention required. A counseling session will be auto-scheduled within 48 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="academic">
            {isStudent ? "Academic" : "Professional"}
          </TabsTrigger>
          <TabsTrigger value="counseling">Counseling History</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedProfile?.name || ""}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile!, name: e.target.value })
                        }
                      />
                    ) : (
                      <span>{userProfile.name}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile?.email || ""}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile!, email: e.target.value })
                        }
                      />
                    ) : (
                      <span>{userProfile.email}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone || "Not provided"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Badge variant="secondary" className="ml-2">
                    {userProfile.role?.toUpperCase()}
                  </Badge>
                </div>

                {isStudent && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{userProfile.rollNumber || "Not assigned"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <span>{userProfile.year || "Not specified"}</span>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <span>{userProfile.department || "Not specified"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic/Professional Tab */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>{isStudent ? "Academic Performance" : "Professional Details"}</CardTitle>
              <CardDescription>
                {isStudent ? "Your academic metrics and performance data" : "Your teaching experience and subjects"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStudent ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Attendance (30 days)</Label>
                    <div className="text-2xl font-bold">{userProfile.attendance30d}%</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (userProfile.attendance30d || 0) < 65 ? "bg-red-500" : 
                          (userProfile.attendance30d || 0) < 75 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`}
                        style={{ width: `${userProfile.attendance30d}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Semester Marks</Label>
                    <div className="text-2xl font-bold">{userProfile.currentSemesterMarks}/100</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (userProfile.currentSemesterMarks || 0) < 50 ? "bg-red-500" : 
                          (userProfile.currentSemesterMarks || 0) < 60 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }`}
                        style={{ width: `${userProfile.currentSemesterMarks}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>SGPA</Label>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <Award className="h-6 w-6 text-yellow-500" />
                      {userProfile.sgpa?.toFixed(2) || "N/A"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Backlogs</Label>
                    <div className={`text-2xl font-bold ${
                      (userProfile.backlogs || 0) > 0 ? "text-red-500" : "text-green-500"
                    }`}>
                      {userProfile.backlogs || 0}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Attempts Exhausted</Label>
                    <div className={`text-2xl font-bold ${
                      (userProfile.attemptsExhausted || 0) > 0 ? "text-red-500" : "text-green-500"
                    }`}>
                      {userProfile.attemptsExhausted || 0}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fee Status</Label>
                    <div className={`text-sm font-medium ${
                      (userProfile.feeOverdueDays || 0) > 30 ? "text-red-500" : 
                      (userProfile.feeOverdueDays || 0) > 0 ? "text-yellow-500" : 
                      "text-green-500"
                    }`}>
                      {(userProfile.feeOverdueDays || 0) === 0 ? "Paid" : 
                       `Overdue by ${userProfile.feeOverdueDays} days`}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-2 block">Subjects Teaching</Label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.subjects?.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-lg font-semibold mb-2 block">Classes Assigned</Label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.classes?.map((cls, index) => (
                        <Badge key={index} variant="outline">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-lg font-semibold mb-2 block">Experience</Label>
                    <p className="text-muted-foreground">
                      {userProfile.experience || 0} years in teaching
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Counseling History Tab */}
        <TabsContent value="counseling">
          <Card>
            <CardHeader>
              <CardTitle>Counseling History</CardTitle>
              <CardDescription>
                {isStudent ? "Your past counseling sessions" : "Counseling sessions conducted"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {counselingHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No counseling history available
                </p>
              ) : (
                <div className="space-y-4">
                  {counselingHistory.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{record.date}</span>
                          </div>
                          {record.followUpRequired && (
                            <Badge variant="destructive">Follow-up Required</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          {isStudent ? (
                            <p className="text-sm">
                              <span className="font-semibold">Mentor:</span> {record.mentorName}
                            </p>
                          ) : (
                            <p className="text-sm">
                              <span className="font-semibold">Student:</span> {record.studentName}
                            </p>
                          )}

                          <div>
                            <Label className="text-sm font-semibold flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4" />
                              Feedback
                            </Label>
                            <p className="text-sm text-muted-foreground">{record.feedbackText}</p>
                          </div>

                          {record.riskFactors && (
                            <div>
                              <Label className="text-sm font-semibold mb-1 block">Risk Factors</Label>
                              <p className="text-sm text-muted-foreground">{record.riskFactors}</p>
                            </div>
                          )}

                          {record.recommendations && (
                            <div>
                              <Label className="text-sm font-semibold mb-1 block">Recommendations</Label>
                              <p className="text-sm text-muted-foreground">{record.recommendations}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}