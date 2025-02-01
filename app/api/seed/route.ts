import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    const cryptos = await prisma.cryptocurrency.findMany({
      orderBy: {
        market_cap_rank: 'asc',
      },
    });

    console.log(`Found ${cryptos.length} cryptocurrencies`);
    return NextResponse.json(cryptos);

  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({
      error: 'Failed to fetch cryptocurrencies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}