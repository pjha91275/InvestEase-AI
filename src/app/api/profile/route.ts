import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { income, occupation, monthlySavingsGoal, notifications } = await req.json();

    const updateFields: any = {};
    if (income !== undefined) updateFields.income = Number(income);
    if (occupation !== undefined) updateFields.occupation = occupation;
    if (monthlySavingsGoal !== undefined) updateFields.monthlySavingsGoal = Number(monthlySavingsGoal);
    if (notifications !== undefined) updateFields.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error updating profile' }, { status: 500 });
  }
}
