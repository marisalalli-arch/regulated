-- CreateTable
CREATE TABLE "DailyHoroscope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "focusWord" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyHoroscope_date_key" ON "DailyHoroscope"("date");
