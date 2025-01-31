import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Fetching data from CoinGecko...');
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} cryptocurrencies`);

    let successCount = 0;
    for (const crypto of data) {
      try {
        await prisma.cryptocurrency.upsert({
          where: { id: crypto.id },
          update: {
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            current_price: crypto.current_price || 0,
            market_cap: crypto.market_cap || 0,
            market_cap_rank: crypto.market_cap_rank || 999999,
            total_volume: crypto.total_volume || 0,
            price_change_24h: crypto.price_change_percentage_24h || 0,
            circulating_supply: crypto.circulating_supply || 0,
          },
          create: {
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
            total_votes: 0,
          },
        });
        successCount++;
        console.log(`Updated ${crypto.name} (${successCount}/${data.length})`);
      } catch (error) {
        console.error(`Failed to update ${crypto.name}:`, error);
      }
    }
    console.log(`Successfully updated ${successCount} cryptocurrencies!`);
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();