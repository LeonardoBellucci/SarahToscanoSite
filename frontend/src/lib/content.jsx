import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { api } from "./api";

const ContentContext = createContext({ content: null, refresh: () => {} });

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const location = useLocation();

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/content");
      setContent(data);
    } catch (e) {
      console.error("content fetch failed", e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <ContentContext.Provider value={{ content, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}
