import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Tooltip, Drawer, Form, Input, Select, message, Row, Col, Typography, Dropdown, Card, Pagination, Popover, Modal } from 'antd';
import type { InputRef } from 'antd';
import { PlusOutlined, ThunderboltOutlined, FileTextOutlined, RocketOutlined, SettingOutlined, FileDoneOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SendOutlined, CheckCircleOutlined, ExclamationCircleOutlined, BarChartOutlined, MoreOutlined, ApiOutlined, DatabaseOutlined, RobotOutlined, ApartmentOutlined, MessageOutlined, ArrowLeftOutlined, ArrowRightOutlined, QuestionCircleOutlined, ClusterOutlined, BranchesOutlined, SafetyCertificateOutlined, SearchOutlined, PicLeftOutlined, FormOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import PaginationBar from '@/components/PaginationBar';
import type { FilterField } from '@/components/FilterBar';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';
import { mockAgents, type AgentItem, type AgentType, type PublishType } from '@/mock/data';
import { getChatLimitConfig } from '@/pages/system-config';
import AgentChatPanel from './AgentChatPanel';
import WorkflowRunPanel from './WorkflowRunPanel';

const { TextArea } = Input;
const { Text, Title } = Typography;

const typeColorMap: Record<AgentType, string> = {
  '标准智能体': 'blue',
  '流程智能体': 'purple',
  '自主智能体': 'geekblue',
  '外部智能体': 'orange',
};

const statusColorMap: Record<string, string> = {
  '未发布': 'default',
  '已发布': 'green',
};

const publishColorMap: Record<PublishType, string> = {
  '广场': 'blue',
  '集成': 'purple',
  'API': 'cyan',
};

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索智能体名称或描述', width: 240 },
  { type: 'select', key: 'type', placeholder: '智能体类型', width: 140, options: [
    { label: '标准智能体', value: '标准智能体' },
    { label: '流程智能体', value: '流程智能体' },
    { label: '自主智能体', value: '自主智能体' },
    { label: '外部智能体', value: '外部智能体' },
  ]},
  { type: 'select', key: 'status', placeholder: '发布状态', width: 110, options: [
    { label: '未发布', value: '未发布' },
    { label: '广场', value: '广场' },
    { label: '集成', value: '集成' },
    { label: 'API', value: 'API' },
  ]},
];

// ──── 复制抽屉数据类型映射 ────
const typeFromChinese: Record<string, string> = {
  '标准智能体': 'standard',
  '流程智能体': 'workflow',
  '自主智能体': 'autonomous',
};

const subTypeFromChinese: Record<string, string> = {
  '普通助手': 'chat',
  '知识库问答': 'kbqa',
  '智能分析问数': 'smart_query',
  '文档编写': 'doc_gen',
  '数据分析报告': 'data_report',
  '文件审核': 'file_review',
  '智能检索': 'smart_search',
  '智能抽取': 'smart_extract',
  '智能分类': 'smart_classify',
  '工作流': 'workflow',
  '对话流': 'chatflow',
};

const agentTypes = [
  { key: 'standard', title: '标准智能体', icon: <RobotOutlined />,
    desc: '单一任务执行，基于模型 + 提示词 + 知识库 + 工具的标准推理链路。',
    example: '警情分析、笔录校对、便民问答等' },
  { key: 'workflow', title: '流程智能体', icon: <ClusterOutlined />,
    desc: '多步骤任务编排，支持条件分支与并行执行，适配复杂审批、研判流程。',
    example: '案件流转审批、多部门协查、信息核查流程等' },
  { key: 'autonomous', title: '自主智能体', icon: <SafetyCertificateOutlined />,
    desc: '具备自主规划与工具调用能力，可分解复杂目标为子任务逐步执行。',
    example: '犯罪画像分析、综合情报研判、自主巡逻决策等' },
];

