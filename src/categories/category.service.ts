import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findFirst({
        where: {
            OR: [
                { name: createCategoryDto.name },
                { slug: createCategoryDto.slug }
            ]
        }
    });

    if (existingCategory) {
        throw new BadRequestException('Category name or slug already exists');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { articles: true } // جلب المقالات التابعة للقسم أيضاً
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (updateCategoryDto.name || updateCategoryDto.slug) {
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { name: updateCategoryDto.name },
                    { slug: updateCategoryDto.slug }
                ],
                NOT: { id }
            }
        });
        if (existingCategory) throw new BadRequestException('Category name or slug already exists');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // التحقق مما إذا كان القسم يحتوي على مقالات قبل حذفه
    const articlesCount = await this.prisma.article.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
        throw new BadRequestException('Cannot delete category with associated articles');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category successfully deleted' };
  }
}

