-- CreateTable
CREATE TABLE "DailyTarot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "arcana" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTarot_date_key" ON "DailyTarot"("date");
