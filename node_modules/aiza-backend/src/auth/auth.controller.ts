import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Request,
  UseGuards,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  profile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPERADMIN")
  @Patch("users/:userId/promote-admin")
  promoteToAdmin(@Param("userId") userId: string, @Request() req: any) {
    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException("Invalid user ID");
    }
    return this.authService.promoteUserToAdmin(Number(userId));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPERADMIN")
  @Get("users")
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPERADMIN")
  @Post("users")
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPERADMIN")
  @Delete("users/:userId")
  deleteUser(@Param("userId") userId: string, @Request() req: any) {
    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException("Invalid user ID");
    }
    return this.authService.deleteUser(Number(userId));
  }
}
