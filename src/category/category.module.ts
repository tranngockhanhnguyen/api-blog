import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  providers: [CategoryService, PrismaService, ConfigService, JwtService],
  controllers: [CategoryController],
})
export class CategoryModule {}
