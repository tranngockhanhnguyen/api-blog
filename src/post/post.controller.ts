import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreatePostDto,
  PostFiltersType,
  PostPaginationResponseType,
  UpdatePostDto,
} from './dtos/post.dto';
import { PostService } from './post.service';
import { Post as PostModel } from '@prisma/client';

@Controller('post')
export class PostController {
  constructor(private post: PostService) {}

  @Post()
  createPost(@Body() body: CreatePostDto): Promise<PostModel> {
    return this.post.create(body);
  }

  @Get()
  getAll(
    @Query() params: PostFiltersType,
  ): Promise<PostPaginationResponseType> {
    console.log('Get all post params', params);
    return this.post.getAll(params);
  }

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    console.log('Get detail post id', id);
    return this.post.getDetail(id);
  }

  @Put(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ): Promise<PostModel> {
    console.log('id and body', id, body);
    return this.post.updatePost(id, body);
  }
}
