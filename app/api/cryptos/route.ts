import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      orderBy: {
        market_cap_rank: 'asc',
      },
      where: {
        NOT: {
          market_cap: null,
        },
      },
    });

    if (!cryptos || cryptos.length === 0) {
      return NextResponse.json(
        { error: 'No cryptocurrencies found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cryptos);
  } catch (error) {
    console.error('Error fetching cryptos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrencies' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}