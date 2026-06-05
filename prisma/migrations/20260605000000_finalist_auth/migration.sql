-- CreateTable
CREATE TABLE "AllowedFinalist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "whatsapp" TEXT,

    CONSTRAINT "AllowedFinalist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalistOtp" (
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalistOtp_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "FinalistProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeforcesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedFinalist_email_key" ON "AllowedFinalist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FinalistProfile_email_key" ON "FinalistProfile"("email");
