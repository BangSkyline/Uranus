import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { minioClient } from '@/lib/minio-client';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) {
    return authResult;
  }
  const userId = authResult.userId;

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const bucketName = 'user-files';
  const objectKey = `${userId}/${uuidv4()}-${file.name}`;

  try {
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1'); // Specify region if needed
    }

    await minioClient.putObject(bucketName, objectKey, Buffer.from(await file.arrayBuffer()), file.size, {
      'Content-Type': file.type,
    });

    const newFile = await prisma.file.create({
      data: {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        bucket: bucketName,
        objectKey: objectKey,
        userId: userId,
      },
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ message: 'File upload failed' }, { status: 500 });
  }
}

