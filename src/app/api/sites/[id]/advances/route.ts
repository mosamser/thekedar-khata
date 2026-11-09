import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId') || undefined;
    const advances = await db.getAdvances(params.id, workerId);
    return NextResponse.json({ success: true, advances });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.workerId || !body.amount || !body.date) {
      return NextResponse.json({ success: false, error: 'workerId, amount and date are required' }, { status: 400 });
    }

    const advance = await db.addAdvance({
      siteId: params.id,
      workerId: body.workerId,
      date: body.date,
      amount: Number(body.amount),
      reason: body.reason,
      paymentMode: body.paymentMode || 'CASH',
    });

    return NextResponse.json({ success: true, advance }, { status: 201 });
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
    const success = await db.deleteAdvance(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

