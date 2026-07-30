import React from 'react';
import HeaderNav from './HeaderNav';

interface StandaloneLayoutProps {
  children: React.ReactNode;
}

/** 独立页面布局：仅顶栏 + 内容，无侧栏和页签 */
const StandaloneLayout: React.FC<StandaloneLayoutProps> = ({ children }) => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HeaderNav />
      <div style={{ flex: 1, overflow: 'auto', background: '#f5f7fa' }}>
        {children}
      </div>
    </div>
  );
};

export default StandaloneLayout;
