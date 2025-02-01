import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define an interface matching Prisma schema
interface CryptoCoinData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  price_change_24h?: number;
  circulating_supply?: number;
}

export async function GET() {
  try {
    // Fetch crypto data from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    );
    
    const data: CryptoCoinData[] = await response.json();
    console.log('Fetched from CoinGecko:', data.length);

    // Add sample data with upsert
    const results = await Promise.all(data.map((crypto: CryptoCoinData) => 
      prisma.cryptocurrency.upsert({
        where: { id: crypto.id },
        update: {
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price,
          market_cap: crypto.market_cap,
          market_cap_rank: crypto.market_cap_rank,
          total_volume: crypto.total_volume,
          price_change_24h: crypto.price_change_24h,
          circulating_supply: crypto.circulating_supply,
        },
        create: {
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price,
          market_cap: crypto.market_cap,
          market_cap_rank: crypto.market_cap_rank,
          total_volume: crypto.total_volume,
          price_change_24h: crypto.price_change_24h,
          circulating_supply: crypto.circulating_supply,
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