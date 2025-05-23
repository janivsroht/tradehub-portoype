import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { sellerId } = req.query;

  if (!sellerId) return res.status(400).json({ error: 'Missing sellerId' });

  try {
    const requests = await prisma.buyRequest.findMany({
      where: {
        sellerId: parseInt(sellerId),
        status: 'pending',
      },
      include: {
        item: true,
        buyer: true,
      },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching buy requests:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
