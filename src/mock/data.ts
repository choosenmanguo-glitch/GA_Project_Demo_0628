/** Mock 数据 - 所有模块的模拟数据集中管理 */
import type { IconPickerValue } from '@/components/IconPicker';

// ==================== 模型管理 ====================
export interface ModelItem {
  id: string;
  displayName: string;
  modelName: string;
  modelType: string;
  supplier: string;
  deployType: '公网' | '本地';
  status: '启用' | '停用';
  source: '自定义' | '广场资源';
  creator: string;
  createTime: string;
  updateTime: string;
  description: string;
  /** API 配置 */
  endpoint?: string;
  apiKey?: string;
  maxTokens?: number;
  temperature?: number;
}

export const mockModels: ModelItem[] = [
  { id: '1', displayName: 'DeepSeek-Chat', modelName: 'deepseek-chat', modelType: '通用大模型', supplier: 'DeepSeek', deployType: '公网', status: '启用', source: '自定义', creator: '管理员', createTime: '2026-01-15', updateTime: '2026-06-20', description: 'DeepSeek 对话模型，支持长上下文理解与多轮对话', endpoint: 'https://api.deepseek.com/v1', maxTokens: 32768, temperature: 0.7 },
  { id: '2', displayName: 'DeepSeek-Reasoner', modelName: 'deepseek-reasoner', modelType: '通用大模型', supplier: 'DeepSeek', deployType: '公网', status: '启用', source: '自定义', creator: '管理员', createTime: '2026-02-10', updateTime: '2026-06-18', description: 'DeepSeek 推理模型，擅长复杂逻辑推理与数学问题', endpoint: 'https://api.deepseek.com/v1', maxTokens: 32768, temperature: 0.3 },
  { id: '3', displayName: 'Qwen-72B-Chat', modelName: 'Qwen-72B-Chat-Int4', modelType: '通用大模型', supplier: '阿里云', deployType: '本地', status: '启用', source: '自定义', creator: '张警官', createTime: '2026-01-20', updateTime: '2026-05-30', description: '通义千问 72B 量化版，本地私有化部署，保障数据安全', maxTokens: 8192, temperature: 0.7 },
  { id: '4', displayName: 'GPT-4o', modelName: 'gpt-4o', modelType: '通用大模型', supplier: 'OpenAI', deployType: '公网', status: '启用', source: '广场资源', creator: '管理员', createTime: '2026-03-01', updateTime: '2026-06-22', description: 'OpenAI 多模态旗舰模型，支持文本、图像、音频输入', endpoint: 'https://api.openai.com/v1', maxTokens: 128000, temperature: 0.7 },
  { id: '5', displayName: 'BGE-M3', modelName: 'bge-m3', modelType: '向量化模型', supplier: 'BAAI', deployType: '本地', status: '启用', source: '广场资源', creator: '管理员', createTime: '2026-02-28', updateTime: '2026-04-15', description: 'BGE-M3 多语言向量化模型，用于知识库文档嵌入', maxTokens: 8192 },
  { id: '6', displayName: 'BGE-Reranker-v2', modelName: 'bge-reranker-v2-m3', modelType: 'ReRank模型', supplier: 'BAAI', deployType: '本地', status: '启用', source: '广场资源', creator: '管理员', createTime: '2026-03-15', updateTime: '2026-05-10', description: 'BGE 重排序模型，用于检索结果精排', maxTokens: 8192 },
  { id: '7', displayName: 'GLM-4-Flash', modelName: 'glm-4-flash', modelType: '通用大模型', supplier: '智谱AI', deployType: '公网', status: '停用', source: '广场资源', creator: '管理员', createTime: '2026-04-01', updateTime: '2026-06-01', description: '智谱 GLM-4 Flash 快速推理版，适合简单问答场景', endpoint: 'https://open.bigmodel.cn/api/paas/v4', maxTokens: 128000, temperature: 0.7 },
  { id: '8', displayName: 'Whisper-Large-v3', modelName: 'whisper-large-v3', modelType: '通用大模型', supplier: 'OpenAI', deployType: '本地', status: '启用', source: '自定义', creator: '李警官', createTime: '2026-05-01', updateTime: '2026-06-10', description: 'OpenAI Whisper 语音识别模型，支持多语言语音转文字', maxTokens: 30000 },
];

// ==================== 模型源管理 ====================
export type ModelSourceDeployType = '本地' | '公网';

export interface ModelSourceItem {
  id: string;
  name: string;
  deployType: ModelSourceDeployType;
  baseUrl: string;
  apiKey: string;
  remark: string;
  creator: string;
  createTime: string;
  updateTime: string;
}

