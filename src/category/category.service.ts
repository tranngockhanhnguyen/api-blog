import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dtos/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    const res = await this.prisma.category.create({
      data,
    });
    return res;
  }

  async getAll(): Promise<Category[]> {
    const res = await this.prisma.category.findMany();
    return res;
  }
}
