import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "superadmin@aiza.com";
  const superAdminPassword = "SuperAdmin123";
  const superAdminName = "Super Administrator";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: superAdminName,
        password: hashedPassword,
        role: "SUPERADMIN",
      },
    });
    console.log(
      `Created superadmin user: ${superAdminEmail} (${superAdminName})`,
    );
  } else {
    console.log(`Superadmin user already exists: ${superAdminEmail}`);
  }

  // Also create a regular admin for testing
  const adminEmail = "admin@aiza.com";
  const adminPassword = "Admin123!";
  const adminName = "Store Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`Created admin user: ${adminEmail} (${adminName})`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  const productCount = await prisma.product.count();
  if (productCount < 12) {
    // Delete existing products to avoid duplicates
    await prisma.product.deleteMany({});
    await prisma.product.createMany({
      data: [
        {
          name: "Silk Embroidered Maxi Dress",
          description:
            "Elegant floor-length maxi dress crafted from pure silk with delicate hand-embroidered floral motifs. Features a flattering A-line silhouette and hidden back zipper.",
          price: 15999.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Dresses",
          stock: 18,
        },
        {
          name: "Tailored Wool Blend Blazer",
          description:
            "Sophisticated single-breasted blazer in premium Italian wool blend. Features notch lapels, double-vented back, and fully lined interior for a polished finish.",
          price: 22999.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Outerwear",
          stock: 12,
        },
        {
          name: "Cashmere Oversized Sweater",
          description:
            "Luxuriously soft 100% Grade-A Mongolian cashmere sweater in a relaxed oversized fit. Features ribbed cuffs and hem with a classic crew neckline.",
          price: 13999.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Knitwear",
          stock: 25,
        },
        {
          name: "High-Waist Wide Leg Trousers",
          description:
            "Modern wide-leg trousers with a flattering high-rise waist. Made from breathable crepe fabric with a flowing drape and side pockets.",
          price: 8499.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Bottoms",
          stock: 30,
        },
        {
          name: "Leather Crossbody Bag",
          description:
            "Handcrafted Italian leather crossbody bag with adjustable strap. Features gold-tone hardware, magnetic closure, and multiple interior compartments.",
          price: 320.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Accessories",
          stock: 8,
        },
        {
          name: "Satin Wrap Blouse",
          description:
            "Effortlessly chic satin wrap blouse with a V-neckline and self-tie waist. The lustrous fabric drapes beautifully for an elegant silhouette.",
          price: 79.99,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Tops",
          stock: 35,
        },
        {
          name: "Floral Print Midi Skirt",
          description:
            "Romantic A-line midi skirt in a vibrant botanical print. Features an elasticated waist, soft pleats, and a gentle movement that catches the light.",
          price: 68.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Bottoms",
          stock: 22,
        },
        {
          name: "Minimalist Gold Hoop Earrings",
          description:
            "Classic 14k gold-plated hoop earrings with a polished finish. Lightweight and hypoallergenic, perfect for everyday elegance.",
          price: 45.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Accessories",
          stock: 50,
        },
        {
          name: "Structured Trench Coat",
          description:
            "Timeless double-breasted trench coat in water-resistant cotton gabardine. Features classic epaulettes, belt, and gun flap detail.",
          price: 345.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Outerwear",
          stock: 6,
        },
        {
          name: "Linen Summer Jumpsuit",
          description:
            "Effortless linen jumpsuit with a relaxed fit, wide legs, and adjustable shoulder straps. Features side pockets and a tie-waist detail.",
          price: 125.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Dresses",
          stock: 15,
        },
        {
          name: "Designer Sunglasses Collection",
          description:
            "Oversized cat-eye sunglasses with UV400 protection lenses and acetate frames. Comes with a luxury carrying case and cleaning cloth.",
          price: 89.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Accessories",
          stock: 40,
        },
        {
          name: "Merino Wool Turtleneck",
          description:
            "Fine-gauge merino wool turtleneck in a slim-fit silhouette. Breathable, temperature-regulating fabric perfect for layering.",
          price: 110.0,
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Knitwear",
          stock: 20,
        },
      ],
    });
    console.log("Created sample products");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
