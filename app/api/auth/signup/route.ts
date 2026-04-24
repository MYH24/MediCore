import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { encrypt } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = createUser(email, password, name);
    
    // Create session token
    const session = await encrypt({
      userId: Number(user.id),
      email: user.email,
      name: user.name,
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create response with cookie header
    const response = NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.message === 'Email already exists') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
