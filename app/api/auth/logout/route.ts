import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return new NextResponse(JSON.stringify({ message: 'Logged out successfully' }), {
    status: 200,
    headers: { 'Set-Cookie': cookie },
  });
}

