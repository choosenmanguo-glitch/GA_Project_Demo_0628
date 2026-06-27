import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Typography, message, Drawer, Input, Avatar, Radio, Row, Col } from 'antd';
import {
  AppstoreAddOutlined,
  ArrowRightOutlined,
  BranchesOutlined,
  CloudUploadOutlined,
  ClusterOutlined,
  CommentOutlined,
  CopyOutlined,
  FileTextOutlined,
  FormOutlined,
  MessageOutlined,
  PicLeftOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';

const { Text, Title } = Typography;

const G = {
  primary: '#1677ff',
  textPrimary: 'rgba(0,0,0,0.88)',
  textSecondary: 'rgba(0,0,0,0.45)',
  textBody: 'rgba(0,0,0,0.65)',
  textTertiary: 'rgba(0,0,0,0.25)',
  border: '#f0f0f0',
  bgLight: '#fafafa',
  bgBlue: '#f0f5ff',
  white: '#fff',
};

type CreationMethod = {
  key: 'form' | 'conversation' | 'template';
  eyebrow: string;
  title: string;
  description: string;
  scenario: string;
  tags: { label: string; icon: React.ReactNode }[];
  icon: React.ReactNode;
  tone: 'blue' | 'purple' | 'cyan';
};

const creationMethods: CreationMethod[] = [
  {
    key: 'form',
    eyebrow: '表单构建',
    title: '从零搭建',
    description: '选择智能体类型后，进入结构化配置页面，按步骤完成模型、提示词、知识库、工具等组件的装配。',
    scenario: '熟悉平台、需要精细化控制的开发者',
    tags: [
      { label: '精细配置', icon: <SettingOutlined /> },
      { label: '多组件编排', icon: <ClusterOutlined /> },
      { label: '开发者', icon: <UserOutlined /> },
    ],
    icon: <FormOutlined />,
    tone: 'blue',
  },
  {
    key: 'conversation',
    eyebrow: '智能构建',
    title: '对话式创建',
    description: '以自然语言描述需求，AI 助手通过多轮对话逐步明确要求，自动生成完整的智能体配置方案。',
    scenario: '新手用户或希望快速验证想法的场景。对话式创建仅支持自主智能体类型。',
    tags: [
      { label: '自然语言', icon: <MessageOutlined /> },
      { label: '快速生成', icon: <ThunderboltOutlined /> },
      { label: '自主智能体', icon: <SafetyCertificateOutlined /> },
    ],
    icon: <CommentOutlined />,
    tone: 'purple',
  },
  {
    key: 'template',
    eyebrow: '模板构建',
    title: '从模板创建',
    description: '浏览智能体模板市场，选择警务场景预置模板一键复制创建，在模板基础上微调配置。',
    scenario: '快速搭建常见警务业务场景的智能体',
    tags: [
      { label: '警务模板', icon: <SafetyCertificateOutlined /> },
      { label: '一键复制', icon: <CopyOutlined /> },
      { label: '快速上线', icon: <CloudUploadOutlined /> },
    ],
    icon: <AppstoreAddOutlined />,
    tone: 'cyan',
  },
];

const toneStyles: Record<CreationMethod['tone'], { line: string; iconColor: string; iconBg: string }> = {
  blue: { line: G.primary, iconColor: G.primary, iconBg: G.bgBlue },
  purple: { line: '#722ed1', iconColor: '#722ed1', iconBg: '#f9f0ff' },
  cyan: { line: '#13c2c2', iconColor: '#13c2c2', iconBg: '#e6fffb' },
};

type AgentType = 'standard' | 'workflow' | 'autonomous';

const agentTypes: { key: AgentType; title: string; desc: string; icon: React.ReactNode; example: string }[] = [
  {
    key: 'standard', title: '标准智能体', icon: <RobotOutlined />,
    desc: '单一任务执行，基于模型 + 提示词 + 知识库 + 工具的标准推理链路。',
    example: '警情分析、笔录校对、便民问答等',
  },
  {
    key: 'workflow', title: '流程智能体', icon: <ClusterOutlined />,
    desc: '多步骤任务编排，支持条件分支与并行执行，适配复杂审批、研判流程。',
    example: '案件流转审批、多部门协查、信息核查流程等',
  },
  {
    key: 'autonomous', title: '自主智能体', icon: <SafetyCertificateOutlined />,
    desc: '具备自主规划与工具调用能力，可分解复杂目标为子任务逐步执行。',
    example: '犯罪画像分析、综合情报研判、自主巡逻决策等',
  },
];

const avatarPresets = [
  { key: 'police', color: '#1677ff', bg: '#e6f4ff', label: '警' },
  { key: 'shield', color: '#52c41a', bg: '#f6ffed', label: '盾' },
  { key: 'search', color: '#722ed1', bg: '#f9f0ff', label: '侦' },
  { key: 'brain', color: '#fa8c16', bg: '#fff7e6', label: '析' },
  { key: 'doc', color: '#13c2c2', bg: '#e6fffb', label: '文' },
  { key: 'chat', color: '#eb2f96', bg: '#fff0f6', label: '答' },
];

const standardBizTypes: { key: string; title: string; desc: string; icon: React.ReactNode; tags?: string[] }[] = [
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

const workflowSubTypes: { key: string; title: string; desc: string; icon: React.ReactNode; tags?: string[] }[] = [
  { key: 'workflow', title: '工作流', desc: '将 AI 模型调用、知识检索、条件分支、代码执行等组件抽象为标准节点，通过拖拽、连线、配置组装为可重复执行的自动化流程。', icon: <BranchesOutlined />, tags: ['可视化编排', '自动化'] },
  { key: 'chatflow', title: '对话流', desc: '以对话交互为主线的流程模式，会话变量跨轮次持久化。提供答案节点、变量赋值器、参数提取器等专用组件，适合多轮对话式业务。', icon: <MessageOutlined />, tags: ['多轮对话', '会话变量'] },
];

const styles = {
  page: {
    flex: 1,
    padding: '16px 24px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '14px 0 0',
    display: 'flex',
  } as React.CSSProperties,
  panel: {
    width: '100%',
    minHeight: 'calc(100vh - 154px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 26,
    padding: '28px 24px 20px',
    border: `1px solid ${G.border}`,
    borderRadius: 8,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  } as React.CSSProperties,
  intro: {
    maxWidth: 1320,
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 24,
  } as React.CSSProperties,
  eyebrow: {
    display: 'block',
    marginBottom: 8,
    color: G.textSecondary,
    fontSize: 13,
    fontWeight: 650,
  } as React.CSSProperties,
  introTitle: {
    margin: 0,
    color: G.textPrimary,
    fontSize: 28,
    fontWeight: 760,
    lineHeight: '36px',
  } as React.CSSProperties,
  introDesc: {
    display: 'block',
    maxWidth: 560,
    color: G.textSecondary,
    fontSize: 14,
    lineHeight: '24px',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
    maxWidth: 1320,
    width: '100%',
    margin: '0 auto',
  } as React.CSSProperties,
  card: {
    position: 'relative',
    minHeight: 560,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 28,
    padding: '28px 26px 24px',
    border: `1px solid ${G.border}`,
    borderRadius: 8,
    background: G.white,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
    overflow: 'hidden',
  } as React.CSSProperties,
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
  } as React.CSSProperties,
  cardMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  } as React.CSSProperties,
  iconBox: {
    width: 56,
    height: 56,
    display: 'grid',
    placeItems: 'center',
    border: `1px solid ${G.border}`,
    borderRadius: 8,
    fontSize: 28,
  } as React.CSSProperties,
  cardEyebrow: {
    display: 'block',
    marginBottom: 6,
    color: G.textSecondary,
    fontSize: 13,
    fontWeight: 650,
  } as React.CSSProperties,
  cardTitle: {
    margin: 0,
    color: G.textPrimary,
    fontSize: 24,
    fontWeight: 760,
    lineHeight: '32px',
  } as React.CSSProperties,
  cardDescription: {
    color: G.textBody,
    fontSize: 14,
    lineHeight: '26px',
  } as React.CSSProperties,
  tagBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  } as React.CSSProperties,
  tagDivider: {
    width: '100%',
    height: 1,
    borderTop: `1px dashed ${G.border}`,
  } as React.CSSProperties,
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  } as React.CSSProperties,
  tagChip: {
    height: 34,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 12px',
    borderRadius: 7,
    color: G.primary,
    background: G.bgBlue,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  } as React.CSSProperties,
  scenario: {
    minHeight: 88,
    padding: '14px 16px',
    border: `1px solid ${G.border}`,
    borderRadius: 8,
    background: G.bgLight,
  } as React.CSSProperties,
  scenarioLabel: {
    display: 'block',
    color: G.textSecondary,
    fontSize: 12,
  } as React.CSSProperties,
  scenarioText: {
    margin: '6px 0 0',
    color: G.textBody,
    fontSize: 13,
    fontWeight: 650,
    lineHeight: '22px',
  } as React.CSSProperties,
  button: {
    height: 44,
    borderRadius: 7,
    boxShadow: '0 4px 12px rgba(22,119,255,0.25)',
    fontWeight: 650,
  } as React.CSSProperties,
  helpTip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: G.textSecondary,
    fontSize: 14,
  } as React.CSSProperties,
};

