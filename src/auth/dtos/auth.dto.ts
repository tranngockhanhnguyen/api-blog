import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @Matches(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
  phone: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  status: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
