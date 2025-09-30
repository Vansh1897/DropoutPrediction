import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  year: text('year'),
  rollNumber: text('roll_number'),
  createdAt: text('created_at').notNull(),
});

export const studentMentorRelationships = sqliteTable('student_mentor_relationships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => users.id).notNull(),
  mentorId: integer('mentor_id').references(() => users.id).notNull(),
  assignedAt: text('assigned_at').notNull(),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => users.id).notNull(),
  mentorId: integer('mentor_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  durationMinutes: integer('duration_minutes').default(30),
  meetingMode: text('meeting_mode').notNull(),
  status: text('status').notNull().default('scheduled'),
  meetingLink: text('meeting_link'),
  location: text('location'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const counselingFeedback = sqliteTable('counseling_feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scheduleId: integer('schedule_id').references(() => schedules.id).notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  mentorId: integer('mentor_id').references(() => users.id).notNull(),
  feedbackText: text('feedback_text').notNull(),
  riskFactors: text('risk_factors'),
  recommendations: text('recommendations'),
  followUpRequired: integer('follow_up_required', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});