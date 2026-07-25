import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateFinancialHealth } from '@/lib/rules/health';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    const report = await calculateFinancialHealth(session.user.id);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading health score' }, { status: 500 });
  }
}
