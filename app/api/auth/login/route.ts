import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '@/lib/db';
import { encrypt } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session token
    const session = await encrypt({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create response with cookie header
    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name },
      token: session // Also return token for client-side storage
    });
    response.cookies.set('session', session, {
      httpOnly: false, // Allow client-side access for debugging
      secure: false,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
