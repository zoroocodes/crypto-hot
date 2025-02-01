// scripts/migrate.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // First try to create the table
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

    console.log('Database tables created successfully');

    // Insert test data
    const testCrypto = await prisma.cryptocurrency.create({
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

    console.log('Test data inserted:', testCrypto);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();