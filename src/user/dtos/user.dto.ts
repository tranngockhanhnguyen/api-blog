import { User } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @MinLength(6)
  password: string;

  @Matches(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
  phone: string;

  status: number;
}

export interface UserFiltersType {
  page?: number;
  search?: string;
  limit?: number;
}

export interface UserPaginationResponseType {
  data: User[];
  total: number;
  limit: number;
  page: number;
}

export class UserUpdateDto {
  name: string;

  @IsOptional()
  @Matches(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
  phone: string;

  status: number;
}
