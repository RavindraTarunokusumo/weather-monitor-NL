-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "City" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'NL',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRun" (
    "id" UUID NOT NULL,
    "sourceName" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsFetched" INTEGER NOT NULL DEFAULT 0,
    "recordsStored" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SourceRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatureC" DOUBLE PRECISION,
    "feelsLikeC" DOUBLE PRECISION,
    "rainMm" DOUBLE PRECISION,
    "rainProbability" DOUBLE PRECISION,
    "windSpeedKmh" DOUBLE PRECISION,
    "windGustKmh" DOUBLE PRECISION,
    "windDirection" TEXT,
    "weatherCode" TEXT,
    "warningLevel" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourcePayload" JSONB,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirQualitySnapshot" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aqiValue" DOUBLE PRECISION,
    "aqiLabel" TEXT,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "o3" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,
    "mainPollutant" TEXT,
    "trendLabel" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourcePayload" JSONB,

    CONSTRAINT "AirQualitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterSnapshot" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "stationId" TEXT,
    "stationName" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterLevelCm" DOUBLE PRECISION,
    "trendLabel" TEXT,
    "riskLabel" TEXT,
    "sourceName" TEXT NOT NULL,
    "sourcePayload" JSONB,

    CONSTRAINT "WaterSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSnapshot" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stateHash" TEXT NOT NULL,
    "weatherSnapshotId" UUID,
    "airQualitySnapshotId" UUID,
    "waterSnapshotId" UUID,
    "cycleComfortScore" INTEGER,
    "cycleComfortLabel" TEXT,
    "bestOutdoorWindow" TEXT,
    "worstOutdoorWindow" TEXT,
    "summaryPayload" JSONB NOT NULL,

    CONSTRAINT "DashboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiBriefing" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "dashboardSnapshotId" UUID NOT NULL,
    "stateHash" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "briefingText" TEXT NOT NULL,
    "structuredBriefing" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AiBriefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "externalProvider" TEXT,
    "externalUserId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaInteraction" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "anonymousSessionId" TEXT,
    "cityId" UUID NOT NULL,
    "dashboardSnapshotId" UUID,
    "question" TEXT NOT NULL,
    "normalizedIntent" TEXT,
    "answer" TEXT NOT NULL,
    "answerMode" TEXT NOT NULL,
    "usedModel" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "estimatedCostUsd" DECIMAL(65,30),
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QaInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageQuota" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "anonymousSessionId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "qaUsed" INTEGER NOT NULL DEFAULT 0,
    "qaLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalUserId_key" ON "User"("externalUserId");

-- AddForeignKey
ALTER TABLE "WeatherSnapshot" ADD CONSTRAINT "WeatherSnapshot_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirQualitySnapshot" ADD CONSTRAINT "AirQualitySnapshot_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSnapshot" ADD CONSTRAINT "WaterSnapshot_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSnapshot" ADD CONSTRAINT "DashboardSnapshot_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSnapshot" ADD CONSTRAINT "DashboardSnapshot_weatherSnapshotId_fkey" FOREIGN KEY ("weatherSnapshotId") REFERENCES "WeatherSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSnapshot" ADD CONSTRAINT "DashboardSnapshot_airQualitySnapshotId_fkey" FOREIGN KEY ("airQualitySnapshotId") REFERENCES "AirQualitySnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSnapshot" ADD CONSTRAINT "DashboardSnapshot_waterSnapshotId_fkey" FOREIGN KEY ("waterSnapshotId") REFERENCES "WaterSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiBriefing" ADD CONSTRAINT "AiBriefing_dashboardSnapshotId_fkey" FOREIGN KEY ("dashboardSnapshotId") REFERENCES "DashboardSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaInteraction" ADD CONSTRAINT "QaInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaInteraction" ADD CONSTRAINT "QaInteraction_dashboardSnapshotId_fkey" FOREIGN KEY ("dashboardSnapshotId") REFERENCES "DashboardSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageQuota" ADD CONSTRAINT "UsageQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
