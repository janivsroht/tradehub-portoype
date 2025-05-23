import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title, description, price, imageUrl, userEmail } = req.body;

  if (!title || !description || !price || !userEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await prisma.userData.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imageUrl,
        seller: {
          connect: { id: user.id },
        },
      },
    });

    res.status(201).json({ message: "Item listed successfully!", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
