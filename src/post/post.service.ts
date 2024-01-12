import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreatePostDto,
  PostFiltersType,
  PostPaginationResponseType,
  UpdatePostDto,
} from './dtos/post.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getAll(filters: PostFiltersType): Promise<PostPaginationResponseType> {
    const page = Number(filters?.limit) || 1;
    const limit = Number(filters?.limit) || 10;
    const search = filters?.search || '';
    const skip = page > 1 ? (page - 1) * limit : 0;

    const posts = await this.prisma.post.findMany({
      take: limit,
      skip,
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            summary: {
              contains: search,
            },
          },
          {
            content: {
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            description: true,
            name: true,
          },
        },
      },
    });

    const total = await this.prisma.post.count({
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            summary: {
              contains: search,
            },
          },
          {
            content: {
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
      data: posts,
      limit,
      page,
      total,
    };
  }

  async create(data: CreatePostDto): Promise<Post> {
    const res = await this.prisma.post.create({
      data,
    });

    return res;
  }

  async getDetail(id: number): Promise<Post> {
    try {
      const res = await this.prisma.post.findFirstOrThrow({
        where: {
          id,
        },
        include: {
          owner: {
            select: {
              name: true,
              id: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res;
    } catch (error) {
      throw new HttpException(
        { message: 'This post does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updatePost(id: number, data: UpdatePostDto): Promise<Post> {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
      },
    });

    if (!post) {
      throw new HttpException(
        { message: 'This post does not exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.prisma.post.update({
      where: {
        id,
      },
      data,
    });

    return res;
  }
}
