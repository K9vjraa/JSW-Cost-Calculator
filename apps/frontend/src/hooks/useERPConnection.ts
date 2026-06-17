import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { logger } from "../utils/logger";
import { useEffect, useRef } from "react";

export function useERPConnection() {
  const query = useQuery({
    queryKey: ["erp-connection-health"],
    queryFn: async () => {
      // Axios requests to "/health" will resolve to VITE_API_URL + "/health"
      // e.g., http://localhost:4000/api/health
      const response = await api.get("/health");
      return response.data;
    },
    // Heartbeat check every 10 seconds
    refetchInterval: 10000,
    // Disable automatic immediate infinite retry loops on failure
    // We let the 10-second interval query handle the reconnections.
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const isConnected = !query.isError && !!query.data;
  const isReconnecting = query.isFetching && query.isError;
  
  // Track previous connection status to only log when the status transitions
  const prevStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    const currentStatus = isConnected;
    if (prevStatusRef.current !== currentStatus) {
      if (currentStatus) {
        logger.info("ERP Connection Status: CONNECTED", { service: "mcms-api" });
      } else {
        logger.warn("ERP Connection Status: DISCONNECTED", { 
          error: query.error instanceof Error ? query.error.message : String(query.error) 
        });
      }
      prevStatusRef.current = currentStatus;
    }
  }, [isConnected, query.error]);

  return {
    isConnected,
    isReconnecting,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
