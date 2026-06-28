import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RawMaterial, GradeMaster, GradeMaterial } from '../types';
import { api } from './api';

// ── GET /materials?status=published ──
export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data } = await api.get('/materials?status=published&limit=1000');
      return data.data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
};

// ── GET /grades ──
export const useGrades = () => {
  return useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data } = await api.get('/grades?limit=1000');
      return data.data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
};

// ── GET /grades/:id ──
export const useGrade = (id: string | null) => {
  return useQuery({
    queryKey: ['grade', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/grades/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
};

// ── GET /grades/:id/materials ──
export const useGradeMaterials = (gradeId: string | null) => {
  return useQuery({
    queryKey: ['grade_materials', gradeId],
    queryFn: async () => {
      if (!gradeId) return [];
      const { data } = await api.get(`/grades/${gradeId}/materials`);
      return data.data || [];
    },
    enabled: !!gradeId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
};

// ── POST /grades ──
export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: responseData } = await api.post(`/grades`, data);
      return responseData.data;
    },
    onSuccess: (newGrade) => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      if (newGrade?.id) {
        queryClient.setQueryData(['grade', newGrade.id], newGrade);
      }
    }
  });
};

// ── PUT /grades/:id ──
export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, version }: { id: string; data: any; version?: number }) => {
      const { data: responseData } = await api.put(`/grades/${id}`, { ...data, version });
      return responseData.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['grades'] });
      await queryClient.cancelQueries({ queryKey: ['grade', id] });

      const previousGrades = queryClient.getQueryData<GradeMaster[]>(['grades']);
      const previousGrade = queryClient.getQueryData<any>(['grade', id]);

      // Optimistically update grades list
      if (previousGrades) {
        queryClient.setQueryData<GradeMaster[]>(
          ['grades'],
          previousGrades.map(g => g.id === id ? { ...g, ...data } : g)
        );
      }

      // Optimistically update single grade
      if (previousGrade) {
        queryClient.setQueryData(['grade', id], { ...previousGrade, ...data });
      }

      return { previousGrades, previousGrade };
    },
    onError: (err, variables, context) => {
      if (context?.previousGrades) {
        queryClient.setQueryData(['grades'], context.previousGrades);
      }
      if (context?.previousGrade) {
        queryClient.setQueryData(['grade', variables.id], context.previousGrade);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['grade_materials', variables.id] });
    }
  });
};

// ── DELETE /grades/:id ──
export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/grades/${id}`);
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['grades'] });
      const previousGrades = queryClient.getQueryData<GradeMaster[]>(['grades']);
      if (previousGrades) {
        queryClient.setQueryData<GradeMaster[]>(
          ['grades'],
          previousGrades.filter(g => g.id !== id)
        );
      }
      return { previousGrades };
    },
    onError: (err, id, context) => {
      if (context?.previousGrades) {
        queryClient.setQueryData(['grades'], context.previousGrades);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    }
  });
};

// ── POST /grades/:id/materials ──
export const useAddGradeMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gradeId, materialId, compositionPercent, sortOrder }: {
      gradeId: string;
      materialId: string;
      compositionPercent: number;
      sortOrder: number;
    }) => {
      const { data } = await api.post(`/grades/${gradeId}/materials`, {
        materialId,
        compositionPercent,
        sortOrder
      });
      return data.data;
    },
    onSuccess: (newMat, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade_materials', variables.gradeId] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', variables.gradeId] });
    }
  });
};

// ── PUT /grades/:id/materials/:materialId ──
export const useUpdateGradeMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gradeId, materialId, compositionPercent, sortOrder }: {
      gradeId: string;
      materialId: string;
      compositionPercent?: number;
      sortOrder?: number;
    }) => {
      const { data } = await api.put(`/grades/${gradeId}/materials/${materialId}`, {
        compositionPercent,
        sortOrder
      });
      return data.data;
    },
    onMutate: async ({ gradeId, materialId, compositionPercent, sortOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['grade_materials', gradeId] });

      const previousMaterials = queryClient.getQueryData<any[]>(['grade_materials', gradeId]);

      if (previousMaterials) {
        queryClient.setQueryData<any[]>(
          ['grade_materials', gradeId],
          previousMaterials.map(m => {
            if (m.materialId === materialId) {
              const updated = { ...m };
              if (compositionPercent !== undefined) updated.compositionPercent = compositionPercent;
              if (sortOrder !== undefined) updated.sortOrder = sortOrder;
              return updated;
            }
            return m;
          })
        );
      }

      return { previousMaterials };
    },
    onError: (err, variables, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(['grade_materials', variables.gradeId], context.previousMaterials);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade_materials', variables.gradeId] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', variables.gradeId] });
    }
  });
};

// ── DELETE /grades/:id/materials/:materialId ──
export const useRemoveGradeMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gradeId, materialId }: { gradeId: string; materialId: string }) => {
      await api.delete(`/grades/${gradeId}/materials/${materialId}`);
      return { gradeId, materialId };
    },
    onMutate: async ({ gradeId, materialId }) => {
      await queryClient.cancelQueries({ queryKey: ['grade_materials', gradeId] });

      const previousMaterials = queryClient.getQueryData<any[]>(['grade_materials', gradeId]);

      if (previousMaterials) {
        queryClient.setQueryData<any[]>(
          ['grade_materials', gradeId],
          previousMaterials.filter(m => m.materialId !== materialId)
        );
      }

      return { previousMaterials };
    },
    onError: (err, variables, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(['grade_materials', variables.gradeId], context.previousMaterials);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grade_materials', variables.gradeId] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', variables.gradeId] });
    }
  });
};

// ── POST /grades/:id/validate ──
export const useValidateGrade = () => {
  return useMutation({
    mutationFn: async (gradeId: string) => {
      const { data } = await api.post(`/grades/${gradeId}/validate`);
      return data.data;
    }
  });
};

// ── POST /grades/:id/submit ──
export const useSubmitGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gradeId: string) => {
      const { data } = await api.post(`/grades/${gradeId}/submit`);
      return data.data;
    },
    onSuccess: (data, gradeId) => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', gradeId] });
    }
  });
};

// ── POST /grades/:id/clone ──
export const useCloneGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, code, name }: { id: string; code: string; name: string }) => {
      const { data } = await api.post(`/grades/${id}/clone`, { code, name });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    }
  });
};

// ── POST /grades/:id/publish ──
export const usePublishGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gradeId: string) => {
      const { data } = await api.post(`/grades/${gradeId}/publish`);
      return data.data;
    },
    onSuccess: (data, gradeId) => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grade', gradeId] });
    }
  });
};
