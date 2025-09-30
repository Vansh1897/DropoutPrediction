import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schedules, users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Query parameters
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(schedules);
    let conditions = [];

    // Handle userId and role filtering
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      if (role === 'student') {
        conditions.push(eq(schedules.studentId, userIdInt));
      } else if (role === 'mentor') {
        conditions.push(eq(schedules.mentorId, userIdInt));
      } else {
        // If no role specified, return schedules where user is either student or mentor
        conditions.push(or(
          eq(schedules.studentId, userIdInt),
          eq(schedules.mentorId, userIdInt)
        ));
      }
    }

    // Status filtering
    if (status) {
      conditions.push(eq(schedules.status, status));
    }

    // Search functionality
    if (search) {
      conditions.push(or(
        like(schedules.title, `%${search}%`),
        like(schedules.description, `%${search}%`),
        like(schedules.notes, `%${search}%`)
      ));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = schedules[sort as keyof typeof schedules] || schedules.createdAt;
    if (order === 'asc') {
      query = query.orderBy(asc(sortField));
    } else {
      query = query.orderBy(desc(sortField));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {
      studentId,
      mentorId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      meetingMode,
      status,
      meetingLink,
      location,
      notes
    } = requestBody;

    // Validate required fields
    if (!studentId || isNaN(parseInt(studentId))) {
      return NextResponse.json({ 
        error: "Valid studentId is required",
        code: "MISSING_STUDENT_ID" 
      }, { status: 400 });
    }

    if (!mentorId || isNaN(parseInt(mentorId))) {
      return NextResponse.json({ 
        error: "Valid mentorId is required",
        code: "MISSING_MENTOR_ID" 
      }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!scheduledDate || typeof scheduledDate !== 'string' || scheduledDate.trim().length === 0) {
      return NextResponse.json({ 
        error: "Scheduled date is required",
        code: "MISSING_SCHEDULED_DATE" 
      }, { status: 400 });
    }

    if (!scheduledTime || typeof scheduledTime !== 'string' || scheduledTime.trim().length === 0) {
      return NextResponse.json({ 
        error: "Scheduled time is required",
        code: "MISSING_SCHEDULED_TIME" 
      }, { status: 400 });
    }

    if (!meetingMode || typeof meetingMode !== 'string' || !['online', 'offline'].includes(meetingMode)) {
      return NextResponse.json({ 
        error: "Meeting mode must be 'online' or 'offline'",
        code: "INVALID_MEETING_MODE" 
      }, { status: 400 });
    }

    // Validate that studentId and mentorId reference existing users
    const studentExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(studentId)))
      .limit(1);

    if (studentExists.length === 0) {
      return NextResponse.json({ 
        error: "Student not found",
        code: "STUDENT_NOT_FOUND" 
      }, { status: 400 });
    }

    const mentorExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(mentorId)))
      .limit(1);

    if (mentorExists.length === 0) {
      return NextResponse.json({ 
        error: "Mentor not found",
        code: "MENTOR_NOT_FOUND" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and auto-generated fields
    const insertData = {
      studentId: parseInt(studentId),
      mentorId: parseInt(mentorId),
      title: title.trim(),
      description: description ? description.trim() : null,
      scheduledDate: scheduledDate.trim(),
      scheduledTime: scheduledTime.trim(),
      durationMinutes: durationMinutes || 30,
      meetingMode,
      status: status || 'scheduled',
      meetingLink: meetingLink ? meetingLink.trim() : null,
      location: location ? location.trim() : null,
      notes: notes ? notes.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSchedule = await db.insert(schedules)
      .values(insertData)
      .returning();

    return NextResponse.json(newSchedule[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const {
      studentId,
      mentorId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      meetingMode,
      status,
      meetingLink,
      location,
      notes
    } = requestBody;

    // Check if record exists
    const existingSchedule = await db.select()
      .from(schedules)
      .where(eq(schedules.id, parseInt(id)))
      .limit(1);

    if (existingSchedule.length === 0) {
      return NextResponse.json({ 
        error: 'Schedule not found' 
      }, { status: 404 });
    }

    // Validate fields if provided
    if (studentId !== undefined) {
      if (isNaN(parseInt(studentId))) {
        return NextResponse.json({ 
          error: "Valid studentId is required",
          code: "INVALID_STUDENT_ID" 
        }, { status: 400 });
      }

      const studentExists = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, parseInt(studentId)))
        .limit(1);

      if (studentExists.length === 0) {
        return NextResponse.json({ 
          error: "Student not found",
          code: "STUDENT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    if (mentorId !== undefined) {
      if (isNaN(parseInt(mentorId))) {
        return NextResponse.json({ 
          error: "Valid mentorId is required",
          code: "INVALID_MENTOR_ID" 
        }, { status: 400 });
      }

      const mentorExists = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, parseInt(mentorId)))
        .limit(1);

      if (mentorExists.length === 0) {
        return NextResponse.json({ 
          error: "Mentor not found",
          code: "MENTOR_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json({ 
        error: "Title cannot be empty",
        code: "INVALID_TITLE" 
      }, { status: 400 });
    }

    if (meetingMode !== undefined && !['online', 'offline'].includes(meetingMode)) {
      return NextResponse.json({ 
        error: "Meeting mode must be 'online' or 'offline'",
        code: "INVALID_MEETING_MODE" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (studentId !== undefined) updateData.studentId = parseInt(studentId);
    if (mentorId !== undefined) updateData.mentorId = parseInt(mentorId);
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate.trim();
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime.trim();
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (meetingMode !== undefined) updateData.meetingMode = meetingMode;
    if (status !== undefined) updateData.status = status;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink ? meetingLink.trim() : null;
    if (location !== undefined) updateData.location = location ? location.trim() : null;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    const updated = await db.update(schedules)
      .set(updateData)
      .where(eq(schedules.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingSchedule = await db.select()
      .from(schedules)
      .where(eq(schedules.id, parseInt(id)))
      .limit(1);

    if (existingSchedule.length === 0) {
      return NextResponse.json({ 
        error: 'Schedule not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(schedules)
      .where(eq(schedules.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Schedule deleted successfully',
      deleted: deleted[0] 
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}