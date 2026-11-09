import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const data = await db.getAttendanceForDate(params.id, date);
    return NextResponse.json({ success: true, date, attendances: data.attendances, advances: data.advances });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { date, records } = body;
    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'date and records array are required' }, { status: 400 });
    }

    await db.saveBatchAttendance(params.id, date, records);
    return NextResponse.json({ success: true, message: 'Attendance recorded successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

