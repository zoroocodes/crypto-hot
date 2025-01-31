import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1'
    );
    
    const data = await response.json();

    for (const crypto of data) {
      await prisma.cryptocurrency.upsert({
        where: { id: crypto.id },
        update: {
          name: crypto.name,
          symbol: crypto.symbol,
          image: crypto.image,
          current_price: crypto.current_price || 0
        },
        create: {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          image: crypto.image,
          current_price: crypto.current_price || 0,
          wins: 0,
          losses: 0,
          total_votes: 0
        }
      });
    }
    console.log('Database updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();