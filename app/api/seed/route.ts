import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First try to fetch crypto data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    );
    
    const data = await response.json();
    console.log('Fetched from CoinGecko:', data.length);

    // Add sample data
    const results = await Promise.all(data.map(crypto => 
      prisma.cryptocurrency.upsert({
        where: { id: crypto.id },
        update: {
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price || 0,
          market_cap: crypto.market_cap || 0,
          market_cap_rank: crypto.market_cap_rank || 999999,
        },
        create: {
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price || 0,
          market_cap: crypto.market_cap || 0,
          market_cap_rank: crypto.market_cap_rank || 999999,
          wins: 0,
          losses: 0,
          total_votes: 0,
        },
      })
    ));

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}