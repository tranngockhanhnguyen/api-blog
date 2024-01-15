import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiResponse({
    status: 201,
    description: 'Resgister successfully',
  })
  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.auth.register(body);
  }

  @ApiOkResponse({ description: 'Login successfully' })
  @ApiUnauthorizedResponse({ description: 'Email or Password is not correct' })
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
