import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'NjJmOTQxMDc4Y2YyZTdiNjQzOGYyZTJh';

export async function authMiddleware(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const token = cookieHeader?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    // Return success with userId and role
    return { status: 200, userId: decoded.userId, role: decoded.role };
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}

export async function adminMiddleware(request: Request) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) {
    return authResult;
  }

  if (authResult.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  return authResult;
}

