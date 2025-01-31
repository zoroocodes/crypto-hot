import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { winnerId, loserId } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Update winner stats
      const winner = await tx.cryptocurrency.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          total_votes: { increment: 1 },
        },
      });

      // Update loser stats
      const loser = await tx.cryptocurrency.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          total_votes: { increment: 1 },
        },
      });

      return { winner, loser };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}