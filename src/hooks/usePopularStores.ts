import { useEffect, useState } from "react";
import type { PopularStore } from "../types/sections";
import type { PopularStoresProvider } from "../services/popularStores";
import { popularStoresProvider } from "../services/popularStores";

type Options = { provider?: PopularStoresProvider };

export function usePopularStores(opts?: Options) {
  const [data, setData] = useState<PopularStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const p = opts?.provider ?? popularStoresProvider;
    let alive = true;
    setLoading(true);
    p.list()
      .then((items) => { if (alive) setData(items); })
      .catch((err) => { if (alive) setError(err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [opts?.provider]);

  return { data, loading, error };
}
