import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Divider, Avatar, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  RobotOutlined,
  FolderOpenOutlined,
  ToolOutlined,
  ExperimentOutlined,
  CodeOutlined,
  FileTextOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const { Text, Title, Paragraph } = Typography;

// ---- Mock 数据 ----

/** 近七天调用量趋势 */
const weeklyTrend = [
  { day: '06/19', calls: 423 },
  { day: '06/20', calls: 561 },
  { day: '06/21', calls: 389 },
  { day: '06/22', calls: 672 },
  { day: '06/23', calls: 534 },
  { day: '06/24', calls: 821 },
  { day: '06/25', calls: 747 },
];

// ---- 新手引导卡片定义 ----
interface GuideCard {
  key: string;
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}

const guideCards: GuideCard[] = [
  {
    key: 'agent',
    title: '搭建智能体',
    icon: <RobotOutlined />,
    iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '通过可视化编排画布，拖拽组件即可构建智能体流程，支持对话、工作流和自主智能体三种模式。',
    actionLabel: '开始搭建',
    actionPath: '/dev/agent-build',
  },
  {
    key: 'knowledge',
    title: '接入知识与数据',
    icon: <FolderOpenOutlined />,
    iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '上传文档创建知识库、连接外部数据源，为智能体注入领域知识。',
    actionLabel: '创建知识库',
    actionPath: '/dev/knowledge',
  },
  {
    key: 'components',
    title: '配置模型与工具',
    icon: <ToolOutlined />,
    iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: '接入大模型、注册 API 工具和 MCP 连接器，为智能体提供推理与执行能力。',
    actionLabel: '查看组件',
    actionPath: '/dev/models',
  },
  {
    key: 'eval',
    title: '测评与发布',
    icon: <ExperimentOutlined />,
    iconBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: '基于测评集对智能体进行效果评估，通过后一键发布至服务门户。',
    actionLabel: '查看测评',
    actionPath: '/dev/agent-eval',
  },
];

/** 快捷入口卡片 */
interface QuickEntry {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  path: string;
  badge?: string;
}

const quickEntries: QuickEntry[] = [
  {
    key: 'agent-build',
    title: '智能体构建',
    description: '可视化编排智能体流程',
    icon: <CodeOutlined />,
    color: '#667eea',
    bg: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.06))',
    path: '/dev/agent-build',
  },
  {
    key: 'agent-manage',
    title: '智能体管理',
    description: '查看和管理已创建的智能体',
    icon: <RobotOutlined />,
    color: '#f5576c',
    bg: 'linear-gradient(135deg, rgba(245,87,108,0.08), rgba(240,147,251,0.06))',
    path: '/dev/agent-manage',
    badge: '8',
  },
  {
    key: 'models',
    title: '模型管理',
    description: '接入和配置大模型',
    icon: <ThunderboltOutlined />,
    color: '#4facfe',
    bg: 'linear-gradient(135deg, rgba(79,172,254,0.08), rgba(0,242,254,0.06))',
    path: '/dev/models',
  },
  {
    key: 'prompts',
    title: '提示词管理',
    description: '管理可复用的提示词模板',
    icon: <FileTextOutlined />,
    color: '#fa8c16',
    bg: 'linear-gradient(135deg, rgba(250,140,22,0.08), rgba(250,173,20,0.06))',
    path: '/dev/prompts',
  },
  {
    key: 'tools',
    title: '工具管理',
    description: '注册和管理工具组件',
    icon: <ToolOutlined />,
    color: '#43e97b',
    bg: 'linear-gradient(135deg, rgba(67,233,123,0.08), rgba(56,249,215,0.06))',
    path: '/dev/tools',
  },
  {
    key: 'connectors',
    title: '连接器',
    description: '配置 MCP 服务与外部连接器',
    icon: <ApiOutlined />,
    color: '#722ed1',
    bg: 'linear-gradient(135deg, rgba(114,46,209,0.08), rgba(83,123,235,0.06))',
    path: '/dev/connectors',
  },
  {
    key: 'knowledge',
    title: '知识库',
    description: '创建知识库、上传文档',
    icon: <DatabaseOutlined />,
    color: '#13c2c2',
    bg: 'linear-gradient(135deg, rgba(19,194,194,0.08), rgba(19,194,194,0.04))',
    path: '/dev/knowledge',
  },
  {
    key: 'agent-eval',
    title: '智能体测评',
    description: '对智能体进行效果评估',
    icon: <ExperimentOutlined />,
    color: '#eb2f96',
    bg: 'linear-gradient(135deg, rgba(235,47,150,0.08), rgba(255,133,197,0.06))',
    path: '/dev/agent-eval',
  },
];

// ---- 组件 ----

