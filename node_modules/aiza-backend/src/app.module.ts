import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { ProductsModule } from "./products/products.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UploadsModule } from "./uploads/uploads.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    UploadsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
