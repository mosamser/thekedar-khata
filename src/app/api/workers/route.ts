import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workers = await db.getWorkers();
    return NextResponse.json({ success: true, workers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.defaultRate) {
      return NextResponse.json(
        { success: false, error: 'Worker name and default daily rate are required' },
        { status: 400 }
      );
    }

    const worker = await db.createWorker({
      name: body.name,
      gender: body.gender || (body.role === 'REJA' ? 'FEMALE' : 'MALE'),
      role: body.role || 'LABOUR',
      defaultRate: Number(body.defaultRate),
    });

    return NextResponse.json({ success: true, worker }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Worker ID is required' }, { status: 400 });
    }

    const updated = await db.updateWorker(body.id, {
      name: body.name?.trim(),
      gender: body.gender,
      role: body.role,
      defaultRate: body.defaultRate !== undefined ? Number(body.defaultRate) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Worker ID is required' }, { status: 400 });
    }

    await db.deleteWorker(id);
    return NextResponse.json({ success: true, message: 'Worker deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


