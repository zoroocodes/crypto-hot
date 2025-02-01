'use client'

import dynamic from 'next/dynamic'

const CryptoHotOrNot = dynamic(() => import('@/components/CryptoHotOrNot'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black text-orange-400 font-mono flex items-center justify-center">
      <div className="text-2xl text-center">
        Loading...
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main>
      <CryptoHotOrNot />
    </main>
  )
}