import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Starting seed process...');
    
    // Fetch top 100 cryptocurrencies from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} cryptocurrencies from CoinGecko`);

    // Insert or update cryptocurrencies
    const results = await Promise.all(
      data.map(async (crypto: any) => {
        return prisma.cryptocurrency.upsert({
          where: { id: crypto.id },
          update: {
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            current_price: crypto.current_price || 0,
            market_cap: crypto.market_cap || 0,
            market_cap_rank: crypto.market_cap_rank || 999999,
            total_volume: crypto.total_volume || 0,
            price_change_24h: crypto.price_change_percentage_24h || 0,
            circulating_supply: crypto.circulating_supply || 0,
          },
          create: {
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            current_price: crypto.current_price || 0,
            market_cap: crypto.market_cap || 0,
            market_cap_rank: crypto.market_cap_rank || 999999,
            total_volume: crypto.total_volume || 0,
            price_change_24h: crypto.price_change_percentage_24h || 0,
            circulating_supply: crypto.circulating_supply || 0,
            wins: 0,
            losses: 0,
            total_votes: 0,
          },
        });
      })
    );

    console.log(`Successfully added ${results.length} cryptocurrencies`);

    return NextResponse.json({
      success: true,
      message: `Added ${results.length} cryptocurrencies`,
      firstFew: results.slice(0, 3) // Show first 3 as sample
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}