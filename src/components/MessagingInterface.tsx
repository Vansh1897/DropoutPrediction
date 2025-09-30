"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export function MessagingInterface({ onClose }: { onClose?: () => void }) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Dr. Kavita Desai (Mentor)",
      lastMessage: "Your meeting is scheduled for tomorrow",
      timestamp: "2 hours ago",
      unread: 2,
    },
    {
      id: "2",
      name: "Prof. Rajiv Malhotra (Teacher)",
      lastMessage: "Please submit your assignment",
      timestamp: "1 day ago",
      unread: 0,
    },
    {
      id: "3",
      name: "HOD - Computer Engineering",
      lastMessage: "Department meeting on Friday",
      timestamp: "2 days ago",
      unread: 1,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      senderId: "mentor",
      senderName: "Dr. Kavita Desai",
      content: "Hello! I noticed your attendance has been low lately. Is everything okay?",
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      senderId: "me",
      senderName: "Me",
      content: "Hi ma'am, I've been having some health issues. I'm recovering now.",
      timestamp: "10:45 AM",
      isOwn: true,
    },
    {
      id: "3",
      senderId: "mentor",
      senderName: "Dr. Kavita Desai",
      content: "I understand. Let's schedule a meeting to discuss how we can help you catch up. Your meeting is scheduled for tomorrow at 10:00 AM.",
      timestamp: "11:00 AM",
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success("Message sent");
    setMessageText("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-[600px] flex">
      {/* Conversations List */}
      <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 border-r`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[calc(600px-73px)]">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                selectedConversation === conv.id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(conv.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm truncate">{conv.name}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className={`${selectedConversation ? "block" : "hidden md:block"} flex-1 flex flex-col`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  KD
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Dr. Kavita Desai</p>
                <p className="text-xs text-muted-foreground">Mentor</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}