export default function AgentBuildPage() {
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [agentType, setAgentType] = useState<AgentType>('standard');
  const [subType, setSubType] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentDesc, setAgentDesc] = useState('');
  const [avatarKey, setAvatarKey] = useState('police');

  const handleCreate = (key: CreationMethod['key']) => {
    if (key === 'form') {
      setAgentType('standard');
      setSubType('');
      setAgentName('');
      setAgentDesc('');
      setAvatarKey('police');
      setDrawerOpen(true);
      return;
    }
    if (key === 'template') {
      nav('/dev/agent-build/template');
      return;
    }

    message.info('对话式创建能力建设中');
  };

  const selectedAvatar = avatarPresets.find(a => a.key === avatarKey)!;

  const handleSubmitForm = () => {
    if (!agentName.trim()) {
      message.warning('请输入智能体名称');
      return;
    }
    if (agentType === 'standard' && !subType) {
      message.warning('请选择子类型');
      return;
    }
    if (agentType === 'workflow' && !subType) {
      message.warning('请选择子类型');
      return;
    }
    message.success(`智能体「${agentName}」创建成功，即将跳转至配置页面。`);
    setDrawerOpen(false);
    setTimeout(() => nav('/dev/agent-config'), 500);
  };

  return (
    <div style={styles.page}>
      <PageHeader title="创建智能体" hint="选择一种创建方式开始搭建你的 AI 智能体" />
      <div style={styles.body}>
        <section style={styles.panel}>
          <div style={styles.intro}>
            <div>
              <Text style={styles.eyebrow}>AGENT BUILDER</Text>
              <Title level={2} style={styles.introTitle}>
                选择构建方式
              </Title>
            </div>
            <Text style={styles.introDesc}>
              面向不同熟练度和业务复杂度，提供结构化配置、对话生成和场景模板三种入口。
            </Text>
          </div>

          <div style={styles.grid}>
            {creationMethods.map((method, index) => {
              const tone = toneStyles[method.tone];

              return (
                <article
                  key={method.key}
                  style={styles.card}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = G.primary;
                    event.currentTarget.style.boxShadow = '0 8px 24px rgba(22,119,255,0.12)';
                    event.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = G.border;
                    event.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                    event.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ ...styles.topLine, background: tone.line }} />
                  <div style={styles.cardMain}>
                    <div style={{ ...styles.iconBox, color: tone.iconColor, background: tone.iconBg }}>
                      {method.icon}
                    </div>
                    <div>
                      <Text style={styles.cardEyebrow}>
                        {String(index + 1).padStart(2, '0')} / {method.eyebrow}
                      </Text>
                      <h3 style={styles.cardTitle}>{method.title}</h3>
                    </div>
                    <Text style={styles.cardDescription}>{method.description}</Text>
                    <div style={styles.tagBlock}>
                      <div style={styles.tagDivider} />
                      <div style={styles.tagRow}>
                        {method.tags.map((tag) => (
                          <span key={tag.label} style={styles.tagChip}>
                            {tag.icon}
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.scenario}>
                      <Text style={styles.scenarioLabel}>适用场景</Text>
                      <p style={styles.scenarioText}>{method.scenario}</p>
                    </div>
                    <Button
                      type="primary"
                      block
                      icon={<ArrowRightOutlined />}
                      style={styles.button}
                      onClick={() => handleCreate(method.key)}
                    >
                      开始创建
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <div style={styles.helpTip}>
            <QuestionCircleOutlined style={{ color: G.textTertiary }} />
            <Text type="secondary">不确定从哪里开始？试试</Text>
            <Button type="link" size="small" icon={<RobotOutlined />} style={{ height: 'auto', padding: '0 2px', fontWeight: 650 }}>
              智能构建
            </Button>
            <Text type="secondary">，告诉我你想做什么。</Text>
          </div>
        </section>
      </div>

      {/* ──── 表单构建 Drawer ──── */}
      <Drawer
        title={<span style={{ fontSize: 16, fontWeight: 650 }}>创建智能体</span>}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="large"
        styles={{ body: { padding: '24px 32px', background: '#fafbfc' } }}
        extra={
          <Button type="primary" icon={<ArrowRightOutlined />} style={{ borderRadius: 6 }}
            onClick={handleSubmitForm}>
            创建智能体
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Agent type selection */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>智能体类型</div>
            <Row gutter={16}>
              {agentTypes.map((t) => {
                const isSelected = agentType === t.key;
                return (
                  <Col span={8} key={t.key}>
                    <div
                      onClick={() => { setAgentType(t.key); setSubType(''); }}
                      style={{
                        background: isSelected ? '#fff' : '#fafafa',
                        border: isSelected ? '2px solid #1677ff' : '2px solid #f0f0f0',
                        borderRadius: 10,
                        padding: '18px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: '100%',
                      }}
                    >
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

          {/* Subtype selection — dynamic based on agentType */}
          {agentType !== 'autonomous' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>
                子类型 <span style={{ color: '#ff4d4f' }}>*</span>
              </div>
              {agentType === 'standard' ? (
                <Row gutter={[12, 12]}>
                  {standardBizTypes.map((st) => {
                    const isSel = subType === st.key;
                    return (
                      <Col span={8} key={st.key}>
                        <div
                          onClick={() => { setSubType(st.key); }}
                          style={{
                            background: isSel ? '#fff' : '#fafafa',
                            border: isSel ? '2px solid #1677ff' : '2px solid #f0f0f0',
                            borderRadius: 10, padding: '14px 14px', cursor: 'pointer',
                            transition: 'all 0.2s', height: '100%', minHeight: 132,
                          }}
                        >
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
                    const isSel = subType === wt.key;
                    return (
                      <Col span={12} key={wt.key}>
                        <div
                          onClick={() => { setSubType(wt.key); }}
                          style={{
                            background: isSel ? '#fff' : '#fafafa',
                            border: isSel ? '2px solid #1677ff' : '2px solid #f0f0f0',
                            borderRadius: 10, padding: '18px 20px', cursor: 'pointer',
                            transition: 'all 0.2s', height: '100%',
                          }}
                        >
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
              placeholder="请输入智能体名称，例如：反诈资金追踪助手"
              maxLength={50}
              showCount
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
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
              value={agentDesc}
              onChange={(e) => setAgentDesc(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* Avatar selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 650, color: G.textPrimary, marginBottom: 12 }}>头像</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {avatarPresets.map((a) => {
                const isSel = avatarKey === a.key;
                return (
                  <div
                    key={a.key}
                    onClick={() => setAvatarKey(a.key)}
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: a.bg, color: a.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, cursor: 'pointer',
                      border: isSel ? `2px solid ${a.color}` : '2px solid transparent',
                      transition: 'all 0.2s',
                      boxShadow: isSel ? `0 0 0 3px ${a.bg}` : 'none',
                    }}
                  >
                    {a.label}
                  </div>
                );
              })}
              <div style={{ width: 48, height: 48, borderRadius: 12, border: '2px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s', color: '#999', fontSize: 18 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1677ff'; e.currentTarget.style.color = '#1677ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.color = '#999'; }}
              >
                <PicLeftOutlined />
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
