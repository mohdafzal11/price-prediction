const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateRanks() {
  console.log('Starting duplicate rank fix process...');
  
  try {
    // 1. Get all tokens with their ranks and last updated time
    console.log('Fetching all tokens...');
    const allTokens = await prisma.token.findMany({
      select: {
        id: true,
        ticker: true,
        name: true,
        rank: true,
        cmcId: true,
        currentPrice: {
          select: {
            lastUpdated: true
          }
        }
      },
      orderBy: {
        rank: 'asc'
      }
    });
    
    console.log(`Found ${allTokens.length} total tokens`);
    
    // 2. Separate tokens into two groups: within top 5000 and beyond
    const topRankedTokens = allTokens.filter(token => token.rank !== null && token.rank <= 5000);
    const beyondTopRanks = allTokens.filter(token => token.rank !== null && token.rank > 5000);
    const tokensWithoutRank = allTokens.filter(token => token.rank === null);
    
    console.log(`Found ${topRankedTokens.length} tokens within top 5000 ranks`);
    console.log(`Found ${beyondTopRanks.length} tokens beyond rank 5000`);
    console.log(`Found ${tokensWithoutRank.length} tokens without rank`);
    
    // 3. Find duplicate ranks within the top 5000
    const rankMap = new Map();
    const duplicates = [];
    
    topRankedTokens.forEach(token => {
      if (!rankMap.has(token.rank)) {
        rankMap.set(token.rank, [token]);
      } else {
        rankMap.get(token.rank).push(token);
      }
    });
    
    // Identify tokens with duplicate ranks
    for (const [rank, tokens] of rankMap.entries()) {
      if (tokens.length > 1) {
        console.log(`Found ${tokens.length} tokens with rank ${rank}`);
        
        // Sort by last updated date (most recent first)
        tokens.sort((a, b) => {
          const dateA = a.currentPrice?.lastUpdated || new Date(0);
          const dateB = b.currentPrice?.lastUpdated || new Date(0);
          return dateB - dateA;
        });
        
        // Keep the most recently updated token, add others to duplicates list
        const [keepToken, ...dupeTokens] = tokens;
        console.log(`Keeping ${keepToken.name} (${keepToken.ticker}) at rank ${rank} (last updated: ${keepToken.currentPrice?.lastUpdated})`);
        
        dupeTokens.forEach(token => {
          duplicates.push(token);
          console.log(`Marked ${token.name} (${token.ticker}) as duplicate at rank ${rank} (last updated: ${token.currentPrice?.lastUpdated})`);
        });
      }
    }
    
    console.log(`Found ${duplicates.length} tokens with duplicate ranks in top 5000 to be reassigned`);
    
    // 4. Check for missing ranks within top 5000
    const missingRanksInTop5000 = [];
    for (let i = 1; i <= 5000; i++) {
      if (!rankMap.has(i)) {
        missingRanksInTop5000.push(i);
      }
    }
    console.log(`Found ${missingRanksInTop5000.length} missing ranks within top 5000: ${missingRanksInTop5000.length > 0 ? missingRanksInTop5000.slice(0, 10).join(', ') + (missingRanksInTop5000.length > 10 ? '...' : '') : 'none'}`);
    
    // 5. Calculate total tokens to reassign
    const tokensToReassign = [...duplicates, ...beyondTopRanks, ...tokensWithoutRank];
    console.log(`Total tokens to reassign: ${tokensToReassign.length}`);
    
    // 6. Find the highest current rank
    const highestRank = Math.max(...allTokens.filter(t => t.rank !== null).map(t => t.rank));
    console.log(`Highest current rank is ${highestRank}`);
    
    // 7. Generate a continuous sequence of ranks starting from 5001
    const updates = [];
    let nextRank = 5001;
    
    // Sort tokens to reassign by their current rank (if they have one)
    tokensToReassign.sort((a, b) => {
      // If both have ranks, sort by rank
      if (a.rank !== null && b.rank !== null) {
        return a.rank - b.rank;
      }
      // If only one has rank, prioritize the one with rank
      if (a.rank !== null) return -1;
      if (b.rank !== null) return 1;
      // If neither has rank, sort by name
      return a.name.localeCompare(b.name);
    });
    
    // Assign new ranks
    for (const token of tokensToReassign) {
      updates.push({
        tokenId: token.id,
        oldRank: token.rank,
        newRank: nextRank++,
        name: token.name,
        ticker: token.ticker
      });
    }
    
    // Log all planned updates
    console.log('Planned rank updates:');
    console.log(`Will update ${updates.length} tokens with new ranks starting from 5001`);
    
    if (updates.length > 10) {
      // Show first 5 and last 5 if there are many updates
      const first5 = updates.slice(0, 5);
      const last5 = updates.slice(-5);
      
      first5.forEach(update => {
        console.log(`Will reassign ${update.name} (${update.ticker}) from rank ${update.oldRank || 'NULL'} to ${update.newRank}`);
      });
      
      console.log(`... ${updates.length - 10} more updates ...`);
      
      last5.forEach(update => {
        console.log(`Will reassign ${update.name} (${update.ticker}) from rank ${update.oldRank || 'NULL'} to ${update.newRank}`);
      });
    } else {
      // Show all updates if there are few
      updates.forEach(update => {
        console.log(`Will reassign ${update.name} (${update.ticker}) from rank ${update.oldRank || 'NULL'} to ${update.newRank}`);
      });
    }
    
    // 8. Confirm before proceeding
    console.log(`\nReady to update ${updates.length} tokens. The top 5000 ranks will remain unchanged except for resolving duplicates.`);
    console.log(`All tokens beyond rank 5000 will be reassigned continuous ranks starting from 5001.`);
    
    // 9. Perform updates in batches
    console.log('Performing rank updates...');
    
    let updateCount = 0;
    const batchSize = 100; // Process in batches to avoid overwhelming the database
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (update) => {
        await prisma.token.update({
          where: { id: update.tokenId },
          data: { rank: update.newRank }
        });
        updateCount++;
      }));
      
      console.log(`Processed ${Math.min(i + batchSize, updates.length)} of ${updates.length} updates`);
    }
    
    console.log(`Successfully reassigned ranks for ${updateCount} tokens.`);
    console.log('Rank fix process completed.');
    
  } catch (error) {
    console.error('Error fixing duplicate ranks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  fixDuplicateRanks()
    .then(() => console.log('Rank fix process completed'))
    .catch(e => console.error('Error in rank fix process:', e));
}

module.exports = { fixDuplicateRanks }; 