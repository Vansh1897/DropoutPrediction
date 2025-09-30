"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStudents, mockTeachers } from "@/lib/mockData";
import { Users, BookOpen, Upload, Plus, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");
    
    if (storedRole !== "teacher") {
      router.push("/login");
      return;
    }
    
    if (storedUserId) {
      setTeacherId(storedUserId);
    } else {
      setTeacherId("T-01"); // Fallback
    }
    setIsLoading(false);
  }, [router]);

  const teacher = mockTeachers.find((t) => t.id === teacherId);
  const classYear = teacher?.classCoordinator || "FE";
  const classStudents = mockStudents.filter((s) => s.year === classYear);

  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [uploadType, setUploadType] = useState<"attendance" | "marks" | "fees">("attendance");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [manualValue, setManualValue] = useState("");

  const avgAttendance = classStudents.length > 0 
    ? (classStudents.reduce((acc, s) => acc + s.attendance30d, 0) / classStudents.length).toFixed(1)
    : "0";
  const avgMarks = classStudents.length > 0
    ? (classStudents.reduce((acc, s) => acc + s.currentSemesterMarks, 0) / classStudents.length).toFixed(1)
    : "0";

  const criticalCount = classStudents.filter(s => s.riskLevel === "critical").length;
  const moderateCount = classStudents.filter(s => s.riskLevel === "moderate").length;
  const lowRiskCount = classStudents.filter(s => s.riskLevel === "low").length;

  const studentPerformanceData = classStudents.map((s) => ({
    name: s.name.split(" ")[0],
    attendance: s.attendance30d,
    marks: s.currentSemesterMarks,
  }));

  // Risk Distribution Pie Chart
  const riskDistributionData = [
    { name: "Low Risk", value: lowRiskCount, color: "#10b981" },
    { name: "Moderate Risk", value: moderateCount, color: "#f59e0b" },
    { name: "Critical Risk", value: criticalCount, color: "#ef4444" },
  ];

  // Attendance Distribution Pie Chart
  const attendanceRanges = [
    { name: "90-100%", value: classStudents.filter(s => s.attendance30d >= 90).length, color: "#10b981" },
    { name: "75-89%", value: classStudents.filter(s => s.attendance30d >= 75 && s.attendance30d < 90).length, color: "#3b82f6" },
    { name: "65-74%", value: classStudents.filter(s => s.attendance30d >= 65 && s.attendance30d < 75).length, color: "#f59e0b" },
    { name: "Below 65%", value: classStudents.filter(s => s.attendance30d < 65).length, color: "#ef4444" },
  ];

  // Marks Distribution Bar Chart
  const marksRanges = [
    { range: "90-100", count: classStudents.filter(s => s.currentSemesterMarks >= 90).length },
    { range: "80-89", count: classStudents.filter(s => s.currentSemesterMarks >= 80 && s.currentSemesterMarks < 90).length },
    { range: "70-79", count: classStudents.filter(s => s.currentSemesterMarks >= 70 && s.currentSemesterMarks < 80).length },
    { range: "60-69", count: classStudents.filter(s => s.currentSemesterMarks >= 60 && s.currentSemesterMarks < 70).length },
    { range: "Below 60", count: classStudents.filter(s => s.currentSemesterMarks < 60).length },
  ];

  // Performance trend over months
  const performanceTrend = [
    { month: "Sep", avgAttendance: 78, avgMarks: 72 },
    { month: "Oct", avgAttendance: 75, avgMarks: 70 },
    { month: "Nov", avgAttendance: 73, avgMarks: 68 },
    { month: "Dec", avgAttendance: parseFloat(avgAttendance), avgMarks: parseFloat(avgMarks) },
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        console.log("Parsed data:", json);
        toast.success(`Successfully uploaded ${uploadType} data for ${json.length} records`);
        setShowUpload(false);
      } catch (error) {
        toast.error("Failed to parse spreadsheet. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  }, [uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleManualSubmit = () => {
    if (!selectedStudent || !manualValue) {
      toast.error("Please fill all fields");
      return;
    }
    const student = classStudents.find((s) => s.id === selectedStudent);
    toast.success(`${uploadType} updated for ${student?.name}`);
    setShowManualEntry(false);
    setSelectedStudent("");
    setManualValue("");
  };

  if (isLoading || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      role="Teacher"
      userName={teacher.name}
      notifications={4}
      onMessagesClick={() => toast.info("Messages feature - Opening...")}
    >
      <Tabs defaultValue="overview" className="space-y-6 animate-in fade-in duration-700">
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-700">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Class Students", value: classStudents.length, subtitle: `${classYear} - Computer Engineering`, icon: Users, color: "blue" },
              { title: "Avg Attendance", value: `${avgAttendance}%`, subtitle: "Last 30 days", icon: BookOpen, color: "green" },
              { title: "Avg Marks", value: avgMarks, subtitle: "Current semester", icon: BookOpen, color: "purple" },
              { title: "At Risk", value: criticalCount + moderateCount, subtitle: "Students need attention", icon: AlertTriangle, color: "red" }
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
                  <AlertTriangle className="h-5 w-5 text-red-500" />
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
                      label={({ name, value }) => `${name}: ${value}`}
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

            {/* Attendance Ranges Pie Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-top duration-500">
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
                      data={attendanceRanges}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceRanges.map((entry, index) => (
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

            {/* Marks Distribution Bar Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Marks Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marksRanges}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs" />
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
                    <Bar dataKey="count" fill="#3b82f6" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Class Performance Line Chart */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Class Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrend}>
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
                    <Line type="monotone" dataKey="avgAttendance" stroke="#10b981" strokeWidth={2} name="Avg Attendance %" />
                    <Line type="monotone" dataKey="avgMarks" stroke="#3b82f6" strokeWidth={2} name="Avg Marks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Performance Comparison */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Student Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentPerformanceData.slice(0, 10)}>
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
                    <Bar dataKey="attendance" fill="#3498db" name="Attendance %" />
                    <Bar dataKey="marks" fill="#2ecc71" name="Marks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6 animate-in fade-in duration-700">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Student Details - {classYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Attendance (30d)</TableHead>
                        <TableHead>Current Marks</TableHead>
                        <TableHead>Backlogs</TableHead>
                        <TableHead>Fee Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/50 transition-colors duration-200">
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <span className={student.attendance30d < 65 ? "text-red-600 font-semibold" : ""}>
                              {student.attendance30d}%
                            </span>
                          </TableCell>
                          <TableCell>{student.currentSemesterMarks}</TableCell>
                          <TableCell>
                            <span className={student.backlogs > 0 ? "text-yellow-600 font-semibold" : ""}>
                              {student.backlogs}
                            </span>
                          </TableCell>
                          <TableCell>
                            {student.feeOverdueDays > 0 ? (
                              <span className="text-red-600 font-semibold">{student.feeOverdueDays}d overdue</span>
                            ) : (
                              <span className="text-green-600">Paid</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                student.riskLevel === "critical"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                  : student.riskLevel === "moderate"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              }`}
                            >
                              {student.riskLevel}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Data Upload Section */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Data Management
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogTrigger asChild>
                  <Button className="shadow-md hover:shadow-lg transition-all duration-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Spreadsheet
                  </Button>
                </DialogTrigger>
                <DialogContent className="animate-in fade-in zoom-in-95 duration-300">
                  <DialogHeader>
                    <DialogTitle>Upload Data from Spreadsheet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Data Type</Label>
                      <Select value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="marks">Marks</SelectItem>
                          <SelectItem value="fees">Fee Details</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      {isDragActive ? (
                        <p>Drop the file here...</p>
                      ) : (
                        <>
                          <p className="font-medium">Drag & drop a spreadsheet here</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            or click to browse (.xlsx, .xls, .csv)
                          </p>
                        </>
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                      <p className="font-semibold">Required Format:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Column 1: Student ID or Roll Number</li>
                        <li>Column 2: Student Name</li>
                        <li>Column 3: {uploadType === "attendance" ? "Attendance %" : uploadType === "marks" ? "Marks" : "Fee Amount"}</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="animate-in fade-in zoom-in-95 duration-300">
                  <DialogHeader>
                    <DialogTitle>Manual Data Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Data Type</Label>
                      <Select value={uploadType} onValueChange={(v: any) => setUploadType(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="marks">Marks</SelectItem>
                          <SelectItem value="fees">Fee Details</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Select Student</Label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {classStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.rollNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>
                        {uploadType === "attendance" ? "Attendance (%)" : uploadType === "marks" ? "Marks" : "Fee Amount"}
                      </Label>
                      <Input
                        type="number"
                        placeholder={uploadType === "attendance" ? "0-100" : "Enter value"}
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={handleManualSubmit} className="w-full">
                      Submit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload student data via spreadsheet or enter manually. Data will be processed and used for dropout prediction analysis.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}