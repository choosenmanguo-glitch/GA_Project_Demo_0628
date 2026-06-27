import React, { useState, useMemo } from 'react';
import { Drawer, Button, Tag, Space, Typography, Row, Col, Card, Descriptions, Switch, message } from 'antd';
import {
  RobotOutlined, SafetyCertificateOutlined, ThunderboltOutlined,
  FileTextOutlined, CopyOutlined, EyeOutlined, TeamOutlined,
  DatabaseOutlined, ApiOutlined, MessageOutlined, SecurityScanOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import StatCards from '@/components/StatCards';
import type { FilterField } from '@/components/FilterBar';
import type { StatItemSimple } from '@/components/StatCards';

const { Text } = Typography;

const CATEGORIES = [
  '客服应答', '知识问答', '数据分析', '文档编写', '文件审核', '信息抽取', '智能分类', '自定义',
];

const MOCK_TEMPLATES = [
  {
    id: 'tpl-1', name: '110接警警情分析标准模板',
    category: '信息抽取',
    description: '适用于指挥中心接警场景，自动从通话语音转写文本中提取标准警情要素并分类录入接处警系统。',
    tags: ['接处警', '警情分析', '信息提取'],
    modelName: 'DeepSeek-Chat',
    knowledgeBases: ['警情分类知识库', '接处警规程库'],
    tools: ['文书智能解析'],
    useCount: 5230, createdAt: '2026-03-15', updatedAt: '2026-06-20',
    isSystem: true,
    systemPrompt: `你是一位经验丰富的110接警中心指挥长与警情研判专家。从口语化且混乱的报案人通话转录文本中，提取标准化警情要素。

【职责】
1. 识别报案时间、精确位置
2. 识别涉案人、被害人、嫌疑人信息
3. 判断警情类别及紧急程度
4. 提取关键事实摘要

【输出格式】以结构化 JSON 格式返回。若信息不全，标注为"待补充"而非猜测。`,
    modelConfig: { temperature: 0.3, maxTokens: 32768, topP: 0.9, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 5, scoreThreshold: 0.75 },
    greeting: '您好，我是110接警警情分析助手，请提供报案人通话录音或文字记录，我将为您提取标准化警情要素。',
    contentReview: true,
  },
  {
    id: 'tpl-2', name: '电诈资金追踪研判模板',
    category: '数据分析',
    description: '适用于反诈中心研判场景，自动分析涉诈资金链路，识别可疑卡号集群，辅助民警研判洗钱路径。',
    tags: ['反诈', '资金追踪', '洗钱研判'],
    modelName: 'DeepSeek-Reasoner',
    knowledgeBases: ['反诈案例知识库', '洗钱模式特征库'],
    tools: ['关系图谱生成', '涉诈基站分析'],
    useCount: 3820, createdAt: '2026-04-02', updatedAt: '2026-06-22',
    isSystem: true,
    systemPrompt: `你是一位精通网络金融犯罪与洗钱链条追踪的反诈精英调查员。涉诈团伙通常使用多级"水房"、聚合支付和地下钱庄进行高频资金洗白。

基于提供的多层级转账记录数据，找出短时间内从起点分散转入再集中转出的可疑卡号群体，按可疑程度降序排列。关注高频交易、异常金额、快进快出特征。`,
    modelConfig: { temperature: 0.2, maxTokens: 32768, topP: 0.85, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 8, scoreThreshold: 0.8 },
    greeting: '您好，请提供涉诈案件的嫌疑卡号、资金流数据或基站漫游记录，我将为您穿透分析洗钱链路。',
    contentReview: true,
  },
  {
    id: 'tpl-3', name: '交通事故责任认定辅助模板',
    category: '文档编写',
    description: '适用于交通管理中事故处理场景，基于现场勘查记录和监控描述分析事故原因并判定责任方。',
    tags: ['交通管理', '事故认定', '责任分析'],
    modelName: 'GPT-4o',
    knowledgeBases: ['道路交通安全法规库'],
    tools: ['车辆轨迹查询', '图像识别'],
    useCount: 2150, createdAt: '2026-04-20', updatedAt: '2026-06-18',
    isSystem: true,
    systemPrompt: `你是一名资深交通事故处理专家。基于现场勘查记录、监控视频描述和当事人陈述，分析事故原因并判定责任方。

【输入】事故时间、地点、涉事车辆信息、道路状况、监控描述、当事人陈述
【输出】事故原因分析、责任认定意见、法律依据引用、安全建议`,
    modelConfig: { temperature: 0.4, maxTokens: 128000, topP: 0.95, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 5, scoreThreshold: 0.7 },
    greeting: '您好，请提供事故发生时间、地点、涉事车辆信息及监控描述，我将为您分析事故原因并出具责任认定意见。',
    contentReview: true,
  },
  {
    id: 'tpl-4', name: '刑事案件案情摘要生成模板',
    category: '文档编写',
    description: '适用于刑侦办案场景，自动解析案件材料生成结构化的案情摘要报告，辅助民警快速梳理案情脉络。',
    tags: ['刑侦办案', '案情摘要', '报告生成'],
    modelName: 'Qwen-72B-Chat',
    knowledgeBases: ['案件卷宗库', '法律法规库'],
    tools: ['文书智能解析', '人口信息查询'],
    useCount: 4890, createdAt: '2026-02-28', updatedAt: '2026-06-15',
    isSystem: true,
    systemPrompt: `你是一名经验丰富的刑事侦查办案民警。基于案件材料，生成标准化案情摘要报告。

【报告结构】案件概况、关键事实陈述（按时间线）、涉案人员信息、证据清单、法律适用建议、下一步侦查方向。`,
    modelConfig: { temperature: 0.35, maxTokens: 8192, topP: 0.9, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 6, scoreThreshold: 0.75 },
    greeting: '您好，请上传案件相关材料，我将自动生成案情摘要报告。',
    contentReview: true,
  },
  {
    id: 'tpl-5', name: '社区警务便民问答模板',
    category: '客服应答',
    description: '适用于派出所社区警务场景，提供户籍办理、居住证申领、治安防范等常见问题智能答疑。',
    tags: ['社区警务', '便民服务', '政策问答'],
    modelName: 'DeepSeek-Chat',
    knowledgeBases: ['户籍信息库', '社区管理规范', '便民政策库'],
    tools: ['人口信息查询'],
    useCount: 7890, createdAt: '2026-01-10', updatedAt: '2026-06-21',
    isSystem: true,
    systemPrompt: `你是社区警务工作台的智能助手，负责解答群众关于户籍、居住证、治安防范等常见问题。语言通俗易懂，态度亲和。涉及政策法规时注明依据。`,
    modelConfig: { temperature: 0.5, maxTokens: 16384, topP: 0.95, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 3, scoreThreshold: 0.7 },
    greeting: '您好，我是社区警务助手，请问有什么可以帮您？您可以咨询户籍办理、居住证申领、治安防范等业务。',
    contentReview: false,
  },
  {
    id: 'tpl-6', name: '走失人员协查通报模板',
    category: '文档编写',
    description: '适用于治安管理场景，根据家属报案信息自动生成标准格式协查通报和寻人提示。',
    tags: ['治安管理', '协查通报', '人员查找'],
    modelName: 'DeepSeek-Chat',
    knowledgeBases: ['走失人员案例库'],
    tools: ['图像识别'],
    useCount: 1560, createdAt: '2026-05-08', updatedAt: '2026-06-10',
    isSystem: true,
    systemPrompt: `根据报案人家属提供的走失人员信息，快速生成一篇格式规范的《协查通报》与《寻人提示》。对体貌特征加粗显示，用最简短的要点列出盘问和注意方式。`,
    modelConfig: { temperature: 0.3, maxTokens: 16384, topP: 0.9, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 3, scoreThreshold: 0.65 },
    greeting: '您好，请提供走失人员的体貌特征、最后出现地点、年龄及健康状况，我将为您生成标准格式协查通报。',
    contentReview: true,
  },
  {
    id: 'tpl-7', name: '巡逻路线智能规划模板',
    category: '数据分析',
    description: '适用于巡特警日常巡逻场景，基于历史案发数据和实时警情分布，智能推荐最优巡逻路线方案。',
    tags: ['巡逻防控', '路线规划', '智慧警务'],
    modelName: 'DeepSeek-Reasoner',
    knowledgeBases: ['治安态势库', '地理信息库'],
    tools: ['警情统计分析'],
    useCount: 2340, createdAt: '2026-04-15', updatedAt: '2026-06-12',
    isSystem: true,
    systemPrompt: `你是一位公安巡逻勤务规划专家，负责基于治安态势数据制定科学合理的巡逻路线方案。`,
    modelConfig: { temperature: 0.25, maxTokens: 16384, topP: 0.85, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 8, scoreThreshold: 0.8 },
    greeting: '您好，请设定巡逻区域和时间范围，我将基于历史案发数据和实时警情为您推荐最优巡逻路线。',
    contentReview: false,
  },
  {
    id: 'tpl-8', name: '笔录文书智能校对模板',
    category: '文档编写',
    description: '适用于法制审核场景，对笔录文书进行语法纠错、格式规范和法条引用校验，提升文书质量。',
    tags: ['法制审核', '文书校对', '质量管控'],
    modelName: 'GPT-4o',
    knowledgeBases: ['法律法规库', '文书规范库'],
    tools: ['文书智能解析'],
    useCount: 6120, createdAt: '2026-02-10', updatedAt: '2026-06-22',
    isSystem: true,
    systemPrompt: `你是一位资深法制审核专家，负责对公安执法文书进行规范性审查。审查语法与文字错误、格式规范性、法条引用正确性、逻辑一致性与完整性。`,
    modelConfig: { temperature: 0.2, maxTokens: 32768, topP: 0.9, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 5, scoreThreshold: 0.8 },
    greeting: '您好，请上传需要校对的笔录文书，我将检查语法错误、格式规范并核验法条引用合规性。',
    contentReview: true,
  },
  {
    id: 'tpl-9', name: '重大活动安保风险评估模板',
    category: '数据分析',
    description: '适用于大型活动安保场景，基于多维数据综合分析活动风险等级，输出结构化风险评估报告。',
    tags: ['安保评估', '风险分析', '大型活动'],
    modelName: 'DeepSeek-Reasoner',
    knowledgeBases: ['安保案例库', '应急预案库', '地理信息库'],
    tools: ['关系图谱生成', '警情统计分析'],
    useCount: 1890, createdAt: '2026-05-20', updatedAt: '2026-06-19',
    isSystem: false,
    systemPrompt: `你是一名重大活动安保风险评估专家。从场地安全性、人员风险、治安态势、交通保障、天气环境五个维度综合评估，输出风险评分与等级。`,
    modelConfig: { temperature: 0.3, maxTokens: 32768, topP: 0.85, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 8, scoreThreshold: 0.75 },
    greeting: '您好，请提供活动基本信息（时间、地点、规模、类型），我将综合评估安保风险并输出结构化报告。',
    contentReview: true,
  },
  {
    id: 'tpl-10', name: '警情周报自动生成模板',
    category: '文档编写',
    description: '适用于指挥中心周报编写场景，基于警情统计数据自动生成图文并茂的警情分析周报。',
    tags: ['指挥中心', '周报生成', '数据可视化'],
    modelName: 'Qwen-72B-Chat',
    knowledgeBases: ['警情分类知识库'],
    tools: ['警情统计分析'],
    useCount: 3450, createdAt: '2026-03-05', updatedAt: '2026-06-16',
    isSystem: true,
    systemPrompt: `你是指挥中心数据分析师，负责基于一周内的警情统计数据生成标准化的警情分析周报。涵盖总体概况、分类统计、时空分布、重点关注和趋势研判。`,
    modelConfig: { temperature: 0.4, maxTokens: 32768, topP: 0.9, continuousDialogue: true },
    knowledgeConfig: { retrievalCount: 5, scoreThreshold: 0.7 },
    greeting: '您好，请指定周报日期范围，我将基于该时段内的警情统计数据自动生成分析周报。',
    contentReview: true,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  '客服应答': 'blue', '知识问答': 'purple', '数据分析': 'geekblue',
  '文档编写': 'green', '文件审核': 'orange', '信息抽取': 'cyan',
  '智能分类': 'magenta', '自定义': 'default',
};

const templateFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '模板名称或场景关键词', width: 240 },
  { type: 'select', key: 'category', placeholder: '分类', width: 130, options: CATEGORIES.map(c => ({ label: c, value: c })) },
];

