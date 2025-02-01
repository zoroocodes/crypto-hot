import { createClient } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Fetch crypto data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const rawData = await response.json();
    
    // Transform data
    const cryptos = rawData.map((crypto: any) => ({
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
      total_votes: 0
    }));

    // Save to Edge Config
    const client = createClient(process.env.EDGE_CONFIG);
    await client.set('cryptos', cryptos);

    return NextResponse.json({
      success: true,
      message: `Added ${cryptos.length} cryptocurrencies`
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ 
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}