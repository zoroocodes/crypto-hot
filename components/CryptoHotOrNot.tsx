'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, Flame, ThumbsUp, Trophy, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  price_change_24h?: number;
  circulating_supply?: number;
  wins?: number;
  losses?: number;
  total_votes?: number;
}

const formatNumber = (num: number | undefined) => {
  if (!num) return 'N/A';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number | undefined) => {
  if (!price) return 'N/A';
  if (price < 0.01) return price.toFixed(8);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const CryptoCard = ({ 
  crypto, 
  position, 
  onVote,
  isSelected,
}: { 
  crypto: Crypto; 
  position: string;
  onVote: () => void;
  isSelected: boolean;
}) => {
  if (!crypto) return null;

  const socialMetrics = {
    social_score: Math.floor(Math.random() * 30) + 70,
    likes: Math.floor(Math.random() * 100000) + 50000,
    trending_score: Math.floor(Math.random() * 20) + 80,
    community_growth: (Math.random() * 20 + 5).toFixed(1)
  };

  const calculateHotScore = () => {
    const scores = {
      price: Math.min(100, (crypto.current_price || 0) / 1000),
      market: Math.min(100, ((crypto.market_cap || 0) / 1e12) * 100),
      volume: Math.min(100, ((crypto.total_volume || 0) / 1e10) * 100),
      social: socialMetrics.social_score,
      trending: socialMetrics.trending_score
    };
    
    return Math.floor(Object.values(scores).reduce((a, b) => a + b, 0) / 5);
  };

  return (
    <div 
      className={`flex-1 cursor-pointer transition-all duration-300 transform
        ${position === 'left' ? 'hover:-translate-x-2' : 'hover:translate-x-2'}
        ${isSelected ? 'scale-105' : 'scale-100'}
        hover:scale-105`}
      onClick={onVote}
    >
      <div className={`bg-gradient-to-b from-red-950 to-orange-950 rounded-xl p-6 
        ${isSelected ? 'ring-4 ring-orange-500' : 'ring-1 ring-orange-900'}
        transition-all duration-300`}
      >
        <div className="mb-6">
          <img
            src={crypto.image || '/api/placeholder/200/200'}
            alt={crypto.name}
            className="w-full h-48 object-contain rounded-lg bg-gradient-to-b from-orange-900/20 to-red-900/20 p-4"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-orange-400">{crypto.name}</h2>
              <span className="text-orange-300 text-sm">{crypto.symbol.toUpperCase()}</span>
            </div>
            <div className="bg-orange-900/50 rounded-lg px-3 py-1">
              #{crypto.market_cap_rank || '??'}
            </div>
          </div>

          <div className="space-y-2 bg-black/20 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-orange-300">Price:</span>
              <span className="text-orange-400 font-bold">${formatPrice(crypto.current_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-300">Market Cap:</span>
              <span className="text-orange-400 font-bold">{formatNumber(crypto.market_cap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-300">24h Volume:</span>
              <span className="text-orange-400 font-bold">{formatNumber(crypto.total_volume)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-300">24h Change:</span>
              <span className={`font-bold ${crypto.price_change_24h && crypto.price_change_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.price_change_24h ? `${crypto.price_change_24h.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-orange-900/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-orange-300">Hot Score:</span>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">
                  {calculateHotScore()}
                </span>
              </div>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{ width: `${calculateHotScore()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CryptoHotOrNot: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPair, setCurrentPair] = useState<number[]>([0, 1]);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cryptos');
        if (!response.ok) throw new Error('Failed to fetch crypto data');
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        setError('Failed to load crypto data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleVote('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleVote('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPair]);

  const handleVote = async (side: 'left' | 'right') => {
    if (selectedSide !== null) return; // Prevent double voting
    setSelectedSide(side);
    
    const winnerIndex = side === 'left' ? currentPair[0] : currentPair[1];
    const loserIndex = side === 'left' ? currentPair[1] : currentPair[0];
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: cryptoData[winnerIndex].id,
          loserId: cryptoData[loserIndex].id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save vote');
      }

      // Get next pair after delay
      setTimeout(() => {
        const indices = Array.from({ length: cryptoData.length }, (_, i) => i);
        const filteredIndices = indices.filter(i => i !== winnerIndex && i !== loserIndex);
        const newFirst = Math.floor(Math.random() * filteredIndices.length);
        let newSecond = Math.floor(Math.random() * (filteredIndices.length - 1));
        if (newSecond >= newFirst) newSecond++;
        setCurrentPair([filteredIndices[newFirst], filteredIndices[newSecond]]);
        setSelectedSide(null);
      }, 1000);
      
      // Refresh data
      const refreshResponse = await fetch('/api/cryptos');
      if (refreshResponse.ok) {
        const freshData = await refreshResponse.json();
        setCryptoData(freshData);
      }
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedSide(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-orange-400 font-mono flex items-center justify-center">
        <div className="text-2xl text-center flex items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          LOADING HOT CRYPTO...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 font-mono flex items-center justify-center">
        <div className="text-2xl text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-orange-100 font-mono p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-orange-500 mb-2">CRYPTO HOT OR NOT</h1>
          <p className="text-orange-400 text-xl">Vote for the Hotter Crypto! 🔥</p>
        </div>

        <div className="relative flex justify-center items-center gap-8">
          <CryptoCard 
            crypto={cryptoData[currentPair[0]]} 
            position="left"
            onVote={() => handleVote('left')}
            isSelected={selectedSide === 'left'}
          />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Flame className="w-16 h-16 text-orange-500 animate-pulse" />
          </div>

          <CryptoCard 
            crypto={cryptoData[currentPair[1]]} 
            position="right"
            onVote={() => handleVote('right')}
            isSelected={selectedSide === 'right'}
          />
        </div>

        <div className="mt-8 text-center">
          <Link href="/rankings" 
            className="inline-block bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 
              rounded-lg text-xl font-bold hover:from-orange-500 hover:to-red-500 
              transition-all"
          >
            View Hot List 🔥
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CryptoHotOrNot;