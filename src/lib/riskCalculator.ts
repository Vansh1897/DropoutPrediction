/**
 * Business Rules for Student Dropout Risk Prediction
 * 
 * Risk Factors:
 * 1. Attendance (30-day) < 65% → High Risk
 * 2. Current Semester Marks < 60 → High Risk
 * 3. Backlogs > 0 → Moderate to High Risk
 * 4. Fee Overdue > 30 days → High Risk
 * 5. Attempts Exhausted >= 2 → Critical Risk
 * 
 * Risk Levels:
 * - Critical: Risk Score >= 0.7 (Immediate intervention required)
 * - Moderate: Risk Score 0.4 - 0.69 (Monitoring and support needed)
 * - Low: Risk Score < 0.4 (Maintain good performance)
 */

export type RiskLevel = "low" | "moderate" | "critical";

export interface StudentRiskData {
  attendance30d: number;
  currentSemesterMarks: number;
  backlogs: number;
  attemptsExhausted: number;
  feeOverdueDays: number;
  previousSemesterMarks?: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
  recommendations: string[];
  requiresImmediateIntervention: boolean;
}

/**
 * Calculate student dropout risk based on business rules
 */
export function calculateRisk(data: StudentRiskData): RiskAssessment {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Factor 1: Attendance (Weight: 30%)
  if (data.attendance30d < 50) {
    riskScore += 0.35;
    riskFactors.push(`Critical: Attendance is ${data.attendance30d}% (Below 50%)`);
    recommendations.push("Immediate attendance improvement required. Meet with mentor urgently.");
  } else if (data.attendance30d < 65) {
    riskScore += 0.25;
    riskFactors.push(`Low attendance: ${data.attendance30d}% (Below 65%)`);
    recommendations.push("Improve attendance to at least 75%. Schedule counseling session.");
  } else if (data.attendance30d < 75) {
    riskScore += 0.15;
    riskFactors.push(`Attendance slightly below requirement: ${data.attendance30d}%`);
    recommendations.push("Aim for 75%+ attendance to stay on track.");
  }

  // Factor 2: Academic Performance (Weight: 25%)
  if (data.currentSemesterMarks < 40) {
    riskScore += 0.3;
    riskFactors.push(`Critical: Very low marks (${data.currentSemesterMarks})`);
    recommendations.push("Academic emergency. Arrange immediate tutoring and extra classes.");
  } else if (data.currentSemesterMarks < 50) {
    riskScore += 0.2;
    riskFactors.push(`Low marks: ${data.currentSemesterMarks}`);
    recommendations.push("Focus on studies. Join peer study groups and attend doubt-clearing sessions.");
  } else if (data.currentSemesterMarks < 60) {
    riskScore += 0.15;
    riskFactors.push(`Below average marks: ${data.currentSemesterMarks}`);
    recommendations.push("Improve study habits. Seek help from teachers for difficult subjects.");
  }

  // Factor 3: Backlogs (Weight: 20%)
  if (data.backlogs > 2) {
    riskScore += 0.25;
    riskFactors.push(`Multiple backlogs: ${data.backlogs} subjects`);
    recommendations.push("Clear backlogs urgently. Create a study plan for backlog subjects.");
  } else if (data.backlogs > 0) {
    riskScore += 0.15;
    riskFactors.push(`Backlogs: ${data.backlogs} subject(s)`);
    recommendations.push("Focus on clearing backlogs in the next attempt.");
  }

  // Factor 4: Attempts Exhausted (Weight: 15%)
  if (data.attemptsExhausted >= 2) {
    riskScore += 0.2;
    riskFactors.push(`Multiple exam attempts exhausted: ${data.attemptsExhausted}`);
    recommendations.push("Critical situation. Intensive academic support needed immediately.");
  } else if (data.attemptsExhausted >= 1) {
    riskScore += 0.1;
    riskFactors.push(`Exam attempt exhausted: ${data.attemptsExhausted}`);
    recommendations.push("No more attempts available. Must pass in next exam.");
  }

  // Factor 5: Fee Status (Weight: 10%)
  if (data.feeOverdueDays > 60) {
    riskScore += 0.15;
    riskFactors.push(`Fees severely overdue: ${data.feeOverdueDays} days`);
    recommendations.push("Clear fee dues immediately. Explore scholarship/financial aid options.");
  } else if (data.feeOverdueDays > 30) {
    riskScore += 0.1;
    riskFactors.push(`Fees overdue: ${data.feeOverdueDays} days`);
    recommendations.push("Pay pending fees soon to avoid academic holds.");
  } else if (data.feeOverdueDays > 0) {
    riskScore += 0.05;
    riskFactors.push(`Fees pending: ${data.feeOverdueDays} days`);
    recommendations.push("Clear fee payment to avoid future issues.");
  }

  // Bonus: Performance decline detection
  if (data.previousSemesterMarks && data.currentSemesterMarks < data.previousSemesterMarks - 10) {
    riskScore += 0.1;
    riskFactors.push(
      `Significant performance decline: ${data.previousSemesterMarks} → ${data.currentSemesterMarks}`
    );
    recommendations.push("Address the reasons for declining performance. Seek counseling.");
  }

  // Cap risk score at 1.0
  riskScore = Math.min(riskScore, 1.0);

  // Determine risk level
  let riskLevel: RiskLevel;
  if (riskScore >= 0.7) {
    riskLevel = "critical";
  } else if (riskScore >= 0.4) {
    riskLevel = "moderate";
  } else {
    riskLevel = "low";
  }

  // Check for immediate intervention triggers
  const requiresImmediateIntervention =
    riskLevel === "critical" ||
    data.attendance30d < 50 ||
    data.attemptsExhausted >= 2 ||
    (data.currentSemesterMarks < 40 && data.backlogs > 0);

  // Add positive recommendations for low-risk students
  if (riskLevel === "low" && riskFactors.length === 0) {
    riskFactors.push("All parameters are healthy");
    recommendations.push("Excellent work! Keep maintaining your good performance.");
    recommendations.push("Continue attending classes regularly and stay focused on studies.");
  }

  return {
    riskScore: parseFloat(riskScore.toFixed(2)),
    riskLevel,
    riskFactors,
    recommendations,
    requiresImmediateIntervention,
  };
}

/**
 * Auto-scheduling logic based on risk level
 */
export function shouldAutoScheduleCounseling(assessment: RiskAssessment): {
  shouldSchedule: boolean;
  urgency: "immediate" | "soon" | "normal" | "none";
  withinHours: number;
} {
  if (assessment.requiresImmediateIntervention) {
    return {
      shouldSchedule: true,
      urgency: "immediate",
      withinHours: 48, // Schedule within 48 hours
    };
  }

  if (assessment.riskLevel === "moderate") {
    return {
      shouldSchedule: true,
      urgency: "soon",
      withinHours: 168, // Schedule within 1 week
    };
  }

  return {
    shouldSchedule: false,
    urgency: "none",
    withinHours: 0,
  };
}

/**
 * Get risk level badge color
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "bg-red-500";
    case "moderate":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

/**
 * Get risk level display name
 */
export function getRiskLevelDisplay(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "Critical Risk";
    case "moderate":
      return "Moderate Risk";
    case "low":
      return "Low Risk";
    default:
      return "Unknown";
  }
}