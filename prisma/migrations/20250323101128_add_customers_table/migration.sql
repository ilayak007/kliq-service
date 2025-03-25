-- CreateTable
CREATE TABLE "Customers" (
    "customerId" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "lastLoggedIn" TIMESTAMP(3),

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customers_email_key" ON "Customers"("email");