const TemplateCard: React.FC<{ template: typeof MOCK_TEMPLATES[0]; onClick: () => void }> = ({ template, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
      padding: '22px 22px 18px', cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
      display: 'flex', flexDirection: 'column', gap: 14,
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
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 6 }}>
          {template.name}
        </div>
        <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px' }} className="line-clamp-2">
          {template.description}
        </Text>
      </div>
      {template.isSystem && (
        <Tag color="blue" style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>系统预置</Tag>
      )}
    </div>
    <Space size={6} wrap>
      <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, border: 0, background: '#f0f5ff', color: '#1677ff' }}>{template.category}</Tag>
      {template.tags.slice(0, 2).map(tag => (
        <Tag key={tag} style={{ borderRadius: 4, margin: 0, fontSize: 11, background: '#fafafa', color: '#666', border: '1px solid #f0f0f0' }}>{tag}</Tag>
      ))}
      {template.tags.length > 2 && <Text type="secondary" style={{ fontSize: 11 }}>+{template.tags.length - 2}</Text>}
    </Space>
    <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
      <span style={{ fontSize: 12, color: '#999' }}><span style={{ fontWeight: 600, color: '#666' }}>默认模型</span> {template.modelName}</span>
      <span style={{ fontSize: 12, color: '#999' }}><span style={{ fontWeight: 600, color: '#666' }}>关联知识库</span> {template.knowledgeBases.length}个</span>
      {template.tools.length > 0 && <span style={{ fontSize: 12, color: '#999' }}><span style={{ fontWeight: 600, color: '#666' }}>挂载工具</span> {template.tools.length}个</span>}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Space size={4}>
        <TeamOutlined style={{ fontSize: 12, color: '#bbb' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>{template.useCount.toLocaleString()} 次使用</Text>
      </Space>
      <Button type="link" size="small" icon={<EyeOutlined />} style={{ fontWeight: 500, fontSize: 13, padding: '0 4px' }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}>
        查看详情
      </Button>
    </div>
  </div>
);

// ──── Detail Drawer content ────

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Card size="small" style={{ borderRadius: 10, borderColor: '#f0f0f0' }}
    title={<Space size={6}><span style={{ color: '#1677ff' }}>{icon}</span><span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span></Space>}>
    {children}
  </Card>
);

