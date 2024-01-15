import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';
import { storageConfig } from 'src/helpers/config';
import {
  CreateUserDto,
  UserFiltersType,
  UserPaginationResponseType,
  UserUpdateDto,
} from './dtos/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private user: UserService) {}

  @UseGuards(AuthGuard)
  @Post()
  createUser(@Body() body: CreateUserDto): Promise<User> {
    console.log('create user body', body);
    return this.user.create(body);
  }

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @UseGuards(AuthGuard)
  @Get()
  getAll(
    @Query() params: UserFiltersType,
  ): Promise<UserPaginationResponseType> {
    console.log('get all user params', params);
    return this.user.getAll(params);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    console.log('id and body', id, body);
    return this.user.update(id, body);
  }

  @ApiParam({ name: 'id' })
  @UseGuards(AuthGuard)
  @Get(':id')
  getUserDetail(@Param('id', ParseIntPipe) id: number): Promise<User> {
    console.log('id', id);
    return this.user.getDetail(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.user.delete(id);
  }

  @UseGuards(AuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
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
  uploadFile(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log('userdata>>>', req.user_data);
    console.log('file>>>', file);
    if (req.fileVadilationError) {
      throw new BadRequestException(req.fileVadilationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.user.upload(
      req.user_data.email,
      file.destination + '/' + file.filename,
    );
  }
}
