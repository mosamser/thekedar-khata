import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const payments = await db.getOwnerPayments(params.id);
    return NextResponse.json({ success: true, payments });
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

    const payment = await db.addOwnerPayment({
      siteId: params.id,
      date: body.date,
      amount: Number(body.amount),
      paymentMode: body.paymentMode || 'CASH',
      stage: body.stage || 'किश्त',
      notes: body.notes || '',
      receivedBy: body.receivedBy || 'पापा (ठेकेदार)',
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
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
    const success = await db.deleteOwnerPayment(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

