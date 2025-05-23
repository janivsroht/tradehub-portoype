import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const users = await prisma.userData.findMany(); 
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
      }
      break;

    case 'POST':
      try {
        const { name, email, password } = req.body; 

        if (!name || !email || !password) {
          return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await prisma.userData.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.userData.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        res.status(201).json({ message: 'User created successfully', user: newUser });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
