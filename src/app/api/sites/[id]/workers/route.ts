import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.workerId) {
      return NextResponse.json({ success: false, error: 'Worker ID is required' }, { status: 400 });
    }

    const sw = await db.addWorkerToSite(params.id, body.workerId, body.customRate);
    return NextResponse.json({ success: true, siteWorker: sw });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    if (!workerId) {
      return NextResponse.json({ success: false, error: 'workerId parameter required' }, { status: 400 });
    }
    const success = await db.removeWorkerFromSite(params.id, workerId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

