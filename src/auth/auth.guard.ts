import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('ACCESS_TOKEN_KEY'),
      });
      request['user_data'] = payload;
      return true;
    } catch (error) {
      throw new HttpException(
        {
          messsage: 'Token expired',
          status: 419,
        },
        419,
      );
    }
  }

  private extractTokenFromHeaders(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
}
