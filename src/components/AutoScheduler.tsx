"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student, Mentor, mockMentors } from "@/lib/mockData";
import { Calendar, Clock, MapPin, Video, AlertTriangle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ScheduledMeeting {
  id: string;
  student: Student;
  mentor: Mentor;
  date: string;
  time: string;
  mode: "online" | "offline";
  type: "auto-scheduled" | "suggested" | "requested";
  status: "pending" | "confirmed" | "completed";
}

interface AutoSchedulerProps {
  student: Student;
  onScheduled?: (meeting: ScheduledMeeting) => void;
}

export function AutoScheduler({ student, onScheduled }: AutoSchedulerProps) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<ScheduledMeeting | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  // Get student's mentor
  const mentor = mockMentors.find((m) => m.id === student.mentorId);

  // Calculate risk and determine scheduling type
  const getRiskDetails = () => {
    const isCritical =
      student.riskScore >= 0.8 ||
      (student.attendance30d < 50 && student.attemptsExhausted >= 2);
    
    const isModerate =
      (student.riskScore >= 0.5 && student.riskScore < 0.8) ||
      (student.attendance30d < 65 && student.feeOverdueDays > 15);

    return {
      isCritical,
      isModerate,
      level: isCritical ? "critical" : isModerate ? "moderate" : "low",
    };
  };

  const riskDetails = getRiskDetails();

  // Auto-schedule for critical cases
  const autoScheduleMeeting = () => {
    setAutoScheduling(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!mentor) {
        toast.error("No mentor assigned. Escalating to HOD...");
        setAutoScheduling(false);
        return;
      }

      // Get earliest available slot (within 48 hours)
      const nextSlot = mentor.availableSlots[0];
      const [date, time] = nextSlot.split(" ");

      const meeting: ScheduledMeeting = {
        id: `MTG-${Date.now()}`,
        student,
        mentor,
        date,
        time,
        mode: "offline",
        type: "auto-scheduled",
        status: "confirmed",
      };

      setScheduledMeeting(meeting);
      setAutoScheduling(false);
      
      // Send notifications
      toast.success("Meeting auto-scheduled! Notifications sent to student, guardian, and mentor.");
      
      if (onScheduled) {
        onScheduled(meeting);
      }
    }, 1500);
  };

  // Suggest slots for moderate risk
  const suggestSlots = () => {
    if (!mentor) return [];
    return mentor.availableSlots.slice(0, 2);
  };

  const confirmSuggestedSlot = () => {
    if (!selectedSlot || !mentor) return;

    const [date, time] = selectedSlot.split(" ");
    
    const meeting: ScheduledMeeting = {
      id: `MTG-${Date.now()}`,
      student,
      mentor,
      date,
      time,
      mode: "offline",
      type: "suggested",
      status: "pending",
    };

    setScheduledMeeting(meeting);
    toast.success("Meeting slot confirmed! Mentor will be notified.");
    
    if (onScheduled) {
      onScheduled(meeting);
    }
  };

  useEffect(() => {
    // Auto-trigger scheduling for critical cases
    if (riskDetails.isCritical && !scheduledMeeting) {
      setShowScheduler(true);
    }
  }, [riskDetails.isCritical]);

  return (
    <>
      <Card className={`${
        riskDetails.isCritical ? "border-red-500 border-2" : 
        riskDetails.isModerate ? "border-yellow-500 border-2" : ""
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Counseling Status</CardTitle>
            {riskDetails.isCritical && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical
              </Badge>
            )}
            {riskDetails.isModerate && (
              <Badge className="bg-yellow-500">
                Moderate Risk
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scheduledMeeting ? (
            <>
              {riskDetails.isCritical && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-200">
                        Critical Risk Detected
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Auto-scheduling counseling session with mentor within 48 hours.
                      </p>
                      <ul className="text-xs mt-2 space-y-1 text-red-600 dark:text-red-400">
                        <li>• Attendance: {student.attendance30d}% (Below 50%)</li>
                        {student.attemptsExhausted >= 2 && (
                          <li>• Multiple exam attempts exhausted</li>
                        )}
                        {student.feeOverdueDays > 30 && (
                          <li>• Fee overdue: {student.feeOverdueDays} days</li>
                        )}
                        <li>• Risk Score: {(student.riskScore * 100).toFixed(0)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {riskDetails.isModerate && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                        Moderate Risk - Action Required
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Please select a counseling slot below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => {
                  setShowScheduler(true);
                  if (riskDetails.isCritical) {
                    autoScheduleMeeting();
                  }
                }}
                className="w-full"
                size="lg"
                variant={riskDetails.isCritical ? "destructive" : riskDetails.isModerate ? "default" : "outline"}
              >
                {riskDetails.isCritical && "Auto-Schedule Meeting"}
                {riskDetails.isModerate && "View Available Slots"}
                {!riskDetails.isCritical && !riskDetails.isModerate && "Request Counseling"}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Meeting Scheduled</span>
              </div>
              
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(scheduledMeeting.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scheduledMeeting.time}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {scheduledMeeting.mode === "online" ? (
                    <Video className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm capitalize">{scheduledMeeting.mode}</span>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Mentor: {scheduledMeeting.mentor.name}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toast.info("Reschedule feature - Opening...")}
              >
                Reschedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {riskDetails.isCritical ? "Auto-Scheduling Meeting" : "Select Meeting Slot"}
            </DialogTitle>
          </DialogHeader>

          {autoScheduling ? (
            <div className="py-8 text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Finding earliest available slot with your mentor...
              </p>
            </div>
          ) : riskDetails.isCritical && scheduledMeeting ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-center font-semibold">Meeting Auto-Scheduled!</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Date:</strong> {new Date(scheduledMeeting.date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {scheduledMeeting.time}
                </p>
                <p className="text-sm">
                  <strong>Mentor:</strong> {scheduledMeeting.mentor.name}
                </p>
                <p className="text-sm">
                  <strong>Mode:</strong> {scheduledMeeting.mode}
                </p>
              </div>

              <div className="p-3 bg-muted rounded text-xs space-y-1">
                <p className="font-semibold">Notifications sent to:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Student (Email & WhatsApp)</li>
                  <li>Guardian (Email & WhatsApp)</li>
                  <li>Mentor (Email & In-app)</li>
                  <li>HOD (In-app notification)</li>
                </ul>
              </div>

              <Button onClick={() => setShowScheduler(false)} className="w-full">
                Close
              </Button>
            </div>
          ) : riskDetails.isModerate ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please select one of the available time slots:
              </p>

              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {suggestSlots().map((slot) => {
                    const [date, time] = slot.split(" ");
                    return (
                      <SelectItem key={slot} value={slot}>
                        {new Date(date).toLocaleDateString()} at {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                <p className="font-semibold">Note:</p>
                <p className="mt-1">
                  If you don't respond within 48 hours, a reminder will be sent. 
                  After 7 days, your teacher and HOD will be notified.
                </p>
              </div>

              <Button 
                onClick={confirmSuggestedSlot} 
                className="w-full"
                disabled={!selectedSlot}
              >
                Confirm Slot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">Request a counseling session with your mentor.</p>
              <Button className="w-full" onClick={() => {
                toast.success("Counseling request sent to mentor");
                setShowScheduler(false);
              }}>
                Send Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}