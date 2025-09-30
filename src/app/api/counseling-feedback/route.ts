import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { counselingFeedback, schedules, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const mentorId = searchParams.get('mentorId');
    const scheduleId = searchParams.get('scheduleId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(counselingFeedback);

    // Build filter conditions
    const conditions = [];
    
    if (studentId) {
      if (isNaN(parseInt(studentId))) {
        return NextResponse.json({ 
          error: "Valid student ID is required",
          code: "INVALID_STUDENT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(counselingFeedback.studentId, parseInt(studentId)));
    }
    
    if (mentorId) {
      if (isNaN(parseInt(mentorId))) {
        return NextResponse.json({ 
          error: "Valid mentor ID is required",
          code: "INVALID_MENTOR_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(counselingFeedback.mentorId, parseInt(mentorId)));
    }
    
    if (scheduleId) {
      if (isNaN(parseInt(scheduleId))) {
        return NextResponse.json({ 
          error: "Valid schedule ID is required",
          code: "INVALID_SCHEDULE_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(counselingFeedback.scheduleId, parseInt(scheduleId)));
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(counselingFeedback.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, studentId, mentorId, feedbackText, riskFactors, recommendations, followUpRequired } = body;

    // Validate required fields
    if (!feedbackText) {
      return NextResponse.json({ 
        error: "Feedback text is required",
        code: "MISSING_FEEDBACK_TEXT" 
      }, { status: 400 });
    }

    if (!scheduleId) {
      return NextResponse.json({ 
        error: "Schedule ID is required",
        code: "MISSING_SCHEDULE_ID" 
      }, { status: 400 });
    }

    if (!studentId) {
      return NextResponse.json({ 
        error: "Student ID is required",
        code: "MISSING_STUDENT_ID" 
      }, { status: 400 });
    }

    if (!mentorId) {
      return NextResponse.json({ 
        error: "Mentor ID is required",
        code: "MISSING_MENTOR_ID" 
      }, { status: 400 });
    }

    // Validate IDs are valid integers
    if (isNaN(parseInt(scheduleId))) {
      return NextResponse.json({ 
        error: "Valid schedule ID is required",
        code: "INVALID_SCHEDULE_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(studentId))) {
      return NextResponse.json({ 
        error: "Valid student ID is required",
        code: "INVALID_STUDENT_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(mentorId))) {
      return NextResponse.json({ 
        error: "Valid mentor ID is required",
        code: "INVALID_MENTOR_ID" 
      }, { status: 400 });
    }

    // Validate referenced records exist
    const schedule = await db.select()
      .from(schedules)
      .where(eq(schedules.id, parseInt(scheduleId)))
      .limit(1);

    if (schedule.length === 0) {
      return NextResponse.json({ 
        error: "Schedule not found",
        code: "SCHEDULE_NOT_FOUND" 
      }, { status: 404 });
    }

    const student = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(studentId)))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json({ 
        error: "Student not found",
        code: "STUDENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const mentor = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(mentorId)))
      .limit(1);

    if (mentor.length === 0) {
      return NextResponse.json({ 
        error: "Mentor not found",
        code: "MENTOR_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare data for insertion
    const insertData = {
      scheduleId: parseInt(scheduleId),
      studentId: parseInt(studentId),
      mentorId: parseInt(mentorId),
      feedbackText: feedbackText.trim(),
      riskFactors: riskFactors ? riskFactors.trim() : null,
      recommendations: recommendations ? recommendations.trim() : null,
      followUpRequired: followUpRequired || false,
      createdAt: new Date().toISOString()
    };

    const newFeedback = await db.insert(counselingFeedback)
      .values(insertData)
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });

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

    const body = await request.json();
    const { feedbackText, riskFactors, recommendations, followUpRequired } = body;

    // Check if record exists
    const existingFeedback = await db.select()
      .from(counselingFeedback)
      .where(eq(counselingFeedback.id, parseInt(id)))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate feedbackText if provided
    if (feedbackText !== undefined && !feedbackText) {
      return NextResponse.json({ 
        error: "Feedback text cannot be empty",
        code: "EMPTY_FEEDBACK_TEXT" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (feedbackText !== undefined) {
      updateData.feedbackText = feedbackText.trim();
    }
    
    if (riskFactors !== undefined) {
      updateData.riskFactors = riskFactors ? riskFactors.trim() : null;
    }
    
    if (recommendations !== undefined) {
      updateData.recommendations = recommendations ? recommendations.trim() : null;
    }
    
    if (followUpRequired !== undefined) {
      updateData.followUpRequired = followUpRequired;
    }

    const updated = await db.update(counselingFeedback)
      .set(updateData)
      .where(eq(counselingFeedback.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

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
    const existingFeedback = await db.select()
      .from(counselingFeedback)
      .where(eq(counselingFeedback.id, parseInt(id)))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(counselingFeedback)
      .where(eq(counselingFeedback.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Feedback deleted successfully',
      deletedFeedback: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}