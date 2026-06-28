import { describe, it, expect } from "vitest";
import { ComparisonMapper } from "../mappers/comparison.mapper.js";

describe("ComparisonMapper", () => {
  it("should map a null session to null", () => {
    expect(ComparisonMapper.toSessionResponse(null)).toBeNull();
  });

  it("should map a database session to a DTO", () => {
    const dbSession = {
      id: "session-1",
      name: "Test Session",
      description: "Desc",
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      items: [
        {
          id: "item-1",
          gradeId: "grade-1",
          position: 0,
          colorCode: "#fff",
          grade: { name: "Grade 1", metalId: "metal-1" }
        }
      ],
      createdBy: {
        id: "user-1",
        name: "Ishan"
      }
    };

    const dto = ComparisonMapper.toSessionResponse(dbSession);

    expect(dto).toEqual({
      id: "session-1",
      name: "Test Session",
      description: "Desc",
      status: "ACTIVE",
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt,
      items: [
        {
          id: "item-1",
          gradeId: "grade-1",
          gradeName: "Grade 1",
          metalId: "metal-1",
          position: 0,
          colorCode: "#fff"
        }
      ],
      createdBy: {
        id: "user-1",
        name: "Ishan"
      }
    });
  });

  it("should map a list of sessions", () => {
    const dbSessions = [{ id: "s1" }, { id: "s2" }];
    const dtos = ComparisonMapper.toSessionListResponse(dbSessions);
    expect(dtos.length).toBe(2);
    expect(dtos[0]!.id).toBe("s1");
    expect(dtos[1]!.id).toBe("s2");
  });
});
