import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockSpaces, type SpaceItem } from '@/mock/data';

interface WorkspaceContextValue {
  currentSpace: SpaceItem;
  spaces: SpaceItem[];
  switchSpace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const DEFAULT_SPACE_ID = '0'; // 我的空间

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSpace, setCurrentSpace] = useState<SpaceItem>(() => {
    return mockSpaces.find(s => s.id === DEFAULT_SPACE_ID) ?? mockSpaces[0];
  });

  // 只展示启用的空间，个人空间排前面
  const spaces = mockSpaces
    .filter(s => s.status === '启用')
    .sort((a, b) => {
      if (a.type === '个人空间' && b.type !== '个人空间') return -1;
      if (a.type !== '个人空间' && b.type === '个人空间') return 1;
      return a.name.localeCompare(b.name, 'zh');
    });

  const switchSpace = useCallback((id: string) => {
    const target = mockSpaces.find(s => s.id === id);
    if (target) setCurrentSpace(target);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ currentSpace, spaces, switchSpace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider');
  return ctx;
}
