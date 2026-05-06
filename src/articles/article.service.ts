import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus } from '../generated/prisma/client';
@Injectable()
export class ArticleService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(status?: ArticleStatus) {
        return this.prisma.article.findMany({
            where: { status, deletedAt: null },
            include: { author: { select: { fullName: true, username: true } }, category: true }
        });
    }

    async findOne(id: number) {

        if (isNaN(Number(id))) {
            throw new BadRequestException("Author ID must be a number");
        }
        const article = await this.prisma.article.findUnique({
            where: { id },
            include: { author: { select: { fullName: true, username: true } }, category: true }
        });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');
        return article;
    }

    async create(createArticleDto: CreateArticleDto, authorId: number) {

        if (isNaN(Number(authorId))) {
            throw new BadRequestException("Author ID must be a number");
        }
        const existingCategory = await this.prisma.category.findUnique({ where: { id: createArticleDto.categoryId } });
        if (!existingCategory) throw new BadRequestException('Category not found');

        return this.prisma.article.create({
            data: {
                ...createArticleDto,
                authorId,
                status: ArticleStatus.DRAFT, 
            }
        });
    }

    async update(id: number, updateArticleDto: UpdateArticleDto, user: any) {
        const article = await this.prisma.article.findUnique({ where: { id } });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');

        if (user.role === 'WRITER') {
            if (article.authorId !== user.id) {
                throw new ForbiddenException('You can only edit your own articles');
            }
            if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.REJECTED) {
                throw new ForbiddenException('You can only edit DRAFT or REJECTED articles');
            }
        }

        return this.prisma.article.update({
            where: { id },
            data: updateArticleDto
        });
    }

    async submitForReview(id: number, authorId: number) {
        const article = await this.prisma.article.findUnique({ where: { id } });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');

        if (article.authorId !== authorId) {
            throw new ForbiddenException('You can only submit your own articles');
        }

        if (article.status !== ArticleStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT articles can be submitted for review');
        }

        return this.prisma.article.update({
            where: { id },
            data: { status: ArticleStatus.PENDING }
        });
    }

    async reviewArticle(id: number, status: ArticleStatus) {

        const article = await this.prisma.article.findUnique({ where: { id } });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');
        if (status !== ArticleStatus.PUBLISHED && status !== ArticleStatus.REJECTED) {
            throw new BadRequestException('Invalid status for review');
        }

        if (article.status !== ArticleStatus.PENDING) {
            throw new BadRequestException('Article is not in PENDING state');
        }

        return this.prisma.article.update({
            where: { id },
            data: {
                status,
                publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null
            }
        });

    }

    async remove(id: number) {
        const article = await this.prisma.article.findUnique({ where: { id } });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');

        return this.prisma.article.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}

