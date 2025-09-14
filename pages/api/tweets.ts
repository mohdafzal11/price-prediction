import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from 'ioredis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a direct Redis connection to use lrange
    const redis = new Redis(process.env.REDIS_URL || '');
    
    // Get tweets from Redis list using lrange (list range)
    const tweetsData = await redis.lrange('twitter_tweets', 0, 0);
    
    // Close the Redis connection
    redis.disconnect();
    
    // If no tweets are found, return an empty array
    if (!tweetsData || tweetsData.length === 0) {
      return res.status(200).json([]);
    }

    // Parse the JSON string from Redis
    try {
      const tweets = JSON.parse(tweetsData[0]);
      return res.status(200).json(tweets);
    } catch (parseError) {
      console.error('Error parsing tweets JSON:', parseError);
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching Twitter tweets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
