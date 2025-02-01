import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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

    // Clear existing data
    await sql`DELETE FROM "Cryptocurrency";`;

    // Insert cryptocurrencies
    for (const crypto of data) {
      await sql`
        INSERT INTO "Cryptocurrency" (
          id, symbol, name, image, current_price, market_cap, 
          market_cap_rank, total_volume, price_change_24h, 
          circulating_supply, wins, losses, total_votes
        ) VALUES (
          ${crypto.id},
          ${crypto.symbol},
          ${crypto.name},
          ${crypto.image},
          ${crypto.current_price || 0},
          ${crypto.market_cap || 0},
          ${crypto.market_cap_rank || 999999},
          ${crypto.total_volume || 0},
          ${crypto.price_change_percentage_24h || 0},
          ${crypto.circulating_supply || 0},
          0,
          0,
          0
        );
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Added ${data.length} cryptocurrencies`,
      firstFew: data.slice(0, 3)
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}