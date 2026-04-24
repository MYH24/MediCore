import { NextResponse } from 'next/server';
import { getSession, decrypt } from '@/lib/session';
import { getChatHistory, clearChatHistory, deleteChatMessage } from '@/lib/db';

async function getSessionFromRequest(request: Request) {
  let session = await getSession();
  if (!session) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      session = await decrypt(token);
    }
  }
  return session;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = getChatHistory(session.userId);
    return NextResponse.json({ history: history.reverse() });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (messageId) {
      deleteChatMessage(parseInt(messageId), session.userId);
    } else {
      clearChatHistory(session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
