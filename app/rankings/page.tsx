'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

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

export default function Rankings() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cryptos')
      .then(res => res.json())
      .then(data => {
        // Sort by win rate
        const sortedData = [...data].sort((a, b) => {
          const aRate = a.wins / (a.wins + a.losses) || 0;
          const bRate = b.wins / (b.wins + b.losses) || 0;
          return bRate - aRate;
        });
        setCryptos(sortedData);
        setLoading(false);
      });
  }, []);

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
          Hottest Cryptos 🔥
        </h1>

        <div className="space-y-4 mb-8">
          {cryptos.map((crypto, index) => (
            <div 
              key={crypto.id}
              className="bg-purple-900/50 p-4 rounded-lg flex items-center gap-4"
            >
              <div className="text-2xl font-bold text-purple-300">#{index + 1}</div>
              <img
                src={crypto.image || '/api/placeholder/48/48'}
                alt={crypto.name}
                className="w-12 h-12 rounded-lg"
              />
              <div className="flex-1">
                <div className="font-bold text-purple-300">{crypto.name}</div>
                <div className="text-sm text-purple-400">
                  ${crypto.current_price?.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-300">
                  {crypto.total_votes > 0 
                    ? `${((crypto.wins / crypto.total_votes) * 100).toFixed(1)}%` 
                    : '0%'}
                </div>
                <div className="text-sm text-purple-400">
                  {crypto.total_votes} votes
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-block bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-500"
          >
            Back to Voting
          </Link>
        </div>
      </div>
    </div>
  );
}