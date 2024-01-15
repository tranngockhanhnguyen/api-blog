import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Post as PostModel } from '@prisma/client';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { storageConfig } from 'src/helpers/config';
import {
  CreatePostDto,
  PostFiltersType,
  PostPaginationResponseType,
  UpdatePostDto,
} from './dtos/post.dto';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private post: PostService) {}

  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArray = ['.jpg', '.png', 'y.jpeg'];
        if (!allowedExtArray.includes(ext)) {
          req.fileVadilationError = `Wrong extension type. Accepted file ext are ${allowedExtArray.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileVadilationError =
              'File size is too large. Accepted file size is less than 5MB';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  @UseGuards(AuthGuard)
  @Post()
  createPost(
    @Req() req: any,
    @Body() body: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PostModel> {
    console.log('req.user_data>>>>', req.user_data);
    console.log('file>>>', file);
    console.log('body>>>', body);

    if (req.fileVadilationError) {
      throw new BadRequestException(req.fileVadilationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.post.create(req.user_data.id, {
      ...body,
      thumbnail: file.destination + '/' + file.filename,
    });
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
