import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cryptos = await prisma.cryptocurrency.findMany({
      orderBy: {
        market_cap_rank: 'asc',
      },
    });
    return NextResponse.json(cryptos);
  } catch (error) {
    console.error('Error fetching cryptos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrencies' },
      { status: 500 }
    );
  }
}