export const mockModelSources: ModelSourceItem[] = [
  { id: 'ms-1', name: 'DeepSeek 官方源', deployType: '公网', baseUrl: 'https://api.deepseek.com/v1', apiKey: 'sk-****abc123', remark: 'DeepSeek 官方 API 接入', creator: '管理员', createTime: '2026-01-10', updateTime: '2026-06-20' },
  { id: 'ms-2', name: '阿里云百炼平台', deployType: '公网', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'sk-****def456', remark: '阿里云模型服务平台', creator: '管理员', createTime: '2026-02-15', updateTime: '2026-06-18' },
  { id: 'ms-3', name: '本地 GPU 集群', deployType: '本地', baseUrl: 'http://10.0.1.100:8080/v1', apiKey: 'local-****ghi789', remark: '本地 vLLM 推理服务', creator: '张警官', createTime: '2026-03-20', updateTime: '2026-06-22' },
  { id: 'ms-4', name: '智谱 AI 开放平台', deployType: '公网', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', apiKey: 'sk-****jkl012', remark: '智谱 GLM 系列模型 API', creator: '管理员', createTime: '2026-04-01', updateTime: '2026-06-15' },
];

// ==================== 技能管理 ====================
export type SkillSource = 'local' | 'square';

export interface SkillConfig {
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  timeout?: number;
  retryCount?: number;
}

export interface SkillItem {
  id: string;
  name: string;
  /** 唯一标识（小写字母、数字、连字符），创建后不可修改 */
  resourceKey?: string;
  description: string;
  /** 当前头像（统一头像组件） */
  avatar?: IconPickerValue;
  source: SkillSource;
  sourceResourceId?: string;
  config: SkillConfig;
  callCount: number;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
  creator: string;
  tags?: string[];
  /** 引用该技能的智能体名称列表（用于删除校验） */
  referencedAgents?: string[];
  /** 技能包（SKILL/skill.md）中的真实名称 */
  packageName?: string;
  /** 技能包（SKILL/skill.md）中的真实描述 */
  packageDescription?: string;
  /** 技能包中的使用场景、用法等 Markdown 文本 */
  usageMarkdown?: string;
}

export const mockSkills: SkillItem[] = [
  {
    id: 'sk1',
    name: '警情分类与分级',
    resourceKey: 'police-incident-classifier',
    description: '根据警情描述自动分类并判定紧急等级，支持多级分类标签',
    avatar: { mode: 'icon', iconKey: 'thunder', iconBgColor: '#fff0f6', iconColor: '#eb2f96' },
    source: 'local',
    config: {
      inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { category: { type: 'string' }, level: { type: 'string' } } },
      timeout: 30,
      retryCount: 0,
    },
    callCount: 128,
    status: 'active',
    createTime: '2026-06-15 10:30:00',
    updateTime: '2026-08-01 14:20:00',
    creator: '张明',
    tags: ['警情', '分类'],
    referencedAgents: ['反诈智能助手', '接警研判机器人'],
    packageName: 'police-incident-classifier',
    packageDescription: '对警情文本进行自动分类并判定紧急等级，返回警情类别与紧急等级。',
    usageMarkdown: `## 使用场景\n\n适用于 110 接处警、线索核查等场景，对警情描述文本进行自动分类与紧急等级判定。\n\n## 用法\n\n- 输入：警情描述文本\n- 输出：警情类别（如「盗窃」「诈骗」「纠纷」）与紧急等级（高 / 中 / 低）\n\n## 示例\n\n\`\`\`json\n{ "text": "某小区发生入室盗窃，嫌疑人已逃离现场" }\n\`\`\`\n\n> 建议配合接警研判机器人使用，分类结果可直接进入警情流转。`,
  },
  {
    id: 'sk2',
    name: '身份证信息核验',
    resourceKey: 'id-card-verify',
    description: '调用人口信息查询API，核验身份证号与姓名匹配性',
    avatar: { mode: 'icon', iconKey: 'safety', iconBgColor: '#e6f4ff', iconColor: '#1677ff' },
    source: 'square',
    sourceResourceId: 'skill-2',
    config: {
      inputSchema: { type: 'object', properties: { idNo: { type: 'string' }, name: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { matched: { type: 'boolean' } } },
      timeout: 10,
      retryCount: 1,
    },
    callCount: 56,
    status: 'active',
    createTime: '2026-07-20 09:00:00',
    updateTime: '2026-08-10 11:00:00',
    creator: '数据资源中心',
    tags: ['身份核验', 'API'],
    packageName: 'id-card-verify',
    packageDescription: '调用人口信息查询接口，核验身份证号与姓名的匹配性。',
    usageMarkdown: `## 使用场景\n\n人员身份核验、实名认证、开户审核等场景。\n\n## 用法\n\n- 输入：身份证号 + 姓名\n- 输出：是否匹配（boolean）\n\n## 示例\n\n\`\`\`json\n{ "idNo": "110101199001011234", "name": "张三" }\n\`\`\``,
  },
  {
    id: 'sk3',
    name: '电诈资金链路分析',
    resourceKey: 'fraud-fund-chain-analysis',
    description: '基于多层级转账记录识别可疑卡号群体，按可疑程度排序',
    avatar: { mode: 'icon', iconKey: 'search', iconBgColor: '#fff7e6', iconColor: '#fa8c16' },
    source: 'local',
    config: {
      inputSchema: { type: 'object', properties: { records: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { suspicious: { type: 'array' } } },
      timeout: 60,
      retryCount: 2,
    },
    callCount: 89,
    status: 'active',
    createTime: '2026-05-28 16:00:00',
    updateTime: '2026-07-30 10:00:00',
    creator: '李强',
    tags: ['反诈', '资金'],
    packageName: 'fraud-fund-chain-analysis',
    packageDescription: '基于多层级转账记录识别可疑卡号群体，并按可疑程度排序输出。',
    usageMarkdown: `## 使用场景\n\n反诈资金研判，识别洗钱链路与可疑卡号群体。\n\n## 用法\n\n- 输入：转账记录列表\n- 输出：可疑卡号列表（按可疑程度降序）\n\n## 注意事项\n\n> 分析结果仅作为研判线索，需结合人工复核。`,
  },
  {
    id: 'sk4',
    name: '交通事故责任认定辅助',
    resourceKey: 'traffic-accident-liability',
    description: '基于现场勘查记录与当事人陈述，分析事故原因并判定责任方',
    avatar: { mode: 'icon', iconKey: 'file', iconBgColor: '#f6ffed', iconColor: '#52c41a' },
    source: 'square',
    sourceResourceId: 'skill-3',
    config: { inputSchema: { type: 'object' }, outputSchema: { type: 'object' }, timeout: 45, retryCount: 1 },
    callCount: 12,
    status: 'active',
    createTime: '2026-08-01 08:00:00',
    updateTime: '2026-08-11 15:30:00',
    creator: '交通管理局',
    tags: ['交通', '事故'],
    packageName: 'traffic-accident-liability',
    packageDescription: '基于现场勘查记录与当事人陈述，分析事故原因并判定责任方。',
    usageMarkdown: `## 使用场景\n\n交通事故处理，辅助责任认定。\n\n## 用法\n\n- 输入：现场勘查记录 + 当事人陈述\n- 输出：事故原因分析 + 责任方判定建议`,
  },
  {
    id: 'sk5',
    name: '走失人员协查通报生成',
    resourceKey: 'missing-person-bulletin',
    description: '根据走失人员特征快速生成规范格式的协查通报',
    avatar: { mode: 'text', text: '走', textBgColor: '#fff7e6', textColor: '#fa8c16' },
    source: 'local',
    config: { inputSchema: { type: 'object' }, outputSchema: { type: 'object' }, timeout: 20, retryCount: 0 },
    callCount: 0,
    status: 'inactive',
    createTime: '2026-07-01 10:00:00',
    updateTime: '2026-08-05 09:00:00',
    creator: '王芳',
    tags: ['治安', '通报'],
    packageName: 'missing-person-bulletin',
    packageDescription: '根据走失人员特征快速生成规范格式的协查通报文本。',
    usageMarkdown: `## 使用场景\n\n治安管理部门发布走失人员协查通报。\n\n## 用法\n\n- 输入：走失人员姓名、性别、年龄、体貌特征、最后出现地点等\n- 输出：规范格式的协查通报文本`,
  },
];

// ==================== 提示词管理 ====================
export interface PromptTemplate {
  id: string;
  name: string;
  type: 'custom' | 'engineering';
  method?: 'ICIO' | 'CRISPE' | 'RASCEF';
  content: string;
  variables: string[];
  category: string;
  creator: string;
  createTime: string;
  updateTime: string;
  usageCount: number;
}

export const mockPrompts: PromptTemplate[] = [
  { id: '1', name: '110接警警情分析提取', type: 'engineering', method: 'RASCEF', content: '你是一位经验丰富的110接警中心指挥长与警情研判专家。从口语化且混乱的报案人通话转录文本中，提取标准化警情要素。1. 识别报案时间、位置。2. 识别涉案人、被害人、嫌疑人。3. 判断警情类别及紧急程度。接警员往往在受害人极度恐慌或口音较重的情况下记录，现需将其快速录入各地公安标准化接处警平台。', variables: ['dialect_type', 'platform_name'], category: '警情分析', creator: '李警官', createTime: '2026-05-18', updateTime: '2026-06-15', usageCount: 328 },
  { id: '2', name: '电诈涉案资金穿透研判', type: 'engineering', method: 'CRISPE', content: '你是一位精通网络金融犯罪与洗钱链条追踪的反诈精英调查员。涉诈团伙通常使用多级"水房"、聚合支付和地下钱庄进行高频资金洗白。基于提供的多层级转账记录数据，找出短时间内从起点分散转入再集中转出的可疑卡号群体，按可疑程度降序排列。', variables: ['source_account', 'time_range'], category: '反诈研判', creator: '王大队', createTime: '2026-05-12', updateTime: '2026-06-10', usageCount: 156 },
  { id: '3', name: '走失人员协查通报生成', type: 'custom', content: '请根据报案人家属提供的走失人员${clothing_features}、${last_seen_location}、${age_appearance}及${medical_history}，快速生成一篇格式规范的《协查通报》与《给${target_department}的寻人提示》。对体貌特征加粗显示，用最简短的要点列出盘问和注意方式，字数控制在${max_word_count}以内。', variables: ['clothing_features', 'last_seen_location', 'age_appearance', 'medical_history', 'target_department', 'disease_type', 'max_word_count'], category: '治安管理', creator: '张警官', createTime: '2026-04-30', updateTime: '2026-05-28', usageCount: 92 },
  { id: '4', name: '交通事故责任认定辅助', type: 'engineering', method: 'ICIO', content: '你是一名资深交通事故处理专家。基于现场勘查记录、监控视频描述和当事人陈述，分析事故原因并判定责任方。Input：事故时间、地点、涉事车辆信息、道路状况、监控描述、当事人陈述。Output：事故原因分析、责任认定意见、法律依据引用。', variables: ['accident_time', 'location', 'vehicle_info', 'road_condition', 'camera_desc', 'statements'], category: '交通管理', creator: '赵警官', createTime: '2026-06-01', updateTime: '2026-06-20', usageCount: 45 },
  { id: '5', name: '刑事案件案情摘要生成', type: 'custom', content: '请根据以下案件材料，生成一份案情摘要报告：案件编号${case_id}，案发时间${incident_time}，案发地点${location}，涉案人员${suspects}，案件类型${case_type}。摘要应包含：案件概述、关键事实、证据清单、法律适用建议。', variables: ['case_id', 'incident_time', 'location', 'suspects', 'case_type'], category: '刑侦办案', creator: '陈队长', createTime: '2026-05-20', updateTime: '2026-06-18', usageCount: 210 },
];

// ==================== 工具管理 ====================
export type ToolSource = '默认' | '自定义' | '广场资源';

export interface ToolItem {
  id: string;
  name: string;
  type: '插件' | 'API' | '工作流';
  provider: string;
  description: string;
  source: ToolSource;
  toolCount?: number;
  callCount: number;
  successRate: number;
  createTime: string;
  author: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

export const mockTools: ToolItem[] = [
  { id: '1', name: '人口信息查询', type: 'API', provider: '全国人口基础信息库', description: '根据身份证号、姓名等要素检索人员基本信息、户籍信息、居住证信息', source: '自定义', toolCount: 4, callCount: 12580, successRate: 99.2, createTime: '2026-01-10', author: '系统初始化', params: [{ name: 'idCard', type: 'string', required: true, description: '身份证号' }, { name: 'name', type: 'string', required: false, description: '姓名' }] },
  { id: '2', name: '车辆轨迹查询', type: 'API', provider: '交警缉查布控系统', description: '基于车牌号查询辖区卡口过车记录和通行轨迹聚合分析', source: '自定义', toolCount: 3, callCount: 8960, successRate: 98.5, createTime: '2026-01-15', author: '系统初始化', params: [{ name: 'plateNumber', type: 'string', required: true, description: '车牌号' }, { name: 'startTime', type: 'string', required: true, description: '开始时间' }, { name: 'endTime', type: 'string', required: true, description: '结束时间' }] },
  { id: '3', name: '人像比对', type: '插件', provider: '人像多维比对引擎', description: '集成多种人脸识别算法，提供照片比对、视频流人脸检索及身份确认服务', source: '自定义', callCount: 4520, successRate: 95.8, createTime: '2026-02-01', author: '张警官', params: [{ name: 'imageBase64', type: 'string', required: true, description: '人脸照片Base64编码' }, { name: 'threshold', type: 'number', required: false, description: '相似度阈值(0-1)' }] },
  { id: '4', name: '涉诈基站分析', type: '工作流', provider: '反诈中心', description: '解析电信诈骗嫌疑号码的基站漫游数据，推断作案窝点和移动轨迹', source: '广场资源', callCount: 2340, successRate: 94.1, createTime: '2026-03-10', author: '资源广场', params: [{ name: 'phoneNumber', type: 'string', required: true, description: '嫌疑手机号' }, { name: 'timeRange', type: 'string', required: true, description: '查询时间范围' }] },
  { id: '5', name: '文书智能解析', type: '插件', provider: '文书解析引擎', description: '自动解析PDF/Word格式的法律文书、报案材料，提取结构化信息', source: '默认', callCount: 7890, successRate: 97.3, createTime: '2026-01-20', author: '系统初始化', params: [{ name: 'fileUrl', type: 'string', required: true, description: '文件URL或本地路径' }, { name: 'docType', type: 'string', required: false, description: '文书类型' }] },
  { id: '6', name: '关系图谱生成', type: '插件', provider: '图谱分析引擎', description: '基于人员、通话、资金流水数据自动生成多维关系拓扑图', source: '广场资源', callCount: 3150, successRate: 96.7, createTime: '2026-02-15', author: '资源广场' },
  { id: '7', name: '警情统计分析', type: '工作流', provider: '指挥中心', description: '按辖区、时段、警情类别统计发案趋势并生成可视化图表', source: '自定义', callCount: 5670, successRate: 99.0, createTime: '2026-04-01', author: '李警官' },
  { id: '8', name: '图像识别', type: '插件', provider: '图侦中心', description: '对监控截图和现场照片进行目标检测、行为识别和场景分类', source: '自定义', callCount: 890, successRate: 88.5, createTime: '2026-03-20', author: '王警官' },
];

// ==================== 连接器管理 ====================
export type ConnectorSource = '自定义' | '广场资源';
export type ConnectorAuthStatus = '已授权' | '未授权';

export interface ConnectorItem {
  id: string;
  name: string;
  serverKey: string;
  authStatus: ConnectorAuthStatus;
  source: ConnectorSource;
  toolCount: number;
  description: string;
  creator: string;
  createTime: string;
  updateTime: string;
}

export const mockConnectors: ConnectorItem[] = [
  { id: 'cn-1', name: '公安数据研判连接器', serverKey: 'police-data-analysis-connector', authStatus: '已授权', source: '自定义', toolCount: 8, description: '接入公安大数据平台，提供人口、车辆、案件等多维度数据检索与分析能力，支持 SQL 查询与智能检索', creator: '系统初始化', createTime: '2026-01-10', updateTime: '2026-06-20' },
  { id: 'cn-2', name: '市局人口库连接器', serverKey: 'population-query-connector', authStatus: '已授权', source: '自定义', toolCount: 4, description: '内部人口基础信息查询服务，支持模糊搜索与精确匹配，覆盖户籍、居住证、流动人口信息', creator: '系统初始化', createTime: '2026-01-15', updateTime: '2026-06-18' },
  { id: 'cn-3', name: '天网视频分析连接器', serverKey: 'tianwang-video-connector', authStatus: '未授权', source: '广场资源', toolCount: 5, description: '对接天网视频监控系统，提供实时视频流分析、目标追踪与行为识别能力', creator: '管理员', createTime: '2026-02-20', updateTime: '2026-06-25' },
  { id: 'cn-4', name: '公文处理连接器', serverKey: 'document-process-connector', authStatus: '已授权', source: '自定义', toolCount: 3, description: '本地公文处理服务，提供文档格式化、签章验证与模板填充功能，支持 DOCX/PDF 格式', creator: '周科长', createTime: '2026-03-01', updateTime: '2026-06-22' },
  { id: 'cn-5', name: '短信通知网关连接器', serverKey: 'sms-gateway-connector', authStatus: '未授权', source: '广场资源', toolCount: 2, description: '统一短信发送网关，用于告警通知、验证码发送和群发通知，支持多通道切换', creator: '管理员', createTime: '2026-04-10', updateTime: '2026-06-15' },
  { id: 'cn-6', name: '图像识别连接器', serverKey: 'image-recognition-connector', authStatus: '已授权', source: '自定义', toolCount: 4, description: '对接图侦中心图像识别引擎，支持人脸比对、车辆识别、物体检测等能力', creator: '王警官', createTime: '2026-05-12', updateTime: '2026-06-24' },
];

// ==================== 数据连接管理 ====================
export type DbType = 'MySQL' | 'TiDB' | 'MinIO' | 'HighGoV9';
export type DataType = '结构化' | '非结构化';

export interface DataSourceItem {
  id: string;
  name: string;
  dbType: DbType;
  dataType: DataType;
  host: string;
  port: number;
  dbName: string;
  creator: string;
  createTime: string;
  updateTime: string;
  description: string;
}

export const mockDataSources: DataSourceItem[] = [
  { id: '1', name: '核心业务主库', dbType: 'MySQL', dataType: '结构化', host: '192.168.1.100', port: 3306, dbName: 'core_business', creator: '张三', createTime: '2026-01-10', updateTime: '2026-06-20', description: '存储核心业务数据，包括案件信息、人员档案、执法记录等' },
  { id: '2', name: '分布式业务库', dbType: 'TiDB', dataType: '结构化', host: '192.168.1.101', port: 4000, dbName: 'distributed_db', creator: '李四', createTime: '2025-11-20', updateTime: '2026-06-15', description: 'TiDB 分布式数据库，承载高并发业务查询和实时分析' },
  { id: '3', name: '影像文件存储', dbType: 'MinIO', dataType: '非结构化', host: '192.168.2.50', port: 9000, dbName: 'media-bucket', creator: '王五', createTime: '2026-03-05', updateTime: '2026-06-18', description: 'MinIO 对象存储，存储监控视频、执法记录仪影像、文书扫描件等非结构化数据' },
  { id: '4', name: '高可用数据库集群', dbType: 'HighGoV9', dataType: '结构化', host: '192.168.3.10', port: 5866, dbName: 'highgo_main', creator: '赵六', createTime: '2026-02-14', updateTime: '2026-06-25', description: 'HighGo V9 国产数据库，用于高可用核心业务系统的数据持久化' },
  { id: '5', name: '文档附件库', dbType: 'MinIO', dataType: '非结构化', host: '192.168.1.200', port: 9000, dbName: 'doc-attachments', creator: '张三', createTime: '2026-01-05', updateTime: '2026-06-22', description: '存储案件卷宗附件、PDF文档、图片证据等非结构化文件' },
];

// ==================== 文件库管理 ====================
export interface FileStoreItem {
  id: string;
  name: string;
  description: string;
  creator: string;
  createTime: string;
  updateTime: string;
  /** 文件数量 */
  fileCount: number;
  /** 存储大小 */
  storageSize: string;
}

export const mockFileStores: FileStoreItem[] = [
  { id: 'fs-1', name: '案件卷宗资料库', description: '存储刑事案件侦查卷宗、起诉意见书、证据材料等电子档案', creator: '陈队长', createTime: '2026-01-10', updateTime: '2026-06-20', fileCount: 1523, storageSize: '28.6 GB' },
  { id: 'fs-2', name: '执法记录视频库', description: '存储执法记录仪视频、监控录像、出警记录等多媒体证据文件', creator: '李警官', createTime: '2026-02-15', updateTime: '2026-06-18', fileCount: 896, storageSize: '156.3 GB' },
  { id: 'fs-3', name: '法律法规文库', description: '存储现行法律法规、司法解释、执法规范文档及典型案例汇编', creator: '周科长', createTime: '2025-11-20', updateTime: '2026-06-15', fileCount: 2340, storageSize: '5.8 GB' },
  { id: 'fs-4', name: '培训学习资料库', description: '存储公安业务培训课件、实战演练教材、新技术学习资料等', creator: '张警官', createTime: '2026-03-05', updateTime: '2026-06-22', fileCount: 456, storageSize: '12.4 GB' },
  { id: 'fs-5', name: '日常工作文档库', description: '存储工作周报、会议纪要、行动方案等日常行政办公文档', creator: '赵警官', createTime: '2026-01-05', updateTime: '2026-06-25', fileCount: 678, storageSize: '3.2 GB' },
  { id: 'fs-6', name: '图像证据资料库', description: '存储现场勘查照片、监控截图、人像比对素材等图像类证据', creator: '王五', createTime: '2026-04-10', updateTime: '2026-06-12', fileCount: 3210, storageSize: '45.7 GB' },
];

// ==================== 智能体管理 ====================
export type AgentType = '标准智能体' | '流程智能体' | '自主智能体' | '外部智能体';
export type AgentStatus = '未发布' | '已发布';
export type PublishType = '广场' | '集成' | 'API';

export interface AgentItem {
  id: string;
  name: string;
  avatar?: string;
  type: AgentType;
  subType: string;
  status: AgentStatus;
  publishTypes: PublishType[];
  description: string;
  spaceName: string;
  modelName: string;
  creator: string;
  createTime: string;
  publishTime?: string;
  updateTime: string;
  callCount: number;
  successRate: number;
  activeUsers: number;
  tokenConsumption: number;
  /** 关联资源 */
  knowledgeBases?: string[];
  tools?: string[];
  /** 外部智能体 */
  externalUrl?: string;
  sourceType?: 'builtin' | 'external';
}

export const mockAgents: AgentItem[] = [
  { id: '1', name: '110接警警情分析助手', type: '标准智能体', subType: '普通助手', status: '已发布', publishTypes: ['广场', 'API'], description: '从接警通话录音中提取标准警情要素，自动分类录入接处警系统', spaceName: '指挥中心', modelName: 'DeepSeek-Chat', creator: '李警官', createTime: '2026-05-18', publishTime: '2026-06-01', updateTime: '2026-06-20', callCount: 12860, successRate: 98.7, activeUsers: 45, tokenConsumption: 2560000, knowledgeBases: ['警情分类知识库', '接处警规程库'], tools: ['文书智能解析'] },
  { id: '2', name: '电诈资金穿透研判助手', type: '流程智能体', subType: '工作流', status: '已发布', publishTypes: ['广场', '集成'], description: '分析涉诈资金链路，识别可疑卡号集群，辅助反诈民警研判洗钱路径', spaceName: '反诈中心', modelName: 'DeepSeek-Reasoner', creator: '王大队', createTime: '2026-05-12', publishTime: '2026-06-05', updateTime: '2026-06-22', callCount: 5620, successRate: 96.1, activeUsers: 28, tokenConsumption: 4320000, knowledgeBases: ['反诈案例知识库', '洗钱模式特征库'], tools: ['关系图谱生成', '涉诈基站分析'] },
  { id: '3', name: '交通事故责任认定助手', type: '标准智能体', subType: '知识库问答', status: '已发布', publishTypes: ['广场'], description: '基于事故现场信息和监控描述，分析事故原因并判定责任方', spaceName: '交警支队', modelName: 'GPT-4o', creator: '赵警官', createTime: '2026-06-01', publishTime: '2026-06-12', updateTime: '2026-06-24', callCount: 2340, successRate: 94.5, activeUsers: 18, tokenConsumption: 1890000, knowledgeBases: ['道路交通安全法规库'], tools: ['车辆轨迹查询', '图像识别'] },
  { id: '4', name: '刑事案件案情摘要生成', type: '标准智能体', subType: '文档编写', status: '已发布', publishTypes: ['API'], description: '自动解析案件材料生成案情摘要报告，辅助刑侦民警快速梳理案情', spaceName: '刑警大队', modelName: 'Qwen-72B-Chat', creator: '陈队长', createTime: '2026-05-20', publishTime: '2026-06-08', updateTime: '2026-06-23', callCount: 8340, successRate: 97.3, activeUsers: 32, tokenConsumption: 3150000, knowledgeBases: ['案件卷宗库', '法律法规库'], tools: ['文书智能解析', '人口信息查询'] },
  { id: '5', name: '走失人员协查通报助手', type: '自主智能体', subType: '自主智能体', status: '已发布', publishTypes: ['集成', 'API'], description: '根据家属报案信息自动生成标准格式协查通报和寻人提示', spaceName: '治安支队', modelName: 'DeepSeek-Chat', creator: '张警官', createTime: '2026-04-30', publishTime: '2026-05-20', updateTime: '2026-06-18', callCount: 1980, successRate: 92.8, activeUsers: 15, tokenConsumption: 980000, tools: ['图像识别'] },
  { id: '6', name: '巡逻路线智能规划', type: '自主智能体', subType: '自主智能体', status: '未发布', publishTypes: [], description: '基于历史案发数据和实时警情分布，智能推荐最优巡逻路线', spaceName: '巡特警支队', modelName: 'GLM-4-Flash', creator: '刘队长', createTime: '2026-06-15', updateTime: '2026-06-24', callCount: 120, successRate: 89.0, activeUsers: 3, tokenConsumption: 45000, tools: ['警情统计分析'] },
  { id: '7', name: '笔录文书智能校对', type: '标准智能体', subType: '文件审核', status: '已发布', publishTypes: ['广场', '集成', 'API'], description: '对笔录文书进行语法纠错、格式规范和法条引用校验', spaceName: '法制大队', modelName: 'GPT-4o', creator: '周科长', createTime: '2026-03-10', publishTime: '2026-04-15', updateTime: '2026-06-20', callCount: 15200, successRate: 99.1, activeUsers: 56, tokenConsumption: 5200000, knowledgeBases: ['法律法规库', '文书规范库'], tools: ['文书智能解析'] },
  { id: '8', name: '社区警务工作台', type: '标准智能体', subType: '普通助手', status: '已发布', publishTypes: ['广场', '集成'], description: '辅助社区民警完成人员信息管理、重点人口走访记录和矛盾调解记录', spaceName: '派出所', modelName: 'Qwen-72B-Chat', creator: '管理员', createTime: '2026-04-01', publishTime: '2026-05-01', updateTime: '2026-06-21', callCount: 23400, successRate: 98.2, activeUsers: 128, tokenConsumption: 7800000, knowledgeBases: ['户籍信息库', '社区管理规范'], tools: ['人口信息查询'] },
  // 外部智能体
  { id: '9', name: '讯飞星火警务助手', type: '外部智能体', subType: '', status: '未发布', publishTypes: [], description: '科大讯飞星火大模型驱动的智能警务问答助手，支持语音交互和多轮对话', spaceName: '指挥中心', modelName: '', creator: '管理员', createTime: '2026-07-15', updateTime: '2026-07-15', callCount: 0, successRate: 0, activeUsers: 0, tokenConsumption: 0, externalUrl: 'https://xinghuo.xfyun.cn/chat/police', sourceType: 'external' },
  { id: '10', name: '百度文心一言案件分析', type: '外部智能体', subType: '', status: '未发布', publishTypes: [], description: '百度文心大模型驱动的案件智能分析工具，支持案情摘要生成与法条匹配', spaceName: '刑警大队', modelName: '', creator: '陈队长', createTime: '2026-07-20', updateTime: '2026-07-20', callCount: 0, successRate: 0, activeUsers: 0, tokenConsumption: 0, externalUrl: 'https://yiyan.baidu.com/chat/case-analysis', sourceType: 'external' },
];

// ==================== 空间运营 / 运维 ====================
export type SpaceStatus = '启用' | '冻结' | '归档';

export interface SpaceItem {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  dept: string;
  type: '个人空间' | '工作空间' | '专案空间';
  status: SpaceStatus;
  memberCount: number;
  agentCount: number;
  knowledgeCount: number;
  promptCount: number;
  toolCount: number;
  modelCount: number;
  connectorCount: number;
  creator: string;
  createTime: string;
  updateTime: string;
}

export const mockSpaces: SpaceItem[] = [
  { id: '0', name: '演示用户的空间', description: '个人默认工作空间，用于日常办公与个人智能体开发', dept: '科信大队', type: '个人空间', status: '启用', memberCount: 1, agentCount: 5, knowledgeCount: 4, promptCount: 8, toolCount: 3, modelCount: 2, connectorCount: 1, creator: '演示用户', createTime: '2025-12-01', updateTime: '2026-06-25' },
  { id: '1', name: '指挥中心空间', description: '全局警情态势感知、调度指挥与多警种协同平台', dept: '指挥中心', type: '工作空间', status: '启用', memberCount: 32, agentCount: 5, knowledgeCount: 8, promptCount: 12, toolCount: 6, modelCount: 4, connectorCount: 3, creator: '李警官', createTime: '2026-01-15', updateTime: '2026-06-20' },
  { id: '2', name: '反诈中心空间', description: '电信网络诈骗案件研判、资金追踪与预警劝阻工作空间', dept: '反诈中心', type: '工作空间', status: '启用', memberCount: 18, agentCount: 3, knowledgeCount: 5, promptCount: 8, toolCount: 4, modelCount: 3, connectorCount: 2, creator: '王大队', createTime: '2026-02-01', updateTime: '2026-06-18' },
  { id: '3', name: '交警支队空间', description: '交通事故认定、违章分析及道路安全管理协同空间', dept: '交警支队', type: '工作空间', status: '启用', memberCount: 24, agentCount: 4, knowledgeCount: 6, promptCount: 10, toolCount: 5, modelCount: 3, connectorCount: 2, creator: '赵警官', createTime: '2026-03-10', updateTime: '2026-06-15' },
  { id: '4', name: '刑警大队空间', description: '刑事案件侦查、技术研判与跨区域协作办案空间', dept: '刑警大队', type: '工作空间', status: '启用', memberCount: 28, agentCount: 6, knowledgeCount: 10, promptCount: 15, toolCount: 7, modelCount: 5, connectorCount: 4, creator: '陈队长', createTime: '2026-01-20', updateTime: '2026-06-22' },
  { id: '5', name: '治安支队空间', description: '社会治安综合治理、巡逻防控与重点场所管理空间', dept: '治安支队', type: '工作空间', status: '冻结', memberCount: 12, agentCount: 2, knowledgeCount: 3, promptCount: 5, toolCount: 2, modelCount: 2, connectorCount: 1, creator: '张警官', createTime: '2026-04-01', updateTime: '2026-06-10' },
  { id: '6', name: '法制大队空间', description: '法律文书审核、案件质量评查与执法规范化建设空间', dept: '法制大队', type: '工作空间', status: '启用', memberCount: 16, agentCount: 3, knowledgeCount: 12, promptCount: 20, toolCount: 3, modelCount: 3, connectorCount: 2, creator: '周科长', createTime: '2026-03-01', updateTime: '2026-06-20' },
  { id: '7', name: '社区警务空间', description: '社区人口管理、走访登记与基层矛盾调解工作空间', dept: '派出所', type: '工作空间', status: '启用', memberCount: 45, agentCount: 4, knowledgeCount: 5, promptCount: 8, toolCount: 3, modelCount: 4, connectorCount: 2, creator: '管理员', createTime: '2026-01-10', updateTime: '2026-06-21' },
  { id: '8', name: '科技信息化大队', description: '公安科技信息化建设、系统运维与数据治理管理空间', dept: '科信大队', type: '工作空间', status: '启用', memberCount: 12, agentCount: 2, knowledgeCount: 4, promptCount: 3, toolCount: 5, modelCount: 2, connectorCount: 3, creator: '技术员', createTime: '2025-12-01', updateTime: '2026-06-24' },
  { id: '9', name: '电信诈骗专项小组', description: '涉诈案件集中攻坚、资金穿透及嫌疑人落地研判专案空间', dept: '刑侦大队', type: '专案空间', status: '启用', memberCount: 15, agentCount: 4, knowledgeCount: 6, promptCount: 9, toolCount: 5, modelCount: 3, connectorCount: 2, creator: '陈队长', createTime: '2026-04-15', updateTime: '2026-06-26' },
  { id: '10', name: '跨境赌博专案组', description: '跨境网络赌博案件侦查、资金链路分析与嫌疑人抓捕协同', dept: '治安支队', type: '专案空间', status: '启用', memberCount: 10, agentCount: 3, knowledgeCount: 5, promptCount: 7, toolCount: 3, modelCount: 2, connectorCount: 1, creator: '张警官', createTime: '2026-05-20', updateTime: '2026-06-27' },
  { id: '11', name: '网络安全管理空间', description: '网络安全监测、漏洞扫描及安全事件响应协同空间', dept: '科信大队', type: '工作空间', status: '启用', memberCount: 8, agentCount: 4, knowledgeCount: 7, promptCount: 6, toolCount: 5, modelCount: 3, connectorCount: 2, creator: '演示用户', createTime: '2026-03-05', updateTime: '2026-06-28' },
  { id: '12', name: '政务数据分析专案', description: '政务大数据分析、专题研判及可视化报告输出专案空间', dept: '科信大队', type: '专案空间', status: '启用', memberCount: 6, agentCount: 3, knowledgeCount: 4, promptCount: 5, toolCount: 4, modelCount: 2, connectorCount: 2, creator: '演示用户', createTime: '2026-06-01', updateTime: '2026-07-10' },
];

// ==================== 空间审核记录 ====================
export interface SpaceApproval {
  id: string;
  spaceName: string;
  spaceType: '工作空间' | '专案空间';
  dept: string;
  applicant: string;
  applyTime: string;
  status: '待审核' | '已通过' | '已驳回';
  approver?: string;
  approvalTime?: string;
  rejectionReason?: string;
  presetResources?: {
    models?: string[];
    prompts?: string[];
    tools?: string[];
    connectors?: string[];
    knowledge?: string[];
  };
  members?: { name: string; dept: string; role: string }[];
}

export const mockApprovals: SpaceApproval[] = [
  {
    id: 'A01', spaceName: '网安支队空间', spaceType: '工作空间', dept: '网安支队', applicant: '赵警官',
    applyTime: '2026-07-15 14:30:00', status: '待审核',
    presetResources: { models: ['DeepSeek-Chat', 'Qwen-72B-Chat'], tools: ['Python执行器', 'WebSearch'] },
    members: [{ name: '赵警官', dept: '网安支队', role: '所有者' }, { name: '技术员', dept: '网安支队', role: '普通用户' }],
  },
  {
    id: 'A06', spaceName: '情报研判中心', spaceType: '工作空间', dept: '指挥中心', applicant: '孙警官',
    applyTime: '2026-07-16 08:00:00', status: '待审核',
    presetResources: { models: ['DeepSeek-Chat'], prompts: ['情报分析模板'], knowledge: ['法规库', '案例库'] },
    members: [{ name: '孙警官', dept: '指挥中心', role: '所有者' }, { name: '周科长', dept: '指挥中心', role: '普通用户' }],
  },
  {
    id: 'A07', spaceName: '电子取证分析', spaceType: '专案空间', dept: '刑侦大队', applicant: '陈队长',
    applyTime: '2026-07-16 15:00:00', status: '待审核',
    presetResources: { tools: ['Python执行器', '取证工具', '日志分析器'], models: ['DeepSeek-Chat', 'Qwen-72B-Chat'] },
    members: [{ name: '陈队长', dept: '刑侦大队', role: '所有者' }],
  },
  {
    id: 'A02', spaceName: '禁毒专项小组', spaceType: '专案空间', dept: '刑侦大队', applicant: '钱警官',
    applyTime: '2026-07-10 11:00:00', status: '已驳回', approver: '李警官', approvalTime: '2026-07-12 09:15:00',
    rejectionReason: '空间名称不够明确，请注明具体业务场景后再重新申请',
    presetResources: { prompts: ['案情分析模板', '线索整理模板'], tools: ['Python执行器', '连接器A'] },
    members: [{ name: '钱警官', dept: '刑侦大队', role: '所有者' }],
  },
  {
    id: 'A03', spaceName: '科信智能化项目', spaceType: '专案空间', dept: '科信大队', applicant: '演示用户',
    applyTime: '2026-07-16 10:30:00', status: '待审核',
    presetResources: { prompts: ['数据分析模板', '报告生成模板'], tools: ['Python执行器'], models: ['DeepSeek-Chat'] },
    members: [{ name: '演示用户', dept: '科信大队', role: '所有者' }],
  },
  {
    id: 'A04', spaceName: '图像识别专项', spaceType: '专案空间', dept: '科信大队', applicant: '演示用户',
    applyTime: '2026-07-08 14:00:00', status: '已驳回', approver: '王大队', approvalTime: '2026-07-10 08:00:00',
    rejectionReason: '专案空间需提供明确案件编号及办案单位信息',
    presetResources: { tools: ['Python执行器', '图像处理工具'], models: ['视觉大模型V2'] },
    members: [{ name: '演示用户', dept: '科信大队', role: '所有者' }],
  },
  {
    id: 'A05', spaceName: '我的工作空间', spaceType: '工作空间', dept: '科信大队', applicant: '演示用户',
    applyTime: '2026-07-05 09:00:00', status: '已通过', approver: '李警官', approvalTime: '2026-07-08 15:00:00',
    members: [{ name: '演示用户', dept: '科信大队', role: '所有者' }],
  },
];

// ==================== 空间成员 ====================
export interface SpaceMember {
  id: string;
  name: string;
  avatar?: string;
  dept: string;
  role: '所有者' | '普通用户';
  joinTime: string;
  lastActive: string;
}

export const mockMembers: SpaceMember[] = [
  { id: '1', name: '演示用户', dept: '科信大队', role: '所有者', joinTime: '2025-12-01', lastActive: '2026-06-25 14:30' },
  { id: '2', name: '李警官', dept: '指挥中心', role: '普通用户', joinTime: '2026-01-05', lastActive: '2026-06-25 10:15' },
  { id: '3', name: '王大队', dept: '反诈中心', role: '普通用户', joinTime: '2026-02-10', lastActive: '2026-06-24 16:45' },
  { id: '4', name: '赵警官', dept: '交警支队', role: '普通用户', joinTime: '2026-03-15', lastActive: '2026-06-25 09:00' },
  { id: '5', name: '陈队长', dept: '刑警大队', role: '普通用户', joinTime: '2026-01-20', lastActive: '2026-06-25 11:30' },
  { id: '6', name: '张警官', dept: '治安支队', role: '普通用户', joinTime: '2026-04-01', lastActive: '2026-06-24 08:00' },
  { id: '7', name: '周科长', dept: '法制大队', role: '普通用户', joinTime: '2026-03-01', lastActive: '2026-06-25 13:00' },
  { id: '8', name: '刘队长', dept: '巡特警支队', role: '普通用户', joinTime: '2026-05-10', lastActive: '2026-06-23 17:20' },
];

// ==================== 操作日志 ====================
export interface OperationLog {
  id: string;
  time: string;
  operator: string;
  type: string;
  target: string;
  detail: string;
  spaceName?: string;
}

export const mockOperationLogs: OperationLog[] = [
  // 指挥中心空间 — 完整生命周期
  { id: '1', time: '2026-07-17 09:00:00', operator: '管理员', type: '创建空间', target: '指挥中心空间', detail: '通过管理中心创建了工作空间「指挥中心空间」', spaceName: '指挥中心空间' },
  { id: '2', time: '2026-07-17 09:05:00', operator: '管理员', type: '修改空间信息', target: '指挥中心空间', detail: '补充了空间描述和部门信息', spaceName: '指挥中心空间' },
  { id: '3', time: '2026-07-17 09:10:00', operator: '管理员', type: '添加成员', target: '指挥中心空间', detail: '添加成员：李警官（普通用户）', spaceName: '指挥中心空间' },
  { id: '4', time: '2026-07-17 09:15:00', operator: '管理员', type: '添加成员', target: '指挥中心空间', detail: '添加成员：王警官（普通用户）', spaceName: '指挥中心空间' },

  // 科技信息化大队空间 — 日常运营
  { id: '5', time: '2026-07-15 10:00:00', operator: '演示用户', type: '申请空间', target: '科技信息化大队', detail: '提交了工作空间「科技信息化大队」的创建申请', spaceName: '科技信息化大队' },
  { id: '6', time: '2026-07-15 14:00:00', operator: '管理员', type: '审批通过', target: '科技信息化大队', detail: '通过了「科技信息化大队」的空间申请', spaceName: '科技信息化大队' },
  { id: '7', time: '2026-07-16 08:30:00', operator: '演示用户', type: '修改空间信息', target: '科技信息化大队', detail: '修改了空间图标和部门信息', spaceName: '科技信息化大队' },
  { id: '8', time: '2026-07-16 09:00:00', operator: '演示用户', type: '添加成员', target: '科技信息化大队', detail: '添加成员：赵警官（普通用户）', spaceName: '科技信息化大队' },
  { id: '9', time: '2026-07-16 15:00:00', operator: '演示用户', type: '添加成员', target: '科技信息化大队', detail: '添加成员：陈警官（普通用户）', spaceName: '科技信息化大队' },

  // 治安支队空间 — 冻结与恢复
  { id: '10', time: '2026-07-14 16:00:00', operator: '管理员', type: '创建空间', target: '治安支队空间', detail: '通过管理中心创建了工作空间「治安支队空间」', spaceName: '治安支队空间' },
  { id: '11', time: '2026-07-14 16:10:00', operator: '管理员', type: '添加成员', target: '治安支队空间', detail: '添加成员：张警官（普通用户）', spaceName: '治安支队空间' },
  { id: '12', time: '2026-07-15 17:00:00', operator: '管理员', type: '冻结空间', target: '治安支队空间', detail: '因人员调整暂时冻结了「治安支队空间」的访问权限', spaceName: '治安支队空间' },
  { id: '13', time: '2026-07-17 08:00:00', operator: '管理员', type: '恢复空间', target: '治安支队空间', detail: '解冻了「治安支队空间」的访问权限', spaceName: '治安支队空间' },

  // 反诈中心空间 — 成员管理
  { id: '14', time: '2026-07-13 11:00:00', operator: '管理员', type: '创建空间', target: '反诈中心空间', detail: '通过管理中心创建了工作空间「反诈中心空间」', spaceName: '反诈中心空间' },
  { id: '15', time: '2026-07-14 10:20:00', operator: '王大队', type: '添加成员', target: '反诈中心空间', detail: '添加成员：孙警官（普通用户）', spaceName: '反诈中心空间' },
  { id: '16', time: '2026-07-14 11:00:00', operator: '王大队', type: '添加成员', target: '反诈中心空间', detail: '添加成员：周警官（普通用户）', spaceName: '反诈中心空间' },
  { id: '17', time: '2026-07-16 09:15:00', operator: '王大队', type: '移除成员', target: '反诈中心空间', detail: '因人员调动移除了成员：周警官', spaceName: '反诈中心空间' },

  // 跨境赌博专案组 — 归档
  { id: '18', time: '2026-07-10 09:00:00', operator: '管理员', type: '创建空间', target: '跨境赌博专案组', detail: '通过管理中心创建了专案空间「跨境赌博专案组」', spaceName: '跨境赌博专案组' },
  { id: '19', time: '2026-07-10 09:30:00', operator: '管理员', type: '添加成员', target: '跨境赌博专案组', detail: '添加成员：刘警官（普通用户）', spaceName: '跨境赌博专案组' },
  { id: '20', time: '2026-07-12 16:30:00', operator: '管理员', type: '归档空间', target: '跨境赌博专案组', detail: '案件结案后归档了「跨境赌博专案组」专案空间', spaceName: '跨境赌博专案组' },
];

// ==================== 告警监控 ====================
export type AlertLevel = '紧急' | '严重' | '警告' | '提示';
export type AlertType = '智能体异常' | '模型调用失败' | 'API超时' | '连接器中断' | '知识库检索异常' | '配额超限';

export interface AlertRecord {
  id: string;
  level: AlertLevel;
  title: string;
  type: AlertType;
  targetResource: string;
  spaceName: string;
  triggerTime: string;
  duration: string;
  status: '待处理' | '处理中' | '已解决' | '已忽略';
  description: string;
  triggerCondition: string;
  errorDetail?: string;
  suggestion: string;
  /** 处理轨迹 */
  timeline?: { time: string; operator: string; action: string; remark: string }[];
}

export const mockAlertRecords: AlertRecord[] = [
  { id: '1', level: '紧急', title: '天网视频分析MCP连接中断', type: '连接器中断', targetResource: '天网视频分析MCP', spaceName: '指挥中心', triggerTime: '2026-06-25 14:32', duration: '2小时18分', status: '待处理', description: '天网视频分析MCP连接器持续返回502错误，所有视频分析请求失败', triggerCondition: '连续3次心跳检测失败', errorDetail: 'connect ECONNREFUSED 192.168.3.20:9521', suggestion: '1. 检查MCP服务器是否正常运行\n2. 验证网络连通性和防火墙规则\n3. 查看服务器日志确认根因\n4. 必要时重启MCP服务', timeline: [{ time: '2026-06-25 14:32:15', operator: '系统', action: '触发告警', remark: '连续3次心跳检测失败，自动触发告警' }] },
  { id: '2', level: '严重', title: '短信通知网关离线超过24小时', type: '连接器中断', targetResource: '短信通知网关', spaceName: '全局', triggerTime: '2026-06-24 09:15', duration: '29小时35分', status: '处理中', description: '短信通知网关MCP服务离线，所有短信通知功能不可用', triggerCondition: '服务离线超过12小时', suggestion: '1. 立即联系运维团队检查网关服务\n2. 检查短信服务商接口状态\n3. 若短时无法恢复，考虑切换备用通道', timeline: [{ time: '2026-06-24 09:15:00', operator: '系统', action: '触发告警', remark: '服务离线触发' }, { time: '2026-06-25 08:30:00', operator: '运维管理员', action: '认领', remark: '已联系服务商排查' }] },
  { id: '3', level: '警告', title: 'GPT-4o模型响应耗时超过3秒', type: '模型调用失败', targetResource: 'GPT-4o 模型', spaceName: '刑警大队', triggerTime: '2026-06-25 11:20', duration: '5小时30分', status: '待处理', description: 'GPT-4o模型近30分钟内平均响应耗时超过3秒，影响用户体验', triggerCondition: '最近30分钟内平均响应耗时 > 3000ms', suggestion: '1. 检查OpenAI API服务状态\n2. 考虑临时切换到备用模型\n3. 降低并发请求数', timeline: [{ time: '2026-06-25 11:20:00', operator: '系统', action: '触发告警', remark: '响应耗时阈值触发' }] },
  { id: '4', level: '提示', title: '核心业务主库存储空间使用率超过80%', type: '配额超限', targetResource: '核心业务主库', spaceName: '全局', triggerTime: '2026-06-24 16:00', duration: '1天2小时', status: '处理中', description: '核心业务数据源存储空间使用率已达到82%，需尽快扩容或清理', triggerCondition: '存储使用率 > 80%', suggestion: '1. 清理历史日志和过期数据\n2. 申请存储扩容\n3. 设置数据归档策略', timeline: [{ time: '2026-06-24 16:00:00', operator: '系统', action: '触发告警', remark: '存储使用率达82%' }, { time: '2026-06-25 09:00:00', operator: '张三', action: '认领', remark: '正在清理过期日志' }] },
  { id: '5', level: '严重', title: '人像比对引擎调用成功率低于90%', type: '智能体异常', targetResource: '人像比对引擎', spaceName: '刑警大队', triggerTime: '2026-06-25 10:45', duration: '6小时', status: '待处理', description: '人像比对工具调用成功率降至88.5%，大量请求返回超时或识别失败', triggerCondition: '最近1小时内成功率 < 90%', suggestion: '1. 检查人像比对服务状态\n2. 验证输入图片质量\n3. 考虑降低并发或增加重试机制' },
  { id: '6', level: '警告', title: 'API调用量接近月配额上限', type: '配额超限', targetResource: '通用大模型API', spaceName: '指挥中心', triggerTime: '2026-06-25 08:00', duration: '10小时', status: '已解决', description: '指挥中心空间本月模型调用量已达配额的92%', triggerCondition: '月调用量 > 90%配额', suggestion: '1. 申请临时提升配额\n2. 优化智能体调用频率\n3. 使用本地模型分流', timeline: [{ time: '2026-06-25 08:00:00', operator: '系统', action: '触发告警', remark: '配额使用率92%' }, { time: '2026-06-25 10:00:00', operator: '李警官', action: '解决', remark: '已申请并获批准临时提升配额至150%' }] },
  { id: '7', level: '提示', title: '日志采集库ES节点内存使用率高', type: '连接器中断', targetResource: 'Elasticsearch日志库', spaceName: '全局', triggerTime: '2026-06-24 14:00', duration: '1天', status: '已忽略', description: 'ES节点堆内存使用率超过75%，可能影响查询性能', triggerCondition: '内存使用率 > 75%', suggestion: '1. 增加ES节点堆内存配置\n2. 清理历史索引\n3. 优化索引分片策略', timeline: [{ time: '2026-06-24 14:00:00', operator: '系统', action: '触发告警', remark: '内存使用率79%' }, { time: '2026-06-25 09:00:00', operator: '运维管理员', action: '忽略', remark: '已确认是批次导入导致，导入完成后会自动恢复' }] },
];

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  monitorTarget: string;
  triggerCondition: string;
  level: AlertLevel;
  notifyMethods: string[];
  notifyTargets: string[];
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

export const mockAlertRules: AlertRule[] = [
  { id: '1', name: 'MCP连接器心跳检测告警', description: '监控所有MCP连接器心跳状态，连续失败时告警', monitorTarget: '连接器', triggerCondition: '连续3次心跳检测失败', level: '紧急', notifyMethods: ['站内消息', '短信', '企业微信'], notifyTargets: ['运维管理员', '空间管理员'], enabled: true, createTime: '2026-01-15', updateTime: '2026-06-20' },
  { id: '2', name: 'GPT-4o模型响应耗时告警', description: '监控GPT-4o模型响应耗时，超时告警', monitorTarget: '模型调用', triggerCondition: '最近30分钟内平均响应耗时 > 3000ms', level: '警告', notifyMethods: ['站内消息', '企业微信'], notifyTargets: ['运维管理员'], enabled: true, createTime: '2026-03-20', updateTime: '2026-06-15' },
  { id: '3', name: '存储空间配额告警', description: '监控数据源存储空间使用率', monitorTarget: '资源配额', triggerCondition: '存储使用率 > 80%', level: '提示', notifyMethods: ['站内消息'], notifyTargets: ['空间管理员'], enabled: true, createTime: '2026-02-01', updateTime: '2026-06-10' },
  { id: '4', name: 'API调用配额预警', description: '监控各空间模型调用配额使用情况', monitorTarget: '资源配额', triggerCondition: '月调用量 > 90% 配额', level: '警告', notifyMethods: ['站内消息', '邮件'], notifyTargets: ['空间管理员', '李警官'], enabled: true, createTime: '2026-04-10', updateTime: '2026-06-18' },
  { id: '5', name: '智能体运行成功率告警', description: '监控智能体调用成功率，低于阈值时告警', monitorTarget: '智能体运行', triggerCondition: '最近1小时内成功率 < 90%', level: '严重', notifyMethods: ['站内消息', '企业微信', '邮件'], notifyTargets: ['运维管理员'], enabled: false, createTime: '2026-05-01', updateTime: '2026-06-01' },
];

// ==================== 会话日志 ====================
export interface SessionLog {
  id: string;
  channel: string;
  agentName: string;
  spaceName: string;
  userName: string;
  title: string;
  messageCount: number;
  tokenConsumption: number;
  startTime: string;
  lastActive: string;
  status: '正常运行' | '部分报错' | '全部报错';
  /** 对话明细 */
  messages?: SessionMessage[];
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  latency?: number;
  tokens?: { input: number; output: number };
  model?: string;
  hasError?: boolean;
}

export const mockSessions: SessionLog[] = [
  { id: 'SES-0625-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '李警官', title: '核实今日上午城东区打架斗殴警情详情', messageCount: 12, tokenConsumption: 2560, startTime: '2026-06-25 14:00', lastActive: '2026-06-25 14:15', status: '正常运行', messages: [
    { id: 'm1', role: 'user', content: '请帮我分析今天上午城东区汽车站报的打架斗殴警情，提取关键要素录入系统。报案人姓吴，男性，约40岁。他说在汽车站广场被两个年轻人打了，鼻梁被打出血，对方骑电动车沿青年大街往东跑了。时间是上午9点半左右。', time: '14:00:12' },
    { id: 'm2', role: 'assistant', content: '已提取以下警情要素：\n- 案发时间：2026年6月25日上午9:30左右\n- 案发地点：城东区汽车站广场\n- 报案人：吴某，男，约40岁\n- 嫌疑人：2人，年轻男性，骑电动车沿青年大街往东逃窜\n- 案情分类：故意伤害/斗殴\n- 紧急程度：P2（30分钟内）\n- 伤情：鼻梁出血，需进一步核实是否骨折', time: '14:00:15', latency: 3250, tokens: { input: 180, output: 145 }, model: 'DeepSeek-Chat' },
  ]},
  { id: 'SES-0625-002', channel: 'API', agentName: '电诈资金穿透研判助手', spaceName: '反诈中心', userName: '王大队', title: '分析近三天涉诈银行卡交易流水', messageCount: 8, tokenConsumption: 4320, startTime: '2026-06-25 10:30', lastActive: '2026-06-25 10:52', status: '正常运行' },
  { id: 'SES-0625-003', channel: '企业微信', agentName: '社区警务工作台', spaceName: '派出所', userName: '孙民警', title: '查询向阳小区三号楼流动人口登记', messageCount: 6, tokenConsumption: 890, startTime: '2026-06-25 09:15', lastActive: '2026-06-25 09:22', status: '正常运行' },
  { id: 'SES-0624-001', channel: 'Web端', agentName: '交通事故责任认定助手', spaceName: '交警支队', userName: '赵警官', title: '分析环城高速三车追尾事故责任', messageCount: 15, tokenConsumption: 3680, startTime: '2026-06-24 16:00', lastActive: '2026-06-24 16:45', status: '部分报错', messages: [
    { id: 'm1', role: 'user', content: '环城高速K23+500处发生三车追尾事故。第一辆车牌鲁A·12345，蓝色本田雅阁；第二辆鲁B·67890白色丰田卡罗拉；第三辆鲁C·11223红色大众朗逸。当时天色已晚，路面湿滑。请分析责任。', time: '16:00:30' },
    { id: 'm2', role: 'assistant', content: '根据你提供的信息，初步分析如下：\n\n**三车追尾基本判定原则**：\n一般追尾事故由后车承担全部责任。\n\n**本案分析**：\n1. 第三辆车（红色大众朗逸）追尾第二辆车，第三辆车承担第二辆车的全部或主要责任\n2. 第二辆车在被追尾后是否因碰撞惯性推撞第一辆车，需结合撞击力度和现场痕迹判断', time: '16:00:38', latency: 7800, tokens: { input: 210, output: 350 }, model: 'GPT-4o' },
  ]},
  { id: 'SES-0624-002', channel: 'Web端', agentName: '刑事案件案情摘要生成', spaceName: '刑警大队', userName: '陈队长', title: '5321入室盗窃案案情摘要', messageCount: 10, tokenConsumption: 2150, startTime: '2026-06-24 14:20', lastActive: '2026-06-24 14:40', status: '正常运行' },
  { id: 'SES-0624-003', channel: 'API', agentName: '笔录文书智能校对', spaceName: '法制大队', userName: '周科长', title: '校对今早制作的询问笔录', messageCount: 7, tokenConsumption: 1450, startTime: '2026-06-24 11:00', lastActive: '2026-06-24 11:15', status: '正常运行' },
  { id: 'SES-0624-004', channel: '第三方', agentName: '人像比对引擎', spaceName: '刑警大队', userName: '刘侦查员', title: '比对监控截图与在逃人员库', messageCount: 4, tokenConsumption: 560, startTime: '2026-06-24 09:30', lastActive: '2026-06-24 09:35', status: '全部报错' },
  { id: 'SES-0623-001', channel: 'Web端', agentName: '社区警务工作台', spaceName: '派出所', userName: '钱民警', title: '更新5月份重点人口走访记录', messageCount: 12, tokenConsumption: 1890, startTime: '2026-06-23 15:00', lastActive: '2026-06-23 15:30', status: '正常运行' },
];

// ==================== 运营洞察 - 部门分析 ====================
export interface DeptAnalysis {
  deptName: string;
  activeUsers: number;
  totalCalls: number;
  tokenConsumption: number;
  agentCount: number;
  trend: { date: string; calls: number }[];
  agentTypeDist: { type: string; value: number }[];
  topAgents: { name: string; calls: number }[];
  topUsers: { name: string; calls: number }[];
}

export const mockDeptAnalyses: Record<string, DeptAnalysis> = {
  '指挥中心': { deptName: '指挥中心', activeUsers: 45, totalCalls: 28500, tokenConsumption: 2560000, agentCount: 5, trend: [{ date: '06/19', calls: 980 }, { date: '06/20', calls: 1240 }, { date: '06/21', calls: 1100 }, { date: '06/22', calls: 1350 }, { date: '06/23', calls: 1180 }, { date: '06/24', calls: 1420 }, { date: '06/25', calls: 1280 }], agentTypeDist: [{ type: '标准智能体', value: 3 }, { type: '流程智能体', value: 1 }, { type: '自主智能体', value: 1 }], topAgents: [{ name: '110接警警情分析助手', calls: 12860 }, { name: '社区警务工作台', calls: 8960 }, { name: '报警分类助手', calls: 4520 }, { name: '警力调度优化', calls: 2180 }], topUsers: [{ name: '李警官', calls: 5240 }, { name: '张警官', calls: 3860 }, { name: '王民警', calls: 3120 }, { name: '赵民警', calls: 2890 }] },
  '反诈中心': { deptName: '反诈中心', activeUsers: 28, totalCalls: 15600, tokenConsumption: 4320000, agentCount: 3, trend: [{ date: '06/19', calls: 580 }, { date: '06/20', calls: 720 }, { date: '06/21', calls: 650 }, { date: '06/22', calls: 810 }, { date: '06/23', calls: 690 }, { date: '06/24', calls: 760 }, { date: '06/25', calls: 740 }], agentTypeDist: [{ type: '标准智能体', value: 1 }, { type: '流程智能体', value: 1 }, { type: '自主智能体', value: 1 }], topAgents: [{ name: '电诈资金穿透研判助手', calls: 5620 }, { name: '涉诈APP分析助手', calls: 3400 }, { name: '受害人画像生成', calls: 2100 }], topUsers: [{ name: '王大队', calls: 4820 }, { name: '刘反诈', calls: 3560 }] },
  '刑警大队': { deptName: '刑警大队', activeUsers: 32, totalCalls: 23500, tokenConsumption: 3150000, agentCount: 6, trend: [{ date: '06/19', calls: 780 }, { date: '06/20', calls: 920 }, { date: '06/21', calls: 850 }, { date: '06/22', calls: 1050 }, { date: '06/23', calls: 890 }, { date: '06/24', calls: 970 }, { date: '06/25', calls: 830 }], agentTypeDist: [{ type: '标准智能体', value: 4 }, { type: '流程智能体', value: 1 }, { type: '自主智能体', value: 1 }], topAgents: [{ name: '刑事案件案情摘要生成', calls: 8340 }, { name: '人像比对引擎', calls: 4520 }, { name: '关系图谱生成', calls: 3120 }], topUsers: [{ name: '陈队长', calls: 7520 }, { name: '刘侦查员', calls: 4890 }] },
  '交警支队': { deptName: '交警支队', activeUsers: 18, totalCalls: 8900, tokenConsumption: 1890000, agentCount: 4, trend: [{ date: '06/19', calls: 320 }, { date: '06/20', calls: 410 }, { date: '06/21', calls: 360 }, { date: '06/22', calls: 480 }, { date: '06/23', calls: 390 }, { date: '06/24', calls: 450 }, { date: '06/25', calls: 420 }], agentTypeDist: [{ type: '标准智能体', value: 3 }, { type: '自主智能体', value: 1 }], topAgents: [{ name: '交通事故责任认定助手', calls: 2340 }, { name: '车辆轨迹查询', calls: 1890 }, { name: '违章识别分析', calls: 1450 }], topUsers: [{ name: '赵警官', calls: 3240 }, { name: '钱交警', calls: 2150 }] },
};

// ==================== 模板库 ====================
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  scene: string;
  type: '系统预置' | '自定义';
  modelName: string;
  knowledgeBases: string[];
  tools: string[];
  useCount: number;
  createTime: string;
  tags: string[];
}

// ==================== 智能体专属对话日志 ====================
/** 按智能体ID索引的对话日志，用于智能体配置页的日志面板 */
export const mockAgentSessions: Record<string, SessionLog[]> = {
  'agent-001': [
    { id: 'SES-110-0626-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '李警官', title: '核实今日上午城东区打架斗殴警情详情', messageCount: 12, tokenConsumption: 2560, startTime: '2026-06-26 09:15', lastActive: '2026-06-26 09:32', status: '正常运行', messages: [
      { id: 'm1', role: 'user', content: '请帮我分析今天上午城东区汽车站报的打架斗殴警情，提取关键要素录入系统。报案人姓吴，男性，约40岁。他说在汽车站广场被两个年轻人打了，鼻梁被打出血，对方骑电动车沿青年大街往东跑了。时间是上午9点半左右。', time: '09:15:12' },
      { id: 'm2', role: 'assistant', content: '已提取以下警情要素：\n\n- **案发时间**：2026年6月26日上午9:30左右\n- **案发地点**：城东区汽车站广场\n- **报案人**：吴某，男，约40岁\n- **嫌疑人**：2人，年轻男性，骑电动车沿青年大街往东逃窜\n- **案情分类**：故意伤害/斗殴\n- **紧急程度**：P2（30分钟内）\n- **伤情**：鼻梁出血，需进一步核实是否骨折\n\n建议：已自动生成接处警记录草稿，请核实后确认录入。', time: '09:15:18', latency: 3250, tokens: { input: 180, output: 145 }, model: 'DeepSeek-Chat' },
      { id: 'm3', role: 'user', content: '请补充一下：报案人手机号是138xxxx5678，身份证号需要我查一下。另外嫌疑人特征之一是其中一个穿黑色卫衣，戴红色头盔。', time: '09:18:05' },
      { id: 'm4', role: 'assistant', content: '收到，已补充以下信息：\n\n- **报案人联系方式**：138xxxx5678\n- **嫌疑人特征**：\n  - 嫌疑人A：黑色卫衣，戴红色头盔\n  - 嫌疑人B：特征待补充\n\n请提供报案人身份证号后我将进一步关联人口信息库完成录入。', time: '09:18:08', latency: 2780, tokens: { input: 230, output: 98 }, model: 'DeepSeek-Chat' },
    ]},
    { id: 'SES-110-0626-002', channel: 'API', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '系统调度', title: '批量处理夜间警情记录（22:00-06:00）', messageCount: 4, tokenConsumption: 1820, startTime: '2026-06-26 06:30', lastActive: '2026-06-26 06:35', status: '正常运行' },
    { id: 'SES-110-0625-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '张警官', title: '南湖区幸福小区入室盗窃警情分析', messageCount: 8, tokenConsumption: 3120, startTime: '2026-06-25 14:00', lastActive: '2026-06-25 14:22', status: '正常运行', messages: [
      { id: 'm1', role: 'user', content: '南湖区幸福小区3栋402发生入室盗窃，报案人刘女士说下午回家发现门锁被撬，客厅和主卧被翻动，丢失现金约5000元、金项链一条、笔记本电脑一台。', time: '14:00:22' },
      { id: 'm2', role: 'assistant', content: '已提取警情要素：\n\n- **案发时间**：2026年6月25日下午\n- **案发地点**：南湖区幸福小区3栋402室\n- **报案人**：刘女士\n- **案件类型**：入室盗窃\n- **损失财物**：现金约5000元、金项链一条、笔记本电脑一台\n- **作案手段**：撬锁入室\n- **紧急程度**：P3\n\n建议：已关联刑侦大队，建议进行现场勘查和周边监控调取。', time: '14:00:28', latency: 4100, tokens: { input: 195, output: 165 }, model: 'DeepSeek-Chat' },
    ]},
    { id: 'SES-110-0625-002', channel: '企业微信', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '王民警', title: '核实110指挥中心转来的交通纠纷警情', messageCount: 6, tokenConsumption: 1480, startTime: '2026-06-25 10:15', lastActive: '2026-06-25 10:26', status: '部分报错', messages: [
      { id: 'm1', role: 'user', content: '刚才接到110转来警情：环城北路与解放路交叉口发生两车刮擦，双方司机争执，围观群众较多影响交通。请帮我快速录入系统。', time: '10:15:30' },
      { id: 'm2', role: 'assistant', content: '警情录入：\n- **案发地点**：环城北路与解放路交叉口\n- **案件类型**：交通事故/两车刮擦\n- **现场情况**：双方争执，围观群众多，影响交通\n- **紧急程度**：P2\n\n建议优先调派附近巡逻民警维持秩序，疏导交通。', time: '10:15:35', latency: 5200, tokens: { input: 168, output: 112 }, model: 'DeepSeek-Chat' },
      { id: 'm3', role: 'user', content: '好的，请查询一下该路口附近的巡逻警力分布情况。', time: '10:18:00' },
      { id: 'm4', role: 'assistant', content: '查询工具调用异常，请稍后重试。当前可能的原因：警力调度系统接口暂时不可用，建议通过电话直接联系该辖区派出所。', time: '10:18:05', latency: 8200, tokens: { input: 145, output: 68 }, model: 'DeepSeek-Chat', hasError: true },
    ]},
    { id: 'SES-110-0624-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '李警官', title: '梳理当日接警数据并生成日报汇总', messageCount: 10, tokenConsumption: 4520, startTime: '2026-06-24 23:00', lastActive: '2026-06-24 23:18', status: '正常运行', messages: [
      { id: 'm1', role: 'user', content: '请帮我生成今日（6月24日）110接警日报汇总，按警情类别、辖区和时间段统计。', time: '23:00:05' },
      { id: 'm2', role: 'assistant', content: '正在整理今日接警数据...\n\n## 2026年6月24日接警日报\n\n### 总量统计\n- 今日接警总数：47起\n- 有效警情：42起（89.4%）\n- 无效报警：5起\n\n### 按警情类别\n| 类别 | 数量 | 占比 |\n|------|------|------|\n| 治安案件 | 18 | 38.3% |\n| 交通事故 | 12 | 25.5% |\n| 刑事警情 | 7 | 14.9% |\n| 纠纷调解 | 5 | 10.6% |\n| 其他 | 5 | 10.6% |\n\n### 高峰时段：14:00-18:00（18起，占38.3%）', time: '23:00:12', latency: 6400, tokens: { input: 280, output: 420 }, model: 'DeepSeek-Chat' },
    ]},
    { id: 'SES-110-0624-002', channel: '第三方', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '第三方平台', title: '市民热线转接警情：噪音扰民投诉', messageCount: 3, tokenConsumption: 680, startTime: '2026-06-24 21:00', lastActive: '2026-06-24 21:04', status: '正常运行' },
    { id: 'SES-110-0623-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '张警官', title: '工业园区化学品泄漏报警处置记录', messageCount: 14, tokenConsumption: 3850, startTime: '2026-06-23 17:30', lastActive: '2026-06-23 18:05', status: '正常运行', messages: [
      { id: 'm1', role: 'user', content: '高新区工业园区B区化工厂报警称有不明气体泄漏，多名工人感到头晕恶心。报警人是工厂安全员周先生，电话139xxxx1234。请立即生成应急预案并通知相关部门。', time: '17:30:18' },
      { id: 'm2', role: 'assistant', content: '⚠️ **紧急警情 - P0级别**\n\n已提取关键信息：\n- **案发地点**：高新区工业园区B区化工厂\n- **事件类型**：危险化学品泄漏\n- **影响范围**：多名工人出现头晕恶心症状\n- **报警人**：周先生 139xxxx1234\n- **紧急程度**：P0（最高级别，立即响应）\n\n已自动执行：\n1. 通知高新区消防支队\n2. 通知市环保局应急科\n3. 通知120急救中心\n4. 通知辖区派出所疏散周边', time: '17:30:25', latency: 2180, tokens: { input: 210, output: 198 }, model: 'DeepSeek-Chat' },
    ]},
    { id: 'SES-110-0623-002', channel: '企业微信', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '赵民警', title: '查询近期城东区盗窃案趋势', messageCount: 5, tokenConsumption: 1120, startTime: '2026-06-23 10:00', lastActive: '2026-06-23 10:08', status: '正常运行' },
    { id: 'SES-110-0622-001', channel: 'Web端', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '李警官', title: '协助处理老年人走失警情', messageCount: 16, tokenConsumption: 2960, startTime: '2026-06-22 15:30', lastActive: '2026-06-22 16:15', status: '正常运行' },
    { id: 'SES-110-0621-001', channel: 'API', agentName: '110接警警情分析助手', spaceName: '指挥中心', userName: '系统调度', title: '凌晨自动巡检未处理警情', messageCount: 2, tokenConsumption: 450, startTime: '2026-06-21 03:00', lastActive: '2026-06-21 03:01', status: '全部报错', messages: [
      { id: 'm1', role: 'user', content: '系统定时任务：扫描过去6小时未处理警情并生成提醒。', time: '03:00:00' },
      { id: 'm2', role: 'assistant', content: '错误：知识库服务连接超时，无法检索历史警情记录。请检查知识库配置及网络连通性。', time: '03:00:05', latency: 46000, tokens: { input: 56, output: 42 }, model: 'DeepSeek-Chat', hasError: true },
    ]},
  ],
};

