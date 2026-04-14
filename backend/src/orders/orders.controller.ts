import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyOrders(@Request() req: any) {
    return this.ordersService.findByUser(Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(Number(req.user.userId), createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin")
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      Number(id),
      updateOrderStatusDto.status,
    );
  }
}
