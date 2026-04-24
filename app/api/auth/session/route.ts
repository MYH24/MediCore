import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    console.log('[v0] Session cookie exists:', !!sessionCookie);
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }
    
    const session = await decrypt(sessionCookie.value);
    console.log('[v0] Session decrypted:', !!session);
    
    if (!session) {
      return NextResponse.json({ user: null });
    }
    
    return NextResponse.json({ 
      user: { 
        id: session.userId, 
        email: session.email, 
        name: session.name 
      } 
    });
  } catch (error) {
    console.error('[v0] Session error:', error);
    return NextResponse.json({ user: null });
  }
}
