-- AlterTable
ALTER TABLE "Product" ADD COLUMN "originalPrice" REAL;
ALTER TABLE "Product" ADD COLUMN "images" TEXT NOT NULL DEFAULT '[]';

-- Migrate existing imageUrl data to images array
UPDATE "Product" SET "images" = ('["' || "imageUrl" || '"]') WHERE "imageUrl" IS NOT NULL;

-- Drop old column (SQLite doesn't support dropping columns directly, but Prisma handles this)
-- The imageUrl column will be removed by Prisma's migration system