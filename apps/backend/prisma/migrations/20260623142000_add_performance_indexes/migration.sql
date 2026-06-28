-- CreateIndex
CREATE INDEX "material_price_history_material_id_effective_date_idx" ON "material_price_history"("material_id", "effective_date");

-- CreateIndex
CREATE INDEX "AlloyComponent_metalId_idx" ON "AlloyComponent"("metalId");

-- CreateIndex
CREATE INDEX "AlloyComponent_gradeId_idx" ON "AlloyComponent"("gradeId");

-- CreateIndex
CREATE INDEX "AlloyComponent_rawMaterialId_idx" ON "AlloyComponent"("rawMaterialId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");
