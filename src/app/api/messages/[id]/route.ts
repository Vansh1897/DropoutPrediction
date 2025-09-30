import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
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
        error: "Valid message ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { read, content } = body;

    // Validate that at least one field is provided for update
    if (read === undefined && content === undefined) {
      return NextResponse.json({
        error: "At least one field (read or content) must be provided for update",
        code: "NO_UPDATE_FIELDS"
      }, { status: 400 });
    }

    // Validate field types if provided
    if (read !== undefined && typeof read !== 'boolean') {
      return NextResponse.json({
        error: "Read status must be a boolean value",
        code: "INVALID_READ_TYPE"
      }, { status: 400 });
    }

    if (content !== undefined && (typeof content !== 'string' || content.trim().length === 0)) {
      return NextResponse.json({
        error: "Content must be a non-empty string",
        code: "INVALID_CONTENT"
      }, { status: 400 });
    }

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({
        error: "Message not found",
        code: "MESSAGE_NOT_FOUND"
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (read !== undefined) {
      updateData.read = read;
    }

    if (content !== undefined) {
      updateData.content = content.trim();
    }

    // Update the message
    const updatedMessage = await db.update(messages)
      .set(updateData)
      .where(eq(messages.id, messageId))
      .returning();

    if (updatedMessage.length === 0) {
      return NextResponse.json({
        error: "Failed to update message",
        code: "UPDATE_FAILED"
      }, { status: 500 });
    }

    return NextResponse.json(updatedMessage[0], { status: 200 });

  } catch (error) {
    console.error('PATCH /api/messages/[id] error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  }
}