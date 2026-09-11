-- CreateTable
CREATE TABLE "CalculationHistory" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "form" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "items" JSONB,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalculationHistory_userId_idx" ON "CalculationHistory"("userId");

-- CreateIndex
CREATE INDEX "CalculationHistory_userId_module_idx" ON "CalculationHistory"("userId", "module");

-- CreateIndex
CREATE INDEX "CalculationHistory_userId_isPinned_idx" ON "CalculationHistory"("userId", "isPinned");

-- CreateIndex
CREATE UNIQUE INDEX "CalculationHistory_userId_historyId_key" ON "CalculationHistory"("userId", "historyId");

-- AddForeignKey
ALTER TABLE "CalculationHistory" ADD CONSTRAINT "CalculationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
