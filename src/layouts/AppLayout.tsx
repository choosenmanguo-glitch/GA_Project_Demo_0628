import React, { useMemo, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderNav from './HeaderNav';
import TabBar from '@/components/TabBar';
import { topNavModules, moduleSideMenus, moduleLabelMap, resolvePageLabel } from '@/config';
import { useTabs } from '@/contexts/TabsContext';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

interface MasterLayoutProps {
  children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTab, setActivePath } = useTabs();

  // 路由变化时自动添加页签
  useEffect(() => {
    const path = location.pathname;
    // 排除根路径和仅含模块前缀的路径
    if (path === '/') return;
    const label = resolvePageLabel(path);
    addTab(path, label);
  }, [location.pathname]);

  // 判断当前激活的一级模块
  const activeModule = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    for (const mod of topNavModules) {
      if (path.startsWith(mod.path)) return mod.key;
    }
    return 'dev';
  }, [location.pathname]);

  // 当前模块的左侧菜单项
  const sideMenuItems = moduleSideMenus[activeModule] ?? [];

  // 当前选中的菜单 key：精确匹配路径
  const selectedKey = useMemo(() => {
    const path = location.pathname;
    // 先精确匹配
    const exact = sideMenuItems?.flatMap(
      (item: any) => item.type === 'group' ? (item.children || []) : [item]
    ).find((item: any) => item?.key === path);
    if (exact) return path;

    // 再匹配前缀
    for (const mod of topNavModules) {
      const children: any[] = (moduleSideMenus[mod.key] || []).flatMap(
        (item: any) => item.type === 'group' ? (item.children || []) : [item]
      );
      const matched = children.find((item: any) => item?.key && path.startsWith(item.key));
      if (matched) return matched.key;
    }
    return path;
  }, [location.pathname, sideMenuItems]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ========== 顶栏 - 56px 固定 ========== */}
      <HeaderNav />

      {/* ========== 下方区域：左侧导航 + 右侧内容 ========== */}
      <Layout style={{ height: 'calc(100vh - 56px)' }}>
        {/* 左侧导航 - 220px */}
        <Sider
          width={220}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 开发中心特殊组件：工作空间切换器 */}
          {activeModule === 'dev' && (
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    background: '#1677ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12,
                  }}
                >
                  W
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.88)' }}>
                  我的空间
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)' }}>切换 ▾</span>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto' }}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={sideMenuItems}
              style={{
                borderRight: 0,
                paddingTop: 4,
              }}
            />
          </div>
        </Sider>

        {/* 右侧内容区 */}
        <Layout style={{ background: '#f5f7fa' }}>
          {/* ========== 页签栏 ========== */}
          <TabBar />

          <Content
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              flex: 1,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MasterLayout;
