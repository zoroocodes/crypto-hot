import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Create table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Cryptocurrency" (
        "id" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "image" TEXT,
        "current_price" DOUBLE PRECISION,
        "market_cap" DOUBLE PRECISION,
        "market_cap_rank" INTEGER,
        "total_volume" DOUBLE PRECISION,
        "price_change_24h" DOUBLE PRECISION,
        "circulating_supply" DOUBLE PRECISION,
        "wins" INTEGER NOT NULL DEFAULT 0,
        "losses" INTEGER NOT NULL DEFAULT 0,
        "total_votes" INTEGER NOT NULL DEFAULT 0,
        "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create indices
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Cryptocurrency_market_cap_rank_idx" ON "Cryptocurrency"("market_cap_rank");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Cryptocurrency_symbol_idx" ON "Cryptocurrency"("symbol");
    `;

    return NextResponse.json({
      success: true,
      message: 'Database migration completed'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}