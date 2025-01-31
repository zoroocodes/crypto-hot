import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { winnerId, loserId } = await request.json();

    await prisma.$transaction([
      prisma.cryptocurrency.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          total_votes: { increment: 1 }
        }
      }),
      prisma.cryptocurrency.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          total_votes: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}