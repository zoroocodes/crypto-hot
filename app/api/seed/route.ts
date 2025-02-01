import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define an interface for the CoinGecko API response
interface CryptoCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
}

export async function GET() {
  try {
    // First try to fetch crypto data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    );
    
    const data: CryptoCoinData[] = await response.json();
    console.log('Fetched from CoinGecko:', data.length);

    // Add sample data with type-safe crypto parameter
    const results = await Promise.all(data.map((crypto: CryptoCoinData) => 
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
  } finally {
    await prisma.$disconnect();
  }
}