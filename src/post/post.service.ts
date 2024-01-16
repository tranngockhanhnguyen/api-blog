import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { unlinkSync } from 'fs';
import { PrismaService } from 'src/prisma.service';
import {
  CreatePostDto,
  PostFiltersType,
  PostPaginationResponseType,
  UpdatePostDto,
} from './dtos/post.dto';

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
      orderBy: {
        createdAt: 'desc',
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

  async create(ownerId: number, data: CreatePostDto): Promise<Post> {
    try {
      const res = await this.prisma.post.create({
        data: {
          ...data,
          status: Number(data.status),
          categoryId: Number(data.categoryId),
          ownerId,
        },
      });

      return res;
    } catch (error) {
      throw new HttpException(
        { message: 'Can not create post' },
        HttpStatus.BAD_REQUEST,
      );
    }
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

    if (post.thumbnail) {
      unlinkSync(post.thumbnail);
    }

    const res = await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        ...data,
        categoryId: Number(data.categoryId),
        status: Number(data.status),
      },
    });

    return res;
  }

  async deletePost(id: number): Promise<Post> {
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

    const res = await this.prisma.post.delete({
      where: {
        id,
      },
    });

    if (post.thumbnail) {
      unlinkSync(post.thumbnail);
    }

    return res;
  }
}
