import { IsEnum, IsNotEmpty } from 'class-validator';
import { ArticleStatus } from '../../generated/prisma/client';

export class UpdateArticleStatusDto {
    @IsNotEmpty()
    @IsEnum(ArticleStatus)
    status!: ArticleStatus;
}
