import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
const { id } = req.query;
const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const user = await prisma.user.findUnique({ where: { id: Number(id) } });
                user ? res.status(200).json(user) : res.status(404).json({ error: 'User not found' });
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch user' });
            }
            break;

        case 'PUT':
            try {
                const { name, email } = req.body;
                const updatedUser = await prisma.user.update({
                    where: { id: Number(id) },
                    data: { name, email },
                });
                res.status(200).json(updatedUser);
            } catch (err) {
                res.status(500).json({ error: 'Failed to update user' });
            }
            break;

        case 'DELETE':
            try {
                await prisma.user.delete({ where: { id: Number(id) } });
                res.status(204).end();
            } catch (err) {
                res.status(500).json({ error: 'Failed to delete user' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
