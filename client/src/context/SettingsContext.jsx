import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const SettingsContext = createContext({ settings: null, loading: true, error: null, reload: () => {} });

export const SettingsProvider = ({ children }) => {
  const [state, setState] = useState({ settings: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await api.get("/api/settings");
      setState({ settings: data.settings, loading: false, error: null });
    } catch (err) {
      setState({ settings: null, loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <SettingsContext.Provider value={{ ...state, reload: load }}>{children}</SettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  // empty object so components can safely read fields while loading
  return { ...ctx, s: ctx.settings || {} };
};
