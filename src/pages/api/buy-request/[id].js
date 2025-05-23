import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    try {
      const updated = await prisma.buyRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: action === 'accept' ? 'accepted' : 'rejected',
        },
      });

      if (action === 'accept') {
        // Delist the item
        await prisma.item.delete({
          where: { id: updated.itemId },
        });
      }

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating request:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
