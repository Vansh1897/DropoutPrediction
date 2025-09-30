import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { studentMentorRelationships, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const studentId = searchParams.get('studentId');
    const mentorId = searchParams.get('mentorId');

    let query = db.select().from(studentMentorRelationships);
    
    // Build conditions array
    const conditions = [];
    
    if (studentId) {
      const parsedStudentId = parseInt(studentId);
      if (isNaN(parsedStudentId)) {
        return NextResponse.json({ 
          error: "Invalid studentId parameter",
          code: "INVALID_STUDENT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(studentMentorRelationships.studentId, parsedStudentId));
    }
    
    if (mentorId) {
      const parsedMentorId = parseInt(mentorId);
      if (isNaN(parsedMentorId)) {
        return NextResponse.json({ 
          error: "Invalid mentorId parameter",
          code: "INVALID_MENTOR_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(studentMentorRelationships.mentorId, parsedMentorId));
    }
    
    // Apply conditions if any exist
    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else if (conditions.length === 2) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.limit(limit).offset(offset);
    
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
    const requestBody = await request.json();
    const { studentId, mentorId } = requestBody;
    
    // Validate required fields
    if (!studentId) {
      return NextResponse.json({ 
        error: "studentId is required",
        code: "MISSING_STUDENT_ID" 
      }, { status: 400 });
    }
    
    if (!mentorId) {
      return NextResponse.json({ 
        error: "mentorId is required",
        code: "MISSING_MENTOR_ID" 
      }, { status: 400 });
    }
    
    // Validate IDs are valid integers
    const parsedStudentId = parseInt(studentId);
    const parsedMentorId = parseInt(mentorId);
    
    if (isNaN(parsedStudentId)) {
      return NextResponse.json({ 
        error: "studentId must be a valid integer",
        code: "INVALID_STUDENT_ID" 
      }, { status: 400 });
    }
    
    if (isNaN(parsedMentorId)) {
      return NextResponse.json({ 
        error: "mentorId must be a valid integer",
        code: "INVALID_MENTOR_ID" 
      }, { status: 400 });
    }
    
    // Validate that both studentId and mentorId reference valid users
    const student = await db.select()
      .from(users)
      .where(eq(users.id, parsedStudentId))
      .limit(1);
      
    if (student.length === 0) {
      return NextResponse.json({ 
        error: "Student not found",
        code: "STUDENT_NOT_FOUND" 
      }, { status: 400 });
    }
    
    const mentor = await db.select()
      .from(users)
      .where(eq(users.id, parsedMentorId))
      .limit(1);
      
    if (mentor.length === 0) {
      return NextResponse.json({ 
        error: "Mentor not found",
        code: "MENTOR_NOT_FOUND" 
      }, { status: 400 });
    }
    
    // Check if relationship already exists
    const existingRelationship = await db.select()
      .from(studentMentorRelationships)
      .where(and(
        eq(studentMentorRelationships.studentId, parsedStudentId),
        eq(studentMentorRelationships.mentorId, parsedMentorId)
      ))
      .limit(1);
      
    if (existingRelationship.length > 0) {
      return NextResponse.json({ 
        error: "Relationship already exists between this student and mentor",
        code: "RELATIONSHIP_EXISTS" 
      }, { status: 400 });
    }
    
    // Create new relationship
    const newRelationship = await db.insert(studentMentorRelationships)
      .values({
        studentId: parsedStudentId,
        mentorId: parsedMentorId,
        assignedAt: new Date().toISOString()
      })
      .returning();
    
    return NextResponse.json(newRelationship[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
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
    
    const parsedId = parseInt(id);
    
    // Check if relationship exists
    const existing = await db.select()
      .from(studentMentorRelationships)
      .where(eq(studentMentorRelationships.id, parsedId))
      .limit(1);
    
    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Relationship not found' 
      }, { status: 404 });
    }
    
    // Delete relationship
    const deleted = await db.delete(studentMentorRelationships)
      .where(eq(studentMentorRelationships.id, parsedId))
      .returning();
    
    return NextResponse.json({
      message: 'Relationship deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}