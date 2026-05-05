import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

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

    @IsNotEmpty()
    @IsNumber()
    categoryId!: number;
}



