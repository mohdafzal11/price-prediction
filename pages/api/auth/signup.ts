import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '../../../prisma/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateUsername, generateDisplayName } from '../../../src/utils/username';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = signupSchema.parse(req.body);
    const username = generateUsername(email);
    const displayName = generateDisplayName(email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const field = 'email';
      return res.status(400).json({ message: `A user with this ${field} already exists` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
