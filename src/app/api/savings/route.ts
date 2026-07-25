import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SavingsGoal } from '@/lib/models/SavingsGoal';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const goals = await SavingsGoal.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading savings goals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { title, targetAmount, deadline, currentSavings } = await req.json();

    if (!title || !targetAmount || !deadline) {
      return NextResponse.json({ error: 'Please input a target, title, and timeline' }, { status: 400 });
    }

    const goal = await SavingsGoal.create({
      userId: session.user.id,
      title,
      targetAmount: Number(targetAmount),
      currentSavings: Number(currentSavings) || 0,
      deadline: new Date(deadline),
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error creating savings goal' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { id, currentSavings, title, targetAmount, deadline } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing savings goal identifier' }, { status: 400 });
    }

    const goal = await SavingsGoal.findOne({ _id: id, userId: session.user.id });
    if (!goal) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 });
    }

    if (currentSavings !== undefined) goal.currentSavings = Number(currentSavings);
    if (title) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (deadline) goal.deadline = new Date(deadline);

    await goal.save();
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error updating savings goal' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing savings goal identifier' }, { status: 400 });
    }

    const result = await SavingsGoal.deleteOne({ _id: id, userId: session.user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Savings goal deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error deleting savings goal' }, { status: 500 });
  }
}
