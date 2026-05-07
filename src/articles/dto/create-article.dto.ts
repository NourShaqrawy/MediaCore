import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200 , {message : "gfgfgfg"})
    title!: string;

    @IsNotEmpty()
    @IsString()
    content!: string;

    @IsNotEmpty()
    @IsNumber()
    categoryId!: number;
}