const standardBizTypes = [
  { key: 'chat', title: '普通助手', desc: '基于大语言模型的对话式智能助手，支持模型选型、提示词编排、开场白定义与文件上传策略配置。', icon: <MessageOutlined />, tags: ['对话助手', '通用'] },
  { key: 'kbqa', title: '知识库问答', desc: '基于知识库的智能问答，支持关联多知识库并配置向量检索参数与重排序模型，实现精准回答。', icon: <SafetyCertificateOutlined />, tags: ['知识检索', 'RAG'] },
  { key: 'smart_query', title: '智能分析问数', desc: '基于结构化数据源的智能分析，支持关联数据表与视图，实现自然语言驱动的数据查询与分析。', icon: <ThunderboltOutlined />, tags: ['数据查询', 'BI分析'] },
  { key: 'doc_gen', title: '文档编写', desc: '结合知识库的文档智能生成，支持素材检索、引用溯源与文件上传，一键生成规范文档。', icon: <FileTextOutlined />, tags: ['文档生成', '写作'] },
  { key: 'data_report', title: '数据分析报告', desc: '基于上传数据文件（CSV/XLSX 等）自动生成包含图表和分析结论的数据分析报告。', icon: <PicLeftOutlined />, tags: ['数据分析', '可视化'] },
  { key: 'file_review', title: '文件审核', desc: '对上传文件进行合规性审核与内容质量审查，自动标记问题项并生成审核意见。', icon: <SafetyCertificateOutlined />, tags: ['审核', '合规'] },
  { key: 'smart_search', title: '智能检索', desc: '基于知识库的精准信息检索，支持检索字段与回复字段配置，实现高效信息定位。', icon: <SearchOutlined />, tags: ['检索', '信息定位'] },
  { key: 'smart_extract', title: '智能抽取', desc: '从非结构化文本中按预设规则提取结构化实体信息，如人名、地名、事件要素等。', icon: <FormOutlined />, tags: ['信息抽取', 'NER'] },
  { key: 'smart_classify', title: '智能分类', desc: '对输入文本按预设分类规则进行自动归类，支持单标签与多标签分类模式。', icon: <AppstoreAddOutlined />, tags: ['分类', '标签'] },
];

const workflowSubTypes = [
  { key: 'workflow', title: '工作流', desc: '将 AI 模型调用、知识检索、条件分支、代码执行等组件抽象为标准节点，通过拖拽、连线、配置组装为可重复执行的自动化流程。', icon: <BranchesOutlined />, tags: ['可视化编排', '自动化'] },
  { key: 'chatflow', title: '对话流', desc: '以对话交互为主线的流程模式，会话变量跨轮次持久化。提供答案节点、变量赋值器、参数提取器等专用组件，适合多轮对话式业务。', icon: <MessageOutlined />, tags: ['多轮对话', '会话变量'] },
];

const G = {
  textPrimary: 'rgba(0,0,0,0.88)',
  textSecondary: 'rgba(0,0,0,0.45)',
  textBody: 'rgba(0,0,0,0.65)',
  textTertiary: 'rgba(0,0,0,0.25)',
  bgBlue: '#f0f5ff',
};

