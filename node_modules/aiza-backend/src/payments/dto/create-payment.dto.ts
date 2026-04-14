import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export enum PaymentMethod {
  CARD = "card",
  NET_BANKING = "netbanking",
  WALLET = "wallet",
  UPI = "upi",
  COD = "cod",
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  description?: string;
}
