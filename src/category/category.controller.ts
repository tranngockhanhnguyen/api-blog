import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private category: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  createCategory(@Body() body: CreateCategoryDto): Promise<Category> {
    console.log('body', body);
    return this.category.create(body);
  }

  @Get()
  getAll(): Promise<Category[]> {
    return this.category.getAll();
  }
}