// ════════════════════════════════════════════════
// 模板库
// ════════════════════════════════════════════════

export const mockTemplates: AgentTemplate[] = [
  { id: 't1', name: '接处警警情分析', description: '从接警通话中快速提取结构化警情要素并自动分类录入，适用于各级110接警中心', scene: '智慧警务', type: '系统预置', modelName: 'DeepSeek-Chat', knowledgeBases: ['警情分类知识库', '接处警规程库'], tools: ['文书智能解析', '人口信息查询'], useCount: 1280, createTime: '2026-01-10', tags: ['接警', '警情分析', '信息提取'] },
  { id: 't2', name: '交通事故认定', description: '基于现场勘查记录和监控描述自动分析事故原因并判定责任，辅助事故处理民警', scene: '交通管理', type: '系统预置', modelName: 'GPT-4o', knowledgeBases: ['道路交通安全法规库'], tools: ['车辆轨迹查询', '图像识别'], useCount: 856, createTime: '2026-02-15', tags: ['交通', '事故认定', '责任判定'] },
  { id: 't3', name: '反诈资金研判', description: '分析涉诈资金链路，识别可疑卡号和洗钱路径，反诈民警的标准研判工具', scene: '刑事侦查', type: '系统预置', modelName: 'DeepSeek-Reasoner', knowledgeBases: ['反诈案例知识库', '洗钱模式特征库'], tools: ['关系图谱生成', '涉诈基站分析'], useCount: 654, createTime: '2026-03-01', tags: ['反诈', '资金穿透', '洗钱'] },
  { id: 't4', name: '笔录智能校对', description: '对笔录文书进行语法纠错、格式规范和法律条款引用校验', scene: '执法规范', type: '系统预置', modelName: 'GPT-4o', knowledgeBases: ['法律法规库', '文书规范库'], tools: ['文书智能解析'], useCount: 1120, createTime: '2026-01-20', tags: ['笔录', '校对', '法条引用'] },
  { id: 't5', name: '社区警务助手', description: '社区民警的日常助手：人口管理、走访记录、矛盾调解一站式工作台', scene: '治安管理', type: '自定义', modelName: 'Qwen-72B-Chat', knowledgeBases: ['户籍信息库', '社区管理规范'], tools: ['人口信息查询'], useCount: 340, createTime: '2026-04-10', tags: ['社区', '走访', '户籍'] },
  { id: 't6', name: '案件摘要生成', description: '智能化案件材料解析与案情摘要自动生成，提升办案效率', scene: '刑事侦查', type: '自定义', modelName: 'Qwen-72B-Chat', knowledgeBases: ['案件卷宗库', '法律法规库'], tools: ['文书智能解析'], useCount: 210, createTime: '2026-05-20', tags: ['案件', '摘要', '自动化'] },
];

