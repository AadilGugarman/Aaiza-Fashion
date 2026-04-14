import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany();
    console.log('Products in database:', products.length);
    console.log('Products:', products);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();