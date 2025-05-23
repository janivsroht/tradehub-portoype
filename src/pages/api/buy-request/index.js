import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { itemId, buyerId, sellerId } = req.body;

    if (!itemId || !buyerId || !sellerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Prevent duplicate requests
      const existingRequest = await prisma.buyRequest.findFirst({
        where: {
          itemId,
          buyerId,
          sellerId,
          status: 'pending',
        },
      });

      if (existingRequest) {
        return res.status(409).json({ error: 'Buy request already exists' });
      }

      const request = await prisma.buyRequest.create({
        data: {
          itemId,
          buyerId,
          sellerId,
        },
      });

      return res.status(201).json(request);
    } catch (error) {
      console.error('Error creating buy request:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // GET /api/buy-request?sellerId=1
    if (req.method === 'GET') {
    const { sellerId } = req.query;

    if (!sellerId) return res.status(400).json({ error: 'Missing sellerId' });

    const requests = await prisma.buyRequest.findMany({
        where: { sellerId: Number(sellerId), status: 'pending' },
        include: {
        item: true,
        buyer: { select: { name: true, email: true } }
        },
    });

    return res.status(200).json(requests);
    }

}
