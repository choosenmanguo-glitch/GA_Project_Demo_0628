import React, { useMemo } from 'react';
import { Avatar, Badge, Button, Card, Col, Progress, Row, Space, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ApiOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HddOutlined,
  MessageOutlined,
  NodeIndexOutlined,
  RightOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const { Text, Title } = Typography;

const weeklyTrend = [
  { day: '06/19', calls: 423 },
  { day: '06/20', calls: 561 },
  { day: '06/21', calls: 389 },
  { day: '06/22', calls: 672 },
  { day: '06/23', calls: 534 },
  { day: '06/24', calls: 821 },
  { day: '06/25', calls: 747 },
];

const workflowSteps = [
  {
    title: '搭建智能体',
    desc: '创建对话、流程或自主智能体',
    status: '已开放',
    icon: <RobotOutlined />,
    path: '/dev/agent-build',
    color: '#1677ff',
  },
  {
    title: '接入知识与数据',
    desc: '挂接知识库、数据源和资源',
    status: '推荐',
    icon: <FolderOpenOutlined />,
    path: '/dev/knowledge',
    color: '#13c2c2',
  },
  {
    title: '配置模型与工具',
    desc: '选择模型、工具与连接器能力',
    status: '常用',
    icon: <ToolOutlined />,
    path: '/dev/models',
    color: '#52c41a',
  },
  {
    title: '测评验证',
    desc: '使用评测集验证效果与稳定性',
    status: '待完善',
    icon: <ExperimentOutlined />,
    path: '/dev/agent-eval',
    color: '#fa8c16',
  },
  {
    title: '发布上线',
    desc: '完成审核后发布至服务门户',
    status: '规范化',
    icon: <DeploymentUnitOutlined />,
    path: '/dev/agent-manage',
    color: '#722ed1',
  },
];

const recentAgents = [
  {
    name: '110接警警情分析助手',
    type: '标准智能体',
    status: '已发布',
    updated: '2026-06-20',
    calls: '12,860',
    next: '查看运行',
  },
  {
    name: '电诈资金穿透研判助手',
    type: '流程智能体',
    status: '已发布',
    updated: '2026-06-22',
    calls: '5,620',
    next: '配置流程',
  },
  {
    name: '交通事故责任认定助手',
    type: '标准智能体',
    status: '草稿',
    updated: '2026-06-24',
    calls: '2,340',
    next: '继续编辑',
  },
];

const todoItems = [
  {
    title: '评测任务待处理',
    desc: '2 个智能体等待回归评测',
    icon: <ExperimentOutlined />,
    color: '#fa8c16',
  },
  {
    title: '发布审核',
    desc: '1 个智能体待确认上线范围',
    icon: <FileDoneOutlined />,
    color: '#1677ff',
  },
  {
    title: '模型配置提醒',
    desc: 'DeepSeek-Reasoner 有新配置项',
    icon: <SettingOutlined />,
    color: '#52c41a',
  },
  {
    title: '资源申请进度',
    desc: '人口基础信息查询接口审批中',
    icon: <MessageOutlined />,
    color: '#722ed1',
  },
];

const quickEntries = [
  {
    title: '智能体构建',
    desc: '可视化编排智能体流程',
    icon: <CodeOutlined />,
    path: '/dev/agent-build',
    color: '#1677ff',
  },
  {
    title: '智能体管理',
    desc: '查看和管理已创建的智能体',
    icon: <RobotOutlined />,
    path: '/dev/agent-manage',
    color: '#eb2f96',
    badge: '8',
  },
  {
    title: '模型管理',
    desc: '接入和配置大模型',
    icon: <ThunderboltOutlined />,
    path: '/dev/models',
    color: '#13c2c2',
  },
  {
    title: '提示词管理',
    desc: '管理可复用的提示词模板',
    icon: <FileTextOutlined />,
    path: '/dev/prompts',
    color: '#fa8c16',
  },
  {
    title: '工具管理',
    desc: '注册和管理工具组件',
    icon: <ToolOutlined />,
    path: '/dev/tools',
    color: '#52c41a',
  },
  {
    title: '连接器',
    desc: '配置 MCP 服务与外部连接器',
    icon: <ApiOutlined />,
    path: '/dev/connectors',
    color: '#722ed1',
  },
  {
    title: '知识库',
    desc: '创建知识库、上传文档',
    icon: <DatabaseOutlined />,
    path: '/dev/knowledge',
    color: '#13c2c2',
  },
  {
    title: '智能体测评',
    desc: '对智能体进行效果评估',
    icon: <ExperimentOutlined />,
    path: '/dev/agent-eval',
    color: '#eb2f96',
  },
];

const statusColor = {
  已发布: 'success',
  草稿: 'warning',
} as const;

const WorkbenchPage: React.FC = () => {
  const navigate = useNavigate();

  const totalCallsThisWeek = useMemo(
    () => weeklyTrend.reduce((sum, item) => sum + item.calls, 0),
    [],
  );

  const statCards = [
    {
      title: '我的智能体',
      value: '5',
      suffix: '个',
      desc: '已发布 3 个',
      icon: <RobotOutlined />,
      color: '#1677ff',
      path: '/dev/agent-manage',
    },
    {
      title: '空间智能体',
      value: '12',
      suffix: '个',
      desc: '已发布 8 / 总数 12',
      icon: <NodeIndexOutlined />,
      color: '#52c41a',
      path: '/dev/agent-manage',
    },
    {
      title: '近七天调用量',
      value: totalCallsThisWeek.toLocaleString(),
      suffix: '次',
      desc: '今日 747 次',
      icon: <ThunderboltOutlined />,
      color: '#fa8c16',
      path: '/dev/stats',
      chart: true,
    },
    {
      title: '知识库文档',
      value: '128',
      suffix: '篇',
      desc: '本周新增 7 篇',
      icon: <DatabaseOutlined />,
      color: '#722ed1',
      path: '/dev/knowledge',
    },
    {
      title: '我的待办',
      value: '3',
      suffix: '项',
      desc: '测评与发布任务',
      icon: <ClockCircleOutlined />,
      color: '#eb2f96',
      path: '/dev/agent-eval',
    },
  ];

  return (
    <div className="workbench-page">
      <div className="workbench-container">
        <section className="workbench-header">
          <div className="workspace-meta">
            <Avatar size={42} className="workspace-avatar">
              W
            </Avatar>
            <div>
              <Space size={8} align="center">
                <Text className="workspace-name">我的空间</Text>
                <Tag className="trust-tag" icon={<SafetyCertificateOutlined />}>
                  可信空间
                </Tag>
              </Space>
              <div className="workspace-sub">32 位成员 · 今日 09:20 更新</div>
            </div>
          </div>

          <div className="header-main">
            <div>
              <Title level={3} className="header-title">
                欢迎回来，演示用户
              </Title>
              <Text className="header-desc">
                按照搭建、接入、配置、测评、发布的链路推进智能体上线。
              </Text>
            </div>
            <div className="header-metrics" aria-label="今日平台状态">
              <div className="header-metric">
                <strong>747</strong>
                <span>今日智能体调用</span>
              </div>
              <div className="header-divider" />
              <div className="header-metric">
                <strong>32</strong>
                <span>活跃用户</span>
              </div>
              <div className="header-divider" />
              <div className="header-metric">
                <strong>正常</strong>
                <span>服务状态</span>
              </div>
            </div>
          </div>
        </section>

        <section className="workflow-section">
          <div className="section-heading">
            <div>
              <Text className="eyebrow">开发流程</Text>
              <Title level={4}>智能体上线链路</Title>
            </div>
            <Progress
              percent={60}
              size="small"
              strokeColor="#1677ff"
              trailColor="#edf2f7"
              className="workflow-progress"
            />
          </div>

          <div className="workflow-rail">
            {workflowSteps.map((step, index) => (
              <button
                className="workflow-step"
                key={step.title}
                type="button"
                onClick={() => navigate(step.path)}
                style={{ '--step-color': step.color } as React.CSSProperties}
              >
                <div className="step-index">{index + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <div className="step-copy">
                  <div className="step-title-row">
                    <Text strong>{step.title}</Text>
                    <Tag>{step.status}</Tag>
                  </div>
                  <Text type="secondary">{step.desc}</Text>
                </div>
                <RightOutlined className="step-arrow" />
              </button>
            ))}
          </div>
        </section>

        <div className="stats-grid">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="stat-card"
              bordered
              onClick={() => navigate(stat.path)}
              styles={{ body: { padding: 16 } }}
            >
              <div className="stat-top">
                <Text type="secondary">{stat.title}</Text>
                <span className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
              <div className="stat-value-row">
                <span className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <Text className="stat-desc">{stat.desc}</Text>
              {stat.chart && (
                <div className="stat-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrend}>
                      <defs>
                        <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fa8c16" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#fa8c16" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="calls"
                        type="monotone"
                        stroke="#fa8c16"
                        strokeWidth={2}
                        fill="url(#callsGradient)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Row gutter={[16, 16]} className="main-grid">
          <Col xs={24} xl={16}>
            <Card
              className="section-card recent-card"
              title={
                <div className="card-title">
                  <HddOutlined />
                  <span>最近智能体 / 我的项目</span>
                </div>
              }
              extra={
                <Button type="link" size="small" onClick={() => navigate('/dev/agent-manage')}>
                  查看全部
                </Button>
              }
              styles={{ body: { padding: 0 } }}
            >
              {recentAgents.map((agent) => (
                <div className="agent-row" key={agent.name}>
                  <div className="agent-icon">
                    <RobotOutlined />
                  </div>
                  <div className="agent-main">
                    <Space size={8} align="center">
                      <Text strong>{agent.name}</Text>
                      <Tag color={statusColor[agent.status as keyof typeof statusColor]}>
                        {agent.status}
                      </Tag>
                      <Tag>{agent.type}</Tag>
                    </Space>
                    <div className="agent-meta">
                      <span>更新时间 {agent.updated}</span>
                      <span>调用次数 {agent.calls}</span>
                    </div>
                  </div>
                  <Button size="small" onClick={() => navigate('/dev/agent-manage')}>
                    {agent.next}
                  </Button>
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card
              className="section-card todo-card"
              title={
                <div className="card-title">
                  <ClockCircleOutlined />
                  <span>待办与消息</span>
                </div>
              }
              extra={<Badge count={3} size="small" />}
              styles={{ body: { padding: 0 } }}
            >
              {todoItems.map((item) => (
                <button
                  className="todo-row"
                  key={item.title}
                  type="button"
                  onClick={() => navigate('/dev/agent-eval')}
                >
                  <span className="todo-icon" style={{ color: item.color, background: `${item.color}12` }}>
                    {item.icon}
                  </span>
                  <span className="todo-copy">
                    <Text strong>{item.title}</Text>
                    <Text type="secondary">{item.desc}</Text>
                  </span>
                  <RightOutlined />
                </button>
              ))}
            </Card>
          </Col>
        </Row>

        <section className="quick-section">
          <div className="section-heading compact">
            <div>
              <Text className="eyebrow">常用能力</Text>
              <Title level={4}>快捷入口</Title>
            </div>
            <Button type="link" size="small" onClick={() => navigate('/dev/space-manage')}>
              空间管理
              <RightOutlined />
            </Button>
          </div>

          <div className="quick-grid">
            {quickEntries.map((entry) => (
              <button
                className="quick-tile"
                key={entry.title}
                type="button"
                onClick={() => navigate(entry.path)}
                style={{ '--entry-color': entry.color } as React.CSSProperties}
              >
                <span className="quick-icon">{entry.icon}</span>
                <span className="quick-copy">
                  <span className="quick-title">
                    {entry.title}
                    {entry.badge && <Badge count={entry.badge} size="small" />}
                  </span>
                  <span>{entry.desc}</span>
                </span>
                <RightOutlined className="quick-arrow" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .workbench-page {
          flex: 1;
          min-height: 100%;
          overflow: auto;
          background: #f4f7fb;
        }

        .workbench-container {
          width: min(1220px, calc(100% - 48px));
          margin: 0 auto;
          padding: 22px 0 40px;
        }

        .workbench-header,
        .workflow-section,
        .quick-section,
        .section-card {
          border: 1px solid #e5eaf3;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 4px 14px rgba(28, 45, 74, 0.04);
        }

        .workbench-header {
          padding: 22px 24px;
          margin-bottom: 16px;
          background:
            linear-gradient(135deg, rgba(22, 119, 255, 0.08), rgba(19, 194, 194, 0.04) 44%, rgba(255, 255, 255, 0.96) 100%),
            #fff;
        }

        .workspace-meta,
        .header-main,
        .header-metrics,
        .stat-top,
        .section-heading,
        .card-title,
        .agent-row,
        .step-title-row {
          display: flex;
          align-items: center;
        }

        .workspace-meta {
          gap: 12px;
          margin-bottom: 18px;
        }

        .workspace-avatar {
          background: linear-gradient(135deg, #1677ff, #4096ff);
          font-weight: 700;
        }

        .workspace-name {
          color: #17233d;
          font-size: 15px;
          font-weight: 700;
        }

        .workspace-sub {
          margin-top: 3px;
          color: #697586;
          font-size: 12px;
        }

        .trust-tag {
          margin-inline-end: 0;
          border-color: #b7ebc6;
          color: #237804;
          background: #f6ffed;
        }

        .header-main {
          justify-content: space-between;
          gap: 24px;
        }

        .header-title {
          margin: 0 0 6px !important;
          color: #0f1f3a !important;
          font-size: 22px !important;
          font-weight: 700 !important;
        }

        .header-desc {
          color: #5f6b7a;
          font-size: 14px;
        }

        .header-metrics {
          min-width: 420px;
          justify-content: flex-end;
          padding: 12px 16px;
          border: 1px solid rgba(22, 119, 255, 0.12);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
        }

        .header-metric {
          min-width: 94px;
          text-align: center;
        }

        .header-metric strong {
          display: block;
          color: #1677ff;
          font-size: 23px;
          line-height: 28px;
        }

        .header-metric span {
          color: #697586;
          font-size: 12px;
        }

        .header-divider {
          width: 1px;
          height: 36px;
          margin: 0 14px;
          background: #e5eaf3;
        }

        .workflow-section,
        .quick-section {
          padding: 20px 22px 22px;
          margin-bottom: 16px;
        }

        .section-heading {
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 16px;
        }

        .section-heading.compact {
          margin-bottom: 14px;
        }

        .section-heading h4 {
          margin: 2px 0 0 !important;
          color: #17233d;
          font-size: 16px !important;
        }

        .eyebrow {
          color: #7a8699;
          font-size: 12px;
        }

        .workflow-progress {
          width: 220px;
        }

        .workflow-rail {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .workflow-step {
          position: relative;
          min-height: 146px;
          padding: 16px;
          border: 1px solid #e5eaf3;
          border-radius: 8px;
          background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .workflow-step:hover,
        .quick-tile:hover,
        .todo-row:hover,
        .agent-row:hover,
        .stat-card:hover {
          border-color: #91caff;
          box-shadow: 0 8px 20px rgba(28, 45, 74, 0.08);
          transform: translateY(-1px);
        }

        .step-index {
          position: absolute;
          top: 12px;
          right: 14px;
          color: #edf2f7;
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
        }

        .step-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border-radius: 8px;
          color: var(--step-color);
          background: color-mix(in srgb, var(--step-color) 12%, white);
          font-size: 18px;
        }

        .step-copy {
          position: relative;
          z-index: 1;
        }

        .step-title-row {
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .step-title-row .ant-tag {
          margin-inline-end: 0;
          color: var(--step-color);
          border-color: color-mix(in srgb, var(--step-color) 26%, white);
          background: color-mix(in srgb, var(--step-color) 8%, white);
        }

        .step-copy .ant-typography-secondary {
          display: block;
          min-height: 38px;
          font-size: 12px;
          line-height: 19px;
        }

        .step-arrow {
          position: absolute;
          right: 14px;
          bottom: 14px;
          color: #b8c2d2;
          font-size: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          height: 118px;
          border-color: #e5eaf3;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .stat-top {
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .stat-top .ant-typography {
          font-size: 12px;
        }

        .stat-icon {
          font-size: 17px;
          opacity: 0.72;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .stat-value {
          font-size: 25px;
          font-weight: 750;
          line-height: 32px;
        }

        .stat-suffix,
        .stat-desc {
          color: #7a8699;
          font-size: 12px;
        }

        .stat-chart {
          height: 34px;
          margin-top: -2px;
        }

        .main-grid {
          margin-bottom: 16px;
        }

        .section-card {
          height: 100%;
          overflow: hidden;
        }

        .section-card .ant-card-head {
          min-height: 50px;
          border-bottom-color: #edf2f7;
        }

        .card-title {
          gap: 8px;
          color: #17233d;
          font-weight: 700;
        }

        .card-title .anticon {
          color: #1677ff;
        }

        .agent-row {
          min-height: 78px;
          padding: 14px 18px;
          gap: 12px;
          border-bottom: 1px solid #edf2f7;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .agent-row:last-child {
          border-bottom: 0;
        }

        .agent-row:hover {
          background: #fbfdff;
        }

        .agent-icon {
          width: 38px;
          height: 38px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #1677ff;
          background: #e6f4ff;
          font-size: 18px;
        }

        .agent-main {
          flex: 1;
          min-width: 0;
        }

        .agent-meta {
          display: flex;
          gap: 18px;
          margin-top: 8px;
          color: #7a8699;
          font-size: 12px;
        }

        .todo-row {
          width: 100%;
          min-height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border: 0;
          border-bottom: 1px solid #edf2f7;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .todo-row:last-child {
          border-bottom: 0;
        }

        .todo-row:hover {
          background: #fbfdff;
        }

        .todo-icon {
          width: 34px;
          height: 34px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 16px;
        }

        .todo-copy {
          flex: 1;
          min-width: 0;
        }

        .todo-copy .ant-typography {
          display: block;
          font-size: 13px;
        }

        .todo-copy .ant-typography-secondary {
          margin-top: 3px;
          font-size: 12px;
        }

        .todo-row > .anticon {
          color: #b8c2d2;
          font-size: 12px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .quick-tile {
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #e5eaf3;
          border-radius: 8px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }

        .quick-icon {
          width: 38px;
          height: 38px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--entry-color);
          background: color-mix(in srgb, var(--entry-color) 10%, white);
          font-size: 18px;
        }

        .quick-copy {
          flex: 1;
          min-width: 0;
        }

        .quick-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #17233d;
          font-size: 14px;
          font-weight: 700;
        }

        .quick-copy > span:last-child {
          display: block;
          margin-top: 4px;
          color: #7a8699;
          font-size: 12px;
        }

        .quick-arrow {
          color: #b8c2d2;
          font-size: 12px;
        }

        @media (max-width: 1180px) {
          .workbench-container {
            width: calc(100% - 32px);
          }

          .header-main {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-metrics {
            width: 100%;
            min-width: 0;
            justify-content: space-between;
          }

          .workflow-rail,
          .stats-grid,
          .quick-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .workbench-container {
            width: calc(100% - 24px);
          }

          .header-metrics,
          .workflow-rail,
          .stats-grid,
          .quick-grid {
            grid-template-columns: 1fr;
          }

          .header-metrics {
            display: grid;
            gap: 10px;
          }

          .header-divider {
            display: none;
          }

          .workflow-progress {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkbenchPage;
