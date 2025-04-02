-- PostgreSQL database schema for Golden Age application

-- Users table
CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "firstName" VARCHAR(50) NOT NULL,
  "lastName" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password" VARCHAR(128) NOT NULL,
  "phoneNumber" VARCHAR(20) UNIQUE NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'resident',
  "languagePreference" VARCHAR(5) NOT NULL DEFAULT 'he',
  "darkMode" BOOLEAN NOT NULL DEFAULT false,
  "fontSize" VARCHAR(20) NOT NULL DEFAULT 'medium',
  "resetPasswordToken" VARCHAR(255),
  "resetPasswordExpire" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE "RefreshTokens" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "token" VARCHAR(1024) UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "isRevoked" BOOLEAN NOT NULL DEFAULT false,
  "revokedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant menus table
CREATE TABLE "RestaurantMenus" (
  "id" SERIAL PRIMARY KEY,
  "date" DATE UNIQUE NOT NULL,
  "menuXml" TEXT NOT NULL,
  "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant hours table
CREATE TABLE "RestaurantHours" (
  "id" SERIAL PRIMARY KEY,
  "hoursJson" TEXT NOT NULL,
  "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pool hours table
CREATE TABLE "PoolHours" (
  "id" SERIAL PRIMARY KEY,
  "hoursXml" TEXT NOT NULL,
  "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE "Activities" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "location" VARCHAR(100),
  "date" DATE NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "instructor" VARCHAR(100),
  "maxParticipants" INTEGER,
  "equipment" TEXT,
  "imageUrl" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Activity registrations table
CREATE TABLE "ActivityRegistrations" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "activityId" INTEGER NOT NULL REFERENCES "Activities"("id") ON DELETE CASCADE,
  "registeredAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "activityId")
);

-- Messages table
CREATE TABLE "Messages" (
  "id" SERIAL PRIMARY KEY,
  "senderId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "recipientId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "subject" VARCHAR(255),
  "content" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medical appointments table
CREATE TABLE "MedicalAppointments" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "doctorName" VARCHAR(100) NOT NULL,
  "specialty" VARCHAR(100),
  "date" DATE NOT NULL,
  "time" TIME NOT NULL,
  "duration" INTEGER NOT NULL DEFAULT 30, -- in minutes
  "location" VARCHAR(100),
  "notes" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "summary" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE "MedicalRecords" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "recordType" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "doctorName" VARCHAR(100),
  "attachmentUrl" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medications table
CREATE TABLE "Medications" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "dosage" VARCHAR(50) NOT NULL,
  "frequency" VARCHAR(100) NOT NULL,
  "purpose" TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Allergies table
CREATE TABLE "Allergies" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "severity" VARCHAR(50), -- mild, moderate, severe
  "reaction" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "idx_refreshTokens_userId" ON "RefreshTokens"("userId");
CREATE INDEX "idx_restaurantMenus_date" ON "RestaurantMenus"("date");
CREATE INDEX "idx_activities_date" ON "Activities"("date");
CREATE INDEX "idx_activityRegistrations_userId" ON "ActivityRegistrations"("userId");
CREATE INDEX "idx_activityRegistrations_activityId" ON "ActivityRegistrations"("activityId");
CREATE INDEX "idx_messages_senderId" ON "Messages"("senderId");
CREATE INDEX "idx_messages_recipientId" ON "Messages"("recipientId");
CREATE INDEX "idx_medicalAppointments_userId" ON "MedicalAppointments"("userId");
CREATE INDEX "idx_medicalAppointments_date" ON "MedicalAppointments"("date");
CREATE INDEX "idx_medicalRecords_userId" ON "MedicalRecords"("userId");
CREATE INDEX "idx_medications_userId" ON "Medications"("userId");
CREATE INDEX "idx_allergies_userId" ON "Allergies"("userId");