export default function AgentTemplateMarket() {
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', category: undefined });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTpl, setDetailTpl] = useState<typeof MOCK_TEMPLATES[0] | null>(null);

  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      const kw = (filters.keyword || '').toLowerCase();
      if (kw && !t.name.toLowerCase().includes(kw) && !t.tags.some(tag => tag.toLowerCase().includes(kw)) && !t.description.toLowerCase().includes(kw)) return false;
      if (filters.category && t.category !== filters.category) return false;
      return true;
    });
  }, [filters]);

  const stats: StatItemSimple[] = [
    { label: '模板总数', value: MOCK_TEMPLATES.length, color: '#1677ff' },
    { label: '系统预置', value: MOCK_TEMPLATES.filter(t => t.isSystem).length, color: '#52c41a' },
    { label: '自定义模板', value: MOCK_TEMPLATES.filter(t => !t.isSystem).length, color: '#722ed1' },
    { label: '累计使用次数', value: MOCK_TEMPLATES.reduce((s, t) => s + t.useCount, 0).toLocaleString(), color: '#fa8c16' },
  ];

  const handleOpenDetail = (tpl: typeof MOCK_TEMPLATES[0]) => {
    setDetailTpl(tpl);
    setDrawerOpen(true);
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="模板市场" hint="浏览预置警务场景模板，一键复制创建智能体" />
      <StatCards stats={stats} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <FilterBar
          filters={templateFilterFields}
          filterValues={filters}
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          onSearch={() => {}}
          onReset={() => setFilters({ keyword: '', category: undefined })}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {filteredTemplates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} onClick={() => handleOpenDetail(tpl)} />
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
              <RobotOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 16, display: 'block' }} />
              <div style={{ fontSize: 14, marginBottom: 4 }}>未找到匹配的模板</div>
              <Text type="secondary" style={{ fontSize: 13 }}>请调整筛选条件或搜索关键词</Text>
            </div>
          )}
        </div>
      </div>

      {/* ──── Template Detail Drawer ──── */}
      <Drawer
        title={<Space><span style={{ fontSize: 16, fontWeight: 650 }}>{detailTpl?.name}</span>{detailTpl?.isSystem && <Tag color="blue" style={{ borderRadius: 4 }}>系统预置</Tag>}</Space>}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="large"
        styles={{ body: { padding: '20px 28px', background: '#f7f8fa' } }}
        extra={
          <Button type="primary" icon={<CopyOutlined />} style={{ borderRadius: 6 }}
            onClick={() => { message.success(`已基于「${detailTpl?.name}」创建新的智能体草稿，可在智能体管理列表中查看和编辑。`); }}>
            使用此模板
          </Button>
        }
      >
        {detailTpl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 基本信息 */}
            <SectionCard icon={<RobotOutlined />} title="基本信息">
              <Descriptions column={2} size="small" colon={false} labelStyle={{ color: '#999', fontSize: 12 }}>
                <Descriptions.Item label="模板名称">{detailTpl.name}</Descriptions.Item>
                <Descriptions.Item label="分类"><Tag color="blue" style={{ borderRadius: 4 }}>{detailTpl.category}</Tag></Descriptions.Item>
                <Descriptions.Item label="来源"><Tag color={detailTpl.isSystem ? 'blue' : 'green'} style={{ borderRadius: 4 }}>{detailTpl.isSystem ? '系统预置' : '自定义模板'}</Tag></Descriptions.Item>
                <Descriptions.Item label="使用次数"><Space size={4}><TeamOutlined style={{ color: '#999' }} /><Text style={{ fontWeight: 600 }}>{detailTpl.useCount.toLocaleString()}</Text></Space></Descriptions.Item>
                <Descriptions.Item label="适用场景" span={2}><Text>{detailTpl.description}</Text></Descriptions.Item>
                <Descriptions.Item label="标签" span={2}>
                  <Space size={4} wrap>{detailTpl.tags.map(tag => <Tag key={tag} style={{ borderRadius: 4 }}>{tag}</Tag>)}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间"><Text style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{detailTpl.createdAt}</Text></Descriptions.Item>
                <Descriptions.Item label="最近更新"><Text style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{detailTpl.updatedAt}</Text></Descriptions.Item>
              </Descriptions>
            </SectionCard>

            {/* 提示词 */}
            <SectionCard icon={<FileTextOutlined />} title="系统提示词">
              <div style={{
                background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '16px 20px',
                fontSize: 13, fontFamily: '"Cascadia Code","Fira Code","JetBrains Mono",monospace',
                lineHeight: '22px', whiteSpace: 'pre-wrap', color: '#595959', maxHeight: 300, overflow: 'auto',
              }}>
                {detailTpl.systemPrompt}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <Tag style={{ borderRadius: 4, background: '#f0f5ff', color: '#1677ff', border: 0 }}>{detailTpl.modelConfig.temperature} temperature</Tag>
                <Tag style={{ borderRadius: 4, background: '#f0f5ff', color: '#1677ff', border: 0 }}>{detailTpl.modelConfig.maxTokens.toLocaleString()} maxTokens</Tag>
                <Tag style={{ borderRadius: 4, background: '#f0f5ff', color: '#1677ff', border: 0 }}>{detailTpl.modelConfig.topP} topP</Tag>
              </div>
            </SectionCard>

            {/* 模型配置 */}
            <SectionCard icon={<ThunderboltOutlined />} title="模型配置">
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>默认模型</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}><ThunderboltOutlined style={{ color: '#1677ff', marginRight: 6 }} />{detailTpl.modelName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>参数预设</div>
                      <Space size={6} wrap>
                        {Object.entries(detailTpl.modelConfig).filter(([k]) => k !== 'continuousDialogue').map(([k, v]) => (
                          <Tag key={k} style={{ borderRadius: 4, margin: 0, fontSize: 12 }}>{k}: <strong>{String(v)}</strong></Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>连续对话</div>
                  <Switch checked={!!detailTpl.modelConfig.continuousDialogue} disabled />
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{detailTpl.modelConfig.continuousDialogue ? '启用' : '未启用'}</Text>
                </Col>
              </Row>
            </SectionCard>

            {/* 知识库 */}
            <SectionCard icon={<DatabaseOutlined />} title="知识库关联">
              {detailTpl.knowledgeBases.length > 0 ? (
                <>
                  <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
                    {detailTpl.knowledgeBases.map((kb) => (
                      <div key={kb} style={{ padding: '8px 14px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DatabaseOutlined style={{ color: '#1677ff' }} /><span style={{ fontSize: 13, fontWeight: 500 }}>{kb}</span>
                      </div>
                    ))}
                  </Space>
                  <Descriptions column={2} size="small" colon={false} labelStyle={{ color: '#999', fontSize: 12 }}>
                    <Descriptions.Item label="检索条数">{detailTpl.knowledgeConfig.retrievalCount} 条</Descriptions.Item>
                    <Descriptions.Item label="相似度阈值">{detailTpl.knowledgeConfig.scoreThreshold}</Descriptions.Item>
                  </Descriptions>
                </>
              ) : <Text type="secondary" style={{ fontSize: 13 }}>未关联知识库</Text>}
            </SectionCard>

            {/* 工具集 */}
            <SectionCard icon={<ApiOutlined />} title="挂载工具">
              {detailTpl.tools.length > 0 ? (
                <Space wrap size={[8, 8]}>
                  {detailTpl.tools.map((tool) => (
                    <div key={tool} style={{ padding: '8px 14px', borderRadius: 8, background: '#f0f5ff', border: '1px solid #d6e4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ApiOutlined style={{ color: '#1677ff' }} /><span style={{ fontSize: 13, fontWeight: 500, color: '#1677ff' }}>{tool}</span>
                    </div>
                  ))}
                </Space>
              ) : <Text type="secondary" style={{ fontSize: 13 }}>未挂载工具</Text>}
            </SectionCard>

            {/* 对话交互 */}
            <SectionCard icon={<MessageOutlined />} title="对话交互设置">
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>开场白</div>
                  <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#595959', lineHeight: '22px' }}>
                    {detailTpl.greeting}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>内容审查</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch checked={detailTpl.contentReview} disabled />
                    <Text type="secondary" style={{ fontSize: 13 }}>{detailTpl.contentReview ? '已开启内容安全审查' : '未开启内容审查'}</Text>
                  </div>
                  {detailTpl.contentReview && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999', padding: '8px 12px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f' }}>
                      <SecurityScanOutlined style={{ color: '#faad14', marginRight: 6 }} />审查敏感信息输出，防止数据泄露和不当内容
                    </div>
                  )}
                </Col>
              </Row>
            </SectionCard>
          </div>
        )}
      </Drawer>
    </div>
  );
}
