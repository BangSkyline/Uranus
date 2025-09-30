import { NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Liste tous les utilisateurs
export async function GET(request: Request) {
  const authResult = await adminMiddleware(request);
  // Check if authResult is a plain object (not a Response) and has non-200 status
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { files: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: Request) {
  const authResult = await adminMiddleware(request);
  // Check if authResult is a plain object (not a Response) and has non-200 status
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  try {
    const { email, username, password, role } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // Hasher le mot de passe
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        username: username || null,
        password: hashedPassword,
        role: role || 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
