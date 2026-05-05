import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus } from '../generated/prisma/client';
@Injectable()
export class ArticleService {
    constructor(private readonly prisma: PrismaService) { }

    // عرض كل المقالات (مع فلترة للحالة إن لزم)
    async findAll(status?: ArticleStatus) {
        return this.prisma.article.findMany({
            where: { status, deletedAt: null },
            include: { author: { select: { fullName: true, username: true } }, category: true }
        });
    }

    // عرض مقال واحد
    async findOne(id: number) {
        const article = await this.prisma.article.findUnique({
            where: { id },
            include: { author: { select: { fullName: true, username: true } }, category: true }
        });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');
        return article;
    }

    // إنشاء مقال (خاص بالكاتب)
    async create(createArticleDto: CreateArticleDto, authorId: number) {
        // التحقق من وجود مسار URL (slug) مسبقا
        const existingCategory = await this.prisma.category.findUnique({ where: { id: createArticleDto.categoryId } });
        if (!existingCategory) throw new BadRequestException('Category not found');

        const existingSlug = await this.prisma.article.findUnique({ where: { slug: createArticleDto.slug } });
        if (existingSlug) throw new BadRequestException('Slug already exists');

        return this.prisma.article.create({
            data: {
                ...createArticleDto,
                authorId,
                status: ArticleStatus.DRAFT, // المقال الجديد يبدأ كمسودة دائماً
            }
        });
    }

    // تعديل مقال (يجب أن يتحقق من الصلاحيات والملكية)
    async update(id: number, updateArticleDto: UpdateArticleDto, user: any) {
        const article = await this.prisma.article.findUnique({ where: { id } });
        if (!article || article.deletedAt) throw new NotFoundException('Article not found');

        // إذا كان المستخدم كاتب، فيجب أن يتأكد أن المقال له وأنه ليس منشوراً مثلاً
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

    // إرسال المقال للمراجعة (خاص بالكاتب)
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

    // مراجعة المقال (قبول / رفض) - خاص بالمحرر أو المدير
    async reviewArticle(id: number, status : ArticleStatus) {
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
        // حذف مقال (بشكل ناعم Soft Delete - خاص بالأدمن فقط)

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

