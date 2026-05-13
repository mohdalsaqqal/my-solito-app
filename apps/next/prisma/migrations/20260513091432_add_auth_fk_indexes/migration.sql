CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "verification"("identifier");
