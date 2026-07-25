import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Chat } from '@/lib/models/Chat';
import { askGemini } from '@/lib/gemini';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const chatLogs = await Chat.find({ userId: session.user.id }).sort({ createdAt: 1 });
    return NextResponse.json(chatLogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { prompt } = await req.json();

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Please enter a message' }, { status: 400 });
    }

    // Retrieve last 10 messages from DB for chat context (before saving the current message)
    const recentChats = await Chat.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Reverse to make chronological for Gemini context
    const history = recentChats.reverse().map((chat) => ({
      role: chat.role === 'user' ? 'user' : 'model',
      parts: [{ text: chat.message }],
    }));

    // Save User message
    await Chat.create({
      userId: session.user.id,
      role: 'user',
      message: prompt,
    });

    let replyText = '';
    try {
      const result = await askGemini(prompt, history);
      replyText = result.text;
    } catch (geminiError: any) {
      console.error('[Chat API] Gemini failed to execute:', geminiError.message);
      return NextResponse.json(
        { error: `Gemini API Error: ${geminiError.message || 'Connection failed'}. Please verify your GEMINI_API_KEY in the .env file.` },
        { status: 502 }
      );
    }

    // Save Assistant message to history database
    await Chat.create({
      userId: session.user.id,
      role: 'model',
      message: replyText,
    });

    return NextResponse.json({
      message: replyText,
      isFallback: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error in chatbot' }, { status: 500 });
  }
}
