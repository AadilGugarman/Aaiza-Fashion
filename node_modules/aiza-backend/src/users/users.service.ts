import { Injectable } from "@nestjs/common";
import type { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { name: string; email: string; password: string; role: Role }) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
