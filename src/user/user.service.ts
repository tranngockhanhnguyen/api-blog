import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import {
  CreateUserDto,
  UserFiltersType,
  UserPaginationResponseType,
  UserUpdateDto,
} from './dtos/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'User already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await hash(data.password, 10);
    const res = await this.prisma.user.create({
      data: { ...data, password: hashPassword, refreshToken: '' },
    });

    return res;
  }

  async getAll(filters: UserFiltersType): Promise<UserPaginationResponseType> {
    const currentPage = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 10;
    const search = filters?.search || '';
    const skip = currentPage > 1 ? (currentPage - 1) * limit : 0;

    const users = await this.prisma.user.findMany({
      take: limit,
      skip,
      where: {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
        AND: [
          {
            status: {
              equals: 1,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.user.count({
      where: {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
        AND: [
          {
            status: {
              equals: 1,
            },
          },
        ],
      },
    });

    return {
      data: users,
      limit,
      page: currentPage,
      total,
    };
  }

  async update(id: number, data: UserUpdateDto): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'User does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });

    return res;
  }

  async getDetail(id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        posts: {},
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'User does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }
}
