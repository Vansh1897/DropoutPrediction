import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schedules } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid schedule ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const scheduleId = parseInt(id);

    // Parse request body
    const requestBody = await request.json();
    const {
      status,
      scheduledDate,
      scheduledTime,
      title,
      description,
      meetingMode,
      meetingLink,
      location,
      notes,
      durationMinutes
    } = requestBody;

    // Validate meetingMode if provided
    if (meetingMode && !['online', 'offline'].includes(meetingMode)) {
      return NextResponse.json({ 
        error: "Meeting mode must be 'online' or 'offline'",
        code: "INVALID_MEETING_MODE" 
      }, { status: 400 });
    }

    // Validate durationMinutes if provided
    if (durationMinutes !== undefined && (isNaN(parseInt(durationMinutes)) || parseInt(durationMinutes) <= 0)) {
      return NextResponse.json({ 
        error: "Duration minutes must be a positive number",
        code: "INVALID_DURATION" 
      }, { status: 400 });
    }

    // Check if schedule exists
    const existingSchedule = await db.select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId))
      .limit(1);

    if (existingSchedule.length === 0) {
      return NextResponse.json({ 
        error: 'Schedule not found',
        code: "SCHEDULE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data - only include provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (status !== undefined) updateData.status = status;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (meetingMode !== undefined) updateData.meetingMode = meetingMode;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);

    // Update the schedule
    const updatedSchedule = await db.update(schedules)
      .set(updateData)
      .where(eq(schedules.id, scheduleId))
      .returning();

    if (updatedSchedule.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update schedule',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updatedSchedule[0], { status: 200 });

  } catch (error) {
    console.error('PATCH schedule error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}