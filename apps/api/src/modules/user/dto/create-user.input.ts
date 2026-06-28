import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => String)
  @IsEmail({}, { message: 'Format email tidak valid.' })
  email!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  password?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  roleIds?: number[];
}
