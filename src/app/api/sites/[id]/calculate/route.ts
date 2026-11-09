import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate parameters are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const summary = await db.calculateSiteHisab(params.id, startDate, endDate);
    if (!summary) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

