import React from 'react';
import { Tabs } from 'antd';

export interface PageTabItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

interface PageTabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  items: PageTabItem[];
}

const PageTabs: React.FC<PageTabsProps> = ({ activeKey, onChange, items }) => {
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      tabBarStyle={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      items={items.map((item) => ({
        key: item.key,
        label: <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>,
        children: item.children,
      }))}
    />
  );
};

export default PageTabs;
