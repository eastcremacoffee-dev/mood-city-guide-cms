/*
  Warnings:

  - You are about to drop the column `iconName` on the `coffee_features` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `coffee_features` table. All the data in the column will be lost.
  - Added the required column `featureId` to the `coffee_features` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "feature_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coffee_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coffeeShopId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    CONSTRAINT "coffee_features_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "coffee_shops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "coffee_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_coffee_features" ("coffeeShopId", "createdAt", "id") SELECT "coffeeShopId", "createdAt", "id" FROM "coffee_features";
DROP TABLE "coffee_features";
ALTER TABLE "new_coffee_features" RENAME TO "coffee_features";
CREATE UNIQUE INDEX "coffee_features_coffeeShopId_featureId_key" ON "coffee_features"("coffeeShopId", "featureId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "feature_templates_name_key" ON "feature_templates"("name");
