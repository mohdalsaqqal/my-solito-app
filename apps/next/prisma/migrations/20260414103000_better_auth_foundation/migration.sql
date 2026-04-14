CREATE TYPE "AppAuthRole" AS ENUM (
  'customer',
  'pharmacist',
  'admin',
  'marketing',
  'catalog',
  'support',
  'ops'
);

CREATE TABLE "user" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
  "id" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,

  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app_auth_role_mapping" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "AppAuthRole" NOT NULL DEFAULT 'customer',
  "updatedByEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "app_auth_role_mapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE UNIQUE INDEX "app_auth_role_mapping_userId_key" ON "app_auth_role_mapping"("userId");

ALTER TABLE "session"
  ADD CONSTRAINT "session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "account"
  ADD CONSTRAINT "account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_auth_role_mapping"
  ADD CONSTRAINT "app_auth_role_mapping_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
