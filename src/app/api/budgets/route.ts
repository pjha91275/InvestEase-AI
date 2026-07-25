import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Budget } from '@/lib/models/Budget';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || currentMonthStr;

    const budget = await Budget.findOne({ userId: session.user.id, month });
    return NextResponse.json(budget || { limit: 0, categoryBudgets: {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading budgets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const data = await req.json();
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = data.month || currentMonthStr;
    const limit = data.limit;
    const categoryBudgets = data.categoryBudgets;

    if (limit === undefined) {
      return NextResponse.json({ error: 'Overall budget limit is required' }, { status: 400 });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: session.user.id, month },
      {
        userId: session.user.id,
        month,
        limit: Number(limit),
        categoryBudgets: categoryBudgets || {},
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error saving budget limits' }, { status: 500 });
  }
}
