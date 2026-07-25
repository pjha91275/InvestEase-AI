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

    // Save User message
    await Chat.create({
      userId: session.user.id,
      role: 'user',
      message: prompt,
    });

    // Retrieve last 10 messages from DB for chat context
    const recentChats = await Chat.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Reverse to make chronological for Gemini context
    const history = recentChats.reverse().map((chat) => ({
      role: chat.role === 'user' ? 'user' : 'model',
      parts: [{ text: chat.message }],
    }));

    let replyText = '';
    try {
      const result = await askGemini(prompt, history);
      replyText = result.text;
    } catch (geminiError: any) {
      console.warn('[Chat API] Gemini failed or key missing, falling back to local advisor:', geminiError.message);
      replyText = getLocalAdvisorResponse(prompt);
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

function getLocalAdvisorResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('50/30/20') || lower.includes('budget') || lower.includes('method')) {
    return `The 50/30/20 rule is a simple budgeting method that can help you manage your money effectively:\n- 50% for Needs: This includes essential expenses like rent, utilities, groceries, and bills.\n- 30% for Wants: This covers non-essential spending like dining out, entertainment, and shopping.\n- 20% for Savings: This goes towards emergency funds, investments, and savings goals.\nTry allocating your budget thresholds in the Budget Planner tab to track these splits.`;
  }
  
  if (lower.includes('emergency') || lower.includes('fund') || lower.includes('reserve')) {
    return `An emergency fund should typically cover 3 to 6 months of your basic living expenses.\n1. Calculate your essential costs (rent, food, utility bills).\n2. Set a realistic target in the Savings Goals tab.\n3. Try depositing regular portions of your monthly income.\nHaving a dedicated reserve ensures safety during sudden layoffs or emergencies.`;
  }

  if (lower.includes('interest') || lower.includes('compound') || lower.includes('grow')) {
    return `Compound interest is the interest you earn on interest. Over time, it allows small deposits to grow exponentially.\nFor example, investing ₹10,000 annually at a 10% return yields:\n- Year 1: ₹11,000\n- Year 5: ₹16,105\n- Year 10: ₹25,937\nStarting early is the single most powerful factor in wealth compounding.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I am InvestEase AI, your personal financial wellness advisor. How can I help you today? You can ask me about:\n- Budgeting techniques (e.g., 50/30/20 rule)\n- How to construct an emergency fund\n- Compound interest and long-term investments`;
  }

  return `Thank you for asking! I'm here to help you structure your financial plans.\nTo maximize your wellness:\n- Review your Monthly Budget status.\n- Ensure you have configured active Savings Goals.\n- Monitor categories allocations to see where your money goes.\nLet me know if you want detailed information on tax basics, emergency reserve formulas, or compound interest!`;
}
