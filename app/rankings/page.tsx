'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Trophy, TrendingUp, ChevronUp, ChevronDown, Flame } from 'lucide-react';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  price_change_percentage_24h?: number;
  wins?: number;
  losses?: number;
  total_votes?: number;
}

export default function Rankings() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'hot' | 'votes' | 'change'>('hot');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cryptos');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setCryptos(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSortedCryptos = () => {
    return [...cryptos].sort((a, b) => {
      if (sortBy === 'hot') {
        const aRate = a.wins ? (a.wins / (a.wins + (a.losses || 0))) : 0;
        const bRate = b.wins ? (b.wins / (b.wins + (b.losses || 0))) : 0;
        return bRate - aRate;
      }
      if (sortBy === 'votes') {
        return ((b.wins || 0) + (b.losses || 0)) - ((a.wins || 0) + (a.losses || 0));
      }
      // sort by 24h change
      return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-orange-400 font-mono flex items-center justify-center">
        <div className="text-2xl text-center flex items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          LOADING HOT LIST...
        </div>
      </div>
    );
  }

  const sortedCryptos = getSortedCryptos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-orange-100 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-orange-500">
            <span className="inline-flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Hot List
            </span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('hot')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                sortBy === 'hot' 
                  ? 'bg-orange-500 text-white scale-105 shadow-lg' 
                  : 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50'
              }`}
            >
              <Flame className="w-4 h-4" />
              Hottest
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                sortBy === 'votes'
                  ? 'bg-orange-500 text-white scale-105 shadow-lg'
                  : 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Most Voted
            </button>
            <button
              onClick={() => setSortBy('change')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                sortBy === 'change'
                  ? 'bg-orange-500 text-white scale-105 shadow-lg'
                  : 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50'
              }`}
            >
              {sortBy === 'change' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              24h Change
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedCryptos.map((crypto, index) => {
            const totalVotes = (crypto.wins || 0) + (crypto.losses || 0);
            const winRate = totalVotes > 0 ? ((crypto.wins || 0) / totalVotes * 100) : 0;

            return (
              <div 
                key={crypto.id}
                className="bg-gradient-to-r from-red-950 to-orange-950 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-orange-400 w-8">
                    #{index + 1}
                  </div>
                  
                  <div className="relative w-12 h-12">
                    <Image
                      src={crypto.image || '/placeholder.png'}
                      alt={crypto.name}
                      fill
                      className="rounded-lg object-contain"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-400">{crypto.name}</span>
                      <span className="text-sm text-orange-300">({crypto.symbol.toUpperCase()})</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-orange-300">
                        ${crypto.current_price?.toLocaleString()}
                      </span>
                      <span className={`${
                        crypto.price_change_percentage_24h && crypto.price_change_percentage_24h > 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {crypto.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-orange-400">
                      {winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-orange-300">
                      {totalVotes.toLocaleString()} votes
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" 
            className="inline-block bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 
              rounded-lg text-xl font-bold hover:from-orange-500 hover:to-red-500 
              transition-all"
          >
            Back to Voting 🔥
          </Link>
        </div>
      </div>
    </div>
  );
}