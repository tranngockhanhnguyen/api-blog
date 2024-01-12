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
import { User } from '@prisma/client';
import {
  CreateUserDto,
  UserFiltersType,
  UserPaginationResponseType,
  UserUpdateDto,
} from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private user: UserService) {}

  @Post()
  createUser(@Body() body: CreateUserDto): Promise<User> {
    console.log('create user body', body);
    return this.user.create(body);
  }

  @Get()
  getAll(
    @Query() params: UserFiltersType,
  ): Promise<UserPaginationResponseType> {
    console.log('get all user params', params);
    return this.user.getAll(params);
  }

  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    console.log('id and body', id, body);
    return this.user.update(id, body);
  }

  @Get(':id')
  getUserDetail(@Param('id', ParseIntPipe) id: number): Promise<User> {
    console.log('id', id);
    return this.user.getDetail(id);
  }
}
