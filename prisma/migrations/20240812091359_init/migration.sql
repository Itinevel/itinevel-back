-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "cin" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "em_number" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "countries" TEXT[],
    "totalCost" DOUBLE PRECISION NOT NULL,
    "itinerarymongoid" TEXT NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cin_key" ON "users"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "itineraries_itinerarymongoid_key" ON "itineraries"("itinerarymongoid");
