import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import { Role } from "../../common/enums";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role;
}
