export class ComparisonMapper {
  /**
   * Maps a database comparison session entity to an API response DTO.
   */
  static toSessionResponse(session: any) {
    if (!session) return null;

    return {
      id: session.id,
      name: session.name,
      description: session.description,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      items: session.items?.map((item: any) => ({
        id: item.id,
        gradeId: item.gradeId,
        gradeName: item.grade?.name,
        metalId: item.grade?.metalId,
        position: item.position,
        colorCode: item.colorCode,
      })),
      createdBy: session.createdBy ? {
        id: session.createdBy.id,
        name: session.createdBy.name,
      } : null,
    };
  }

  static toSessionListResponse(sessions: any[]) {
    return sessions.map(this.toSessionResponse);
  }
}
