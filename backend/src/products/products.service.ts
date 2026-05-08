import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductDto) {
    const productData = {
      ...data,
      images: data.images ? JSON.stringify(data.images) : "[]",
      // Provide imageUrl for backward compatibility with existing database schema
      imageUrl:
        Array.isArray(data.images) && data.images.length > 0
          ? data.images[0]
          : "",
    };
    return this.prisma.product.create({ data: productData });
  }

  findAll() {
    return this.prisma.product
      .findMany({
        orderBy: { createdAt: "desc" },
      })
      .then((products) =>
        products.map((product) => ({
          ...product,
          images: JSON.parse(product.images),
        })),
      );
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } }).then((product) => {
      if (!product) return null;
      return {
        ...product,
        images: JSON.parse(product.images),
      };
    });
  }

  update(id: number, data: UpdateProductDto) {
    const updateData: any = { ...data };
    if (data.images) {
      updateData.images = JSON.stringify(data.images);
      // Update imageUrl to the first image for backward compatibility
      if (Array.isArray(data.images) && data.images.length > 0) {
        updateData.imageUrl = data.images[0];
      }
    }
    return this.prisma.product
      .update({ where: { id }, data: updateData })
      .then((product) => {
        if (!product) return null;
        return {
          ...product,
          images: JSON.parse(product.images),
        };
      });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
