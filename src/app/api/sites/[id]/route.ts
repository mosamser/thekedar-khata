import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const site = await db.getSiteById(params.id);
    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, site });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await db.updateSite(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, site: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.deleteSite(params.id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

