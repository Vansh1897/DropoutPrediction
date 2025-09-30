import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationWith = searchParams.get('conversationWith');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(messages);

    // Special query logic based on parameters
    if (userId && conversationWith) {
      // Show conversation between two specific users
      const userIdInt = parseInt(userId);
      const conversationWithInt = parseInt(conversationWith);
      
      if (isNaN(userIdInt) || isNaN(conversationWithInt)) {
        return NextResponse.json({ 
          error: "Valid user IDs are required",
          code: "INVALID_USER_IDS" 
        }, { status: 400 });
      }

      query = query.where(
        or(
          and(eq(messages.senderId, userIdInt), eq(messages.receiverId, conversationWithInt)),
          and(eq(messages.senderId, conversationWithInt), eq(messages.receiverId, userIdInt))
        )
      );
    } else if (userId) {
      // Show all messages for a specific user (sent or received)
      const userIdInt = parseInt(userId);
      
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      query = query.where(
        or(
          eq(messages.senderId, userIdInt),
          eq(messages.receiverId, userIdInt)
        )
      );
    }

    // Add search functionality across content
    if (search) {
      const searchCondition = like(messages.content, `%${search}%`);
      
      if (userId || conversationWith) {
        // Combine with existing conditions
        const existingWhere = query.toSQL().where;
        query = query.where(and(existingWhere, searchCondition));
      } else {
        query = query.where(searchCondition);
      }
    }

    // Order by createdAt DESC for conversation view
    const results = await query
      .orderBy(desc(messages.createdAt))
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
    const requestBody = await request.json();
    const { senderId, receiverId, content } = requestBody;

    // Validate required fields
    if (!senderId) {
      return NextResponse.json({ 
        error: "Sender ID is required",
        code: "MISSING_SENDER_ID" 
      }, { status: 400 });
    }

    if (!receiverId) {
      return NextResponse.json({ 
        error: "Receiver ID is required",
        code: "MISSING_RECEIVER_ID" 
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ 
        error: "Content is required and must be a non-empty string",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    // Validate that senderId and receiverId are valid integers
    const senderIdInt = parseInt(senderId);
    const receiverIdInt = parseInt(receiverId);

    if (isNaN(senderIdInt) || isNaN(receiverIdInt)) {
      return NextResponse.json({ 
        error: "Sender ID and Receiver ID must be valid integers",
        code: "INVALID_USER_IDS" 
      }, { status: 400 });
    }

    // Validate that sender and receiver exist in users table
    const sender = await db.select().from(users).where(eq(users.id, senderIdInt)).limit(1);
    if (sender.length === 0) {
      return NextResponse.json({ 
        error: "Sender user not found",
        code: "SENDER_NOT_FOUND" 
      }, { status: 400 });
    }

    const receiver = await db.select().from(users).where(eq(users.id, receiverIdInt)).limit(1);
    if (receiver.length === 0) {
      return NextResponse.json({ 
        error: "Receiver user not found",
        code: "RECEIVER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Prevent sending message to self
    if (senderIdInt === receiverIdInt) {
      return NextResponse.json({ 
        error: "Cannot send message to yourself",
        code: "SELF_MESSAGE_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Create new message with auto-generated fields
    const newMessage = await db.insert(messages)
      .values({
        senderId: senderIdInt,
        receiverId: receiverIdInt,
        content: content.trim(),
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
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
    const requestBody = await request.json();

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ 
        error: 'Message not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Only allow updating specific fields
    if ('content' in requestBody && requestBody.content !== undefined) {
      if (typeof requestBody.content !== 'string' || requestBody.content.trim() === '') {
        return NextResponse.json({ 
          error: "Content must be a non-empty string",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }
      updates.content = requestBody.content.trim();
    }

    if ('read' in requestBody && requestBody.read !== undefined) {
      if (typeof requestBody.read !== 'boolean') {
        return NextResponse.json({ 
          error: "Read status must be a boolean",
          code: "INVALID_READ_STATUS" 
        }, { status: 400 });
      }
      updates.read = requestBody.read;
    }

    // Don't allow updating senderId or receiverId
    if ('senderId' in requestBody || 'receiverId' in requestBody) {
      return NextResponse.json({ 
        error: "Sender ID and Receiver ID cannot be updated",
        code: "IMMUTABLE_FIELDS" 
      }, { status: 400 });
    }

    // Update the message
    const updated = await db.update(messages)
      .set(updates)
      .where(eq(messages.id, messageId))
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ 
        error: 'Message not found' 
      }, { status: 404 });
    }

    // Delete the message
    const deleted = await db.delete(messages)
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json({
      message: 'Message deleted successfully',
      deletedMessage: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}