// ════════════════════════════════════════════════
// 资源广场 / 我的资源
// ════════════════════════════════════════════════

export type ResourceType = '模型' | 'API' | '连接器' | '知识库' | '提示词' | '插件工具' | '数据连接';
export type ResourcePublishStatus = '待上架' | '已上架' | '已下架';
export type ResourcePublicStrategy = '完全公开' | '公开可见授权可用' | '授权可见';
export type InstallStatus = '未安装' | '已安装' | '安装失败' | '安装中';
export type AuthSource = '我申请的' | '共享给我的' | '管理员授权';

export interface ResourceItem {
  id: string;
  name: string;
  key: string;
  type: ResourceType;
  subType: string;
  deployType: string;
  description: string;
  detail: string; // Markdown 详细介绍
  publicStrategy: ResourcePublicStrategy;
  owner: string;
  publishStatus: ResourcePublishStatus;
  isTop: boolean;
  installCount: number;
  publishDate: string;
  tags: string[];
}

export interface UserResourceItem {
  id: string;
  resourceId: string;
  userId: string;
  resource: ResourceItem;
  authSource: AuthSource;
  authExpireDate?: string;
  installStatus: InstallStatus;
}

export const mockResources: ResourceItem[] = [
  {
    id: 'r1', name: 'DeepSeek-Chat 通用大模型', key: 'deepseek-chat-v1', type: '模型', subType: '大模型',
    deployType: '公网', description: 'DeepSeek 对话模型，支持长上下文理解与多轮对话，适用于警情分析、案情研判等场景',
    detail: '## DeepSeek-Chat\n\n**模型能力**：通用对话、长文本理解、多轮对话\n\n**适用场景**：\n- 警情分析提取\n- 案件摘要生成\n- 讯问笔录辅助\n- 日常办公问答\n\n**技术规格**：\n- 最大 Token：32,768\n- 温度范围：0.0-1.5\n- API 端点：`https://api.deepseek.com/v1`\n\n**对接方式**：通过智能网关统一代理，调用方无需直接连接模型供应商。',
    publicStrategy: '完全公开', owner: '平台管理员', publishStatus: '已上架', isTop: true, installCount: 1420,
    publishDate: '2026-01-15', tags: ['对话', '大模型', 'DeepSeek'],
  },
  {
    id: 'r2', name: 'DeepSeek-Reasoner 推理模型', key: 'deepseek-reasoner-v1', type: '模型', subType: '大模型',
    deployType: '公网', description: 'DeepSeek 推理模型，擅长复杂逻辑推理与数学问题，适用于反诈资金链路研判、案件关系分析',
    detail: '## DeepSeek-Reasoner\n\n**模型能力**：逻辑推理、数学计算、多步推理\n\n**适用场景**：\n- 资金链路穿透研判\n- 案件关系图谱推理\n- 法律条文逻辑分析\n- 复杂案情推理\n\n**技术规格**：\n- 最大 Token：32,768\n- 温度推荐：0.1-0.3\n- API 端点：`https://api.deepseek.com/v1`',
    publicStrategy: '完全公开', owner: '平台管理员', publishStatus: '已上架', isTop: false, installCount: 890,
    publishDate: '2026-02-10', tags: ['推理', '数学', 'DeepSeek'],
  },
  {
    id: 'r3', name: 'Qwen-72B-Chat 千问模型', key: 'qwen-72b-chat-int4', type: '模型', subType: '大模型',
    deployType: '内网', description: '通义千问 72B 量化版，本地私有化部署，保障公安数据安全',
    detail: '## Qwen-72B-Chat\n\n**部署方式**：本地私有化部署\n\n**模型能力**：通用对话、文本生成、指令遵循\n\n**适用场景**：\n- 涉密案件材料处理\n- 内部公文撰写\n- 刑侦案情分析\n\n**技术规格**：\n- 最大 Token：8,192\n- 部署地址：内网服务器集群\n- 适用等级：非密/秘密',
    publicStrategy: '授权可见', owner: '科信支队', publishStatus: '已上架', isTop: true, installCount: 320,
    publishDate: '2026-01-20', tags: ['内网', '千问', '私有化'],
  },
  {
    id: 'r4', name: 'BGE-M3 向量化模型', key: 'bge-m3-embedding', type: '模型', subType: '向量化模型',
    deployType: '内网', description: 'BGE-M3 多语言向量化模型，用于知识库文档嵌入与语义检索',
    detail: '## BGE-M3\n\n**模型能力**：文本向量化、语义检索\n\n**适用场景**：\n- 法律法规语义检索\n- 案件卷宗相似度匹配\n- 警情知识库构建\n\n**技术规格**：\n- 向量维度：1024\n- 支持密度和稀疏检索\n- 多语言支持',
    publicStrategy: '公开可见授权可用', owner: '科信支队', publishStatus: '已上架', isTop: false, installCount: 560,
    publishDate: '2026-02-28', tags: ['向量化', 'Embedding', 'BAAI'],
  },
  {
    id: 'r5', name: 'GPT-4o 多模态模型', key: 'gpt-4o-multimodal', type: '模型', subType: '多模态模型',
    deployType: '公网', description: 'OpenAI 多模态旗舰模型，支持文本、图像分析，适用于图侦、事故分析',
    detail: '## GPT-4o\n\n**模型能力**：多模态理解、图像分析、文本生成\n\n**适用场景**：\n- 监控图像分析描述\n- 事故现场图片辅助认定\n- 人脸特征文字描述生成\n\n**技术规格**：\n- 最大 Token：128,000\n- 支持图像输入\n- API 端点：通过平台代理',
    publicStrategy: '公开可见授权可用', owner: '平台管理员', publishStatus: '已上架', isTop: false, installCount: 210,
    publishDate: '2026-03-01', tags: ['多模态', 'GPT', '图像'],
  },
  {
    id: 'r6', name: '全国人口基础信息查询接口', key: 'population-query-api', type: 'API', subType: '数据查询',
    deployType: '内网', description: '根据身份证号、姓名等要素检索人员基本信息、户籍信息、居住证信息',
    detail: '## 人口信息查询接口\n\n**接口说明**：对接全国人口基础信息库，提供人员基本信息查询服务。\n\n**请求方式**：POST\n\n**鉴权**：API Key（Header）\n\n**请求参数**：\n| 参数 | 类型 | 必填 | 说明 |\n|------|------|------|------|\n| idCard | string | 是 | 身份证号 |\n| name | string | 否 | 姓名 |\n\n**返回示例**：JSON 格式，含姓名、性别、出生日期、户籍地址等。',
    publicStrategy: '授权可见', owner: '治安支队', publishStatus: '已上架', isTop: true, installCount: 890,
    publishDate: '2026-01-10', tags: ['人口', '查询', '身份证'],
  },
  {
    id: 'r7', name: '车辆轨迹查询接口', key: 'vehicle-track-api', type: 'API', subType: '数据查询',
    deployType: '内网', description: '基于车牌号查询辖区卡口过车记录和通行轨迹聚合分析',
    detail: '## 车辆轨迹查询\n\n**接口说明**：对接交警缉查布控系统，查询车辆通行轨迹。\n\n**请求方式**：POST\n\n**鉴权**：API Key\n\n**请求参数**：\n| 参数 | 类型 | 必填 | 说明 |\n|------|------|------|------|\n| plateNumber | string | 是 | 车牌号 |\n| startTime | string | 是 | 开始时间 |\n| endTime | string | 是 | 结束时间 |',
    publicStrategy: '授权可见', owner: '交警支队', publishStatus: '已上架', isTop: false, installCount: 670,
    publishDate: '2026-01-15', tags: ['车辆', '卡口', '轨迹'],
  },
  {
    id: 'r8', name: '文书智能解析 API', key: 'document-parse-api', type: 'API', subType: '文档处理',
    deployType: '内网', description: '自动解析PDF/Word格式的法律文书、报案材料，提取结构化信息',
    detail: '## 文书智能解析\n\n**接口说明**：智能解析公安文书，提取结构化字段。\n\n**请求方式**：POST\n\n**鉴权**：API Key + 文件上传\n\n**支持格式**：PDF、DOCX、图片\n\n**返回字段**：案件编号、当事人信息、案情描述、涉案金额等结构化JSON。',
    publicStrategy: '公开可见授权可用', owner: '法制大队', publishStatus: '已上架', isTop: false, installCount: 540,
    publishDate: '2026-01-20', tags: ['文书', '解析', '结构化'],
  },
  {
    id: 'r9', name: '市局数据研判连接器', key: 'police-data-connector', type: '连接器', subType: '数据服务',
    deployType: '内网', description: '接入公安大数据平台，提供人口、车辆、案件等多维度数据检索与分析工具集',
    detail: '## 市局数据研判连接器\n\n**服务说明**：基于 MCP 协议提供公安数据检索与分析工具集。\n\n**协议**：SSE\n\n**端点**：`https://connector.police.data.server/sse`\n\n**可用工具**：\n- 人口信息查询\n- 车辆信息查询\n- 案件信息检索\n- 警情统计分析\n\n**适用场景**：数据研判、案件串并、情报分析。',
    publicStrategy: '授权可见', owner: '指挥中心', publishStatus: '已上架', isTop: true, installCount: 1100,
    publishDate: '2026-01-10', tags: ['MCP', '数据', '研判'],
  },
  {
    id: 'r10', name: '天网视频分析连接器', key: 'tianwang-video-connector', type: '连接器', subType: '视频分析',
    deployType: '内网', description: '对接天网视频监控系统，提供实时视频流分析、目标追踪与行为识别能力',
    detail: '## 天网视频分析 MCP\n\n**服务说明**：基于 MCP 协议提供视频分析能力。\n\n**协议**：SSE\n\n**可用工具**：\n- 实时视频流分析\n- 目标检测与追踪\n- 人像比对\n- 行为异常检测\n\n**适用场景**：治安巡逻、刑侦追逃、交通管理。',
    publicStrategy: '授权可见', owner: '图侦中心', publishStatus: '已上架', isTop: false, installCount: 450,
    publishDate: '2026-02-20', tags: ['MCP', '视频', '天网'],
  },
  {
    id: 'r11', name: '短信通知网关连接器', key: 'sms-gateway-connector', type: '连接器', subType: '通知服务',
    deployType: '内网', description: '统一短信发送网关，用于告警通知、验证码发送和群发通知',
    detail: '## 短信通知网关\n\n**服务说明**：统一短信发送MCP服务。\n\n**协议**：SSE\n\n**可用工具**：\n- 单条短信发送\n- 批量短信群发\n- 通知模板管理\n\n**适用场景**：警情通知、告警提醒、任务派发通知。',
    publicStrategy: '公开可见授权可用', owner: '指挥中心', publishStatus: '已上架', isTop: false, installCount: 780,
    publishDate: '2026-04-10', tags: ['MCP', '短信', '通知'],
  },
  {
    id: 'r12', name: '警情分类知识库', key: 'alert-class-kb', type: '知识库', subType: '业务知识库',
    deployType: '内网', description: '110接处警标准化分类体系知识库，含警情类别定义、要素模板与处置规程',
    detail: '## 警情分类知识库\n\n**知识库说明**：110接处警标准化分类体系。\n\n**内容覆盖**：\n- 警情类别定义（治安/刑事/交通/纠纷等）\n- 警情要素模板\n- 分级处置规程\n- 法律法规引用\n\n**检索方式**：语义检索 + 分类标签过滤\n\n**文档数量**：1,280 篇',
    publicStrategy: '完全公开', owner: '指挥中心', publishStatus: '已上架', isTop: false, installCount: 980,
    publishDate: '2026-05-01', tags: ['知识库', '警情分类', '规程'],
  },
  {
    id: 'r13', name: '道路交通安全法规库', key: 'traffic-law-kb', type: '知识库', subType: '法规知识库',
    deployType: '内网', description: '道路交通安全法及其实施条例、地方交管规定等法规全文检索库',
    detail: '## 道路交通安全法规库\n\n**知识库说明**：完整的道路交通安全法规体系。\n\n**内容覆盖**：\n- 《道路交通安全法》全文\n- 实施条例\n- 地方交管规定\n- 事故责任认定标准\n- 典型案例判例\n\n**文档数量**：860 篇',
    publicStrategy: '公开可见授权可用', owner: '交警支队', publishStatus: '已上架', isTop: false, installCount: 420,
    publishDate: '2026-05-15', tags: ['知识库', '交通', '法规'],
  },
  {
    id: 'r14', name: '反诈案例知识库', key: 'antifraud-case-kb', type: '知识库', subType: '业务知识库',
    deployType: '内网', description: '电诈典型案例分析、诈骗手法特征库与资金链路模式知识库',
    detail: '## 反诈案例知识库\n\n**知识库说明**：电信诈骗案例与研判知识库。\n\n**内容覆盖**：\n- 典型诈骗案例\n- 诈骗手法特征\n- 洗钱链路模式\n- 预警模型特征\n\n**文档数量**：1,560 篇\n\n**更新频率**：每周自动同步最新案例。',
    publicStrategy: '授权可见', owner: '反诈中心', publishStatus: '已上架', isTop: true, installCount: 360,
    publishDate: '2026-05-20', tags: ['知识库', '反诈', '案例'],
  },
  {
    id: 'r15', name: '刑侦案件卷宗知识库', key: 'criminal-archive-kb', type: '知识库', subType: '业务知识库',
    deployType: '内网', description: '历史刑事案件卷宗语义索引库，支持案情相似度检索与办案经验复用',
    detail: '## 刑侦案件卷宗知识库\n\n**知识库说明**：历史刑事案件卷宗结构化知识库。\n\n**内容覆盖**：\n- 刑事案件卷宗\n- 侦查手段经验\n- 审讯策略参考\n- 证据链分析方法\n\n**权限要求**：需刑侦部门授权\n\n**文档数量**：3,200 篇',
    publicStrategy: '授权可见', owner: '刑警大队', publishStatus: '已上架', isTop: false, installCount: 280,
    publishDate: '2026-06-01', tags: ['知识库', '刑侦', '卷宗'],
  },
  // ── 提示词 ──
  {
    id: 'r16', name: '警情分析提取提示词模板', key: 'alert-extract-prompt', type: '提示词', subType: 'ICIO',
    deployType: '内网', description: '采用ICIO提示词工程方法，从口语化报案转录文本中标准化提取警情要素，含输入约束→情境→指令→输出规范',
    detail: '## 警情分析提取提示词\n\n**方法**：ICIO（Input-Context-Instruction-Output）\n\n**适用场景**：110接处警平台警情录入\n\n**模板变量**：\n- `dialect_type`：方言类型\n- `platform_name`：接处警平台名称\n\n**核心约束**：\n- 强制标准化输出字段（时间/地点/人员/类别/紧急程度）\n- 应对口语化、方言、口音等情况\n- 长度控制≤300字\n\n**使用方式**：在智能体配置中引入此模板，绑定实际变量后即可生效。',
    publicStrategy: '完全公开', owner: '指挥中心', publishStatus: '已上架', isTop: true, installCount: 620,
    publishDate: '2026-03-10', tags: ['提示词', 'ICIO', '警情分析'],
  },
  {
    id: 'r17', name: '反诈资金研判提示词模板', key: 'antifraud-prompt', type: '提示词', subType: 'CRISPE',
    deployType: '内网', description: 'CRISPE方法论构建的反诈精英调查员角色提示词，用于涉诈团伙多级资金链路穿透研判与可疑卡号识别',
    detail: '## 反诈资金研判提示词\n\n**方法**：CRISPE（Capacity-Role-Insight-Statement-Personality-Experiment）\n\n**角色定位**：精通网络金融犯罪与洗钱链条追踪的反诈精英调查员\n\n**核心能力**：\n- 多级水房资金穿透分析\n- 聚合支付与地下钱庄识别\n- 可疑卡号集群按可疑程度降序排列\n\n**变量**：`source_account`、`time_range`',
    publicStrategy: '授权可见', owner: '反诈中心', publishStatus: '已上架', isTop: false, installCount: 310,
    publishDate: '2026-04-05', tags: ['提示词', 'CRISPE', '反诈'],
  },
  {
    id: 'r18', name: '案情摘要生成提示词模板', key: 'case-summary-prompt', type: '提示词', subType: 'RASCEF',
    deployType: '内网', description: 'RASCEF结构化提示词，自动解析案件材料生成标准格式案情摘要报告，含案件概述、关键事实、证据清单、法律适用建议',
    detail: '## 案情摘要生成提示词\n\n**方法**：RASCEF（Role-Action-Step-Context-Example-Format）\n\n**输入变量**：\n- `case_id`：案件编号\n- `incident_time`：案发时间\n- `location`：案发地点\n- `suspects`：涉案人员\n- `case_type`：案件类型\n\n**输出规范**：\n1. 案件概述（100字内）\n2. 关键事实列表\n3. 证据清单\n4. 法律适用建议',
    publicStrategy: '公开可见授权可用', owner: '法制大队', publishStatus: '已上架', isTop: false, installCount: 250,
    publishDate: '2026-05-01', tags: ['提示词', 'RASCEF', '案件'],
  },
  // ── 插件工具 ──
  {
    id: 'r19', name: '人像比对插件', key: 'face-compare-plugin', type: '插件工具', subType: '图像分析',
    deployType: '内网', description: '集成多种人脸识别算法，提供照片比对、视频流人脸检索及身份确认服务，适用于逃犯识别与身份核验',
    detail: '## 人像比对插件\n\n**插件类型**：图像分析\n\n**功能**：\n- 照片1:1比对\n- 1:N人脸检索\n- 视频流实时检测\n- 跨年龄人像识别\n\n**参数**：\n- `imageBase64`：人脸照片编码\n- `threshold`：相似度阈值(0-1)，默认0.85\n\n**对接方式**：通过插件SDK集成，安装后自动注册到工具面板。',
    publicStrategy: '授权可见', owner: '图侦中心', publishStatus: '已上架', isTop: true, installCount: 480,
    publishDate: '2026-02-01', tags: ['插件', '人像', '比对'],
  },
  {
    id: 'r20', name: '关系图谱生成插件', key: 'graph-build-plugin', type: '插件工具', subType: '数据分析',
    deployType: '内网', description: '基于人员、通话、资金流水数据自动生成多维关系拓扑图，辅助案件串并与团伙分析',
    detail: '## 关系图谱生成插件\n\n**插件类型**：数据分析\n\n**功能**：\n- 人员关系拓扑图\n- 通话记录关联图谱\n- 资金流向关系图\n- 多维度联合分析\n\n**输入**：人员ID列表、时间段\n\n**输出**：可交互D3.js关系图（JSON格式）\n\n**使用场景**：团伙案件分析、资金链路可视化。',
    publicStrategy: '授权可见', owner: '刑警大队', publishStatus: '已上架', isTop: false, installCount: 390,
    publishDate: '2026-02-15', tags: ['插件', '图谱', '关系'],
  },
  {
    id: 'r21', name: '文书格式检测插件', key: 'doc-check-plugin', type: '插件工具', subType: '文档处理',
    deployType: '内网', description: '自动检测公安文书格式规范，校验语法错误、格式偏差及法律条款引用准确性，即插即用型工具',
    detail: '## 文书格式检测插件\n\n**插件类型**：文档处理\n\n**检测维度**：\n- 格式规范（字号、行距、段落结构）\n- 语法与错别字\n- 法条引用格式及有效性\n- 必填字段完整性\n\n**支持格式**：DOCX、PDF\n\n**输出**：批注式修改建议 + 合规评分（0-100）',
    publicStrategy: '公开可见授权可用', owner: '法制大队', publishStatus: '已上架', isTop: false, installCount: 560,
    publishDate: '2026-03-20', tags: ['插件', '文书', '检测'],
  },
  // ── 数据连接 ──
  {
    id: 'r22', name: '核心业务主库连接', key: 'core-biz-db-conn', type: '数据连接', subType: 'MySQL',
    deployType: '内网', description: '连接公安核心业务数据库（MySQL），提供案件信息、人员档案、执法记录等结构化数据检索能力',
    detail: '## 核心业务主库\n\n**数据库类型**：MySQL 8.0\n\n**部署地址**：192.168.1.100:3306\n\n**数据范围**：\n- 案件信息表\n- 人员档案表\n- 执法记录表\n- 警情登记表\n\n**使用方式**：安装后通过智能网关代理访问，支持SQL查询与视图封装。',
    publicStrategy: '授权可见', owner: '科信支队', publishStatus: '已上架', isTop: true, installCount: 340,
    publishDate: '2026-01-10', tags: ['数据连接', 'MySQL', '核心业务'],
  },
  {
    id: 'r23', name: '历史案件存档库连接', key: 'archive-db-conn', type: '数据连接', subType: 'Oracle',
    deployType: '内网', description: '连接Oracle历史案件归档数据库，存储5年以上结案案件信息，支持历史案件检索与分析复盘',
    detail: '## 历史案件存档库\n\n**数据库类型**：Oracle 19c\n\n**部署地址**：192.168.1.101:1521\n\n**数据范围**：\n- 结案案件完整卷宗\n- 判决文书\n- 执行记录\n\n**查询方式**：支持按案号、时间范围、案件类别复合检索。',
    publicStrategy: '公开可见授权可用', owner: '科信支队', publishStatus: '已上架', isTop: false, installCount: 180,
    publishDate: '2026-02-20', tags: ['数据连接', 'Oracle', '归档'],
  },
  {
    id: 'r24', name: '操作日志采集库连接', key: 'log-es-conn', type: '数据连接', subType: 'Elasticsearch',
    deployType: '内网', description: '连接Elasticsearch日志采集库，存储平台操作日志、API调用日志和系统运行日志，用于审计追溯与运维监控',
    detail: '## 操作日志采集库\n\n**数据库类型**：Elasticsearch 8.x\n\n**部署地址**：192.168.3.10:9200\n\n**索引范围**：\n- 平台操作日志（operation-logs-*）\n- API调用日志（api-calls-*）\n- 系统运行日志（system-metrics-*）\n\n**查询能力**：全文检索 + 时间范围过滤 + 聚合分析。',
    publicStrategy: '授权可见', owner: '运维中心', publishStatus: '已上架', isTop: false, installCount: 120,
    publishDate: '2026-04-01', tags: ['数据连接', 'ES', '日志'],
  },
];

