import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.auth.register(body);
  }
  @Post('login')
  login(
    @Body() body: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.auth.login(body);
  }

  @Post('refresh-token')
  refreshToken(
    @Body() { refresh_token },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.auth.refreshToken(refresh_token);
  }
}
