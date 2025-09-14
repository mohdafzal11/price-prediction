import { PrismaClient } from '@prisma/client';

async function run() {
  const prisma = new PrismaClient();
  try {
    const totalTokens = await prisma.token.count();
    console.log('Total tokens:', totalTokens);
    
    const tokensWithCmc = await prisma.token.count({ 
      where: { 
        cmcId: { 
          not: null 
        } 
      } 
    });
    console.log('Tokens with CMC ID:', tokensWithCmc);
    
    const tokensWithRank = await prisma.token.count({ 
      where: { 
        rank: { 
          not: null 
        } 
      } 
    });
    console.log('Tokens with rank:', tokensWithRank);
    
    const top1000Tokens = await prisma.token.count({
      where: {
        AND: [
          { rank: { not: null } },
          { cmcId: { not: null } }
        ]
      },
      take: 1000
    });
    console.log('Tokens for pregeneration:', Math.min(1000, top1000Tokens));
    
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

run(); 