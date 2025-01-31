'use client'

import React, { useState, useEffect } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price?: number;
  wins: number;
  losses: number;
  total_votes: number;
}

const CryptoCard = ({ crypto, onVote }: { crypto: Crypto; onVote: () => void }) => (
  <div 
    onClick={onVote}
    className="bg-gradient-to-b from-purple-900 to-purple-950 p-6 rounded-lg cursor-pointer 
      hover:scale-105 transition-transform duration-200"
  >
    <div className="flex items-center gap-4 mb-4">
      <img
        src={crypto.image || '/api/placeholder/64/64'}
        alt={crypto.name}
        className="w-16 h-16 rounded-lg"
      />
      <div>
        <h2 className="text-2xl font-bold text-purple-300">{crypto.name}</h2>
        <p className="text-purple-400">${crypto.current_price?.toLocaleString()}</p>
      </div>
    </div>
    <div className="text-center text-purple-400">
      {crypto.total_votes > 0 && `Win Rate: ${((crypto.wins / crypto.total_votes) * 100).toFixed(1)}%`}
    </div>
  </div>
);

export default function CryptoHotOrNot() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [pair, setPair] = useState<number[]>([0, 1]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cryptos')
      .then(res => res.json())
      .then(data => {
        setCryptos(data);
        setLoading(false);
      });
  }, []);

  const handleVote = async (winnerIndex: number, loserIndex: number) => {
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: cryptos[winnerIndex].id,
          loserId: cryptos[loserIndex].id
        })
      });

      // Get new pair
      const newPair = [
        Math.floor(Math.random() * cryptos.length),
        Math.floor(Math.random() * cryptos.length)
      ];
      
      // Make sure we don't get the same crypto twice
      while (newPair[0] === newPair[1]) {
        newPair[1] = Math.floor(Math.random() * cryptos.length);
      }
      
      setPair(newPair);
      
      // Refresh data
      const response = await fetch('/api/cryptos');
      const freshData = await response.json();
      setCryptos(freshData);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-400 mb-8">
          Crypto Hot or Not 🔥
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <CryptoCard 
            crypto={cryptos[pair[0]]} 
            onVote={() => handleVote(pair[0], pair[1])} 
          />
          <CryptoCard 
            crypto={cryptos[pair[1]]} 
            onVote={() => handleVote(pair[1], pair[0])} 
          />
        </div>

        <div className="text-center">
          <Link 
            href="/rankings" 
            className="inline-block bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-500"
          >
            View Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}