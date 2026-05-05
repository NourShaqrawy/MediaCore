import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    slug!: string;

    @IsNotEmpty()
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsNotEmpty()
    @IsString()
    categoryId!: string;
}
