-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image360" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "iframeName" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Image360" ("createdAt", "id", "iframeName", "productHandle", "productId", "title") SELECT "createdAt", "id", "iframeName", "productHandle", "productId", "title" FROM "Image360";
DROP TABLE "Image360";
ALTER TABLE "new_Image360" RENAME TO "Image360";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
