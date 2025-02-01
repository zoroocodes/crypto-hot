import { createClient } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const cryptos = await client.get('cryptos') || [];
    return NextResponse.json(cryptos);
  } catch (error) {
    console.error('Error fetching cryptos:', error);
    return NextResponse.json({ error: 'Failed to fetch cryptos' }, { status: 500 });
  }
}