import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const VALID_ROLES = ['student', 'mentor', 'hod', 'teacher', 'admin'];
const VALID_YEARS = ['FE', 'SE', 'TE', 'BE'];

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user[0]);
    }

    // List users with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const year = searchParams.get('year');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(users);
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      ));
    }

    // Role filter
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ 
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      conditions.push(eq(users.role, role));
    }

    // Year filter
    if (year) {
      if (!VALID_YEARS.includes(year)) {
        return NextResponse.json({ 
          error: `Invalid year. Must be one of: ${VALID_YEARS.join(', ')}`,
          code: "INVALID_YEAR" 
        }, { status: 400 });
      }
      conditions.push(eq(users.year, year));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'name') {
      query = query.orderBy(orderBy(users.name));
    } else if (sort === 'email') {
      query = query.orderBy(orderBy(users.email));
    } else if (sort === 'role') {
      query = query.orderBy(orderBy(users.role));
    } else {
      query = query.orderBy(orderBy(users.createdAt));
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
    const { name, email, role, year, rollNumber } = requestBody;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ 
        error: "Role is required",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email.trim())) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ 
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Validate year if provided
    if (year && !VALID_YEARS.includes(year)) {
      return NextResponse.json({ 
        error: `Invalid year. Must be one of: ${VALID_YEARS.join(', ')}`,
        code: "INVALID_YEAR" 
      }, { status: 400 });
    }

    // Check if email is unique
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    // Create user
    const newUser = await db.insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        year: year || null,
        rollNumber: rollNumber?.trim() || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { name, email, role, year, rollNumber } = requestBody;

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: any = {};

    // Validate and update name
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    // Validate and update email
    if (email !== undefined) {
      if (!email || !email.trim()) {
        return NextResponse.json({ 
          error: "Email cannot be empty",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }

      if (!isValidEmail(email.trim())) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }

      // Check email uniqueness (exclude current user)
      const emailExists = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email.trim().toLowerCase()),
          eq(users.id, parseInt(id))
        ))
        .limit(1);

      if (emailExists.length === 0) {
        const otherUserWithEmail = await db.select()
          .from(users)
          .where(eq(users.email, email.trim().toLowerCase()))
          .limit(1);

        if (otherUserWithEmail.length > 0) {
          return NextResponse.json({ 
            error: "Email already exists",
            code: "EMAIL_EXISTS" 
          }, { status: 400 });
        }
      }

      updates.email = email.trim().toLowerCase();
    }

    // Validate and update role
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ 
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      updates.role = role;
    }

    // Validate and update year
    if (year !== undefined) {
      if (year && !VALID_YEARS.includes(year)) {
        return NextResponse.json({ 
          error: `Invalid year. Must be one of: ${VALID_YEARS.join(', ')}`,
          code: "INVALID_YEAR" 
        }, { status: 400 });
      }
      updates.year = year || null;
    }

    // Update roll number
    if (rollNumber !== undefined) {
      updates.rollNumber = rollNumber?.trim() || null;
    }

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    const updated = await db.update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PATCH error:', error);
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

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deleted = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'User deleted successfully',
      user: deleted[0] 
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}