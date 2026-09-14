-- CreateTable
CREATE TABLE "RunnerRating" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunnerRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RunnerRating_orderId_key" ON "RunnerRating"("orderId");

-- CreateIndex
CREATE INDEX "RunnerRating_runnerId_idx" ON "RunnerRating"("runnerId");

-- CreateIndex
CREATE INDEX "RunnerRating_studentId_idx" ON "RunnerRating"("studentId");

-- AddForeignKey
ALTER TABLE "RunnerRating" ADD CONSTRAINT "RunnerRating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunnerRating" ADD CONSTRAINT "RunnerRating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunnerRating" ADD CONSTRAINT "RunnerRating_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
