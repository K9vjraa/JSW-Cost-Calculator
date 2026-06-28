/**
 * GradeService — Complex business logic for Grade Builder.
 */

import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import { prisma } from "../repositories/base.repository.js";
import * as gradeRepo from "../repositories/grade.repository.js";
import type { CreateGradeMaterialInput, UpdateGradeMaterialInput, CloneGradeInput } from "../validations/index.js";

export async function getGrade(id: string) {
  const grade = (await gradeRepo.findGradeById(id)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");
  return grade;
}

export async function getGradeMaterials(gradeId: string) {
  const grade = (await gradeRepo.findGradeById(gradeId)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");
  return grade.gradeMaterials;
}

export async function addGradeMaterial(gradeId: string, data: CreateGradeMaterialInput, actorId: string, ip?: string) {
  const grade = (await gradeRepo.findGradeById(gradeId)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");

  if (grade.status !== "DRAFT" && grade.status !== "ACTIVE") {
     throw new ApiError(400, "Cannot modify materials for a submitted or approved grade.");
  }

  // Check if material already exists in this grade
  const existing = grade.gradeMaterials.find((m: any) => m.rawMaterialId === data.rawMaterialId);
  if (existing) {
    throw new ApiError(400, "Material already exists in this grade. Update it instead.");
  }

  // Check if material is active
  const material = await prisma.rawMaterial.findUnique({ where: { id: data.rawMaterialId } });
  if (!material || !material.availability) {
    throw new ApiError(400, "Only active and available materials can be added.");
  }

  const row = await gradeRepo.createGradeMaterial(gradeId, data);

  await audit({ userId: actorId, action: "ADD_MATERIAL", entity: "Grade", entityId: gradeId, details: { materialId: data.rawMaterialId, composition: data.compositionPercentage }, ipAddress: ip });
  return row;
}

export async function updateGradeMaterial(gradeId: string, materialId: string, data: UpdateGradeMaterialInput, actorId: string, ip?: string) {
  const grade = (await gradeRepo.findGradeById(gradeId)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");

  if (grade.status !== "DRAFT" && grade.status !== "ACTIVE") {
     throw new ApiError(400, "Cannot modify materials for a submitted or approved grade.");
  }

  const existing = grade.gradeMaterials.find((m: any) => m.rawMaterialId === materialId);
  if (!existing) {
    throw new ApiError(404, "Material not found in this grade.");
  }

  const row = await gradeRepo.updateGradeMaterial(existing.id, data as any);
  await audit({ userId: actorId, action: "UPDATE_MATERIAL", entity: "Grade", entityId: gradeId, details: { materialId, composition: data.compositionPercentage }, ipAddress: ip });
  return row;
}

export async function removeGradeMaterial(gradeId: string, materialId: string, actorId: string, ip?: string) {
  const grade = (await gradeRepo.findGradeById(gradeId)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");

  if (grade.status !== "DRAFT" && grade.status !== "ACTIVE") {
     throw new ApiError(400, "Cannot modify materials for a submitted or approved grade.");
  }

  const existing = grade.gradeMaterials.find((m: any) => m.rawMaterialId === materialId);
  if (!existing) {
    throw new ApiError(404, "Material not found in this grade.");
  }

  await gradeRepo.deleteGradeMaterial(existing.id);
  await audit({ userId: actorId, action: "REMOVE_MATERIAL", entity: "Grade", entityId: gradeId, details: { materialId }, ipAddress: ip });
}

export async function cloneGrade(id: string, data: CloneGradeInput, actorId: string, ip?: string) {
  const grade = (await gradeRepo.findGradeById(id)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");

  const newName = data.name || `${grade.name} (Copy)`;
  
  // Create a new grade with same properties, but DRAFT status
  const newGrade = await prisma.$transaction(async (tx) => {
    const created = await tx.grade.create({
      data: {
        metalId: grade.metalId,
        name: newName,
        code: data.code || null,
        category: grade.category,
        steelType: grade.steelType,
        subGrade: grade.subGrade,
        targetBatchQty: grade.targetBatchQty,
        description: grade.description,
        multiplier: grade.multiplier,
        extraPrice: grade.extraPrice,
        mechanicalProperties: typeof grade.mechanicalProperties === 'object' && grade.mechanicalProperties ? grade.mechanicalProperties : {},
        toleranceProperties: typeof grade.toleranceProperties === 'object' && grade.toleranceProperties ? grade.toleranceProperties : {},
        bendProperties: typeof grade.bendProperties === 'object' && grade.bendProperties ? grade.bendProperties : {},
        chemicalComposition: typeof grade.chemicalComposition === 'object' && grade.chemicalComposition ? grade.chemicalComposition : {},
        status: "DRAFT",
        version: 1,
        createdById: actorId,
        updatedById: actorId
      }
    });

    // Copy materials
    if (grade.gradeMaterials.length > 0) {
      await tx.gradeMaterial.createMany({
        data: grade.gradeMaterials.map((m: any) => ({
          gradeId: created.id,
          materialId: m.rawMaterialId,
          compositionPercent: m.compositionPercent,
          autoQuantity: m.autoQuantity,
          sortOrder: m.sortOrder
        }))
      });
    }
    
    // Copy specific properties if they exist
    if (grade.mechanicalProperties) {
      const { id: _id, gradeId: _gid, createdAt: _c, updatedAt: _u, ...mechProps } = grade.mechanicalProperties;
      await tx.mechanicalProperty.create({ data: { ...mechProps, gradeId: created.id } as any });
    }
    if (grade.chemicalComposition) {
      const { id: _id, gradeId: _gid, createdAt: _c, updatedAt: _u, ...chemProps } = grade.chemicalComposition;
      await tx.chemicalProperty.create({ data: { ...chemProps, gradeId: created.id } as any });
    }

    return created;
  });

  await audit({ userId: actorId, action: "CLONE", entity: "Grade", entityId: newGrade.id, details: { originalId: id }, ipAddress: ip });
  return newGrade;
}

export async function validateGrade(id: string, actorId: string) {
  const grade = (await gradeRepo.findGradeById(id)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");

  const errors: string[] = [];

  // Validation 1: Composition must equal 100%
  const totalComposition = grade.gradeMaterials.reduce((acc: number, m: any) => acc + Number(m.compositionPercent), 0);
  if (Math.abs(totalComposition - 100) > 0.01) {
    errors.push(`Total composition is ${totalComposition}%, but must be exactly 100%.`);
  }

  // Validation 2: No duplicate materials (already enforced by DB unique constraint, but checking here)
  const materialIds = new Set();
  for (const gm of grade.gradeMaterials) {
    if (materialIds.has(gm.rawMaterialId)) {
      errors.push(`Duplicate material found: ${gm.material.materialName}`);
    }
    materialIds.add(gm.rawMaterialId);

    // Validation 3 & 4: Active and Approved materials only
    if (!gm.material.availability) {
      errors.push(`Material ${gm.material.materialName} is not active or available.`);
    }

    // Validation 5: Locked Prices only (ensured because prices are not in grade table, but we can verify it has a valid rate)
    if (!gm.material.currentRate || Number(gm.material.currentRate) <= 0) {
      errors.push(`Material ${gm.material.materialName} does not have a valid locked price.`);
    }
  }

  // Validation 6: Target Batch > 0
  if (grade.targetBatchQty != null && Number(grade.targetBatchQty) <= 0) {
    errors.push("Target batch quantity must be greater than 0.");
  }

  const isValid = errors.length === 0;

  // Log validation
  await gradeRepo.createGradeValidationLog({
    gradeId: id,
    status: isValid ? "SUCCESS" : "FAILED",
    errors: errors.length > 0 ? errors : undefined,
    validatedById: actorId
  } as any);

  return { isValid, errors };
}

export async function submitGrade(id: string, actorId: string, ip?: string) {
  const validation = await validateGrade(id, actorId);
  if (!validation.isValid) {
    throw new ApiError(400, "Grade validation failed. Cannot submit. Errors: " + validation.errors.join(", "));
  }

  const grade = (await gradeRepo.findGradeById(id)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");
  
  if (grade.status === "SUBMITTED" || grade.status === "APPROVED") {
      throw new ApiError(400, `Grade is already in ${grade.status} state.`);
  }

  const row = await gradeRepo.updateGrade(id, { status: "SUBMITTED", updatedById: actorId } as any);
  
  await gradeRepo.createGradeHistory({
    gradeId: id,
    action: "SUBMIT",
    previousState: { status: grade.status } as any,
    newState: { status: "SUBMITTED" } as any,
    changedById: actorId
  });

  await audit({ userId: actorId, action: "SUBMIT", entity: "Grade", entityId: id, details: {}, ipAddress: ip });
  return row;
}

export async function publishGrade(id: string, actorId: string, ip?: string) {
  const grade = (await gradeRepo.findGradeById(id)) as any;
  if (!grade) throw new ApiError(404, "Grade not found.");
  
  const validation = await validateGrade(id, actorId);
  if (!validation.isValid) {
    throw new ApiError(400, "Grade validation failed. Cannot publish. Errors: " + validation.errors.join(", "));
  }

  // Increment version
  const newVersion = (grade.version || 1) + 1;

  const row = await prisma.$transaction(async (tx) => {
      // 1. Snapshot current grade state
      await tx.gradeVersion.create({
          data: {
              gradeId: id,
              version: newVersion,
              status: "ACTIVE",
              createdById: actorId,
              approvedById: actorId,
              changeReason: "Auto-published version",
              snapshotJson: grade as any
          }
      });

      // 2. Publish
      const updated = await tx.grade.update({
          where: { id },
          data: { status: "ACTIVE", version: newVersion, updatedById: actorId }
      });

      await tx.gradeHistory.create({
          data: {
              gradeId: id,
              action: "PUBLISH",
              previousState: { status: grade.status, version: grade.version } as any,
              newState: { status: "ACTIVE", version: newVersion } as any,
              changedById: actorId
          }
      });

      return updated;
  });

  await audit({ userId: actorId, action: "PUBLISH", entity: "Grade", entityId: id, details: { version: newVersion }, ipAddress: ip });
  return row;
}
