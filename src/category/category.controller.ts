import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private category: CategoryService) {}

  @Post()
  createCategory(@Body() body: CreateCategoryDto): Promise<Category> {
    console.log('body', body);
    return this.category.create(body);
  }
}
