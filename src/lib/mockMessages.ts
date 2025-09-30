export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: "direct" | "announcement";
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const mockMessages: Message[] = [
  // Messages for FE-01 (Aarav Sharma - student)
  {
    id: "MSG-001",
    senderId: "M-01",
    senderName: "Dr. Kavita Desai",
    senderRole: "Mentor",
    receiverId: "FE-01",
    receiverName: "Aarav Sharma",
    content: "Hi Aarav, I noticed your attendance has been dropping. Is everything okay? Let's schedule a meeting to discuss.",
    timestamp: "2024-01-24T10:30:00Z",
    read: true,
    type: "direct",
  },
  {
    id: "MSG-002",
    senderId: "FE-01",
    senderName: "Aarav Sharma",
    senderRole: "Student",
    receiverId: "M-01",
    receiverName: "Dr. Kavita Desai",
    content: "Yes ma'am, I've been facing some family issues. I would like to meet and discuss.",
    timestamp: "2024-01-24T14:15:00Z",
    read: true,
    type: "direct",
  },
  {
    id: "MSG-003",
    senderId: "M-01",
    senderName: "Dr. Kavita Desai",
    senderRole: "Mentor",
    receiverId: "FE-01",
    receiverName: "Aarav Sharma",
    content: "I've scheduled a meeting for tomorrow at 10:00 AM. We'll work through this together.",
    timestamp: "2024-01-24T15:00:00Z",
    read: false,
    type: "direct",
  },
  {
    id: "MSG-004",
    senderId: "T-01",
    senderName: "Dr. Rajiv Malhotra",
    senderRole: "Teacher",
    receiverId: "FE-01",
    receiverName: "Aarav Sharma",
    content: "Please submit your pending Data Structures assignment by Friday.",
    timestamp: "2024-01-23T09:00:00Z",
    read: true,
    type: "direct",
  },

  // Messages for Mentor M-01 (Dr. Kavita Desai)
  {
    id: "MSG-005",
    senderId: "FE-02",
    senderName: "Diya Patel",
    senderRole: "Student",
    receiverId: "M-01",
    receiverName: "Dr. Kavita Desai",
    content: "Ma'am, can I reschedule tomorrow's meeting? I have a medical appointment.",
    timestamp: "2024-01-24T16:30:00Z",
    read: false,
    type: "direct",
  },
  {
    id: "MSG-006",
    senderId: "BE-73",
    senderName: "Rajesh Yadav",
    senderRole: "Student",
    receiverId: "M-01",
    receiverName: "Dr. Kavita Desai",
    content: "Thank you for the guidance in our last session. I'm working on improving my attendance.",
    timestamp: "2024-01-23T11:00:00Z",
    read: true,
    type: "direct",
  },
  {
    id: "MSG-007",
    senderId: "HOD-01",
    senderName: "Dr. Suresh Choudhary",
    senderRole: "HOD",
    receiverId: "M-01",
    receiverName: "Dr. Kavita Desai",
    content: "Please submit the monthly counseling report by end of week.",
    timestamp: "2024-01-22T14:00:00Z",
    read: true,
    type: "direct",
  },

  // Messages for Teacher T-01 (Dr. Rajiv Malhotra)
  {
    id: "MSG-008",
    senderId: "HOD-01",
    senderName: "Dr. Suresh Choudhary",
    senderRole: "HOD",
    receiverId: "T-01",
    receiverName: "Dr. Rajiv Malhotra",
    content: "Faculty meeting scheduled for Friday at 3:00 PM. Please ensure attendance.",
    timestamp: "2024-01-24T12:00:00Z",
    read: false,
    type: "direct",
  },
  {
    id: "MSG-009",
    senderId: "FE-03",
    senderName: "Arjun Kumar",
    senderRole: "Student",
    receiverId: "T-01",
    receiverName: "Dr. Rajiv Malhotra",
    content: "Sir, I have a doubt in the sorting algorithms topic. Can we discuss?",
    timestamp: "2024-01-23T16:00:00Z",
    read: true,
    type: "direct",
  },

  // Messages for HOD
  {
    id: "MSG-010",
    senderId: "M-02",
    senderName: "Dr. Amit Verma",
    senderRole: "Mentor",
    receiverId: "HOD-01",
    receiverName: "Dr. Suresh Choudhary",
    content: "Two students in SE batch require immediate intervention. Please review.",
    timestamp: "2024-01-24T11:30:00Z",
    read: false,
    type: "direct",
  },
  {
    id: "MSG-011",
    senderId: "T-03",
    senderName: "Dr. Amit Verma",
    senderRole: "Teacher",
    receiverId: "HOD-01",
    receiverName: "Dr. Suresh Choudhary",
    content: "TE batch performance report submitted in the portal.",
    timestamp: "2024-01-23T13:00:00Z",
    read: true,
    type: "direct",
  },

  // Announcements
  {
    id: "MSG-012",
    senderId: "HOD-01",
    senderName: "Dr. Suresh Choudhary",
    senderRole: "HOD",
    receiverId: "ALL",
    receiverName: "All Students",
    content: "Reminder: Mid-semester exams begin next week. Ensure all backlogs are cleared.",
    timestamp: "2024-01-24T09:00:00Z",
    read: false,
    type: "announcement",
  },
];

export function getConversationsForUser(userId: string): Conversation[] {
  const userMessages = mockMessages.filter(
    (msg) => msg.senderId === userId || msg.receiverId === userId
  );

  const conversationMap = new Map<string, Conversation>();

  userMessages.forEach((msg) => {
    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const otherUserName = msg.senderId === userId ? msg.receiverName : msg.senderName;
    const otherUserRole = msg.senderId === userId ? "unknown" : msg.senderRole;

    if (otherUserId === "ALL") return; // Skip announcements in conversations

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        userName: otherUserName,
        userRole: otherUserRole,
        lastMessage: msg.content,
        lastMessageTime: msg.timestamp,
        unreadCount: 0,
      });
    }

    const conversation = conversationMap.get(otherUserId)!;
    const msgTime = new Date(msg.timestamp).getTime();
    const lastTime = new Date(conversation.lastMessageTime).getTime();

    if (msgTime > lastTime) {
      conversation.lastMessage = msg.content;
      conversation.lastMessageTime = msg.timestamp;
    }

    if (msg.receiverId === userId && !msg.read) {
      conversation.unreadCount++;
    }
  });

  return Array.from(conversationMap.values()).sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
}

export function getMessagesForConversation(
  userId: string,
  otherUserId: string
): Message[] {
  return mockMessages
    .filter(
      (msg) =>
        (msg.senderId === userId && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === userId)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getAnnouncementsForUser(userRole: string): Message[] {
  return mockMessages
    .filter((msg) => msg.type === "announcement" && (msg.receiverId === "ALL" || msg.receiverId.includes(userRole)))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}