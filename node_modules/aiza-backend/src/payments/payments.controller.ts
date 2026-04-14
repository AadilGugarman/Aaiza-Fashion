import { Body, Controller, Post } from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("checkout")
  async checkout(@Body() payload: CreatePaymentDto) {
    return this.paymentsService.checkout(payload);
  }
}
