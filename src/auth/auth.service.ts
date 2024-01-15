import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(data: RegisterDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'This email already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await hash(data.password, 10);

    const res = await this.prisma.user.create({
      data: {
        ...data,
        password: hashPassword,
        refreshToken: '',
      },
    });

    return res;
  }

  async login(
    data: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Email does not exist' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const verify = await compare(data.password, user.password);

    if (!verify) {
      throw new HttpException(
        { message: 'Password does not correct' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    return await this.generateToken(payload);
  }

  private async generateToken(payload: { id: number; email: string }) {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('ACCESS_TOKEN_KEY'),
      expiresIn: this.config.get('ACCESS_TOKEN_EXP_IN'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('REFRESH_TOKEN_KEY'),
      expiresIn: this.config.get('REFRESH_TOKEN_EXP_IN'),
    });

    await this.prisma.user.update({
      where: {
        id: payload.id,
      },
      data: {
        refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    _refresh_token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const verify = await this.jwt.verifyAsync(_refresh_token, {
        secret: this.config.get('REFRESH_TOKEN_KEY'),
      });

      const checkExistToken = await this.prisma.user.findUnique({
        where: {
          email: verify.email,
          refreshToken: _refresh_token,
        },
      });

      if (!checkExistToken) {
        throw new HttpException(
          { message: 'Refesh token is not valid' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.generateToken({
        id: verify.id,
        email: verify.email,
      });
    } catch (error) {
      throw new HttpException(
        { message: 'Refesh token is not valid' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
