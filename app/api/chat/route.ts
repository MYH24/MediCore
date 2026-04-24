import { NextResponse } from 'next/server';
import { getSession, decrypt } from '@/lib/session';
import { createChatMessage } from '@/lib/db';
import { getModePrompt, ChatMode } from '@/lib/chat-modes';

function cleanResponse(text: string): string {
  let cleaned = text;
  
  // Remove markdown bold/italic formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove reference numbers like [1], [2], [1][2], etc.
  cleaned = cleaned.replace(/\[\d+\](\[\d+\])*/g, '');
  cleaned = cleaned.replace(/\s*\[\d+[,\s\d]*\]\s*/g, ' ');
  
  // Remove any "Sources:", "References:", or "Citations:" sections
  cleaned = cleaned.replace(/\n*(Sources|References|Citations):.*$/is, '');
  
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s)]+/g, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  
  // Remove markdown bullet points
  cleaned = cleaned.replace(/^[\s]*[-*•]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Remove informal greetings at the start
  cleaned = cleaned.replace(/^(Hi|Hey|Hello|Hello there|Hi there)[,!.]?\s*/i, '');
  
  // Clean up extra whitespace and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\s+([.,!?])/g, '$1');
  cleaned = cleaned.replace(/([.,!?])\s*([.,!?])/g, '$1');
  
  // Remove any remaining markdown artifacts
  cleaned = cleaned.replace(/```[^`]*```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    // Try to get session from cookie first
    let session = await getSession();
    
    // Fallback: check Authorization header
    if (!session) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        session = await decrypt(token);
      }
    }

    const { message, mode = 'general' } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured. Please add PERPLEXITY_API_KEY in Settings > Vars' 
      }, { status: 500 });
    }

    // Get mode-specific prompt
    const systemPrompt = getModePrompt(mode as ChatMode);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return NextResponse.json({ 
        error: `API error: ${response.status}. Please check your PERPLEXITY_API_KEY.` 
      }, { status: 500 });
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content || 
      'I hear you. Please tell me more about what you are experiencing, and I will do my best to support you.';
    
    // Clean the response thoroughly
    const cleanedResponse = cleanResponse(rawResponse);

    // Save to chat history if user is authenticated
    if (session) {
      createChatMessage(session.userId, message, cleanedResponse);
    }

    return NextResponse.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