// ════════════════════════════════════════════════
// 用户已授权资源（模拟当前登录用户 "张警官"）
// ════════════════════════════════════════════════

const mockResourceMap = Object.fromEntries(mockResources.map(r => [r.id, r]));

export const mockUserResources: UserResourceItem[] = [
  { id: 'ur1', resourceId: 'r1', userId: 'zhang', resource: mockResourceMap['r1'], authSource: '共享给我的', installStatus: '已安装' },
  { id: 'ur2', resourceId: 'r2', userId: 'zhang', resource: mockResourceMap['r2'], authSource: '我申请的', installStatus: '已安装' },
  { id: 'ur3', resourceId: 'r5', userId: 'zhang', resource: mockResourceMap['r5'], authSource: '我申请的', installStatus: '未安装' },
  { id: 'ur4', resourceId: 'r6', userId: 'zhang', resource: mockResourceMap['r6'], authSource: '管理员授权', installStatus: '已安装' },
  { id: 'ur5', resourceId: 'r7', userId: 'zhang', resource: mockResourceMap['r7'], authSource: '我申请的', installStatus: '未安装' },
  { id: 'ur6', resourceId: 'r8', userId: 'zhang', resource: mockResourceMap['r8'], authSource: '共享给我的', installStatus: '已安装' },
  { id: 'ur7', resourceId: 'r9', userId: 'zhang', resource: mockResourceMap['r9'], authSource: '管理员授权', installStatus: '已安装' },
  { id: 'ur8', resourceId: 'r10', userId: 'zhang', resource: mockResourceMap['r10'], authSource: '我申请的', installStatus: '安装失败' },
  { id: 'ur9', resourceId: 'r11', userId: 'zhang', resource: mockResourceMap['r11'], authSource: '共享给我的', installStatus: '未安装' },
  { id: 'ur10', resourceId: 'r12', userId: 'zhang', resource: mockResourceMap['r12'], authSource: '共享给我的', installStatus: '已安装' },
  { id: 'ur11', resourceId: 'r13', userId: 'zhang', resource: mockResourceMap['r13'], authSource: '我申请的', installStatus: '未安装' },
  { id: 'ur12', resourceId: 'r14', userId: 'zhang', resource: mockResourceMap['r14'], authSource: '我申请的', authExpireDate: '2026-07-05', installStatus: '已安装' },
  { id: 'ur13', resourceId: 'r15', userId: 'zhang', resource: mockResourceMap['r15'], authSource: '管理员授权', authExpireDate: '2026-07-01', installStatus: '未安装' },
  { id: 'ur14', resourceId: 'r16', userId: 'zhang', resource: mockResourceMap['r16'], authSource: '共享给我的', installStatus: '已安装' },
  { id: 'ur15', resourceId: 'r18', userId: 'zhang', resource: mockResourceMap['r18'], authSource: '我申请的', installStatus: '未安装' },
  { id: 'ur16', resourceId: 'r19', userId: 'zhang', resource: mockResourceMap['r19'], authSource: '管理员授权', installStatus: '已安装' },
  { id: 'ur17', resourceId: 'r21', userId: 'zhang', resource: mockResourceMap['r21'], authSource: '共享给我的', installStatus: '未安装' },
  { id: 'ur18', resourceId: 'r22', userId: 'zhang', resource: mockResourceMap['r22'], authSource: '我申请的', installStatus: '已安装' },
  { id: 'ur19', resourceId: 'r24', userId: 'zhang', resource: mockResourceMap['r24'], authSource: '管理员授权', authExpireDate: '2026-07-03', installStatus: '未安装' },
];
