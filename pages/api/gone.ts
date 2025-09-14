import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint that returns a 410 Gone status for deprecated or invalid URL paths
 * This is used for URLs containing "[slug]" which should not be accessed directly
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return a 410 Gone status with a simple text message
  res.status(410).send('Gone - This URL is no longer valid');
} 