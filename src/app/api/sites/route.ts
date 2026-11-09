import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sites = await db.getSites();
    return NextResponse.json({ success: true, sites });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.startDate) {
      return NextResponse.json(
        { success: false, error: 'Site name and start date are required' },
        { status: 400 }
      );
    }

    const site = await db.createSite({
      name: body.name,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      contractType: body.contractType,
      contractAmount: body.contractAmount,
      notes: body.notes,
      assignedWorkerIds: body.assignedWorkerIds,
    });

    return NextResponse.json({ success: true, site }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

