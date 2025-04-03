-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hashed_key" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "expires_at" DATETIME,
    "last_used_at" DATETIME,
    "owner_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);
