import { NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Obtenir un utilisateur spécifique
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authResult = await adminMiddleware(request);
  // Check if authResult is a Response (e.g., NextResponse) or a plain object
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

// PUT - Modifier un utilisateur
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await adminMiddleware(request);
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  try {
    const { email, username, password, role } = await request.json();

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Validation du rôle
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Vérifier l'unicité de l'email si modifié
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (email) updateData.email = email;
    if (username !== undefined) updateData.username = username || null;
    if (role) updateData.role = role;
    if (password) updateData.password = bcrypt.hashSync(password, 10);

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authResult = await adminMiddleware(request);
  if (!(authResult instanceof Response) && authResult.status !== 200) {
    return NextResponse.json({ message: authResult.message || 'Unauthorized' }, { status: authResult.status });
  }

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Empêcher la suppression de son propre compte
    if (params.id === authResult.userId) {
      return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
    }

    // Supprimer l'utilisateur et ses fichiers
    await prisma.$transaction([
      prisma.file.deleteMany({ where: { userId: params.id } }),
      prisma.user.delete({ where: { id: params.id } })
    ]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
