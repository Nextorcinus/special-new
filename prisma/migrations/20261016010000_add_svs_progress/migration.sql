-- CreateTable
CREATE TABLE "SvsProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SvsProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SvsProgress_userId_key"
ON "SvsProgress"("userId");

-- CreateIndex
CREATE INDEX "SvsProgress_userId_idx"
ON "SvsProgress"("userId");

-- AddForeignKey
ALTER TABLE "SvsProgress"
ADD CONSTRAINT "SvsProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
