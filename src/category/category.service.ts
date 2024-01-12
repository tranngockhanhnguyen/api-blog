import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dtos/category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    const res = await this.prisma.category.create({
      data,
    });
    return res;
  }
}
