-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Calculation_createdAt_idx" ON "Calculation"("createdAt");

-- CreateIndex
CREATE INDEX "Calculation_completedAt_idx" ON "Calculation"("completedAt");

-- CreateIndex
CREATE INDEX "Grade_name_idx" ON "Grade"("name");

-- CreateIndex
CREATE INDEX "Grade_status_idx" ON "Grade"("status");

-- CreateIndex
CREATE INDEX "Grade_createdAt_idx" ON "Grade"("createdAt");

-- CreateIndex
CREATE INDEX "Metal_createdAt_idx" ON "Metal"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
