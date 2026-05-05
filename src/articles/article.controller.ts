import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query , Delete} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/guard/roles.decorator';
import { CURRENT_USER_KEY } from '../utils/constant';
import { ArticleStatus } from '../generated/prisma/client';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';

@Controller('articles')
@UseGuards(AuthGuard, RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findAll(@Query('status') status?: ArticleStatus) {
    return this.articleService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @Post()
  @Roles('WRITER', 'ADMIN') // أضفنا أدمن كخيار إضافي أو يمكن حصره بالكاتب فقط
  create(@Body() createArticleDto: CreateArticleDto, @Req() request: any) {
    const user = request[CURRENT_USER_KEY];
    return this.articleService.create(createArticleDto, user.id);
  }

  @Patch(':id')
  @Roles('WRITER', 'EDITOR', 'ADMIN') // Editor, Admin could also edit typos
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto, @Req() request: any) {
    const user = request[CURRENT_USER_KEY];
    return this.articleService.update(id, updateArticleDto, user);
  }

  @Post(':id/submit')
  @Roles('WRITER')
  submitForReview(@Param('id') id: string, @Req() request: any) {
    const user = request[CURRENT_USER_KEY];
    return this.articleService.submitForReview(id, user.id);
  }

  @Post(':id/review')
  @Roles('EDITOR', 'ADMIN')
  reviewArticle(@Param('id') id: string, @Body() updateArticleStatusDto: UpdateArticleStatusDto) {
    return this.articleService.reviewArticle(id, updateArticleStatusDto.status as any);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }
}
