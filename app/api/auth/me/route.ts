import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const authResult = await authMiddleware(request);
  // Check if authResult is a plain object (not a Response) and has non-200 status
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  const userId = authResult.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
