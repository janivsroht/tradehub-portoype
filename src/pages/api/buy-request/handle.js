import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { requestId, action, itemId } = req.body;

    try {
        if (action === 'accept') {
            await prisma.buyRequest.update({
                where: { id: requestId },
                data: { status: 'accepted' },
            });

            // Delist item
            await prisma.item.delete({ where: { id: itemId } });

        } else if (action === 'reject') {
            await prisma.buyRequest.update({
                where: { id: requestId },
                data: { status: 'rejected' },
            });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Handle request error:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
