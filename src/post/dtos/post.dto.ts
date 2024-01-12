import { Post } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export interface PostFiltersType {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PostPaginationResponseType {
  data: Post[];
  page: number;
  limit: number;
  total: number;
}

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  summary: string;

  @IsNotEmpty()
  content: string;

  status: number;

  @IsNotEmpty()
  ownerId: number;

  @IsNotEmpty()
  categoryId: number;
}

export class UpdatePostDto {
  title: string;
  summary: string;
  content: string;
  status: number;
  ownerId: number;
  categoryId: number;
}
