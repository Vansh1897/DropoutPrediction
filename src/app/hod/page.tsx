"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { StudentCard } from "@/components/StudentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStudents, mockMentors, hodInfo, YearLevel } from "@/lib/mockData";
import { Users, AlertTriangle, TrendingUp, GraduationCap, UserPlus, PlusCircle, Edit, Trash2, BookOpen, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function HODDashboard() {
  const [selectedYear, setSelectedYear] = useState<YearLevel | "all">("all");
  const [showMentorAssignment, setShowMentorAssignment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    year: "FE" as YearLevel,
  });
  const [newMentorData, setNewMentorData] = useState({
    name: "",
    email: "",
  });

  const totalStudents = mockStudents.length;
  const criticalStudents = mockStudents.filter((s) => s.riskLevel === "critical").length;
  const moderateStudents = mockStudents.filter((s) => s.riskLevel === "moderate").length;
  const atRiskPercentage = ((criticalStudents + moderateStudents) / totalStudents * 100).toFixed(1);
  const lowRiskStudents = mockStudents.filter((s) => s.riskLevel === "low").length;

  const filteredStudents = selectedYear === "all" 
    ? mockStudents 
    : mockStudents.filter((s) => s.year === selectedYear);

  // Data for year-wise risk distribution
  const yearData = ["FE", "SE", "TE", "BE"].map((year) => {
    const yearStudents = mockStudents.filter((s) => s.year === year);
    return {
      year,
      total: yearStudents.length,
      critical: yearStudents.filter((s) => s.riskLevel === "critical").length,
      moderate: yearStudents.filter((s) => s.riskLevel === "moderate").length,
      low: yearStudents.filter((s) => s.riskLevel === "low").length,
    };
  });

  // Data for risk distribution pie chart
  const riskData = [
    { name: "Low Risk", value: lowRiskStudents, color: "#10b981" },
    { name: "Moderate Risk", value: moderateStudents, color: "#f59e0b" },
    { name: "Critical Risk", value: criticalStudents, color: "#ef4444" },
  ];

  // Attendance trend data
  const attendanceTrendData = [
    { month: "Sep", FE: 75, SE: 78, TE: 70, BE: 82 },
    { month: "Oct", FE: 72, SE: 76, TE: 68, BE: 80 },
    { month: "Nov", FE: 70, SE: 74, TE: 65, BE: 78 },
    { month: "Dec", FE: 68, SE: 72, TE: 62, BE: 76 },
  ];

  // Performance metrics by year
  const yearPerformanceData = ["FE", "SE", "TE", "BE"].map((year) => {
    const yearStudents = mockStudents.filter((s) => s.year === year);
    const avgAttendance = yearStudents.reduce((acc, s) => acc + s.attendance30d, 0) / yearStudents.length;
    const avgMarks = yearStudents.reduce((acc, s) => acc + s.currentSemesterMarks, 0) / yearStudents.length;
    return {
      year,
      attendance: parseFloat(avgAttendance.toFixed(1)),
      marks: parseFloat(avgMarks.toFixed(1)),
    };
  });

  // Student retention and dropout risk over time
  const retentionTrend = [
    { month: "Sep", retained: 95, atRisk: 5 },
    { month: "Oct", retained: 93, atRisk: 7 },
    { month: "Nov", retained: 91, atRisk: 9 },
    { month: "Dec", retained: 89, atRisk: 11 },
  ];

  // Department metrics radar
  const departmentMetrics = [
    { metric: "Attendance", value: 72 },
    { metric: "Academic Performance", value: 68 },
    { metric: "Student Engagement", value: 75 },
    { metric: "Mentor Coverage", value: 85 },
    { metric: "Fee Collection", value: 80 },
  ];

  // Backlog distribution
  const backlogDistribution = [
    { range: "No Backlogs", count: mockStudents.filter(s => s.backlogs === 0).length, color: "#10b981" },
    { range: "1-2 Backlogs", count: mockStudents.filter(s => s.backlogs >= 1 && s.backlogs <= 2).length, color: "#f59e0b" },
    { range: "3+ Backlogs", count: mockStudents.filter(s => s.backlogs > 2).length, color: "#ef4444" },
  ];

  // Mentor workload distribution
  const mentorWorkload = mockMentors.map(m => ({
    name: m.name,
    students: m.assignedStudents.length,
    critical: m.assignedStudents.filter(id => {
      const student = mockStudents.find(s => s.id === id);
      return student?.riskLevel === "critical";
    }).length,
  }));

  const handleAssignMentor = () => {
    if (!selectedStudent || !selectedMentor) {
      toast.error("Please select both student and mentor");
      return;
    }
    toast.success("Mentor assigned successfully!");
    setShowMentorAssignment(false);
    setSelectedStudent("");
    setSelectedMentor("");
  };

  const handleAddMentor = () => {
    if (!newMentorData.name || !newMentorData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success(`Mentor ${newMentorData.name} added successfully!`);
    setShowAddMentor(false);
    setNewMentorData({ name: "", email: "" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout
      title="Department Overview"
      role="HOD"
      userName={hodInfo.name}
      notifications={5}
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="mentors">
            <GraduationCap className="h-4 w-4 mr-2" />
            Mentors
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-700">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Students", value: totalStudents, subtitle: "Computer Engineering", icon: Users, color: "blue" },
              { title: "At Risk", value: `${atRiskPercentage}%`, subtitle: `${criticalStudents + moderateStudents} students`, icon: AlertTriangle, color: "yellow", trend: { value: 5, isPositive: false } },
              { title: "Critical Cases", value: criticalStudents, subtitle: "Needs immediate attention", icon: AlertTriangle, color: "red" },
              { title: "Active Mentors", value: mockMentors.length, subtitle: "Available for counseling", icon: GraduationCap, color: "purple" }
            ].map((kpi, index) => (
              <div key={index} className="animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <KPICard {...kpi} />
              </div>
            ))}
          </div>

          {/* Top Statistics Charts */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Overall Risk Pie Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Overall Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Backlog Distribution Pie */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-top duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  Backlog Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={backlogDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {backlogDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Metrics Radar */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Department Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={departmentMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Metrics" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Year-wise Risk Distribution Stacked Bar */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Year-wise Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                    <Bar dataKey="moderate" stackId="a" fill="#f59e0b" name="Moderate" />
                    <Bar dataKey="low" stackId="a" fill="#10b981" name="Low" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Year Performance Comparison */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance by Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={yearPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="attendance" fill="#10b981" name="Avg Attendance %" />
                    <Line type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={2} name="Avg Marks" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Trend Line Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Attendance Trend (4 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="FE" stroke="#3498db" strokeWidth={2} name="FE" />
                    <Line type="monotone" dataKey="SE" stroke="#2ecc71" strokeWidth={2} name="SE" />
                    <Line type="monotone" dataKey="TE" stroke="#f39c12" strokeWidth={2} name="TE" />
                    <Line type="monotone" dataKey="BE" stroke="#9b59b6" strokeWidth={2} name="BE" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retention Trend Area Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Student Retention Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={retentionTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="retained" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Retained %" />
                    <Area type="monotone" dataKey="atRisk" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="At Risk %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Workload Bar Chart */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                Mentor Workload Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentorWorkload}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="students" fill="#8b5cf6" name="Total Students" />
                  <Bar dataKey="critical" fill="#ef4444" name="Critical Cases" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom duration-700">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button onClick={() => setShowAddMentor(true)} className="h-24 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <div className="flex flex-col items-center">
                  <PlusCircle className="h-8 w-8 mb-2" />
                  <span>Add New Mentor</span>
                </div>
              </Button>
              <Button onClick={() => setShowMentorAssignment(true)} variant="outline" className="h-24 hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2">
                <div className="flex flex-col items-center">
                  <UserPlus className="h-8 w-8 mb-2" />
                  <span>Assign Mentor</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  All Students
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedYear} onValueChange={(v) => setSelectedYear(v as YearLevel | "all")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Years</TabsTrigger>
                  <TabsTrigger value="FE">FE</TabsTrigger>
                  <TabsTrigger value="SE">SE</TabsTrigger>
                  <TabsTrigger value="TE">TE</TabsTrigger>
                  <TabsTrigger value="BE">BE</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedYear}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-muted/50 transition-colors duration-200">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="border-2 border-primary/20">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {getInitials(student.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.year}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={student.attendance30d < 65 ? "text-red-600 font-semibold" : ""}>
                                {student.attendance30d}%
                              </span>
                            </TableCell>
                            <TableCell>{student.currentSemesterMarks}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  student.riskLevel === "critical"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : student.riskLevel === "moderate"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                }
                              >
                                {student.riskLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => toast.info("Edit student")} className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => toast.error("Delete student")} className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-500" />
                  All Mentors
                </CardTitle>
                <Button onClick={() => setShowAddMentor(true)} className="shadow-md hover:shadow-lg transition-all duration-300">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Mentor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Mentor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Students</TableHead>
                      <TableHead>Available Slots</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMentors.map((mentor) => (
                      <TableRow key={mentor.id} className="hover:bg-muted/50 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                                {getInitials(mentor.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{mentor.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {mentor.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{mentor.assignedStudents.length} students</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{mentor.availableSlots.length} slots</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast.info("View mentor details")} className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                              View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toast.info("Edit mentor")} className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Mentor Dialog */}
      <Dialog open={showAddMentor} onOpenChange={setShowAddMentor}>
        <DialogContent className="animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Add New Mentor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mentor-name">Full Name</Label>
              <Input
                id="mentor-name"
                placeholder="Enter mentor name"
                value={newMentorData.name}
                onChange={(e) => setNewMentorData({ ...newMentorData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="mentor-email">Email</Label>
              <Input
                id="mentor-email"
                type="email"
                placeholder="mentor@example.edu"
                value={newMentorData.email}
                onChange={(e) => setNewMentorData({ ...newMentorData, email: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button onClick={handleAddMentor} className="w-full">
              Add Mentor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Mentor Dialog */}
      <Dialog open={showMentorAssignment} onOpenChange={setShowMentorAssignment}>
        <DialogContent className="animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Assign Mentor to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Mentor</Label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mockMentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignMentor} className="w-full">
              Assign Mentor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}