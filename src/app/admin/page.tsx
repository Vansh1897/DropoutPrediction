"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Activity, AlertTriangle, Users, Shield, UserPlus, Settings, TrendingUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { mockStudents, mockTeachers, mockMentors, adminInfo } from "@/lib/mockData";

export default function AdminDashboard() {
  const [showAddHOD, setShowAddHOD] = useState(false);
  const [hodName, setHodName] = useState("");
  const [hodEmail, setHodEmail] = useState("");
  const [hodDepartment, setHodDepartment] = useState("");

  const handleAddHOD = () => {
    if (!hodName || !hodEmail || !hodDepartment) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success(`HOD ${hodName} added for ${hodDepartment} department`);
    setShowAddHOD(false);
    setHodName("");
    setHodEmail("");
    setHodDepartment("");
  };

  // Statistics Data
  const totalStudents = mockStudents.length;
  const criticalStudents = mockStudents.filter(s => s.riskLevel === "critical").length;
  const moderateStudents = mockStudents.filter(s => s.riskLevel === "moderate").length;
  const lowRiskStudents = mockStudents.filter(s => s.riskLevel === "low").length;

  // Risk Distribution Pie Chart
  const riskDistributionData = [
    { name: "Low Risk", value: lowRiskStudents, color: "#10b981" },
    { name: "Moderate Risk", value: moderateStudents, color: "#f59e0b" },
    { name: "Critical Risk", value: criticalStudents, color: "#ef4444" },
  ];

  // Department-wise statistics (mock data)
  const departmentData = [
    { department: "Computer", students: totalStudents, teachers: mockTeachers.length, mentors: mockMentors.length },
    { department: "Mechanical", students: 85, teachers: 12, mentors: 4 },
    { department: "Civil", students: 78, teachers: 10, mentors: 3 },
    { department: "Electrical", students: 92, teachers: 14, mentors: 5 },
  ];

  // Teacher workload distribution
  const teacherWorkloadData = mockTeachers.map(t => ({
    name: t.name.split(" ")[0],
    classes: Math.floor(Math.random() * 5) + 3,
    students: Math.floor(Math.random() * 50) + 30,
  }));

  // System usage over time
  const systemUsageData = [
    { month: "Sep", logins: 450, sessions: 320, alerts: 45 },
    { month: "Oct", logins: 520, sessions: 380, alerts: 52 },
    { month: "Nov", logins: 580, sessions: 420, alerts: 38 },
    { month: "Dec", logins: 620, sessions: 480, alerts: 41 },
  ];

  // Role distribution pie chart
  const roleDistributionData = [
    { name: "Students", value: totalStudents, color: "#3b82f6" },
    { name: "Teachers", value: mockTeachers.length, color: "#8b5cf6" },
    { name: "Mentors", value: mockMentors.length, color: "#10b981" },
    { name: "HODs", value: 1, color: "#f59e0b" },
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      role="Admin"
      userName={adminInfo.name}
      notifications={8}
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-700">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Students", value: totalStudents, subtitle: "Across all departments", icon: Users, color: "blue" },
              { title: "Teachers", value: mockTeachers.length, subtitle: "Active faculty", icon: Users, color: "purple" },
              { title: "Mentors", value: mockMentors.length, subtitle: "Available counselors", icon: GraduationCap, color: "green" },
              { title: "At Risk", value: `${((criticalStudents + moderateStudents) / totalStudents * 100).toFixed(0)}%`, subtitle: `${criticalStudents + moderateStudents} students`, icon: AlertTriangle, color: "red" }
            ].map((kpi, index) => (
              <div key={index} className="animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <KPICard {...kpi} />
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Risk Distribution Pie Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
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

            {/* Role Distribution Pie Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-top duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistributionData.map((entry, index) => (
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

            {/* Department Overview Bar Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  Department Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="department" className="text-xs" />
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
                    <Bar dataKey="students" fill="#3b82f6" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* System Activity Area Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemUsageData}>
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
                    <Area type="monotone" dataKey="logins" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="sessions" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="alerts" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Teacher Workload Bar Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-orange-500" />
                  Teacher Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teacherWorkloadData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" />
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
                    <Bar dataKey="classes" fill="#8b5cf6" name="Classes" />
                    <Bar dataKey="students" fill="#f59e0b" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* HOD Management */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  HOD Management
                </CardTitle>
                <Dialog open={showAddHOD} onOpenChange={setShowAddHOD}>
                  <DialogTrigger asChild>
                    <Button className="shadow-md hover:shadow-lg transition-all duration-300">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add HOD
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="animate-in fade-in zoom-in-95 duration-300">
                    <DialogHeader>
                      <DialogTitle>Add New HOD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hodName">Full Name</Label>
                        <Input
                          id="hodName"
                          placeholder="Dr. Name Surname"
                          value={hodName}
                          onChange={(e) => setHodName(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hodEmail">Email</Label>
                        <Input
                          id="hodEmail"
                          type="email"
                          placeholder="hod@college.edu"
                          value={hodEmail}
                          onChange={(e) => setHodEmail(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Select value={hodDepartment} onValueChange={setHodDepartment}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="computer">Computer Engineering</SelectItem>
                            <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                            <SelectItem value="civil">Civil Engineering</SelectItem>
                            <SelectItem value="electrical">Electrical Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddHOD} className="w-full">
                        Add HOD
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Dr. Suresh Choudhary</h3>
                      <p className="text-sm text-muted-foreground">Computer Engineering</p>
                      <p className="text-xs text-muted-foreground mt-1">suresh.choudhary@college.edu</p>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers List */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Teachers Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTeachers.map((teacher) => (
                      <TableRow key={teacher.id} className="hover:bg-muted/50 transition-colors duration-200">
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.subject || "Multiple"}</TableCell>
                        <TableCell>
                          {teacher.isClassCoordinator ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs font-semibold">
                              Class Coordinator - {teacher.classCoordinator}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Teacher</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-500" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-br from-red-50/50 to-yellow-50/50 dark:from-red-950/20 dark:to-yellow-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Risk Thresholds
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Critical:</span>
                      <span className="font-semibold">≥ 0.80</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moderate:</span>
                      <span className="font-semibold">0.50 - 0.79</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low:</span>
                      <span className="font-semibold">< 0.50</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    Configure
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Notification Settings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Email Alerts:</span>
                      <span className="text-green-600 font-semibold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WhatsApp:</span>
                      <span className="text-green-600 font-semibold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Schedule:</span>
                      <span className="text-green-600 font-semibold">Active</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Teacher Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Dr. Anil Kumar</h3>
                      <p className="text-sm text-muted-foreground">Computer Engineering</p>
                      <p className="text-xs text-muted-foreground mt-1">anil.kumar@college.edu</p>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-r from-green-50/50 to-yellow-50/50 dark:from-green-950/20 dark:to-yellow-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Health
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-semibold">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span className="font-semibold">42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-semibold">78%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 animate-in fade-in duration-700">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-500" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-md bg-gradient-to-r from-red-50/50 to-blue-50/50 dark:from-red-950/20 dark:to-blue-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Security Settings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Two-Factor Auth:</span>
                      <span className="font-semibold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Timeout:</span>
                      <span className="font-semibold">30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Whitelisting:</span>
                      <span className="font-semibold">Active</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}