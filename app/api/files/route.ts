import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) {
    return authResult;
  }
  const userId = authResult.userId;

  const files = await prisma.file.findMany({ where: { userId } });
  return NextResponse.json(files);
}

