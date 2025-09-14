import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../src/lib/prisma';
import { redisHandler } from 'utils/redis';

async function generateFAQsFromAI(tokenTicker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CENTRAL_API || 'https://droomdroom.com/api/v1'}/ai/generate-faq`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: [
            `Why is ${tokenTicker}'s price up today?`,
            `Why is ${tokenTicker}'s price down today?`,
            `What could affect ${tokenTicker}'s future price?`,
            `What are people saying about ${tokenTicker}?`,
            `What is the latest news on ${tokenTicker}?`,
            `What is ${tokenTicker}?`,
            `What is next on ${tokenTicker}'s roadmap?`,
          ]
        })
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    return result.data?.faqs || [];
  } catch (error) {
    console.error('Error generating FAQs from AI:', error);
    return [];
  }
}

function areFAQsOld(faqs: any[]): boolean {
  if (faqs.length === 0) return true;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return faqs.some(faq => new Date(faq.updatedAt) < twentyFourHoursAgo);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid id parameter' });
  }

  const cacheKey = `coin_faqs_${id}`;
  const cachedData = await redisHandler.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    let token;

    if (isNumeric) {
      token = await prisma.token.findFirst({
        where: { cmcId: id },
        select: { id: true, name: true, ticker: true }
      });
    }
    
    if (!token) {
      token = await prisma.token.findFirst({
        where: { ticker: id.toUpperCase() },
        select: { id: true, name: true, ticker: true }
      });
    }

    if (!token) {
      try {
        token = await prisma.token.findUnique({
          where: { id: id },
          select: { id: true, name: true, ticker: true }
        });
      } catch (error) {
        // Invalid ObjectId format, continue
        console.error('Invalid ObjectId format:', error);
      }
    }

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    let faqs = await prisma.faqs.findMany({
      where: {
        tokenId: token.id
      },
      select: {
        id: true,
        order: true,
        question: true,
        answer: true,
        generatedBy: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { order: 'asc' },
      ]
    });

    const shouldGenerateNewFAQs = faqs.length === 0 || areFAQsOld(faqs);

    if (shouldGenerateNewFAQs) {
      console.log(`Generating new FAQs for token: ${token.ticker}`);
      
      const generatedFAQs = await generateFAQsFromAI(token.ticker);
      
      if (generatedFAQs.length > 0) {
        if (faqs.length > 0) {
          await prisma.faqs.deleteMany({
            where: { tokenId: token.id }
          });
        }

        const newFAQs = await Promise.all(
          generatedFAQs.map(async (faq: any) => {
            return await prisma.faqs.create({
              data: {
                tokenId: token.id,
                order: faq.order,
                question: faq.question,
                answer: faq.answer,
                generatedBy: 'AI'
              },
              select: {
                id: true,
                question: true,
                answer: true,
                generatedBy: true,
                createdAt: true,
                updatedAt: true
              }
            });
          })
        );

        faqs = newFAQs;
      }
    }

    const result = {
      token: {
        id: token.id,
        name: token.name,
        ticker: token.ticker
      },
      faqs: faqs,
      total: faqs.length,
      lastUpdated: faqs.length > 0 ? faqs[0].updatedAt : null,
      generatedFromAI: shouldGenerateNewFAQs && faqs.length > 0
    };

    await redisHandler.set(cacheKey, result, { expirationTime: 3600 });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
} 