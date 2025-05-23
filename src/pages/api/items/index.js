import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Set response content type
  res.setHeader('Content-Type', 'application/json');

  try {
    // Switch based on HTTP method
    switch (req.method) {
      case 'GET': {
        const { sellerId } = req.query;

        let items;

        // If sellerId is provided, filter by sellerId
        if (sellerId) {
        // Convert sellerId to number before using it
        const sellerIdNumber = parseInt(sellerId, 10);
        
        if (isNaN(sellerIdNumber)) {
          return res.status(400).json({ error: "Invalid sellerId query parameter" });
        }

        items = await prisma.item.findMany({
          where: {
            sellerId: sellerIdNumber,
          },
          include: {
            seller: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });
      } else {
          // Otherwise, fetch all items
          items = await prisma.item.findMany({
            include: {
              seller: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });
        }

        return res.status(200).json(items);
      }

      case 'POST': {
        // Validate content type
        if (req.headers['content-type'] !== 'application/json') {
          return res.status(415).json({ error: 'Content-Type must be application/json' });
        }

        const { title, description, price, imageUrl, sellerId } = req.body;

        // Check for missing fields
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!description) missingFields.push('description');
        if (!price) missingFields.push('price');
        if (!imageUrl) missingFields.push('imageUrl');
        if (!sellerId) missingFields.push('sellerId');

        if (missingFields.length > 0) {
          return res.status(400).json({
            error: 'Missing required fields',
            missingFields,
          });
        }

        // Create a new item in the DB
        const newItem = await prisma.item.create({
          data: {
            title,
            description,
            price: Number(price),
            imageUrl,
            seller: {
              connect: { id: sellerId },
            },
          },
          include: {
            seller: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });

        return res.status(201).json(newItem);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
