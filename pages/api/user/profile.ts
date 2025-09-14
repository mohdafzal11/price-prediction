import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../prisma/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(2),
  image: z.string().url().optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          image: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const data = updateProfileSchema.parse(req.body);

      // Check if username is already taken by another user
      if (data.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: data.username,
            NOT: { id: session.user.id },
          },
        });

        if (existingUser) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          username: data.username,
          displayName: data.displayName,
          image: data.image,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          image: true,
          createdAt: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
