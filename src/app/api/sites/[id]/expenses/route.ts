import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const expenses = await db.getSiteExpenses(params.id);
    return NextResponse.json({ success: true, expenses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.amount || !body.date) {
      return NextResponse.json({ success: false, error: 'amount and date are required' }, { status: 400 });
    }

    const expense = await db.addSiteExpense({
      siteId: params.id,
      date: body.date,
      category: body.category || 'OTHER',
      amount: Number(body.amount),
      description: body.description || '',
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    const success = await db.deleteSiteExpense(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

