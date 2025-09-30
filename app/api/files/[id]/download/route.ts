import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { minioClient } from '@/lib/minio-client';

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const stream = await minioClient.getObject(file.bucket, file.objectKey);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`, // Force download
        'Content-Length': file.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ message: 'File download failed' }, { status: 500 });
  }
}

