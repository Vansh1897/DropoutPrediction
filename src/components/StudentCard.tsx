"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Student } from "@/lib/mockData";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentCardProps {
  student: Student;
  onView?: () => void;
  onSchedule?: () => void;
  onMessage?: () => void;
  compact?: boolean;
}

export function StudentCard({ student, onView, onSchedule, onMessage, compact = false }: StudentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{student.name}</h4>
                <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span>Att: {student.attendance30d}%</span>
                  <span>•</span>
                  <span>Marks: {student.currentSemesterMarks}</span>
                </div>
              </div>
            </div>
            <RiskBadge level={student.riskLevel} size="sm" showIcon={false} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
              <p className="text-xs text-muted-foreground">{student.year} • {student.email}</p>
            </div>
          </div>
          <RiskBadge level={student.riskLevel} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Attendance (30d)</p>
            <p className="font-semibold text-lg">{student.attendance30d}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Current Marks</p>
            <p className="font-semibold text-lg">{student.currentSemesterMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Backlogs</p>
            <p className="font-semibold text-lg">{student.backlogs}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Fee Overdue</p>
            <p className="font-semibold text-lg">{student.feeOverdueDays}d</p>
          </div>
        </div>

        <div className="flex gap-2">
          {onView && (
            <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onSchedule && (
            <Button size="sm" variant="outline" className="flex-1" onClick={onSchedule}>
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          )}
          {onMessage && (
            <Button size="sm" variant="outline" onClick={onMessage}>
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}