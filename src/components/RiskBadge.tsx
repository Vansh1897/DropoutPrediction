"use client";

import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/mockData";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, showIcon = true, size = "md" }: RiskBadgeProps) {
  const config = {
    critical: {
      label: "Critical Risk",
      color: "bg-red-500 hover:bg-red-600 text-white border-red-600",
      icon: AlertTriangle,
    },
    moderate: {
      label: "Moderate Risk",
      color: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600",
      icon: AlertCircle,
    },
    low: {
      label: "Low Risk",
      color: "bg-green-500 hover:bg-green-600 text-white border-green-600",
      icon: CheckCircle,
    },
  };

  const { label, color, icon: Icon } = config[level];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  return (
    <Badge className={`${color} ${sizeClasses[size]} font-semibold`}>
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} />}
      {label}
    </Badge>
  );
}