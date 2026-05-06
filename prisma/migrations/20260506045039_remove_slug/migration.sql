/*
  Warnings:

  - You are about to drop the column `slug` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "articles_slug_idx";

-- DropIndex
DROP INDEX "articles_slug_key";

-- DropIndex
DROP INDEX "categories_slug_idx";

-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "slug";
