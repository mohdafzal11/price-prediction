const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function findDuplicateTokens() {
  console.log('Searching for duplicate tokens...');
  
  // Find duplicate cmcIds
  console.log('\n=== Tokens with duplicate cmcIds ===');
  
  // Get all tokens with cmcId
  const tokensWithCmcId = await prisma.token.findMany({
    where: {
      cmcId: { not: null }
    },
    select: {
      id: true,
      ticker: true,
      name: true,
      cmcId: true
    }
  });
  
  // Group by cmcId
  const cmcIdGroups = {};
  tokensWithCmcId.forEach(token => {
    const cmcId = token.cmcId.toString();
    if (!cmcIdGroups[cmcId]) {
      cmcIdGroups[cmcId] = [];
    }
    cmcIdGroups[cmcId].push(token);
  });
  
  // Find groups with more than one token
  const duplicateCmcIds = Object.entries(cmcIdGroups)
    .filter(([_, tokens]) => tokens.length > 1)
    .map(([cmcId, tokens]) => ({
      cmcId,
      count: tokens.length,
      tickers: tokens.map(t => t.ticker),
      ids: tokens.map(t => t.id)
    }))
    .sort((a, b) => b.count - a.count);
  
  if (duplicateCmcIds.length === 0) {
    console.log('No tokens with duplicate cmcIds found.');
  } else {
    console.log(`Found ${duplicateCmcIds.length} cmcIds with multiple tokens:`);
    duplicateCmcIds.forEach(dup => {
      console.log(`- cmcId: ${dup.cmcId}, Count: ${dup.count}, Tickers: ${dup.tickers.join(', ')}`);
      console.log(`  IDs: ${dup.ids.join(', ')}`);
    });
    
    // Save to file
    fs.writeFileSync('duplicate_cmcids.json', JSON.stringify(duplicateCmcIds, null, 2));
    console.log('Saved duplicate cmcIds to duplicate_cmcids.json');
  }
  
//   // Find duplicate tickers
//   console.log('\n=== Tokens with duplicate tickers ===');
  
//   // Get all tokens
//   const allTokens = await prisma.token.findMany({
//     select: {
//       id: true,
//       ticker: true,
//       name: true
//     }
//   });
  
//   // Group by ticker
//   const tickerGroups = {};
//   allTokens.forEach(token => {
//     if (!tickerGroups[token.ticker]) {
//       tickerGroups[token.ticker] = [];
//     }
//     tickerGroups[token.ticker].push(token);
//   });
  
//   // Find groups with more than one token
//   const duplicateTickers = Object.entries(tickerGroups)
//     .filter(([_, tokens]) => tokens.length > 1)
//     .map(([ticker, tokens]) => ({
//       ticker,
//       count: tokens.length,
//       ids: tokens.map(t => t.id)
//     }))
//     .sort((a, b) => b.count - a.count);
  
//   if (duplicateTickers.length === 0) {
//     console.log('No tokens with duplicate tickers found.');
//   } else {
//     console.log(`Found ${duplicateTickers.length} tickers with multiple tokens:`);
//     duplicateTickers.forEach(dup => {
//       console.log(`- Ticker: ${dup.ticker}, Count: ${dup.count}`);
//       console.log(`  IDs: ${dup.ids.join(', ')}`);
//     });
    
//     // Save to file
//     fs.writeFileSync('duplicate_tickers.json', JSON.stringify(duplicateTickers, null, 2));
//     console.log('Saved duplicate tickers to duplicate_tickers.json');
//   }
  
//   // Find tokens with similar cmcIds (within a small range)
//   console.log('\n=== Tokens with similar cmcIds ===');
//   const tokens = await prisma.token.findMany({
//     where: {
//       cmcId: { not: null }
//     },
//     select: {
//       id: true,
//       ticker: true,
//       name: true,
//       cmcId: true
//     },
//     orderBy: {
//       cmcId: 'asc'
//     }
//   });
  
//   const similarCmcIds = [];
//   for (let i = 0; i < tokens.length - 1; i++) {
//     const current = tokens[i];
//     const next = tokens[i + 1];
    
//     // Check if cmcIds are very close (within 5)
//     if (Math.abs(current.cmcId - next.cmcId) <= 5 && current.ticker !== next.ticker) {
//       similarCmcIds.push({
//         token1: {
//           id: current.id,
//           ticker: current.ticker,
//           name: current.name,
//           cmcId: current.cmcId
//         },
//         token2: {
//           id: next.id,
//           ticker: next.ticker,
//           name: next.name,
//           cmcId: next.cmcId
//         },
//         difference: Math.abs(current.cmcId - next.cmcId)
//       });
//     }
//   }
  
//   if (similarCmcIds.length === 0) {
//     console.log('No tokens with similar cmcIds found.');
//   } else {
//     console.log(`Found ${similarCmcIds.length} pairs of tokens with similar cmcIds:`);
//     similarCmcIds.forEach(pair => {
//       console.log(`- ${pair.token1.ticker} (cmcId: ${pair.token1.cmcId}) and ${pair.token2.ticker} (cmcId: ${pair.token2.cmcId}), Difference: ${pair.difference}`);
//     });
    
//     // Save to file
//     fs.writeFileSync('similar_cmcids.json', JSON.stringify(similarCmcIds, null, 2));
//     console.log('Saved similar cmcIds to similar_cmcids.json');
//   }
  
//   // Find tokens with null cmcIds
//   console.log('\n=== Tokens with null cmcIds ===');
//   const nullCmcIds = await prisma.token.findMany({
//     where: {
//       cmcId: null
//     },
//     select: {
//       id: true,
//       ticker: true,
//       name: true
//     }
//   });
  
//   if (nullCmcIds.length === 0) {
//     console.log('No tokens with null cmcIds found.');
//   } else {
//     console.log(`Found ${nullCmcIds.length} tokens with null cmcIds:`);
//     nullCmcIds.slice(0, 10).forEach(token => {
//       console.log(`- ${token.ticker} (${token.name}), ID: ${token.id}`);
//     });
    
//     if (nullCmcIds.length > 10) {
//       console.log(`... and ${nullCmcIds.length - 10} more`);
//     }
    
//     // Save to file
//     fs.writeFileSync('null_cmcids.json', JSON.stringify(nullCmcIds, null, 2));
//     console.log('Saved tokens with null cmcIds to null_cmcids.json');
//   }
}

async function main() {
  try {
    await findDuplicateTokens();
  } catch (error) {
    console.error('Error finding duplicate tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 