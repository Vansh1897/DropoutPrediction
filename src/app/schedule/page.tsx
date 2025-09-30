"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, Video, Users, Edit, Trash, CheckCircle, XCircle } from "lucide-react";
import { mockMeetings, mockStudents, mockMentors, mockTeachers, hodInfo, Meeting } from "@/lib/mockData";
import { toast } from "sonner";

export default function SchedulePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");

    if (!storedUserId || !storedRole) {
      router.push("/login");
      return;
    }

    setUserId(storedUserId);
    setUserRole(storedRole);

    // Get user name
    let name = "";
    if (storedRole === "student") {
      const student = mockStudents.find((s) => s.id === storedUserId);
      name = student?.name || "Student";
    } else if (storedRole === "mentor") {
      const mentor = mockMentors.find((m) => m.id === storedUserId);
      name = mentor?.name || "Mentor";
    } else if (storedRole === "teacher") {
      const teacher = mockTeachers.find((t) => t.id === storedUserId);
      name = teacher?.name || "Teacher";
    } else if (storedRole === "hod") {
      name = hodInfo.name;
    }
    setUserName(name);

    // Filter meetings for user
    const userMeetings = mockMeetings.filter(
      (m) => m.studentId === storedUserId || m.mentorId === storedUserId
    );
    setMeetings(userMeetings);
  }, [router]);

  const handleRescheduleMeeting = () => {
    if (!selectedMeeting || !newDate || !newTime) {
      toast.error("Please fill all required fields");
      return;
    }

    const updatedMeetings = meetings.map((m) =>
      m.id === selectedMeeting.id
        ? { ...m, date: newDate, time: newTime, status: "pending" as const }
        : m
    );

    setMeetings(updatedMeetings);
    toast.success("Meeting rescheduled successfully!");
    setShowRescheduleDialog(false);
    setSelectedMeeting(null);
    setNewDate("");
    setNewTime("");
    setRescheduleReason("");
  };

  const handleCancelMeeting = (meeting: Meeting) => {
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, status: "cancelled" as const } : m
    );
    setMeetings(updatedMeetings);
    toast.success("Meeting cancelled");
  };

  const handleConfirmMeeting = (meeting: Meeting) => {
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, status: "confirmed" as const } : m
    );
    setMeetings(updatedMeetings);
    toast.success("Meeting confirmed");
  };

  const getStudentName = (studentId: string) => {
    return mockStudents.find((s) => s.id === studentId)?.name || "Unknown";
  };

  const getMentorName = (mentorId: string) => {
    return mockMentors.find((m) => m.id === mentorId)?.name || "Unknown";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const upcomingMeetings = meetings
    .filter((m) => m.status !== "cancelled" && m.status !== "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastMeetings = meetings
    .filter((m) => m.status === "completed" || m.status === "cancelled")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calendar data
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMeetingsForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetings.filter((m) => m.date === dateStr && m.status !== "cancelled");
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <DashboardLayout
      title="Schedule"
      role={userRole}
      userName={userName}
      notifications={0}
    >
      <div className="space-y-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Meetings */}
          <TabsContent value="upcoming" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Calendar className="h-16 w-16 mb-4 opacity-50" />
                    <p>No upcoming meetings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => {
                      const otherPersonName = userRole === "student" 
                        ? getMentorName(meeting.mentorId)
                        : getStudentName(meeting.studentId);
                      const otherPersonRole = userRole === "student" ? "Mentor" : "Student";

                      return (
                        <div
                          key={meeting.id}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {getInitials(otherPersonName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{otherPersonName}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {otherPersonRole}
                                  </Badge>
                                  <Badge className={`text-xs ${getStatusColor(meeting.status)}`}>
                                    {meeting.status}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(meeting.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{meeting.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {meeting.mode === "online" ? (
                                      <>
                                        <Video className="h-4 w-4" />
                                        <span>Online</span>
                                      </>
                                    ) : (
                                      <>
                                        <MapPin className="h-4 w-4" />
                                        <span>In-person</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {meeting.type === "auto-scheduled" && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    Auto-scheduled (Risk Alert)
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              {meeting.status === "pending" && userRole === "mentor" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmMeeting(meeting)}
                                  title="Confirm"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setNewDate(meeting.date);
                                  setNewTime(meeting.time);
                                  setShowRescheduleDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Reschedule
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelMeeting(meeting)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{monthNames[selectedMonth]} {selectedYear}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm p-2">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 min-h-24"></div>
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayMeetings = getMeetingsForDate(day);
                    const isToday = 
                      day === new Date().getDate() &&
                      selectedMonth === new Date().getMonth() &&
                      selectedYear === new Date().getFullYear();

                    return (
                      <div
                        key={day}
                        className={`p-2 border rounded-lg min-h-24 ${
                          isToday ? "bg-primary/10 border-primary" : ""
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayMeetings.slice(0, 2).map((meeting) => (
                            <div
                              key={meeting.id}
                              className="text-xs p-1 bg-blue-100 dark:bg-blue-900/20 rounded truncate"
                              title={`${meeting.time} - ${
                                userRole === "student"
                                  ? getMentorName(meeting.mentorId)
                                  : getStudentName(meeting.studentId)
                              }`}
                            >
                              {meeting.time}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayMeetings.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting History</CardTitle>
              </CardHeader>
              <CardContent>
                {pastMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clock className="h-16 w-16 mb-4 opacity-50" />
                    <p>No past meetings</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {pastMeetings.map((meeting) => {
                        const otherPersonName = userRole === "student"
                          ? getMentorName(meeting.mentorId)
                          : getStudentName(meeting.studentId);

                        return (
                          <div
                            key={meeting.id}
                            className="p-4 border rounded-lg bg-muted/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                                    {getInitials(otherPersonName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">{otherPersonName}</h4>
                                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                    <span>{formatDate(meeting.date)}</span>
                                    <span>{meeting.time}</span>
                                    <span>{meeting.mode}</span>
                                  </div>
                                  {meeting.outcome && (
                                    <p className="text-sm mt-2 text-muted-foreground">
                                      Outcome: {meeting.outcome}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={getStatusColor(meeting.status)}>
                                {meeting.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reschedule Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Meeting</DialogTitle>
            </DialogHeader>
            {selectedMeeting && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">
                    With: {userRole === "student"
                      ? getMentorName(selectedMeeting.mentorId)
                      : getStudentName(selectedMeeting.studentId)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {formatDate(selectedMeeting.date)} at {selectedMeeting.time}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-date">New Date</Label>
                    <input
                      id="new-date"
                      type="date"
                      className="mt-2 w-full px-3 py-2 border rounded-md bg-background"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-time">New Time</Label>
                    <input
                      id="new-time"
                      type="time"
                      className="mt-2 w-full px-3 py-2 border rounded-md bg-background"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Why are you rescheduling?"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button onClick={handleRescheduleMeeting} className="w-full">
                  Confirm Reschedule
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}