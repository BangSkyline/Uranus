import { NextResponse } from 'next/server';
import { minioClient } from '@/lib/minio-client';
import { authMiddleware } from '@/lib/auth';

const MINIO_BUCKET = process.env.MINIO_BUCKET || 'user-files';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) {
    return authResult;
  }
  const userId = authResult.userId;

  const objectPath = params.path.join('/');

  // Basic check to ensure the user is only accessing their own files
  if (!objectPath.startsWith(`${userId}/`)) {
    return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
  }

  try {
    const stat = await minioClient.statObject(MINIO_BUCKET, objectPath);
    const stream = await minioClient.getObject(MINIO_BUCKET, objectPath);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': stat.metaData['content-type'] || 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error: any) {
    if (error.code === 'NotFound') {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }
    console.error('Error proxying MinIO request:', error);
    return NextResponse.json({ message: 'MinIO proxy error' }, { status: 500 });
  }
}


