import { createClient } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { winnerId, loserId } = await request.json();
    
    const client = createClient(process.env.EDGE_CONFIG);
    const cryptos = await client.get('cryptos') || [];

    // Update votes
    const updatedCryptos = cryptos.map((crypto: any) => {
      if (crypto.id === winnerId) {
        return { ...crypto, wins: (crypto.wins || 0) + 1, total_votes: (crypto.total_votes || 0) + 1 };
      }
      if (crypto.id === loserId) {
        return { ...crypto, losses: (crypto.losses || 0) + 1, total_votes: (crypto.total_votes || 0) + 1 };
      }
      return crypto;
    });

    // Save updated data
    await client.set('cryptos', updatedCryptos);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}