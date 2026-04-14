import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class OrderItemDto {
  @IsInt()
  @Type(() => Number)
  productId!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsNotEmpty()
  @IsString()
  paymentMethod!: string;
}
