import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

/** GET a backend URL. Re-fetches when `url` changes; pass null to skip. */
export const useApi = (url, { select = (d) => d, initial = null } = {}) => {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get(url)
      .then(({ data }) => !cancelled && setData(select(data)))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
};

export const usePackages = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)).toString();
  const { data, ...rest } = useApi(`/api/package/get-packages?${qs}`, { select: (d) => ({ packages: d.packages || [], total: d.total || 0 }) });
  return { packages: data?.packages || [], total: data?.total || 0, ...rest };
};
