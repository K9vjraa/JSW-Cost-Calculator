import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export const useRawMaterials = () => {
  return useQuery({
    queryKey: ['RawMaterial'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>('/raw-materials', {
        params: { limit: 500 }
      });
      
      return (data?.data || []).map((item: any) => ({
        id: item.id,
        rawMatId: item.code,
        code: item.code,
        alloyName: item.name,
        name: item.name,
        alloyDescription: item.description,
        isAvail: item.isAvail,
        isMicro: item.isMicro,
        currentRate: item.currentRate,
        currentPrice: item.currentRate,
        updatedById: item.updatedById,
        updatedBy: item.updatedBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    }
  });
};

export const useCreateRawMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMaterial: {
      name: string;
      code: string;
      category?: string | null;
      unit?: string;
      currentRate?: number | null;
      supplier?: string | null;
      status: string;
      description?: string | null;
      isAvail: boolean;
      isMicro: boolean;
    }) => {
      const { data } = await api.post('/raw-materials', newMaterial);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
    },
  });
};

export const useUpdateRawMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updatedFields }: { id: string; [key: string]: any }) => {
      const { data } = await api.put(`/raw-materials/${id}`, updatedFields);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
    },
  });
};

export const useUpdateRawMaterialRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newRate }: { id: string; newRate: number }) => {
      const { data } = await api.put(`/raw-materials/${id}`, { currentRate: newRate });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
  });
};

export const useCreatePrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceData: {
      rawMaterialId?: string | null;
      metalId?: string | null;
      pricePerUnit: number;
      effectiveFrom: string;
      reason?: string;
      source: string;
      actorId?: string;
    }) => {
      const { data } = await api.post('/prices', priceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
      queryClient.invalidateQueries({ queryKey: ['PriceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-table'] });
    },
  });
};

export const usePriceHistory = (materialId?: string | null) => {
  return useQuery({
    queryKey: ['PriceHistory', materialId || 'ALL'],
    queryFn: async () => {
      if (materialId) {
        const { data } = await api.get<{ data: any[] }>(`/materials/${materialId}/price-history`);
        return data?.data || [];
      } else {
        const { data } = await api.get<{ data: any[] }>('/materials/price-history', {
          params: { limit: 1000 }
        });
        return data?.data || [];
      }
    }
  });
};

export const useActiveMaterials = () => {
  return useQuery({
    queryKey: ['activeMaterials'],
    queryFn: async () => {
      const { data } = await api.get<any[]>('/materials');
      return data;
    }
  });
};

export const useCurrentMaterialRate = (materialId: string | null) => {
  return useQuery({
    queryKey: ['currentMaterialRate', materialId],
    queryFn: async () => {
      if (!materialId) return null;
      const { data } = await api.get<any>(`/material-rates/current/${materialId}`);
      return data;
    },
    enabled: !!materialId
  });
};

export const usePublishNewRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      materialId: string;
      newRate: number;
      effectiveDate: string;
      supplier: string;
      reason: string;
      remarks?: string | null;
    }) => {
      const { data } = await api.post('/material-rates/publish', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['RawMaterial'] });
      queryClient.invalidateQueries({ queryKey: ['PriceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
      queryClient.invalidateQueries({ queryKey: ['activeMaterials'] });
      queryClient.invalidateQueries({ queryKey: ['currentMaterialRate'] });
    }
  });
};