export default function AgentManagePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AgentItem[]>(mockAgents);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentItem | null>(null);
  const [activePane, setActivePane] = useState<'create' | 'config'>('create');
  const [viewingAgent, setViewingAgent] = useState<AgentItem | null>(null);
  const [configTab, setConfigTab] = useState('info');
  const [createMethod, setCreateMethod] = useState<'blank' | 'template' | 'import' | null>(null);
  const [form] = Form.useForm();
  const [externalAgentOpen, setExternalAgentOpen] = useState(false);
  const [externalForm] = Form.useForm();
  const [externalIcon, setExternalIcon] = useState<IconPickerValue>({ mode: 'text' });
  const externalName = Form.useWatch('name', externalForm);
  const [chatAgent, setChatAgent] = useState<AgentItem | null>(null);
  const [chatTipModalOpen, setChatTipModalOpen] = useState(false);
  const [settingsSignal, setSettingsSignal] = useState(0);
  const [todayRemaining, setTodayRemaining] = useState(10);

  // ──── 复制抽屉状态 ────
  const [copyDrawerOpen, setCopyDrawerOpen] = useState(false);
  const [copyAgentType, setCopyAgentType] = useState('standard');
  const [copySubType, setCopySubType] = useState('');
  const [copyAgentName, setCopyAgentName] = useState('');
  const [copyAgentDesc, setCopyAgentDesc] = useState('');
  const [copyAvatarValue, setCopyAvatarValue] = useState<IconPickerValue>({ mode: 'text' });
  const copyNameInputRef = useRef<InputRef>(null);

  const handleCopyAgent = (agent: AgentItem) => {
    setCopyAgentType(typeFromChinese[agent.type] || 'standard');
    setCopySubType(subTypeFromChinese[agent.subType] || agent.subType || '');
    setCopyAgentName(agent.name + '（1）');
    setCopyAgentDesc(agent.description || '');
    setCopyAvatarValue({ mode: 'text', text: agent.name.charAt(0) });
    setCopyDrawerOpen(true);
    setTimeout(() => {
      copyNameInputRef.current?.focus();
      copyNameInputRef.current?.select();
    }, 150);
  };

  const chatConfig = getChatLimitConfig();

  const todayKey = `chat_usage_${new Date().toISOString().slice(0, 10)}`;
  const getUsageCount = () => parseInt(localStorage.getItem(todayKey) || '0', 10);
  const incrementUsage = () => {
    const current = getUsageCount();
    localStorage.setItem(todayKey, String(current + 1));
    setTodayRemaining(Math.max(0, chatConfig.dailyLimit - (current + 1)));
  };

  const openChat = (agent: AgentItem) => {
    setChatAgent(agent);
    if (chatConfig.enabled && localStorage.getItem('chat_dev_tip_dismissed') !== '1') {
      setChatTipModalOpen(true);
    } else {
      setSettingsSignal(s => s + 1);
    }
  };

  const handleChatSend = () => {
    if (chatConfig.enabled) {
      incrementUsage();
    }
  };

  useEffect(() => {
    setTodayRemaining(Math.max(0, chatConfig.dailyLimit - getUsageCount()));
  }, []);

  const activeStatIndex = activeStat === 'all' ? 0 : activeStat === '标准智能体' ? 1 : activeStat === '流程智能体' ? 2 : activeStat === '自主智能体' ? 3 : activeStat === '外部智能体' ? 4 : -1;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.keyword && !item.name.includes(filters.keyword) && !item.description.includes(filters.keyword)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.status) {
        if (filters.status === '未发布') {
          if (item.publishTypes.length > 0) return false;
        } else {
          if (!item.publishTypes.includes(filters.status)) return false;
        }
      }
      return true;
    });
  }, [data, filters]);

  const statCards = [
    { key: 'all', title: '智能体总数', value: data.length, color: '#1677ff', icon: <RobotOutlined />, bg: '#e6f4ff' },
    { key: '标准智能体', title: '标准智能体', value: data.filter(d => d.type === '标准智能体').length, color: '#1677ff', icon: <FileTextOutlined />, bg: '#e6f4ff' },
    { key: '流程智能体', title: '流程智能体', value: data.filter(d => d.type === '流程智能体').length, color: '#722ed1', icon: <ApartmentOutlined />, bg: '#f9f0ff' },
    { key: '自主智能体', title: '自主智能体', value: data.filter(d => d.type === '自主智能体').length, color: '#2f54eb', icon: <ThunderboltOutlined />, bg: '#f0f5ff' },
    { key: '外部智能体', title: '外部智能体', value: data.filter(d => d.type === '外部智能体').length, color: '#fa8c16', icon: <ApiOutlined />, bg: '#fff7e6' },
  ];

  const tableColumns: ColumnsType<AgentItem> = useMemo(() => [
    { title: '智能体名称', dataIndex: 'name', width: 180, render: (name) => (
      <Space>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #1677ff, #69b1ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{name.charAt(0)}</div>
        <span style={{ fontWeight: 500 }}>{name}</span>
      </Space>
    )},
    { title: '描述', dataIndex: 'description', ellipsis: true, width: 200 },
    { title: '类型', width: 160, render: (_: unknown, r: AgentItem) => <Tag color={typeColorMap[r.type]}>{r.type}{r.subType && r.subType !== r.type ? `-${r.subType}` : ''}</Tag> },
    { title: '绑定模型', dataIndex: 'modelName', width: 140, render: (modelName: string, r: AgentItem) => r.type === '外部智能体' ? <Tag>外部接入</Tag> : modelName },
    { title: '发布状态', width: 200, render: (_: unknown, r: AgentItem) => {
      if (r.status === '未发布') return <Tag color="default">未发布</Tag>;
      return (
        <Space size={4} wrap>
          {r.publishTypes.map((pt) => (
            <Tag key={pt} color={publishColorMap[pt]} style={{ margin: 0, borderRadius: 4 }}>{pt}</Tag>
          ))}
        </Space>
      );
    }},
    { title: '创建人', dataIndex: 'creator', width: 100 },
    { title: '更新时间', dataIndex: 'updateTime', width: 110 },
    { title: '操作', width: 220, render: (_, r) => {
      const moreItems = [
        { key: 'chat', icon: <MessageOutlined />, label: '去对话', onClick: () => openChat(r) },
        { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: () => message.success('已删除') },
      ];
      return (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setViewingAgent(r)}>编辑</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/dev/agent-config${r.type === '外部智能体' ? '?external=true' : typeFromChinese[r.type] && typeFromChinese[r.type] !== 'standard' ? `?type=${typeFromChinese[r.type]}` : ''}`)}>配置</Button>
          {r.type !== '外部智能体' && <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopyAgent(r)}>复制</Button>}
          <Dropdown menu={{
            items: moreItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              danger: item.danger,
              onClick: item.onClick,
            })),
          }} trigger={['click']}>
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      );
    }},
  ], []);

  const creationMethods = [
    { key: 'blank', icon: <FileDoneOutlined style={{ fontSize: 32, color: '#1677ff' }} />, title: '空白智能体', desc: '从零开始配置提示词、模型与工具' },
    { key: 'template', icon: <FileTextOutlined style={{ fontSize: 32, color: '#722ed1' }} />, title: '基于模板', desc: '选择预置模板快速创建' },
    { key: 'import', icon: <SendOutlined style={{ fontSize: 32, color: '#13c2c2' }} />, title: '导入配置', desc: '从JSON文件中导入智能体配置' },
  ];

  // ──── Card Component ────
  const AgentCard: React.FC<{ agent: AgentItem; onConfig: () => void; onView: () => void }> = ({ agent, onConfig, onView }) => (
    <div
      onClick={onConfig}
      style={{
        background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
        padding: '20px 20px 16px', cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = '#1677ff';
        el.style.boxShadow = '0 6px 20px rgba(22,119,255,0.08)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = '#f0f0f0';
        el.style.boxShadow = 'none';
        el.style.transform = 'none';
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: '#1677ff' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, #1677ff, #69b1ff)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>
            {agent.name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.name}
            </div>
            <Space size={4}>
              <Tag color={typeColorMap[agent.type]} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{agent.type}{agent.subType && agent.subType !== agent.type ? `-${agent.subType}` : ''}</Tag>
              {agent.status === '未发布'
                ? <Tag color="default" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>未发布</Tag>
                : agent.publishTypes.map((pt) => (
                    <Tag key={pt} color={publishColorMap[pt]} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{pt}</Tag>
                  ))
              }
            </Space>
          </div>
        </div>
      </div>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {agent.description}
      </Text>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>{agent.creator} · {agent.updateTime}</Text>
        <Space size={4}>
          <Button
            type="default"
            size="small"
            icon={<SettingOutlined />}
            style={{ borderRadius: 6, fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); onConfig(); }}
          >
            配置
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'view', icon: <EyeOutlined />, label: '编辑', onClick: ({ domEvent }) => { domEvent.stopPropagation(); onView(); } },
                { key: 'chat', icon: <MessageOutlined />, label: '去对话', onClick: ({ domEvent }) => { domEvent.stopPropagation(); openChat(agent); } },
                ...(agent.type !== '外部智能体' ? [{ key: 'copy', icon: <CopyOutlined />, label: '复制', onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); handleCopyAgent(agent); } }] : []),
                { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }) => { domEvent.stopPropagation(); message.success('已删除'); } },
              ],
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              style={{ borderRadius: 6, fontSize: 12 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </Space>
      </div>
    </div>
  );

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setActivePane('create');
    setCreateMethod(null);
    setDrawerOpen(true);
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {chatAgent ? (
        chatAgent.type === '流程智能体' && chatAgent.subType === '工作流' ? (
          <WorkflowRunPanel
            agent={chatAgent}
            onBack={() => setChatAgent(null)}
            chatEnabled={chatConfig.enabled}
            remaining={todayRemaining}
            dailyLimit={chatConfig.dailyLimit}
          />
        ) : (
          <AgentChatPanel
            agent={chatAgent}
            onBack={() => setChatAgent(null)}
            chatEnabled={chatConfig.enabled}
            remaining={todayRemaining}
            dailyLimit={chatConfig.dailyLimit}
            onSend={handleChatSend}
            openSettingsSignal={settingsSignal}
          />
        )
      ) : (
        <>
        <PageHeader title="智能体管理" hint="管理已创建的智能体，支持列表和卡片两种视图，可按类型和发布状态筛选" />
        <Row gutter={16} style={{ padding: '0 0 12px' }}>
          {statCards.map((item, idx) => {
            const isActive = activeStatIndex === idx;
            const handleClick = () => {
              if (item.key === 'all') {
                setFilters(prev => ({ ...prev, type: undefined }));
                setActiveStat('all');
              } else {
                setFilters(prev => ({ ...prev, type: item.key }));
                setActiveStat(item.key);
              }
            };
            return (
              <Col key={item.key} style={{ flex: '1 1 0', minWidth: 0 }}>
                <Card
                  size="small"
                  onClick={handleClick}
                  style={{
                    borderRadius: 10,
                    borderColor: isActive ? item.color : '#f0f0f0',
                    cursor: 'pointer',
                    background: isActive ? item.bg : '#fff',
                    boxShadow: isActive ? `0 2px 8px ${item.color}18` : 'none',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, fontSize: 20,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                      <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: '32px' }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); if (key === 'status' || key === 'type') setActiveStat(null); }}
            onSearch={() => {}}
            onReset={() => { setFilters({ keyword: '', type: undefined, status: undefined }); setActiveStat(null); setCardPage(1); }}
            viewMode={viewMode}
            onViewModeChange={(mode) => setViewMode(mode)}
            onCreate={() => navigate('/dev/agent-build')}
            createText="创建智能体"
            extra={<Button icon={<ApiOutlined />} onClick={() => setExternalAgentOpen(true)}>接入外部智能体</Button>}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'table' ? (
              <Table rowKey="id" columns={tableColumns} dataSource={filteredData} size="middle" pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }} style={{ marginTop: 12 }} locale={{ emptyText: '暂无智能体' }} />
            ) : (
              <>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, flex: 1, alignContent: 'start' }}>
                  {filteredData.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map((item) => (
                    <AgentCard
                      key={item.id}
                      agent={item}
                      onConfig={() => navigate(`/dev/agent-config${item.type === '外部智能体' ? '?external=true' : typeFromChinese[item.type] && typeFromChinese[item.type] !== 'standard' ? `?type=${typeFromChinese[item.type]}` : ''}`)}
                      onView={() => setViewingAgent(item)}
                    />
                  ))}
                </div>
                <PaginationBar current={cardPage} pageSize={cardPageSize} total={filteredData.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
              </>
            )}
          </div>
      </div>

      {/* 创建/配置抽屉 */}
      <Drawer
        title={editingAgent ? `编辑智能体 - ${editingAgent.name}` : '创建智能体'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={activePane === 'config' ? '80%' as any : 560}
        destroyOnClose
        footer={activePane === 'create' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" disabled={!createMethod} onClick={() => { if (createMethod === 'blank') { setActivePane('config'); setConfigTab('info'); } else { message.info('模板/导入功能开发中'); } }}>下一步：配置</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button onClick={() => { message.success('已保存草稿'); setDrawerOpen(false); }}>保存草稿</Button>
            <Button type="primary" icon={<RocketOutlined />}>发布智能体</Button>
          </div>
        )}
        styles={{ body: { padding: 0 } }}
      >
        {activePane === 'create' ? (
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}><Text type="secondary">选择创建方式开始构建你的智能体</Text></div>
            {creationMethods.map((m) => (
              <div key={m.key} onClick={() => setCreateMethod(m.key as typeof createMethod)}
                style={{ padding: '20px 24px', marginBottom: 12, borderRadius: 12, cursor: 'pointer', border: `2px solid ${createMethod === m.key ? '#1677ff' : '#f0f0f0'}`, background: createMethod === m.key ? '#f0f5ff' : '#fff', transition: 'all .2s' }}>
                <Row align="middle" gutter={16}>
                  <Col>{m.icon}</Col>
                  <Col flex={1}><div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{m.title}</div><Text type="secondary" style={{ fontSize: 13 }}>{m.desc}</Text></Col>
                  <Col>{createMethod === m.key && <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 20 }} />}</Col>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: 180, borderRight: '1px solid #f0f0f0', padding: '16px 0', background: '#fafafa' }}>
              {[
                { key: 'info', icon: <SettingOutlined />, label: '信息卡片' },
                { key: 'config', icon: <ThunderboltOutlined />, label: '配置' },
                { key: 'publish', icon: <RocketOutlined />, label: '发布' },
                { key: 'logs', icon: <FileTextOutlined />, label: '日志' },
                { key: 'stats', icon: <BarChartOutlined />, label: '统计' },
              ].map((tab) => (
                <div key={tab.key} onClick={() => setConfigTab(tab.key)}
                  style={{ padding: '10px 20px', cursor: 'pointer', fontSize: 14, color: configTab === tab.key ? '#1677ff' : '#595959', background: configTab === tab.key ? '#e6f4ff' : 'transparent', borderRight: configTab === tab.key ? '3px solid #1677ff' : '3px solid transparent', fontWeight: configTab === tab.key ? 600 : 400, transition: 'all .2s' }}>
                  <Space size={8}>{tab.icon}{tab.label}</Space>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
              {configTab === 'info' && (
                <div>
                  <Title level={5} style={{ margin: '0 0 20px' }}>基础信息</Title>
                  <Form layout="vertical" form={form}>
                    <Row gutter={16}>
                      <Col span={12}><Form.Item label="智能体名称" required><Input placeholder="请输入智能体名称" /></Form.Item></Col>
                      <Col span={12}><Form.Item label="智能体类型" required><Select placeholder="选择类型" options={['标准智能体', '流程智能体', '自主智能体'].map(v => ({ label: v, value: v }))} /></Form.Item></Col>
                      <Col span={12}><Form.Item label="所属空间" required><Select placeholder="选择空间" options={mockAgents.slice(0, 4).map(a => ({ label: a.spaceName, value: a.spaceName }))} /></Form.Item></Col>
                      <Col span={12}><Form.Item label="绑定模型" required><Input placeholder="选择模型" /></Form.Item></Col>
                      <Col span={24}><Form.Item label="智能体描述"><TextArea rows={3} placeholder="描述智能体的功能和用途" /></Form.Item></Col>
                    </Row>
                  </Form>
                </div>
              )}
              {configTab === 'config' && (
                <div>
                  <Title level={5} style={{ margin: 0 }}>提示词配置</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>为智能体设计系统提示词与行为准则</Text>
                  <TextArea rows={8} placeholder={'你是一位经验丰富的公安数据分析专家。你的职责是\n\n1. 理解用户的警务数据需求\n2. 调用合适的工具获取数据\n3. 以结构化格式呈现分析结果\n4. 确保分析结论符合警务规范'} style={{ marginBottom: 16, fontFamily: 'monospace' }} />
                  <div style={{ padding: '16px', background: '#fafafa', borderRadius: 8, marginTop: 8 }}>
                    <Text type="secondary">提示词变量：{'{user_query}  {result_data}  {context_info}'}</Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{['结构清晰', '警务规范', '数据准确'].map(t => <Tag key={t} color="processing">{t}</Tag>)}</div>
                  </div>
                </div>
              )}
              {configTab === 'publish' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                  <Title level={4}>准备发布智能体</Title>
                  <Text type="secondary" style={{ marginBottom: 24 }}>发布后智能体将对空间内所有成员可用</Text>
                  <Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><CheckCircleOutlined style={{ color: '#52c41a' }} /> <span>提示词配置完成</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><ExclamationCircleOutlined style={{ color: '#faad14' }} /> <span>未绑定知识库</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><CheckCircleOutlined style={{ color: '#52c41a' }} /> <span>模型已选择</span></div>
                  </Space>
                </div>
              )}
              {configTab === 'logs' && <div style={{ textAlign: 'center', padding: '40px 0' }}><FileTextOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} /><Text type="secondary">操作日志将在智能体发布后记录</Text></div>}
              {configTab === 'stats' && <div style={{ textAlign: 'center', padding: '40px 0' }}><BarChartOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} /><Text type="secondary">统计数据将在智能体发布后生成</Text></div>}
            </div>
          </div>
        )}
      </Drawer>

      {/* 接入外部智能体抽屉 */}
      <Drawer
        title="接入外部智能体"
        open={externalAgentOpen}
        onClose={() => { setExternalAgentOpen(false); externalForm.resetFields(); setExternalIcon({ mode: 'text' }); }}
        size={560}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setExternalAgentOpen(false); externalForm.resetFields(); setExternalIcon({ mode: 'text' }); }}>取消</Button>
            <Button type="primary" onClick={async () => {
              try {
                const values = await externalForm.validateFields();
                const newId = String(data.length + 1);
                const now = new Date().toISOString().slice(0, 10);
                const newAgent: AgentItem = {
                  id: newId,
                  name: values.name,
                  type: '外部智能体',
                  subType: '',
                  status: '未发布',
                  publishTypes: [],
                  description: values.description || '',
                  spaceName: values.space,
                  modelName: '',
                  creator: '当前用户',
                  createTime: now,
                  updateTime: now,
                  callCount: 0,
                  successRate: 0,
                  activeUsers: 0,
                  tokenConsumption: 0,
                  externalUrl: values.externalUrl,
                  sourceType: 'external',
                };
                setData(prev => [newAgent, ...prev]);
                message.success('外部智能体接入成功');
                setExternalAgentOpen(false);
                externalForm.resetFields();
                setExternalIcon({ mode: 'text' });
                navigate('/dev/agent-config?external=true');
              } catch {}
            }}>确认接入</Button>
          </div>
        }
      >
        <Form form={externalForm} layout="vertical">
          <Form.Item label="智能体名称" name="name" rules={[{ required: true, message: '请输入名称' }, { max: 50, message: '不超过50个字符' }]}>
            <Input placeholder="请输入外部智能体名称" />
          </Form.Item>
          <Form.Item label="智能体描述" name="description" rules={[{ max: 200, message: '不超过200个字符' }]}>
            <TextArea rows={3} placeholder="描述外部智能体的功能和用途" />
          </Form.Item>
          <Form.Item label="智能体图标">
            <IconPicker value={externalIcon} onChange={setExternalIcon} size={64} defaultName={externalName} />
          </Form.Item>
          <Form.Item label="外部链接" name="externalUrl" rules={[{ required: true, message: '请输入外部链接' }, { type: 'url', message: '请输入有效的URL地址' }]}>
            <Input placeholder="https://example.com/agent" />
          </Form.Item>
          <Form.Item label="所属空间" name="space" rules={[{ required: true, message: '请选择空间' }]}>
            <Select placeholder="选择空间" options={[...new Set(data.map(a => a.spaceName))].map(s => ({ label: s, value: s }))} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 查看详情抽屉 */}
      <Drawer title="智能体详情" open={!!viewingAgent} onClose={() => setViewingAgent(null)} size={560} destroyOnClose>
        {viewingAgent && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1677ff, #69b1ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, margin: '0 auto 12px' }}>{viewingAgent.name.charAt(0)}</div>
              <Title level={4} style={{ margin: 0 }}>{viewingAgent.name}</Title>
              <Tag color={typeColorMap[viewingAgent.type]} style={{ marginTop: 8 }}>{viewingAgent.type}</Tag>
              {viewingAgent.status === '未发布'
                ? <Tag color="default" style={{ marginTop: 8 }}>未发布</Tag>
                : viewingAgent.publishTypes.map((pt) => (
                    <Tag key={pt} color={publishColorMap[pt]} style={{ marginTop: 8 }}>{pt}</Tag>
                  ))
              }
            </div>
            <Text style={{ display: 'block', marginBottom: 24, textAlign: 'center' }}>{viewingAgent.description}</Text>
            <Row gutter={[16, 16]}>
              {[
                { label: '所属空间', value: viewingAgent.spaceName }, { label: viewingAgent.type === '外部智能体' ? '外部链接' : '绑定模型', value: viewingAgent.type === '外部智能体' ? viewingAgent.externalUrl : viewingAgent.modelName },
                { label: '创建人', value: viewingAgent.creator }, { label: '创建时间', value: viewingAgent.createTime },
                { label: '发布时间', value: viewingAgent.publishTime || '-' }, { label: '更新时间', value: viewingAgent.updateTime },
              ].map((item) => (
                <Col span={12} key={item.label}><div style={{ marginBottom: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text><div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div></div></Col>
              ))}
            </Row>
          </div>
        )}
      </Drawer>

      {/* 复制智能体抽屉 */}
      <Drawer
        title={<span style={{ fontSize: 16, fontWeight: 650 }}>复制智能体</span>}
        open={copyDrawerOpen}
        onClose={() => setCopyDrawerOpen(false)}
        size="large"
        styles={{ body: { padding: '24px 32px', background: '#fafbfc' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setCopyDrawerOpen(false)}>取消</Button>
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => { setCopyDrawerOpen(false); navigate('/dev/agent-config'); }}>
              创建智能体
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Agent type selection — readonly */}
          <div style={{ pointerEvents: 'none', opacity: 0.7 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>
              智能体类型
              <span style={{ color: '#999', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>(只读)</span>
            </div>
            <Row gutter={16}>
              {agentTypes.map((t) => {
                const isSelected = copyAgentType === t.key;
                return (
                  <Col span={8} key={t.key}>
                    <div style={{
                      background: isSelected ? '#fff' : '#fafafa',
                      border: isSelected ? '2px solid #1677ff' : '2px solid #f0f0f0',
                      borderRadius: 10, padding: '18px 16px',
                      transition: 'all 0.2s', height: '100%',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: isSelected ? '#1677ff' : '#999', fontSize: 18 }}>{t.icon}</span>
                        <span style={{ fontWeight: 650, fontSize: 14, color: isSelected ? G.textPrimary : G.textBody }}>{t.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: G.textSecondary, lineHeight: '20px', marginBottom: 8 }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: G.textTertiary, padding: '4px 8px', background: '#f5f5f5', borderRadius: 4, display: 'inline-block' }}>
                        典型场景：{t.example}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Subtype selection — readonly */}
          {copyAgentType !== 'autonomous' && (
            <div style={{ pointerEvents: 'none', opacity: 0.7 }}>
              <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>
                子类型 <span style={{ color: '#ff4d4f' }}>*</span>
                <span style={{ color: '#999', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>(只读)</span>
              </div>
              {copyAgentType === 'standard' ? (
                <Row gutter={[12, 12]}>
                  {standardBizTypes.map((st) => {
                    const isSel = copySubType === st.key;
                    return (
                      <Col span={8} key={st.key}>
                        <div style={{
                          background: isSel ? '#fff' : '#fafafa',
                          border: isSel ? '2px solid #1677ff' : '2px solid #f0f0f0',
                          borderRadius: 10, padding: '14px 14px', transition: 'all 0.2s', height: '100%', minHeight: 132,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: isSel ? '#1677ff' : '#999', fontSize: 16 }}>{st.icon}</span>
                            <span style={{ fontWeight: 650, fontSize: 13, color: isSel ? G.textPrimary : G.textBody }}>{st.title}</span>
                          </div>
                          <div style={{ fontSize: 11, color: G.textSecondary, lineHeight: '18px', marginBottom: 8 }}>{st.desc}</div>
                          {st.tags && (
                            <Space size={4}>
                              {st.tags.map(tag => (
                                <span key={tag} style={{ fontSize: 10, color: isSel ? '#1677ff' : '#aaa', background: isSel ? G.bgBlue : '#f5f5f5', padding: '1px 6px', borderRadius: 3 }}>{tag}</span>
                              ))}
                            </Space>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Row gutter={16}>
                  {workflowSubTypes.map((wt) => {
                    const isSel = copySubType === wt.key;
                    return (
                      <Col span={12} key={wt.key}>
                        <div style={{
                          background: isSel ? '#fff' : '#fafafa',
                          border: isSel ? '2px solid #1677ff' : '2px solid #f0f0f0',
                          borderRadius: 10, padding: '18px 20px', transition: 'all 0.2s', height: '100%',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 28, color: isSel ? '#1677ff' : '#999' }}>{wt.icon}</span>
                            <span style={{ fontWeight: 650, fontSize: 14, color: isSel ? G.textPrimary : G.textBody }}>{wt.title}</span>
                          </div>
                          <div style={{ fontSize: 12, color: G.textSecondary, lineHeight: '20px', marginBottom: 10 }}>{wt.desc}</div>
                          {wt.tags && (
                            <Space size={4}>
                              {wt.tags.map(tag => (
                                <span key={tag} style={{ fontSize: 10, color: isSel ? '#1677ff' : '#aaa', background: isSel ? G.bgBlue : '#f5f5f5', padding: '1px 6px', borderRadius: 3 }}>{tag}</span>
                              ))}
                            </Space>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          )}

          {/* Agent name */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 8 }}>
              智能体名称 <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <Input
              ref={copyNameInputRef}
              placeholder="请输入智能体名称"
              maxLength={50}
              showCount
              value={copyAgentName}
              onChange={(e) => setCopyAgentName(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* Agent description */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 8 }}>智能体描述</div>
            <Input.TextArea
              placeholder="描述该智能体的用途和适用范围，方便团队成员理解和使用"
              rows={3}
              maxLength={200}
              showCount
              value={copyAgentDesc}
              onChange={(e) => setCopyAgentDesc(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* Avatar selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>头像</div>
            <IconPicker value={copyAvatarValue} onChange={setCopyAvatarValue} size={64} defaultName={copyAgentName} />
          </div>
        </div>
      </Drawer>
        </>
      )}

      {/* 对话页使用提示弹窗 */}
      <Modal
        title="使用提示"
        open={chatTipModalOpen}
        onOk={() => {
          localStorage.setItem('chat_dev_tip_dismissed', '1');
          setChatTipModalOpen(false);
          setSettingsSignal(s => s + 1);
        }}
        onCancel={() => {
          setChatTipModalOpen(false);
          setSettingsSignal(s => s + 1);
        }}
        okText="知道了"
        cancelText="关闭"
        width={480}
      >
        <Text>
          开发中心的对话页面仅供测试，限制每日使用次数（{chatConfig.dailyLimit}次），如需正常使用，请将智能体发布到门户，并前往门户使用。
        </Text>
      </Modal>
    </div>
  );
}
