import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cmcId } = req.query;

  if (!cmcId) {
    return res.status(400).json({ error: 'CMC ID is required' });
  }

  try {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical`, {
      params: {
        id: cmcId,
        time_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        time_end: new Date().toISOString(),
        interval: 'daily'
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
      }
    });

    const chartData = response.data.data[cmcId].quotes.map((quote: any) => ({
      timestamp: quote.timestamp,
      price: quote.quote.USD.price
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error fetching CMC data:', error);
    res.status(500).json({ error: 'Error fetching chart data' });
  }
}
