import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { minioClient } from '@/lib/minio-client';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) {
    return authResult;
  }
  const userId = authResult.userId;
  const fileId = params.id;

  try {
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file || file.userId !== userId) {
      return NextResponse.json({ message: 'File not found or unauthorized' }, { status: 404 });
    }

    await minioClient.removeObject(file.bucket, file.objectKey);
    await prisma.file.delete({ where: { id: fileId } });

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ message: 'File deletion failed' }, { status: 500 });
  }
}


