import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const exists = await this.usersService.findByEmail(registerDto.email);
    if (exists) {
      throw new ConflictException("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const { password, ...result } = user;
    return {
      access_token,
      user: result,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async promoteUserToAdmin(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    if (user.role === "ADMIN") {
      throw new ConflictException("User is already an admin");
    }
    return this.usersService.updateRole(userId, "ADMIN");
  }

  async getAllUsers() {
    return this.usersService.findAll();
  }

  async deleteUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    if (user.role === "SUPERADMIN") {
      throw new ConflictException("Cannot delete super admin");
    }
    return this.usersService.delete(userId);
  }

  async createUser(createUserDto: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const exists = await this.usersService.findByEmail(createUserDto.email);
    if (exists) {
      throw new ConflictException("Email already in use");
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role as any,
    });
  }
}
