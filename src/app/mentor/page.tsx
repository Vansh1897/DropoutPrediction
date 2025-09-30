"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { StudentCard } from "@/components/StudentCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStudents, mockMentors, Student } from "@/lib/mockData";
import { Users, AlertTriangle, Calendar, CheckCircle, MessageSquare, FileText, TrendingUp, Clock, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MentorDashboard() {
  const mentorId = "M-01"; // For demo
  const mentor = mockMentors.find((m) => m.id === mentorId)!;
  const assignedStudents = mockStudents.filter((s) => mentor.assignedStudents.includes(s.id));
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingMode, setMeetingMode] = useState<"online" | "offline">("offline");
  const [notes, setNotes] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [riskFactors, setRiskFactors] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);

  // Mock counseling history
  const getCounselingHistory = (studentId: string) => {
    const histories: Record<string, any[]> = {
      "FE-01": [
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
        }
      ],
      "BE-73": [
        {
          id: 1,
          date: "2024-01-05",
          feedback: "Placement stress, need support. Student is anxious about placements.",
          riskFactors: "Low attendance, backlogs",
          recommendations: "Join placement preparation classes, career counseling",
          followUpRequired: true
        }
      ]
    };
    return histories[studentId] || [];
  };

  const criticalCount = assignedStudents.filter((s) => s.riskLevel === "critical").length;
  const moderateCount = assignedStudents.filter((s) => s.riskLevel === "moderate").length;
  const lowRiskCount = assignedStudents.filter((s) => s.riskLevel === "low").length;
  const avgAttendance = (assignedStudents.reduce((acc, s) => acc + s.attendance30d, 0) / assignedStudents.length).toFixed(1);
  const avgMarks = (assignedStudents.reduce((acc, s) => acc + s.currentSemesterMarks, 0) / assignedStudents.length).toFixed(1);

  // Risk Distribution for pie chart
  const riskDistribution = [
    { name: "Low Risk", value: lowRiskCount, color: "#10b981" },
    { name: "Moderate Risk", value: moderateCount, color: "#f59e0b" },
    { name: "Critical Risk", value: criticalCount, color: "#ef4444" },
  ];

  // Student performance distribution
  const performanceRanges = [
    { range: "Excellent (>80)", count: assignedStudents.filter(s => s.currentSemesterMarks > 80).length },
    { range: "Good (70-80)", count: assignedStudents.filter(s => s.currentSemesterMarks >= 70 && s.currentSemesterMarks <= 80).length },
    { range: "Average (60-69)", count: assignedStudents.filter(s => s.currentSemesterMarks >= 60 && s.currentSemesterMarks < 70).length },
    { range: "Poor (<60)", count: assignedStudents.filter(s => s.currentSemesterMarks < 60).length },
  ];

  // Counseling activity over time
  const counselingActivity = [
    { month: "Sep", sessions: 8, followUps: 5, resolved: 3 },
    { month: "Oct", sessions: 10, followUps: 7, resolved: 5 },
    { month: "Nov", sessions: 12, followUps: 8, resolved: 6 },
    { month: "Dec", sessions: 9, followUps: 6, resolved: 4 },
  ];

  // Student engagement metrics
  const engagementMetrics = [
    { metric: "Attendance Rate", value: parseFloat(avgAttendance) },
    { metric: "Academic Performance", value: parseFloat(avgMarks) },
    { metric: "Response Rate", value: 85 },
    { metric: "Improvement Rate", value: 70 },
  ];

  // Attendance distribution
  const attendanceDistribution = [
    { name: ">75%", value: assignedStudents.filter(s => s.attendance30d > 75).length, color: "#10b981" },
    { name: "65-75%", value: assignedStudents.filter(s => s.attendance30d >= 65 && s.attendance30d <= 75).length, color: "#f59e0b" },
    { name: "<65%", value: assignedStudents.filter(s => s.attendance30d < 65).length, color: "#ef4444" },
  ];

  const handleScheduleMeeting = () => {
    if (!selectedStudent || !meetingDate || !meetingTime) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success(`Meeting scheduled with ${selectedStudent.name} on ${meetingDate} at ${meetingTime}`);
    setShowScheduler(false);
    setSelectedStudent(null);
    setMeetingDate("");
    setMeetingTime("");
    setNotes("");
  };

  const handleSaveFeedback = () => {
    if (!selectedStudent || !feedbackText.trim()) {
      toast.error("Please provide feedback");
      return;
    }
    toast.success(`Feedback saved for ${selectedStudent.name}`);
    setShowFeedbackDialog(false);
    setFeedbackText("");
    setRiskFactors("");
    setRecommendations("");
    setFollowUpRequired(false);
  };

  const openScheduler = (student: Student) => {
    setSelectedStudent(student);
    setShowScheduler(true);
  };

  const openFeedbackDialog = (student: Student) => {
    setSelectedStudent(student);
    setShowFeedbackDialog(true);
  };

  const getStudentRadarData = (student: Student) => [
    { metric: "Attendance", value: student.attendance30d },
    { metric: "Marks", value: student.currentSemesterMarks },
    { metric: "Regularity", value: 100 - student.feeOverdueDays },
    { metric: "Engagement", value: student.previousSemesterMarks },
    { metric: "Progress", value: Math.max(0, 100 - (student.backlogs * 20)) },
  ];

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <DashboardLayout
      title="Mentor Dashboard"
      role="Mentor"
      userName={mentor.name}
      notifications={3}
      onMessagesClick={() => toast.info("Messages feature - Opening...")}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 mb-6">
          <TabsTrigger value="overview" className="transition-all">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="transition-all">
            <Users className="h-4 w-4 mr-2" />
            My Students
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Assigned Students"
              value={assignedStudents.length}
              subtitle="Under your mentorship"
              icon={Users}
              color="blue"
            />
            <KPICard
              title="Critical Cases"
              value={criticalCount}
              subtitle="Immediate attention needed"
              icon={AlertTriangle}
              color="red"
            />
            <KPICard
              title="Moderate Risk"
              value={moderateCount}
              subtitle="Requires monitoring"
              icon={AlertTriangle}
              color="yellow"
            />
            <KPICard
              title="Avg Attendance"
              value={`${avgAttendance}%`}
              subtitle="Last 30 days"
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Statistics Charts */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Risk Distribution Pie Chart */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Distribution Pie */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Attendance Ranges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Distribution Bar */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Performance Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceRanges}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
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
                    <Bar dataKey="count" fill="#8b5cf6" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Counseling Activity and Engagement */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Counseling Activity Area Chart */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Counseling Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={counselingActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
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
                    <Legend />
                    <Area type="monotone" dataKey="sessions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Sessions" />
                    <Area type="monotone" dataKey="followUps" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Follow-ups" />
                    <Area type="monotone" dataKey="resolved" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Engagement Radar */}
            <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={engagementMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Metrics" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
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
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Students List */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Your Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assignedStudents
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((student, index) => (
                      <div
                        key={student.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 animate-in fade-in slide-in-from-left"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{student.name}</h4>
                            <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                          </div>
                          <RiskBadge level={student.riskLevel} size="sm" showIcon={false} />
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Att: {student.attendance30d}%</span>
                          <span>Marks: {student.currentSemesterMarks}</span>
                          <span>Risk: {(student.riskScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedStudent ? (
                <>
                  <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow duration-300 animate-in fade-in slide-in-from-right">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedStudent.rollNumber} • {selectedStudent.year} • {selectedStudent.email}
                          </p>
                        </div>
                        <RiskBadge level={selectedStudent.riskLevel} size="lg" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Risk Factors */}
                      <div className="animate-in fade-in slide-in-from-bottom duration-300">
                        <h4 className="font-semibold mb-3 text-lg">Risk Factors</h4>
                        <div className="space-y-2">
                          {selectedStudent.attendance30d < 65 && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-all duration-200">
                              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-sm">Low attendance: {selectedStudent.attendance30d}%</span>
                            </div>
                          )}
                          {selectedStudent.backlogs > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:shadow-md transition-all duration-200">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              <span className="text-sm">{selectedStudent.backlogs} backlog(s)</span>
                            </div>
                          )}
                          {selectedStudent.feeOverdueDays > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:shadow-md transition-all duration-200">
                              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              <span className="text-sm">Fee overdue: {selectedStudent.feeOverdueDays} days</span>
                            </div>
                          )}
                          {selectedStudent.attemptsExhausted >= 2 && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-all duration-200">
                              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-sm">Multiple exam attempts exhausted</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => openScheduler(selectedStudent)} className="flex-1 min-w-[120px] hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                        <Button variant="outline" onClick={() => toast.info("Sending message...")} className="hover:scale-105 transition-transform duration-200 hover:shadow-md">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" onClick={() => openFeedbackDialog(selectedStudent)} className="hover:scale-105 transition-transform duration-200 hover:shadow-md">
                          <FileText className="h-4 w-4 mr-2" />
                          Add Feedback
                        </Button>
                      </div>

                      {/* Performance Charts */}
                      <Tabs defaultValue="trends" className="animate-in fade-in duration-500">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="trends">Trends</TabsTrigger>
                          <TabsTrigger value="radar">Overall View</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="trends" className="space-y-4 animate-in fade-in">
                          {/* Marks Trend */}
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-semibold mb-3">Marks Trend</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={selectedStudent.marksHistory}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
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
                                <Line type="monotone" dataKey="marks" stroke="#3498db" strokeWidth={2} dot={{ fill: '#3498db', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Attendance Trend */}
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-semibold mb-3">Attendance Trend</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={selectedStudent.attendanceHistory}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
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
                                <Line type="monotone" dataKey="percentage" stroke="#2ecc71" strokeWidth={2} dot={{ fill: '#2ecc71', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </TabsContent>

                        <TabsContent value="radar" className="animate-in fade-in">
                          <div className="py-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 hover:shadow-md transition-shadow duration-300">
                            <ResponsiveContainer width="100%" height={400}>
                              <RadarChart data={getStudentRadarData(selectedStudent)}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
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
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Counseling History */}
                      {selectedStudent.lastCounseling && (
                        <div className="animate-in fade-in slide-in-from-bottom duration-300">
                          <h4 className="font-semibold mb-2">Last Counseling</h4>
                          <div className="p-4 bg-muted rounded-lg hover:shadow-md transition-shadow duration-200 border border-border/50">
                            <p className="text-sm text-muted-foreground">
                              Date: {new Date(selectedStudent.lastCounseling).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2">{selectedStudent.counselingFeedback}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center text-muted-foreground animate-in fade-in zoom-in duration-500">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a student to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* My Students Tab */}
        <TabsContent value="students" className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-6">
            {assignedStudents.sort((a, b) => b.riskScore - a.riskScore).map((student, index) => {
              const counselingHistory = getCounselingHistory(student.id);
              
              return (
                <Card 
                  key={student.id} 
                  className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 hover:border-primary/30 animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 hover:scale-110 transition-transform duration-200 shadow-md">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-xl font-bold">{student.name}</h3>
                            <RiskBadge level={student.riskLevel} size="md" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNumber} • {student.year} • {student.email}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="hover:bg-accent transition-colors">Attendance: {student.attendance30d}%</Badge>
                            <Badge variant="outline" className="hover:bg-accent transition-colors">Marks: {student.currentSemesterMarks}</Badge>
                            <Badge variant="outline" className="hover:bg-accent transition-colors">Backlogs: {student.backlogs}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openScheduler(student)} className="hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openFeedbackDialog(student)} className="hover:scale-105 transition-transform duration-200 hover:shadow-md">
                          <FileText className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="performance" className="w-full">
                      <TabsList>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="counseling">
                          Counseling History
                          {counselingHistory.length > 0 && (
                            <Badge variant="secondary" className="ml-2">{counselingHistory.length}</Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="performance" className="space-y-4 animate-in fade-in">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-semibold mb-3">Marks Trend</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={student.marksHistory}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
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
                                <Line type="monotone" dataKey="marks" stroke="#3498db" strokeWidth={2} dot={{ fill: '#3498db', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-semibold mb-3">Attendance Trend</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={student.attendanceHistory}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
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
                                <Line type="monotone" dataKey="percentage" stroke="#2ecc71" strokeWidth={2} dot={{ fill: '#2ecc71', r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="counseling" className="animate-in fade-in">
                        {counselingHistory.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mb-3 opacity-50" />
                            <p>No counseling sessions yet</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-3 hover:scale-105 transition-transform duration-200"
                              onClick={() => openFeedbackDialog(student)}
                            >
                              Add First Feedback
                            </Button>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {counselingHistory.map((session, sessionIndex) => (
                                <div 
                                  key={session.id} 
                                  className="p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30 animate-in fade-in slide-in-from-left"
                                  style={{ animationDelay: `${sessionIndex * 50}ms` }}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-semibold">Session #{session.id}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(session.date).toLocaleDateString()}
                                    </span>
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
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Meeting Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="max-w-md animate-in fade-in zoom-in duration-300">
          <DialogHeader>
            <DialogTitle>Schedule Counseling Meeting</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg border border-border/50">
                  <p className="font-semibold">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.rollNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    className="mt-2 w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary transition-all"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <input
                    id="time"
                    type="time"
                    className="mt-2 w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary transition-all"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Mode</Label>
                <Select value={meetingMode} onValueChange={(v) => setMeetingMode(v as "online" | "offline")}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline (In-person)</SelectItem>
                    <SelectItem value="online">Online (Video call)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or agenda for the meeting..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 focus:ring-2 focus:ring-primary transition-all"
                  rows={3}
                />
              </div>

              <Button onClick={handleScheduleMeeting} className="w-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg">
                Confirm & Schedule
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-lg animate-in fade-in zoom-in duration-300">
          <DialogHeader>
            <DialogTitle>Add Counseling Feedback</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg border border-border/50">
                  <p className="font-semibold">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStudent.rollNumber}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback *</Label>
                <Textarea
                  id="feedback"
                  placeholder="Describe the counseling session and key discussion points..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="mt-2 focus:ring-2 focus:ring-primary transition-all"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="risk-factors">Risk Factors</Label>
                <Textarea
                  id="risk-factors"
                  placeholder="List any risk factors identified..."
                  value={riskFactors}
                  onChange={(e) => setRiskFactors(e.target.value)}
                  className="mt-2 focus:ring-2 focus:ring-primary transition-all"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Provide recommendations and action items..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="mt-2 focus:ring-2 focus:ring-primary transition-all"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="follow-up"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                <Label htmlFor="follow-up" className="cursor-pointer">
                  Follow-up required
                </Label>
              </div>

              <Button onClick={handleSaveFeedback} className="w-full hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg">
                Save Feedback
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}