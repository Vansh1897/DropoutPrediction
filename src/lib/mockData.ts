export type UserRole = "admin" | "hod" | "mentor" | "teacher" | "student";
export type RiskLevel = "low" | "moderate" | "critical";
export type YearLevel = "FE" | "SE" | "TE" | "BE";

export interface Student {
  id: string;
  name: string;
  email: string;
  year: YearLevel;
  rollNumber: string;
  mentorId: string;
  attendance30d: number;
  attendance90d: number;
  overallAttendance: number;
  currentSemesterMarks: number;
  previousSemesterMarks: number;
  backlogs: number;
  attemptsExhausted: number;
  feeOverdueDays: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lastCounseling?: string;
  counselingFeedback?: string;
  marksHistory: { month: string; marks: number }[];
  attendanceHistory: { month: string; percentage: number }[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  classCoordinator?: YearLevel;
  isClassCoordinator: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  assignedStudents: string[];
  availableSlots: string[];
}

export interface Meeting {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;
  time: string;
  type: "auto-scheduled" | "suggested" | "requested";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  mode: "online" | "offline";
  outcome?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "meeting" | "alert" | "reminder";
  read: boolean;
  timestamp: string;
}

// Mock Students with Indian names
export const mockStudents: Student[] = [
  // FE Students (30 students)
  {
    id: "FE-01",
    name: "Aarav Sharma",
    email: "aarav.sharma@student.edu",
    year: "FE",
    rollNumber: "FE-2024-001",
    mentorId: "M-01",
    attendance30d: 45,
    attendance90d: 52,
    overallAttendance: 48,
    currentSemesterMarks: 42,
    previousSemesterMarks: 55,
    backlogs: 2,
    attemptsExhausted: 2,
    feeOverdueDays: 60,
    riskScore: 0.85,
    riskLevel: "critical",
    lastCounseling: "2024-01-10",
    counselingFeedback: "Financial issues, family problems",
    marksHistory: [
      { month: "Sep", marks: 55 },
      { month: "Oct", marks: 50 },
      { month: "Nov", marks: 45 },
      { month: "Dec", marks: 42 },
    ],
    attendanceHistory: [
      { month: "Sep", percentage: 65 },
      { month: "Oct", percentage: 58 },
      { month: "Nov", percentage: 50 },
      { month: "Dec", percentage: 45 },
    ],
  },
  {
    id: "FE-02",
    name: "Diya Patel",
    email: "diya.patel@student.edu",
    year: "FE",
    rollNumber: "FE-2024-002",
    mentorId: "M-01",
    attendance30d: 62,
    attendance90d: 68,
    overallAttendance: 65,
    currentSemesterMarks: 58,
    previousSemesterMarks: 72,
    backlogs: 1,
    attemptsExhausted: 0,
    feeOverdueDays: 20,
    riskScore: 0.62,
    riskLevel: "moderate",
    marksHistory: [
      { month: "Sep", marks: 72 },
      { month: "Oct", marks: 68 },
      { month: "Nov", marks: 62 },
      { month: "Dec", marks: 58 },
    ],
    attendanceHistory: [
      { month: "Sep", percentage: 75 },
      { month: "Oct", percentage: 70 },
      { month: "Nov", percentage: 68 },
      { month: "Dec", percentage: 62 },
    ],
  },
  {
    id: "FE-03",
    name: "Arjun Kumar",
    email: "arjun.kumar@student.edu",
    year: "FE",
    rollNumber: "FE-2024-003",
    mentorId: "M-01",
    attendance30d: 88,
    attendance90d: 85,
    overallAttendance: 87,
    currentSemesterMarks: 78,
    previousSemesterMarks: 75,
    backlogs: 0,
    attemptsExhausted: 0,
    feeOverdueDays: 0,
    riskScore: 0.15,
    riskLevel: "low",
    marksHistory: [
      { month: "Sep", marks: 75 },
      { month: "Oct", marks: 76 },
      { month: "Nov", marks: 77 },
      { month: "Dec", marks: 78 },
    ],
    attendanceHistory: [
      { month: "Sep", percentage: 85 },
      { month: "Oct", percentage: 87 },
      { month: "Nov", percentage: 88 },
      { month: "Dec", percentage: 88 },
    ],
  },
  // ... continue generating FE students with helper function
  ...generateStudents("FE", "FE-2024", 4, 30, "M-01", "M-02", "M-03"),
  
  // SE Students (30 students)
  ...generateStudents("SE", "SE-2023", 31, 60, "M-04", "M-05", "M-06"),
  
  // TE Students (25 students)
  ...generateStudents("TE", "TE-2022", 61, 85, "M-07", "M-08", "M-09"),
  
  // BE Students (25 students)
  ...generateStudents("BE", "BE-2021", 86, 110, "M-10", "M-11", "M-12"),
];

// Helper function to generate students
function generateStudents(
  year: YearLevel,
  rollPrefix: string,
  startId: number,
  endId: number,
  ...mentorIds: string[]
): Student[] {
  const indianNames = [
    "Rahul Sharma", "Priya Singh", "Amit Patel", "Neha Gupta", "Vikram Reddy",
    "Anjali Kumar", "Karan Mehta", "Pooja Joshi", "Rohan Desai", "Sneha Iyer",
    "Aditya Verma", "Kavya Nair", "Siddharth Rao", "Ishita Kapoor", "Aryan Malhotra",
    "Disha Pandey", "Varun Saxena", "Riya Agarwal", "Harsh Chopra", "Tanvi Shah",
    "Dev Kulkarni", "Simran Bhatia", "Nikhil Sinha", "Anushka Tiwari", "Yash Bansal",
    "Megha Arora", "Kunal Jain", "Shruti Mishra", "Aakash Khurana", "Nisha Rana",
    "Rohit Bhatt", "Aditi Chawla", "Akshay Dhawan", "Preeti Vyas", "Manish Goyal",
    "Divya Bhardwaj", "Saurabh Thakur", "Komal Dutta", "Pankaj Chauhan", "Swati Ghosh",
  ];
  
  const students: Student[] = [];
  let nameIndex = 0;
  
  for (let i = startId; i <= endId; i++) {
    const mentorId = mentorIds[Math.floor(Math.random() * mentorIds.length)];
    const name = indianNames[nameIndex % indianNames.length];
    const email = name.toLowerCase().replace(" ", ".") + "@student.edu";
    
    // Generate varied performance metrics
    const attendance = Math.floor(Math.random() * 50) + 45; // 45-95%
    const marks = Math.floor(Math.random() * 50) + 40; // 40-90
    const backlogs = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
    const feeOverdue = Math.random() < 0.2 ? Math.floor(Math.random() * 60) : 0;
    
    // Calculate risk score
    let riskScore = 0;
    if (attendance < 65) riskScore += 0.3;
    if (marks < 60) riskScore += 0.25;
    if (backlogs > 0) riskScore += backlogs * 0.15;
    if (feeOverdue > 30) riskScore += 0.2;
    
    const riskLevel: RiskLevel = 
      riskScore >= 0.7 ? "critical" : 
      riskScore >= 0.4 ? "moderate" : "low";
    
    students.push({
      id: `${year}-${i.toString().padStart(2, "0")}`,
      name: `${name} ${i}`,
      email,
      year,
      rollNumber: `${rollPrefix}-${i.toString().padStart(3, "0")}`,
      mentorId,
      attendance30d: attendance,
      attendance90d: attendance + Math.floor(Math.random() * 10) - 5,
      overallAttendance: attendance,
      currentSemesterMarks: marks,
      previousSemesterMarks: marks + Math.floor(Math.random() * 10) - 5,
      backlogs,
      attemptsExhausted: backlogs > 0 ? Math.floor(Math.random() * 2) : 0,
      feeOverdueDays: feeOverdue,
      riskScore,
      riskLevel,
      marksHistory: [
        { month: "Sep", marks: marks + 5 },
        { month: "Oct", marks: marks + 2 },
        { month: "Nov", marks: marks - 2 },
        { month: "Dec", marks },
      ],
      attendanceHistory: [
        { month: "Sep", percentage: attendance + 5 },
        { month: "Oct", percentage: attendance + 2 },
        { month: "Nov", percentage: attendance - 2 },
        { month: "Dec", percentage: attendance },
      ],
    });
    
    nameIndex++;
  }
  
  return students;
}

// Mock Teachers - Multiple teachers per subject
export const mockTeachers: Teacher[] = [
  // Data Structures Teachers
  {
    id: "T-01",
    name: "Dr. Rajiv Malhotra",
    email: "rajiv.malhotra@college.edu",
    subject: "Data Structures",
    classCoordinator: "FE",
    isClassCoordinator: true,
  },
  {
    id: "T-02",
    name: "Prof. Anita Deshmukh",
    email: "anita.deshmukh@college.edu",
    subject: "Data Structures",
    isClassCoordinator: false,
  },
  
  // Database Management Teachers
  {
    id: "T-03",
    name: "Prof. Kavita Desai",
    email: "kavita.desai@college.edu",
    subject: "Database Management",
    classCoordinator: "SE",
    isClassCoordinator: true,
  },
  {
    id: "T-04",
    name: "Dr. Suresh Patil",
    email: "suresh.patil@college.edu",
    subject: "Database Management",
    isClassCoordinator: false,
  },
  
  // Operating Systems Teachers
  {
    id: "T-05",
    name: "Dr. Amit Verma",
    email: "amit.verma@college.edu",
    subject: "Operating Systems",
    classCoordinator: "TE",
    isClassCoordinator: true,
  },
  {
    id: "T-06",
    name: "Prof. Neelam Bose",
    email: "neelam.bose@college.edu",
    subject: "Operating Systems",
    isClassCoordinator: false,
  },
  
  // Machine Learning Teachers
  {
    id: "T-07",
    name: "Prof. Sunita Rao",
    email: "sunita.rao@college.edu",
    subject: "Machine Learning",
    classCoordinator: "BE",
    isClassCoordinator: true,
  },
  {
    id: "T-08",
    name: "Dr. Prakash Joshi",
    email: "prakash.joshi@college.edu",
    subject: "Machine Learning",
    isClassCoordinator: false,
  },
  
  // Computer Networks Teachers
  {
    id: "T-09",
    name: "Dr. Vikram Saxena",
    email: "vikram.saxena@college.edu",
    subject: "Computer Networks",
    isClassCoordinator: false,
  },
  {
    id: "T-10",
    name: "Prof. Ramesh Kulkarni",
    email: "ramesh.kulkarni@college.edu",
    subject: "Computer Networks",
    isClassCoordinator: false,
  },
  
  // Web Technologies Teachers
  {
    id: "T-11",
    name: "Prof. Deepa Chatterjee",
    email: "deepa.chatterjee@college.edu",
    subject: "Web Technologies",
    isClassCoordinator: false,
  },
  {
    id: "T-12",
    name: "Dr. Manish Agrawal",
    email: "manish.agrawal@college.edu",
    subject: "Web Technologies",
    isClassCoordinator: false,
  },
  
  // Algorithms Teachers
  {
    id: "T-13",
    name: "Dr. Priya Mehta",
    email: "priya.mehta@college.edu",
    subject: "Algorithms",
    isClassCoordinator: false,
  },
  {
    id: "T-14",
    name: "Prof. Arun Kumar",
    email: "arun.kumar@college.edu",
    subject: "Algorithms",
    isClassCoordinator: false,
  },
];

// Mock Mentors - 12 mentors for 110 students (max 10 per mentor)
export const mockMentors: Mentor[] = [
  {
    id: "M-01",
    name: "Dr. Rajiv Malhotra",
    email: "rajiv.malhotra@college.edu",
    assignedStudents: ["FE-01", "FE-02", "FE-03", "FE-04", "FE-05", "FE-06", "FE-07", "FE-08", "FE-09", "FE-10"],
    availableSlots: ["Mon 10:00 AM", "Tue 2:00 PM", "Wed 11:00 AM", "Thu 3:00 PM", "Fri 10:00 AM"],
  },
  {
    id: "M-02",
    name: "Prof. Kavita Desai",
    email: "kavita.desai@college.edu",
    assignedStudents: ["FE-11", "FE-12", "FE-13", "FE-14", "FE-15", "FE-16", "FE-17", "FE-18", "FE-19", "FE-20"],
    availableSlots: ["Mon 9:00 AM", "Wed 2:00 PM", "Thu 10:00 AM", "Fri 3:00 PM"],
  },
  {
    id: "M-03",
    name: "Dr. Amit Verma",
    email: "amit.verma@college.edu",
    assignedStudents: ["FE-21", "FE-22", "FE-23", "FE-24", "FE-25", "FE-26", "FE-27", "FE-28", "FE-29", "FE-30"],
    availableSlots: ["Tue 10:00 AM", "Wed 3:00 PM", "Fri 11:00 AM"],
  },
  {
    id: "M-04",
    name: "Prof. Sunita Rao",
    email: "sunita.rao@college.edu",
    assignedStudents: ["SE-31", "SE-32", "SE-33", "SE-34", "SE-35", "SE-36", "SE-37", "SE-38", "SE-39", "SE-40"],
    availableSlots: ["Mon 1:00 PM", "Tue 11:00 AM", "Thu 2:00 PM", "Fri 9:00 AM"],
  },
  {
    id: "M-05",
    name: "Dr. Vikram Saxena",
    email: "vikram.saxena@college.edu",
    assignedStudents: ["SE-41", "SE-42", "SE-43", "SE-44", "SE-45", "SE-46", "SE-47", "SE-48", "SE-49", "SE-50"],
    availableSlots: ["Mon 11:00 AM", "Wed 1:00 PM", "Thu 4:00 PM"],
  },
  {
    id: "M-06",
    name: "Prof. Deepa Chatterjee",
    email: "deepa.chatterjee@college.edu",
    assignedStudents: ["SE-51", "SE-52", "SE-53", "SE-54", "SE-55", "SE-56", "SE-57", "SE-58", "SE-59", "SE-60"],
    availableSlots: ["Tue 9:00 AM", "Wed 10:00 AM", "Fri 2:00 PM"],
  },
  {
    id: "M-07",
    name: "Dr. Suresh Patil",
    email: "suresh.patil@college.edu",
    assignedStudents: ["TE-61", "TE-62", "TE-63", "TE-64", "TE-65", "TE-66", "TE-67", "TE-68", "TE-69"],
    availableSlots: ["Mon 2:00 PM", "Tue 1:00 PM", "Thu 11:00 AM", "Fri 1:00 PM"],
  },
  {
    id: "M-08",
    name: "Prof. Anita Deshmukh",
    email: "anita.deshmukh@college.edu",
    assignedStudents: ["TE-70", "TE-71", "TE-72", "TE-73", "TE-74", "TE-75", "TE-76", "TE-77", "TE-78"],
    availableSlots: ["Mon 3:00 PM", "Wed 9:00 AM", "Fri 4:00 PM"],
  },
  {
    id: "M-09",
    name: "Dr. Neelam Bose",
    email: "neelam.bose@college.edu",
    assignedStudents: ["TE-79", "TE-80", "TE-81", "TE-82", "TE-83", "TE-84", "TE-85"],
    availableSlots: ["Tue 3:00 PM", "Thu 9:00 AM", "Fri 12:00 PM"],
  },
  {
    id: "M-10",
    name: "Dr. Prakash Joshi",
    email: "prakash.joshi@college.edu",
    assignedStudents: ["BE-86", "BE-87", "BE-88", "BE-89", "BE-90", "BE-91", "BE-92", "BE-93", "BE-94"],
    availableSlots: ["Mon 10:00 AM", "Wed 11:00 AM", "Thu 1:00 PM"],
  },
  {
    id: "M-11",
    name: "Prof. Ramesh Kulkarni",
    email: "ramesh.kulkarni@college.edu",
    assignedStudents: ["BE-95", "BE-96", "BE-97", "BE-98", "BE-99", "BE-100", "BE-101", "BE-102", "BE-103"],
    availableSlots: ["Tue 2:00 PM", "Wed 4:00 PM", "Fri 10:00 AM"],
  },
  {
    id: "M-12",
    name: "Dr. Manish Agrawal",
    email: "manish.agrawal@college.edu",
    assignedStudents: ["BE-104", "BE-105", "BE-106", "BE-107", "BE-108", "BE-109", "BE-110"],
    availableSlots: ["Mon 9:00 AM", "Thu 10:00 AM", "Fri 3:00 PM"],
  },
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: "MTG-001",
    studentId: "FE-01",
    mentorId: "M-01",
    date: "2024-01-25",
    time: "10:00",
    type: "auto-scheduled",
    status: "confirmed",
    mode: "offline",
  },
  {
    id: "MTG-002",
    studentId: "TE-55",
    mentorId: "M-03",
    date: "2024-01-25",
    time: "13:00",
    type: "auto-scheduled",
    status: "pending",
    mode: "online",
  },
  {
    id: "MTG-003",
    studentId: "FE-02",
    mentorId: "M-01",
    date: "2024-01-26",
    time: "11:00",
    type: "suggested",
    status: "pending",
    mode: "offline",
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "N-001",
    userId: "M-01",
    title: "Critical Risk Alert",
    message: "Student Aarav Sharma (FE-01) flagged as CRITICAL risk. Meeting auto-scheduled for Jan 25, 10:00 AM.",
    type: "alert",
    read: false,
    timestamp: "2024-01-24T09:00:00Z",
  },
  {
    id: "N-002",
    userId: "FE-01",
    title: "Counseling Session Scheduled",
    message: "Your counseling session with Dr. Kavita Desai is scheduled for Jan 25, 10:00 AM (Offline).",
    type: "meeting",
    read: false,
    timestamp: "2024-01-24T09:05:00Z",
  },
  {
    id: "N-003",
    userId: "M-02",
    title: "Meeting Request",
    message: "Kavya Reddy has requested a counseling session.",
    type: "meeting",
    read: true,
    timestamp: "2024-01-23T14:30:00Z",
  },
];

export const hodInfo = {
  id: "HOD-01",
  name: "Dr. Suresh Choudhary",
  email: "suresh.choudhary@college.edu",
  department: "Computer Engineering",
};

export const adminInfo = {
  id: "ADMIN-01",
  name: "Principal Ramesh Kulkarni",
  email: "admin@college.edu",
};