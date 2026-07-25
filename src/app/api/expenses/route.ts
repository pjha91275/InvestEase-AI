import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Expense } from '@/lib/models/Expense';
import { Roundup } from '@/lib/models/Roundup';
import { Portfolio } from '@/lib/models/Portfolio';
import { Investment } from '@/lib/models/Investment';
import { Notification } from '@/lib/models/Notification';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const paymentMethod = searchParams.get('paymentMethod');
    const merchant = searchParams.get('merchant');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { userId: session.user.id };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }
    if (merchant) {
      query.merchant = { $regex: merchant, $options: 'i' };
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error fetching expenses' }, { status: 500 });
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

    const { title, amount, category, merchant, date, paymentMethod, notes, isScanned } = data;

    if (!title || !amount || !category || !merchant || !paymentMethod) {
      return NextResponse.json({ error: 'Please enter all required transaction fields' }, { status: 400 });
    }

    const parsedDate = date ? new Date(date) : new Date();
    const expenseAmount = Number(amount);

    const expense = await Expense.create({
      userId: session.user.id,
      title,
      amount: expenseAmount,
      category,
      merchant,
      date: parsedDate,
      paymentMethod,
      notes: notes || '',
      isScanned: isScanned || false,
    });

    // 1. Calculate roundup amount to nearest rupee
    const rounded = Math.ceil(expenseAmount);
    const roundupAmount = Number((rounded - expenseAmount).toFixed(2));

    if (roundupAmount > 0) {
      // 2. Log Roundup
      await Roundup.create({
        userId: session.user.id,
        expenseId: expense._id,
        amount: roundupAmount,
        originalAmount: expenseAmount,
        roundedAmount: rounded,
        merchant,
        status: 'Invested',
      });

      // 3. Get or Create User's Portfolio
      let portfolio = await Portfolio.findOne({ userId: session.user.id });
      if (!portfolio) {
        portfolio = await Portfolio.create({
          userId: session.user.id,
          allocations: { indexFunds: 40, mutualFunds: 20, stocks: 20, gold: 10, crypto: 10 },
          balances: { indexFunds: 0, mutualFunds: 0, stocks: 0, gold: 0, crypto: 0 },
          totalInvested: 0,
          currentValue: 0,
        });
      }

      // 4. Split and apply round-up balances based on allocations
      const indexShare = Number((roundupAmount * (portfolio.allocations.indexFunds / 100)).toFixed(4));
      const mutualShare = Number((roundupAmount * (portfolio.allocations.mutualFunds / 100)).toFixed(4));
      const stocksShare = Number((roundupAmount * (portfolio.allocations.stocks / 100)).toFixed(4));
      const goldShare = Number((roundupAmount * (portfolio.allocations.gold / 100)).toFixed(4));
      const cryptoShare = Number((roundupAmount * (portfolio.allocations.crypto / 100)).toFixed(4));

      portfolio.balances.indexFunds = Number((portfolio.balances.indexFunds + indexShare).toFixed(4));
      portfolio.balances.mutualFunds = Number((portfolio.balances.mutualFunds + mutualShare).toFixed(4));
      portfolio.balances.stocks = Number((portfolio.balances.stocks + stocksShare).toFixed(4));
      portfolio.balances.gold = Number((portfolio.balances.gold + goldShare).toFixed(4));
      portfolio.balances.crypto = Number((portfolio.balances.crypto + cryptoShare).toFixed(4));

      portfolio.totalInvested = Number((portfolio.totalInvested + roundupAmount).toFixed(2));
      portfolio.currentValue = Number((portfolio.currentValue + roundupAmount).toFixed(2));
      await portfolio.save();

      // 5. Log Investment History
      await Investment.create({
        userId: session.user.id,
        amount: roundupAmount,
        date: parsedDate,
        allocationsApplied: {
          indexFunds: indexShare,
          mutualFunds: mutualShare,
          stocks: stocksShare,
          gold: goldShare,
          crypto: cryptoShare,
        },
        description: `Auto round-up sweep: ${merchant}`,
      });

      // 6. Create Notification
      await Notification.create({
        userId: session.user.id,
        title: 'Round-Up Invested',
        message: `₹${roundupAmount} round-up from ${merchant} added to your portfolio.`,
        type: 'success',
        isRead: false,
      });
    }

    return NextResponse.json({ expense, fraudAlerts: [] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error posting transaction' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const data = await req.json();
    const { id, title, amount, category, merchant, date, paymentMethod, notes, isScanned } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing expense resource identifier' }, { status: 400 });
    }

    const expense = await Expense.findOne({ _id: id, userId: session.user.id });
    if (!expense) {
      return NextResponse.json({ error: 'Expense record not found' }, { status: 404 });
    }

    if (title) expense.title = title;
    if (amount !== undefined) expense.amount = Number(amount);
    if (category) expense.category = category;
    if (merchant) expense.merchant = merchant;
    if (date) expense.date = new Date(date);
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (notes !== undefined) expense.notes = notes;
    if (isScanned !== undefined) expense.isScanned = isScanned;

    await expense.save();
    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error modifying transaction' }, { status: 500 });
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
      return NextResponse.json({ error: 'Missing expense resource identifier' }, { status: 400 });
    }

    const result = await Expense.deleteOne({ _id: id, userId: session.user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Expense record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error removing transaction' }, { status: 500 });
  }
}
