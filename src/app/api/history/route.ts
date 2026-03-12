import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { HistoryListResponse } from '@/types';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(request.url);

  const type = searchParams.get('type');
  const model = searchParams.get('model');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const where: Record<string, unknown> = { userId };
  if (type && (type === 'analyze' || type === 'testbench')) {
    where.type = type;
  }
  if (model) {
    where.model = model;
  }

  const [items, total] = await Promise.all([
    prisma.history.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.history.count({ where }),
  ]);

  const response: HistoryListResponse = {
    items: items.map((item) => ({
      id: item.id,
      type: item.type as 'analyze' | 'testbench',
      model: item.model,
      input: item.input,
      result: item.result,
      scenario: item.scenario ?? undefined,
      clockPeriod: item.clockPeriod ?? undefined,
      simulationTime: item.simulationTime ?? undefined,
      createdAt: item.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  return NextResponse.json(response);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await request.json();

  if (body.all === true) {
    await prisma.history.deleteMany({ where: { userId } });
    return NextResponse.json({ success: true });
  }

  if (body.id && typeof body.id === 'string') {
    const entry = await prisma.history.findUnique({ where: { id: body.id } });
    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await prisma.history.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
}
