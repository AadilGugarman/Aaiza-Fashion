import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: data.items.map((item) => item.productId) } },
    });

    if (products.length !== data.items.length) {
      throw new NotFoundException("One or more products not found");
    }

    const items = data.items.map((item) => {
      const product = products.find((product) => product.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product!.price,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const paymentStatus = data.paymentMethod.toLowerCase().includes("card")
      ? "PAID"
      : "PENDING";

    return this.prisma.order.create({
      data: {
        userId,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  updateStatus(orderId: number, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
  }
}
