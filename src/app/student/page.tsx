"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStudents, mockMentors } from "@/lib/mockData";
import { Calendar, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, MessageSquare, Mail, Phone, Clock, FileText, Target, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudentDashboard() {
  const studentId = "FE-01"; // Demo - Critical risk student
  const student = mockStudents.find((s) => s.id === studentId)!;
  const mentor = mockMentors.find((m) => m.assignedStudents.includes(studentId));
  
  const [showCounselingRequest, setShowCounselingRequest] = useState(false);
  const [requestReason, setRequestReason] = useState("");

  // Mock counseling history data
  const counselingHistory = [
    {
      id: 1,
      date: "2024-01-10",
      feedback: "Financial issues, family problems. Student needs financial aid counseling.",
      riskFactors: "Low attendance, fee overdue",
      recommendations: "Apply for scholarship, attend career counseling",
      followUpRequired: true
    },
    {
      id: 2,
      date: "2023-12-15",
      feedback: "Improving attendance, but still struggling with academics.",
      riskFactors: "Low marks in programming subjects",
      recommendations: "Join peer study group, attend extra classes",
      followUpRequired: false
    },
    {
      id: 3,
      date: "2023-11-20",
      feedback: "Initial counseling session. Student seems motivated but facing challenges.",
      riskFactors: "First-time away from home, adjustment issues",
      recommendations: "Regular check-ins, connect with campus support",
      followUpRequired: true
    }
  ];

  const handleRequestCounseling = () => {
    if (!requestReason.trim()) {
      toast.error("Please provide a reason for counseling");
      return;
    }
    toast.success("Counseling request sent to your mentor");
    setShowCounselingRequest(false);
    setRequestReason("");
  };

  const radarData = [
    { metric: "Attendance", value: student.attendance30d, fullMark: 100 },
    { metric: "Academic Performance", value: student.currentSemesterMarks, fullMark: 100 },
    { metric: "Regularity", value: 100 - student.feeOverdueDays, fullMark: 100 },
    { metric: "Progress", value: Math.max(0, 100 - (student.backlogs * 20)), fullMark: 100 },
    { metric: "Engagement", value: student.previousSemesterMarks, fullMark: 100 },
  ];

  const comparisonData = [
    { category: "Your Attendance", value: student.attendance30d, color: "#3498db" },
    { category: "Class Average", value: 75, color: "#95a5a6" },
  ];

  // Subject-wise performance
  const subjectPerformance = [
    { subject: "Data Structures", marks: 72, attendance: 68 },
    { subject: "Algorithms", marks: 65, attendance: 70 },
    { subject: "DBMS", marks: 58, attendance: 62 },
    { subject: "Operating Systems", marks: 70, attendance: 65 },
    { subject: "Computer Networks", marks: 63, attendance: 68 },
  ];

  // Monthly progress
  const monthlyProgress = [
    { month: "Sep", attendance: 75, marks: 68, backlogs: 2 },
    { month: "Oct", attendance: 72, marks: 65, backlogs: 2 },
    { month: "Nov", marks: 62, attendance: 68, backlogs: 2 },
    { month: "Dec", attendance: student.attendance30d, marks: student.currentSemesterMarks, backlogs: student.backlogs },
  ];

  // Goals vs Achievement
  const goalsData = [
    { name: "Attendance Goal", target: 75, achieved: student.attendance30d },
    { name: "Marks Goal", target: 70, achieved: student.currentSemesterMarks },
    { name: "Clear Backlogs", target: 0, achieved: student.backlogs },
  ];

  // Strengths and weaknesses pie chart
  const strengthsWeaknesses = [
    { name: "Strengths", value: 60, color: "#10b981" },
    { name: "Areas to Improve", value: 40, color: "#f59e0b" },
  ];

  const getRiskRecommendations = () => {
    const recommendations = [];
    
    if (student.attendance30d < 65) {
      recommendations.push({
        icon: AlertTriangle,
        color: "text-red-600",
        title: "Improve Attendance",
        description: `Your attendance is ${student.attendance30d}%. Minimum required is 75%. Attend all classes regularly.`,
      });
    }
    
    if (student.currentSemesterMarks < 60) {
      recommendations.push({
        icon: TrendingDown,
        color: "text-orange-600",
        title: "Focus on Studies",
        description: "Your marks are below expected level. Consider extra study hours and doubt-clearing sessions.",
      });
    }
    
    if (student.feeOverdueDays > 0) {
      recommendations.push({
        icon: AlertTriangle,
        color: "text-red-600",
        title: "Clear Fee Dues",
        description: `Your fees are overdue by ${student.feeOverdueDays} days. Please clear dues at the earliest.`,
      });
    }
    
    if (student.backlogs > 0) {
      recommendations.push({
        icon: AlertTriangle,
        color: "text-yellow-600",
        title: "Clear Backlogs",
        description: `You have ${student.backlogs} backlog(s). Focus on clearing them in the next attempt.`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: CheckCircle,
        color: "text-green-600",
        title: "Great Work!",
        description: "Keep up the good performance and maintain consistency.",
      });
    }

    return recommendations;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <DashboardLayout
      title="My Progress"
      role="Student"
      userName={student.name}
      notifications={2}
      onMessagesClick={() => toast.info("Messages feature - Opening...")}
    >
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="mentor">My Mentor</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Risk Status Banner */}
          <Card className={`border-2 ${
            student.riskLevel === "critical" 
              ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
              : student.riskLevel === "moderate"
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
              : "border-green-500 bg-green-50 dark:bg-green-950/20"
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <RiskBadge level={student.riskLevel} size="lg" />
                    <div>
                      <h2 className="text-2xl font-bold">Your Current Status</h2>
                      <p className="text-sm text-muted-foreground">
                        Risk Score: {(student.riskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={student.riskScore * 100} className="h-3 mb-3" />
                  <p className="text-sm">
                    {student.riskLevel === "critical" && "You need immediate attention. Please schedule a counseling session."}
                    {student.riskLevel === "moderate" && "You're showing some concerning signs. Let's work together to improve."}
                    {student.riskLevel === "low" && "You're doing well! Keep maintaining your good performance."}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setShowCounselingRequest(true)}
                  className="ml-4"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Request Counseling
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{student.attendance30d}%</div>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                <Progress value={student.attendance30d} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{student.currentSemesterMarks}</div>
                <p className="text-xs text-muted-foreground mt-1">This semester</p>
                <div className={`text-xs mt-2 flex items-center ${
                  student.currentSemesterMarks > student.previousSemesterMarks ? "text-green-600" : "text-red-600"
                }`}>
                  {student.currentSemesterMarks > student.previousSemesterMarks ? (
                    <><TrendingUp className="h-3 w-3 mr-1" /> Improved</>
                  ) : (
                    <><TrendingDown className="h-3 w-3 mr-1" /> Declined</>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Backlogs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{student.backlogs}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending subjects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
              </CardHeader>
              <CardContent>
                {student.feeOverdueDays > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-red-600">{student.feeOverdueDays}</div>
                    <p className="text-xs text-muted-foreground mt-1">Days overdue</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-green-600">✓</div>
                    <p className="text-xs text-muted-foreground mt-1">All paid</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Overall Performance Radar */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Your Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance vs Class Average Bar */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Attendance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                    <Bar dataKey="value" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strengths vs Weaknesses Pie */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={strengthsWeaknesses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {strengthsWeaknesses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subject-wise Performance */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Subject-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="subject" className="text-xs" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                    <Legend />
                    <Bar dataKey="marks" fill="#8b5cf6" name="Marks" />
                    <Bar dataKey="attendance" fill="#10b981" name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Progress Area Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Monthly Progress Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="attendance" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Attendance %" />
                    <Area type="monotone" dataKey="marks" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Marks" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Marks Trend Line Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Marks Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={student.marksHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                    <Line type="monotone" dataKey="marks" stroke="#3498db" strokeWidth={3} dot={{ fill: '#3498db', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Trend Line Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={student.attendanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#000000",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#000000" }}
                      itemStyle={{ color: "#000000" }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="#2ecc71" strokeWidth={3} dot={{ fill: '#2ecc71', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Recommendations for You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getRiskRecommendations().map((rec, idx) => {
                const Icon = rec.icon;
                return (
                  <div key={idx} className="flex gap-3 p-4 rounded-lg bg-muted">
                    <Icon className={`h-6 w-6 ${rec.color} flex-shrink-0`} />
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Mentor Tab */}
        <TabsContent value="mentor" className="space-y-6">
          {mentor ? (
            <>
              {/* Mentor Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>My Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                        {getInitials(mentor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{mentor.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{mentor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {mentor.assignedStudents.length} Students
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button variant="outline" onClick={() => setShowCounselingRequest(true)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {mentor.availableSlots.map((slot, idx) => (
                      <div key={idx} className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{slot}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Counseling History */}
              <Card>
                <CardHeader>
                  <CardTitle>Counseling History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {counselingHistory.map((session) => (
                        <div key={session.id} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <h4 className="font-semibold">Session #{session.id}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Feedback:</p>
                              <p>{session.feedback}</p>
                            </div>

                            {session.riskFactors && (
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Risk Factors:</p>
                                <p className="text-red-600 dark:text-red-400">{session.riskFactors}</p>
                              </div>
                            )}

                            {session.recommendations && (
                              <div>
                                <p className="font-semibold text-muted-foreground mb-1">Recommendations:</p>
                                <p className="text-blue-600 dark:text-blue-400">{session.recommendations}</p>
                              </div>
                            )}

                            {session.followUpRequired && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Follow-up Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No Mentor Assigned</p>
                <p className="text-sm text-muted-foreground">Please contact your HOD to get a mentor assigned.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Counseling Request Dialog */}
      <Dialog open={showCounselingRequest} onOpenChange={setShowCounselingRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Counseling Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your mentor will be notified and will schedule a session with you.
            </p>
            <div>
              <Label htmlFor="reason">Reason for Counseling</Label>
              <Textarea
                id="reason"
                placeholder="Please describe what you'd like to discuss..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <Button onClick={handleRequestCounseling} className="w-full">
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}