import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ---- 类型 ----
export interface TabInfo {
  path: string;
  label: string;
}

interface TabsContextValue {
  tabs: TabInfo[];
  activePath: string;
  addTab: (path: string, label: string) => void;
  removeTab: (path: string) => void;
  setActivePath: (path: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const STORAGE_KEY = 'platform-tabs';

/** 从 sessionStorage 恢复标签栈 */
function loadTabs(): TabInfo[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveTabs(tabs: TabInfo[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {}
}

// ---- Provider ----
export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState<TabInfo[]>(() => {
    const saved = loadTabs();
    if (saved.length > 0) return saved;
    // 默认打开工作台
    return [{ path: '/dev/workbench', label: '工作台' }];
  });

  const [activePath, setActivePath] = useState<string>(() => {
    if (location.pathname === '/') return '/dev/workbench';
    return location.pathname;
  });

  // 持久化
  const updateTabs = useCallback((newTabs: TabInfo[]) => {
    setTabs(newTabs);
    saveTabs(newTabs);
  }, []);

  const addTab = useCallback((path: string, label: string) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.path === path);
      if (exists) {
        // 已存在则仅切换
        setActivePath(path);
        return prev;
      }
      const next = [...prev, { path, label }];
      saveTabs(next);
      return next;
    });
  }, []);

  const removeTab = useCallback((path: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.path !== path);
      if (next.length === 0) {
        // 至少保留工作台
        const fallback: TabInfo = { path: '/dev/workbench', label: '工作台' };
        saveTabs([fallback]);
        navigate(fallback.path);
        setActivePath(fallback.path);
        return [fallback];
      }
      saveTabs(next);
      if (path === activePath) {
        const removedIdx = prev.findIndex((t) => t.path === path);
        const target = next[Math.min(removedIdx, next.length - 1)];
        navigate(target.path);
        setActivePath(target.path);
      }
      return next;
    });
  }, [activePath, navigate]);

  return (
    <TabsContext.Provider value={{ tabs, activePath, addTab, removeTab, setActivePath }}>
      {children}
    </TabsContext.Provider>
  );
};

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be inside TabsProvider');
  return ctx;
}
