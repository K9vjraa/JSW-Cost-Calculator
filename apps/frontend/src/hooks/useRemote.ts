import { useEffect, useState } from "react";

export function useRemote<T>(loader: () => Promise<T>, fallback: T) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loader().then((next) => {
      if (mounted) setData(next);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
