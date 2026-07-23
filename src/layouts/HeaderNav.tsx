import React from 'react';
import { Layout, Badge, Avatar, Dropdown, Tooltip } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { topNavModules } from '@/config';

const { Header } = Layout;

/** 盾牌徽章 SVG - 鲁警门户专属图标 */
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 7V12C3 17.5 7 22 12 23C17 22 21 17.5 21 12V7L12 2Z"
      fill="none"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="1.5"
    />
    <path
      d="M16 9.5L10.5 15L8 12.5"
      stroke="rgba(255,255,255,0.85)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeModule = React.useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'dev';
    for (const mod of topNavModules) {
      if (path.startsWith(mod.path)) return mod.key;
    }
    return 'dev';
  }, [location.pathname]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>演示用户</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>科信大队 · 管理员</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          padding: '0 24px',
          background: '#1E61B9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          lineHeight: 'normal',
        }}
      >
        {/* ========== 左侧：Logo + 导航 ========== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36, flex: 1 }}>
          {/* Logo + 名称 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <img
            src={new URL('../png/lujing-zhisuan-logo-scheme3-44.png', import.meta.url).href}
            alt="智能体开发平台"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
          />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
            智能体开发平台
          </span>
        </div>

        {/* ========== 中间：一级导航 ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '4px 6px',
          }}
        >
          {topNavModules.map((mod) => {
            const isActive = activeModule === mod.key;
            return (
              <div
                key={mod.key}
                onClick={() => navigate(mod.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 20px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0F5AB5' : '#f0f0f0',
                  background: isActive ? '#fff' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = '#f0f0f0';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 16, color: isActive ? '#0F5AB5' : 'rgba(255,255,255,0.65)' }}>
                  {mod.icon}
                </span>
                {mod.label}
              </div>
            );
          })}
        </div>
        </div>

        {/* ========== 右侧：功能入口组 ========== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* 智能体门户 - 独立按钮 */}
          <Tooltip title="跳转至智能体门户" placement="bottom">
            <div
              onClick={() => window.open('https://luijing.example.com', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <ShieldIcon />
              智能体门户
            </div>
          </Tooltip>

          {/* 分隔 */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />

          {/* 消息通知 */}
          <Tooltip title="消息通知" placement="bottom">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Badge
                count={5}
                size="small"
                styles={{ root: { fontSize: 10 } }}
                offset={[-2, 4]}
              >
                <BellOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }} />
              </Badge>
            </div>
          </Tooltip>

          {/* 用户信息 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginLeft: 4,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: '15px' }}>
                  演示用户
                </span>
                <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '13px' }}>
                  科信大队
                </span>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

    </>
  );
};

export default HeaderNav;
