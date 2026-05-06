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
            name: createCategoryDto.name
        }
    });

    if (existingCategory) {
        throw new BadRequestException('Category name already exists');
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
      include: { articles: true } 
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (updateCategoryDto.name) {
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name: updateCategoryDto.name,
                NOT: { id }
            }
        });
        if (existingCategory) throw new BadRequestException('Category name already exists');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const articlesCount = await this.prisma.article.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
        throw new BadRequestException('Cannot delete category with associated articles');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category successfully deleted' };
  }
}

