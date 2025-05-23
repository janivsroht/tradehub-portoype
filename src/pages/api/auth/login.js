import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {


  if (req.method !== 'POST') {
  

    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });


  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.userData.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Optional: You can return user data or JWT later
    res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });

  } catch (err) {
    console.error("🔥 Login server error:", err.message);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
}
