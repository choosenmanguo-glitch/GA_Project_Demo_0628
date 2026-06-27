import React, { useMemo, useEffect, useState } from 'react';
import { Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderNav from './HeaderNav';
import TabBar from '@/components/TabBar';
import { topNavModules, moduleSideMenus, moduleLabelMap, resolvePageLabel } from '@/config';
import { useTabs } from '@/contexts/TabsContext';
import type { MenuProps } from 'antd';

interface MasterLayoutProps {
  children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTab, setActivePath } = useTabs();
  const [collapsed, setCollapsed] = useState(false);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ──── Global sidebar collapsed styles ──── */}
      <style>{`
        .sidebar-collapsed .ant-menu-item-group-title {
          display: none !important;
        }
        .sidebar-collapsed .ant-menu-item,
        .sidebar-collapsed .ant-menu-submenu-title {
          width: 64px !important;
          padding-inline: 0 !important;
          justify-content: center !important;
        }
        .sidebar-collapsed .ant-menu-item .ant-menu-item-icon,
        .sidebar-collapsed .ant-menu-submenu-title .ant-menu-item-icon {
          margin-inline-end: 0 !important;
        }
      `}</style>
      {/* ========== 顶栏 - 56px 固定 ========== */}
      <HeaderNav />

      {/* ========== 下方区域：左侧导航 + 右侧内容 ========== */}
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden' }}>
        {/* 左侧导航 - 可折叠 */}
        <div
          style={{
            width: collapsed ? 64 : 220,
            transition: 'width 0.2s',
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* 开发中心特殊组件：工作空间切换器 */}
          {activeModule === 'dev' && (
            <div
              style={{
                padding: collapsed ? '12px 0' : '12px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="我的空间 - 点击切换"
            >
              {collapsed ? (
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: '#1677ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>W</div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: 4,
                        background: '#1677ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12,
                      }}
                    >W</div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.88)' }}>
                      我的空间
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)' }}>切换 ▾</span>
                </>
              )}
            </div>
          )}

          <div className={collapsed ? 'sidebar-collapsed' : undefined} style={{ flex: 1, overflow: 'auto', overflowX: 'hidden' }}>
            <Menu
              mode="inline"
              inlineCollapsed={collapsed}
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={sideMenuItems}
              style={{
                borderRight: 0,
                padding: 0,
              }}
            />
          </div>

          {/* ──── 折叠按钮 ──── */}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '1px solid #f0f0f0',
              background: '#fff',
              color: '#999',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1677ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f7fa', overflow: 'hidden', minWidth: 0 }}>
          {/* ========== 页签栏 ========== */}
          <TabBar />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              flex: 1,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterLayout;