const WorkbenchPage: React.FC = () => {
  const navigate = useNavigate();

  // 新手引导折叠状态（localStorage）
  const storageKey = 'workbench-guide-collapsed';
  const [guideCollapsed, setGuideCollapsed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });
  const [guideAnimate, setGuideAnimate] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, String(guideCollapsed));
  }, [guideCollapsed]);

  // 挂载动画
  useEffect(() => {
    setGuideAnimate(true);
  }, []);

  const handleHideGuide = () => {
    setGuideCollapsed(true);
  };

  const handleShowGuide = () => {
    setGuideCollapsed(false);
  };

  const todayCalls = useMemo(() => 747, []);
  const todayActiveUsers = useMemo(() => 32, []);
  const totalCallsThisWeek = useMemo(
    () => weeklyTrend.reduce((s, d) => s + d.calls, 0),
    [],
  );

  // 指标卡片数据
  const statCards = [
    {
      title: '我的智能体',
      value: 5,
      suffix: ' 个',
      subText: '已发布 3 个',
      color: '#1677ff',
      icon: <RobotOutlined />,
      onClick: () => navigate('/dev/agent-manage'),
    },
    {
      title: '空间智能体',
      value: 12,
      suffix: '',
      subText: '已发布 8 / 总数 12',
      color: '#52c41a',
      icon: <RobotOutlined />,
      onClick: () => navigate('/dev/agent-manage'),
    },
    {
      title: '近七天调用量',
      value: totalCallsThisWeek.toLocaleString(),
      suffix: ' 次',
      subText: null,
      color: '#fa8c16',
      icon: <ThunderboltOutlined />,
      chart: true,
      onClick: () => navigate('/dev/stats'),
    },
    {
      title: '知识库文档',
      value: 128,
      suffix: ' 篇',
      subText: '新增 7 篇本周',
      color: '#722ed1',
      icon: <DatabaseOutlined />,
      onClick: () => navigate('/dev/knowledge'),
    },
    {
      title: '我的待办',
      value: 3,
      suffix: ' 项',
      subText: '测评任务',
      color: '#eb2f96',
      icon: <ClockCircleOutlined />,
      onClick: () => navigate('/dev/agent-eval'),
    },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#f5f7fa' }}>
      {/* ===== 内容容器 ===== */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 40px' }}>
        {/* ========== 一、欢迎区 ========== */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1d39c4 0%, #1677ff 40%, #4096ff 100%)',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(22,119,255,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 背景装饰 */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -50,
              left: '40%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Avatar
                size={40}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                W
              </Avatar>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                    我的空间
                  </Text>
                  <Tooltip title="切换工作空间">
                    <SwapOutlined
                      style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}
                    />
                  </Tooltip>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                  32 位成员
                </Text>
              </div>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 300, letterSpacing: 0.5 }}>
              欢迎回来，演示用户
            </Text>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 40,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: '32px' }}>
                {todayCalls.toLocaleString()}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
                今日智能体调用
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: '32px' }}>
                {todayActiveUsers}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
                活跃用户
              </div>
            </div>
          </div>
        </div>

        {/* ========== 二、新手引导区 ========== */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: guideCollapsed ? '16px 24px' : '24px 24px 20px',
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
          }}
        >
          {/* 标题行 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => setGuideCollapsed(!guideCollapsed)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #ffd77a, #ffb347)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThunderboltOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <Text strong style={{ fontSize: 15 }}>
                新手引导
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                快速了解平台核心能力
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!guideCollapsed && (
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHideGuide();
                  }}
                  style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)' }}
                >
                  不再显示
                </Button>
              )}
              {guideCollapsed ? (
                <DownOutlined style={{ color: 'rgba(0,0,0,0.35)', fontSize: 12 }} />
              ) : (
                <UpOutlined style={{ color: 'rgba(0,0,0,0.35)', fontSize: 12 }} />
              )}
            </div>
          </div>

          {/* 卡片区 */}
          {!guideCollapsed && (
            <Row gutter={16} style={{ marginTop: 20, animation: 'fadeIn 0.4s ease' }}>
              {guideCards.map((card, idx) => (
                <Col span={6} key={card.key}>
                  <div
                    style={{
                      borderRadius: 10,
                      border: '1px solid #f0f0f0',
                      padding: '20px 16px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: guideAnimate ? 1 : 0,
                      transform: guideAnimate ? 'translateY(0)' : 'translateY(8px)',
                      transitionDelay: `${idx * 0.08}s`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1677ff';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(22,119,255,0.08)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* 步骤编号 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -1,
                        right: 12,
                        fontSize: 48,
                        fontWeight: 800,
                        color: 'rgba(0,0,0,0.03)',
                        lineHeight: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* 图标 */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: card.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 18,
                        marginBottom: 12,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {card.icon}
                    </div>

                    {/* 标题 */}
                    <Text strong style={{ fontSize: 14, marginBottom: 6, position: 'relative', zIndex: 1 }}>
                      {card.title}
                    </Text>

                    {/* 描述 */}
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, lineHeight: '1.6', flex: 1, position: 'relative', zIndex: 1 }}
                    >
                      {card.description}
                    </Text>

                    {/* 操作链接 */}
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate(card.actionPath)}
                      style={{ padding: 0, marginTop: 8, fontWeight: 500, fontSize: 12, position: 'relative', zIndex: 1 }}
                    >
                      {card.actionLabel}
                      <RightOutlined style={{ fontSize: 10, marginLeft: 2 }} />
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* 折叠时显示恢复按钮 */}
          {guideCollapsed && (
            <div style={{ marginTop: 8 }}>
              <Button
                type="link"
                size="small"
                onClick={handleShowGuide}
                style={{ fontSize: 12, padding: 0 }}
              >
                首次使用？查看完整使用指南
              </Button>
            </div>
          )}
        </div>

        {/* ========== 三、数据指标区 ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          {statCards.map((stat) => (
              <Card
                key={stat.title}
                size="small"
                onClick={stat.onClick}
                style={{
                  borderRadius: 10,
                  borderColor: '#f0f0f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                }}
                styles={{ body: { padding: stat.chart ? '14px 16px 8px' : '16px' } }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(0,0,0,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#d9d9d9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                }}
              >
                {stat.chart ? (
                  /* 特殊卡片：带迷你图 */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ color: stat.color, fontSize: 13, display: 'flex' }}>
                        {stat.icon}
                      </span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {stat.title}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 0 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: stat.color, lineHeight: '28px' }}>
                        {totalCallsThisWeek.toLocaleString()}
                      </span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        次
                      </Text>
                    </div>
                    <div style={{ marginTop: 4, height: 42 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyTrend}>
                          <defs>
                            <linearGradient id="statGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={stat.color} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={stat.color} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="calls"
                            stroke={stat.color}
                            strokeWidth={2}
                            fill="url(#statGradient)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  /* 普通统计卡片 */
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {stat.title}
                      </Text>
                      <span style={{ color: stat.color, fontSize: 16, display: 'flex', opacity: 0.5 }}>
                        {stat.icon}
                      </span>
                    </div>
                    <Statistic
                      value={stat.value}
                      suffix={
                        <Text style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.55)' }}>
                          {stat.suffix}
                        </Text>
                      }
                      valueStyle={{
                        color: stat.color,
                        fontSize: 28,
                        fontWeight: 700,
                      }}
                    />
                    {stat.subText && (
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 2, display: 'block' }}>
                        {stat.subText}
                      </Text>
                    )}
                  </>
                )}
              </Card>
          ))}
        </div>

        {/* ========== 四、快捷入口区 ========== */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 24px 8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThunderboltOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
            <Text strong style={{ fontSize: 15 }}>
              快捷入口
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            {quickEntries.map((entry) => (
              <Col span={6} key={entry.key}>
                <div
                  onClick={() => navigate(entry.path)}
                  style={{
                    borderRadius: 10,
                    padding: '18px 16px',
                    background: entry.bg,
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = entry.color;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${entry.color}15`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* 图标 */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${entry.color}20, ${entry.color}08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: entry.color,
                      fontSize: 20,
                      marginBottom: 10,
                    }}
                  >
                    {entry.icon}
                  </div>

                  {/* 标题 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      {entry.title}
                    </Text>
                    {entry.badge && (
                      <Tag
                        color="red"
                        style={{
                          fontSize: 10,
                          lineHeight: '16px',
                          padding: '0 6px',
                          margin: 0,
                          borderRadius: 10,
                        }}
                      >
                        {entry.badge}
                      </Tag>
                    )}
                  </div>

                  {/* 描述 */}
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, lineHeight: '1.5', marginTop: 4, display: 'block' }}
                  >
                    {entry.description}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>

          {/* 管理员入口 */}
          <div style={{ padding: '16px 0 20px', marginTop: 8 }}>
            <Divider style={{ margin: '0 0 12px', fontSize: 12, color: '#d9d9d9' }} />
            <Button
              type="link"
              size="small"
              onClick={() => navigate('/dev/space-manage')}
              style={{ fontSize: 12, padding: 0, color: 'rgba(0,0,0,0.45)' }}
            >
              空间管理
              <RightOutlined style={{ fontSize: 10, marginLeft: 4 }} />
            </Button>
          </div>
        </div>
      </div>

      {/* 动画注入 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WorkbenchPage;
