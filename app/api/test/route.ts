import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    
    // Try to create a test record
    const result = await prisma.cryptocurrency.create({
      data: {
        id: 'test-' + Date.now(),
        name: 'Test Coin',
        symbol: 'TEST',
        current_price: 1,
        wins: 0,
        losses: 0,
        total_votes: 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database connected and write successful',
      data: result
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}