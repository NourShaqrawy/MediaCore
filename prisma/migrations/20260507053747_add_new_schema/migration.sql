/*
  Warnings:

  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "newSchema";

-- CreateEnum
CREATE TYPE "newSchema"."ArticleStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_authorId_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_categoryId_fkey";

-- DropTable
DROP TABLE "articles";

-- DropTable
DROP TABLE "categories";

-- DropEnum
DROP TYPE "ArticleStatus";

-- CreateTable
CREATE TABLE "newSchema"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newSchema"."articles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "status" "newSchema"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "newSchema"."categories"("name");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "newSchema"."articles"("status");

-- CreateIndex
CREATE INDEX "articles_authorId_idx" ON "newSchema"."articles"("authorId");

-- CreateIndex
CREATE INDEX "articles_categoryId_idx" ON "newSchema"."articles"("categoryId");

-- AddForeignKey
ALTER TABLE "newSchema"."articles" ADD CONSTRAINT "articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "newSchema"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newSchema"."articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
