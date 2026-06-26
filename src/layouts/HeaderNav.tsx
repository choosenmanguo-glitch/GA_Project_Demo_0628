import React, { useState } from 'react';
import { Layout, Badge, Avatar, Dropdown, Popover, Space, Tooltip } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { topNavModules, moduleLabelMap } from '@/config';
import GlobalAssistantDrawer from '@/components/GlobalAssistantDrawer';

const { Header } = Layout;

/** 盾牌徽章 SVG - 鲁警门户专属图标 */
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 7V12C3 17.5 7 22 12 23C17 22 21 17.5 21 12V7L12 2Z"
      fill="#1677ff"
      stroke="none"
    />
    <path
      d="M16 9.5L10.5 15L8 12.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** AI 火花 SVG - 全局助手专属图标 */
const SparklesIcon = ({ color = '#7c3aed', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="sparkle-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <path d="M12 2L14.5 9.5H22L15.5 14L17 21L12 17L7 21L8.5 14L2 9.5H9.5L12 2Z" fill="url(#sparkle-grad)" />
  </svg>
);

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const activeModule = React.useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
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
          height: 56,
          padding: '0 20px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          lineHeight: 'normal',
        }}
      >
        {/* ========== 左侧：Logo + 名称 ========== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <img
            src={new URL('../png/lujing-zhisuan-logo-scheme3-44.png', import.meta.url).href}
            alt="鲁警智算"
            style={{ width: 36, height: 36, objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1d39c4', letterSpacing: 0.5, lineHeight: '18px' }}>
              鲁警智算
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(0,0,0,0.35)', letterSpacing: 2, lineHeight: '14px' }}>
              开发平台
            </span>
          </div>
        </div>

        {/* ========== 中间：一级导航 ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: '#fff',
            borderRadius: 10,
            padding: 3,
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
                  padding: '3px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1677ff' : 'rgba(0,0,0,0.55)',
                  background: isActive ? '#fff' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.85)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.55)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 14, color: isActive ? '#1677ff' : 'rgba(0,0,0,0.35)' }}>
                  {mod.icon}
                </span>
                {mod.label}
              </div>
            );
          })}
        </div>

        {/* ========== 右侧：功能入口组 ========== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* 鲁警门户 - 独立按钮 */}
          <Tooltip title="跳转至鲁警门户" placement="bottom">
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
                color: '#1d39c4',
                background: 'linear-gradient(135deg, rgba(22,119,255,0.06), rgba(22,119,255,0.02))',
                border: '1px solid rgba(22,119,255,0.15)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(22,119,255,0.12), rgba(22,119,255,0.06))';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(22,119,255,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(22,119,255,0.06), rgba(22,119,255,0.02))';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(22,119,255,0.15)';
              }}
            >
              <ShieldIcon />
              鲁警门户
            </div>
          </Tooltip>

          {/* 分隔 */}
          <div style={{ width: 1, height: 20, background: '#f0f0f0', margin: '0 8px' }} />

          {/* 全局智能助手 */}
          <Tooltip title="AI 智能助手" placement="bottom">
            <div
              onClick={() => setAssistantOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 10,
                cursor: 'pointer',
                background: assistantOpen
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))'
                  : 'transparent',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))';
              }}
              onMouseLeave={(e) => {
                if (!assistantOpen) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <SparklesIcon size={22} />
              {/* 在线脉冲点 */}
              <div
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#52c41a',
                  border: '1.5px solid #fff',
                  boxShadow: '0 0 0 2px rgba(82, 196, 26, 0.2)',
                }}
              />
            </div>
          </Tooltip>

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
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
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
                <BellOutlined style={{ fontSize: 18, color: 'rgba(0,0,0,0.45)' }} />
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
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#1677ff',
                  boxShadow: '0 2px 6px rgba(22, 119, 255, 0.3)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.85)', lineHeight: '15px' }}>
                  演示用户
                </span>
                <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(0,0,0,0.35)', lineHeight: '13px' }}>
                  科信大队
                </span>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* 全局智能助手抽屉 */}
      <GlobalAssistantDrawer open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
};

export default HeaderNav;
