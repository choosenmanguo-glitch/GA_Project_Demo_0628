/** Mock 数据 - 所有模块的模拟数据集中管理 */

// ==================== 模型管理 ====================
export interface ModelItem {
  id: string;
  displayName: string;
  modelName: string;
  modelType: string;
  supplier: string;
  deployType: '公网' | '本地' | '私有云';
  status: '启用' | '停用';
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
  { id: '1', displayName: 'DeepSeek-Chat', modelName: 'deepseek-chat', modelType: '通用大模型', supplier: 'DeepSeek', deployType: '公网', status: '启用', createTime: '2026-01-15', updateTime: '2026-06-20', description: 'DeepSeek 对话模型，支持长上下文理解与多轮对话', endpoint: 'https://api.deepseek.com/v1', maxTokens: 32768, temperature: 0.7 },
  { id: '2', displayName: 'DeepSeek-Reasoner', modelName: 'deepseek-reasoner', modelType: '推理模型', supplier: 'DeepSeek', deployType: '公网', status: '启用', createTime: '2026-02-10', updateTime: '2026-06-18', description: 'DeepSeek 推理模型，擅长复杂逻辑推理与数学问题', endpoint: 'https://api.deepseek.com/v1', maxTokens: 32768, temperature: 0.3 },
  { id: '3', displayName: 'Qwen-72B-Chat', modelName: 'Qwen-72B-Chat-Int4', modelType: '通用大模型', supplier: '阿里云', deployType: '本地', status: '启用', createTime: '2026-01-20', updateTime: '2026-05-30', description: '通义千问 72B 量化版，本地私有化部署，保障数据安全', maxTokens: 8192, temperature: 0.7 },
  { id: '4', displayName: 'GPT-4o', modelName: 'gpt-4o', modelType: '多模态模型', supplier: 'OpenAI', deployType: '公网', status: '启用', createTime: '2026-03-01', updateTime: '2026-06-22', description: 'OpenAI 多模态旗舰模型，支持文本、图像、音频输入', endpoint: 'https://api.openai.com/v1', maxTokens: 128000, temperature: 0.7 },
  { id: '5', displayName: 'BGE-M3', modelName: 'bge-m3', modelType: '向量化模型', supplier: 'BAAI', deployType: '本地', status: '启用', createTime: '2026-02-28', updateTime: '2026-04-15', description: 'BGE-M3 多语言向量化模型，用于知识库文档嵌入', maxTokens: 8192 },
  { id: '6', displayName: 'BGE-Reranker-v2', modelName: 'bge-reranker-v2-m3', modelType: '重排序模型', supplier: 'BAAI', deployType: '本地', status: '启用', createTime: '2026-03-15', updateTime: '2026-05-10', description: 'BGE 重排序模型，用于检索结果精排', maxTokens: 8192 },
  { id: '7', displayName: 'GLM-4-Flash', modelName: 'glm-4-flash', modelType: '通用大模型', supplier: '智谱AI', deployType: '公网', status: '停用', createTime: '2026-04-01', updateTime: '2026-06-01', description: '智谱 GLM-4 Flash 快速推理版，适合简单问答场景', endpoint: 'https://open.bigmodel.cn/api/paas/v4', maxTokens: 128000, temperature: 0.7 },
  { id: '8', displayName: 'Whisper-Large-v3', modelName: 'whisper-large-v3', modelType: '语音识别', supplier: 'OpenAI', deployType: '本地', status: '启用', createTime: '2026-05-01', updateTime: '2026-06-10', description: 'OpenAI Whisper 语音识别模型，支持多语言语音转文字', maxTokens: 30000 },
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
export interface ToolItem {
  id: string;
  name: string;
  type: '内置' | 'API' | '工作流';
  provider: string;
  description: string;
  status: '启用' | '停用';
  callCount: number;
  successRate: number;
  createTime: string;
  author: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

export const mockTools: ToolItem[] = [
  { id: '1', name: '人口信息查询', type: 'API', provider: '全国人口基础信息库', description: '根据身份证号、姓名等要素检索人员基本信息、户籍信息、居住证信息', status: '启用', callCount: 12580, successRate: 99.2, createTime: '2026-01-10', author: '官方插件', params: [{ name: 'idCard', type: 'string', required: true, description: '身份证号' }, { name: 'name', type: 'string', required: false, description: '姓名' }] },
  { id: '2', name: '车辆轨迹查询', type: 'API', provider: '交警缉查布控系统', description: '基于车牌号查询辖区卡口过车记录和通行轨迹聚合分析', status: '启用', callCount: 8960, successRate: 98.5, createTime: '2026-01-15', author: '官方插件', params: [{ name: 'plateNumber', type: 'string', required: true, description: '车牌号' }, { name: 'startTime', type: 'string', required: true, description: '开始时间' }, { name: 'endTime', type: 'string', required: true, description: '结束时间' }] },
  { id: '3', name: '人像比对', type: '内置', provider: '人像多维比对引擎', description: '集成多种人脸识别算法，提供照片比对、视频流人脸检索及身份确认服务', status: '启用', callCount: 4520, successRate: 95.8, createTime: '2026-02-01', author: '第三方接入', params: [{ name: 'imageBase64', type: 'string', required: true, description: '人脸照片Base64编码' }, { name: 'threshold', type: 'number', required: false, description: '相似度阈值(0-1)' }] },
  { id: '4', name: '涉诈基站分析', type: '工作流', provider: '反诈中心', description: '解析电信诈骗嫌疑号码的基站漫游数据，推断作案窝点和移动轨迹', status: '启用', callCount: 2340, successRate: 94.1, createTime: '2026-03-10', author: '反诈中心', params: [{ name: 'phoneNumber', type: 'string', required: true, description: '嫌疑手机号' }, { name: 'timeRange', type: 'string', required: true, description: '查询时间范围' }] },
  { id: '5', name: '文书智能解析', type: '内置', provider: '文书解析引擎', description: '自动解析PDF/Word格式的法律文书、报案材料，提取结构化信息', status: '启用', callCount: 7890, successRate: 97.3, createTime: '2026-01-20', author: '官方插件', params: [{ name: 'fileUrl', type: 'string', required: true, description: '文件URL或本地路径' }, { name: 'docType', type: 'string', required: false, description: '文书类型' }] },
  { id: '6', name: '关系图谱生成', type: '内置', provider: '图谱分析引擎', description: '基于人员、通话、资金流水数据自动生成多维关系拓扑图', status: '启用', callCount: 3150, successRate: 96.7, createTime: '2026-02-15', author: '官方插件' },
  { id: '7', name: '警情统计分析', type: '工作流', provider: '指挥中心', description: '按辖区、时段、警情类别统计发案趋势并生成可视化图表', status: '启用', callCount: 5670, successRate: 99.0, createTime: '2026-04-01', author: '指挥中心' },
  { id: '8', name: '图像识别', type: '内置', provider: '图侦中心', description: '对监控截图和现场照片进行目标检测、行为识别和场景分类', status: '停用', callCount: 890, successRate: 88.5, createTime: '2026-03-20', author: '图侦中心' },
];

// ==================== 连接器（MCP）管理 ====================
export type ConnectorType = 'SSE' | 'stdio';
export type ConnectorStatus = '已连接' | '连接异常' | '离线';

export interface ConnectorItem {
  id: string;
  name: string;
  description: string;
  type: ConnectorType;
  status: ConnectorStatus;
  endpoint?: string;
  command?: string;
  toolCount: number;
  callCount: number;
  avgLatency: number; // ms
  createTime: string;
  updateTime: string;
}

export const mockConnectors: ConnectorItem[] = [
  { id: '1', name: '公安数据研判MCP', description: '接入公安大数据平台，提供人口、车辆、案件等多维度数据检索与分析能力', type: 'SSE', status: '已连接', endpoint: 'https://mcp.police.data.server/sse', toolCount: 8, callCount: 45200, avgLatency: 320, createTime: '2026-01-10', updateTime: '2026-06-22' },
  { id: '2', name: '市局人口库MCP', description: '内部人口基础信息查询服务，支持模糊搜索与精确匹配', type: 'SSE', status: '已连接', endpoint: 'https://mcp.internal.population.db/sse', toolCount: 4, callCount: 32100, avgLatency: 180, createTime: '2026-01-15', updateTime: '2026-06-20' },
  { id: '3', name: '天网视频分析MCP', description: '对接天网视频监控系统，提供实时视频流分析、目标追踪与行为识别能力', type: 'SSE', status: '连接异常', endpoint: 'https://mcp.tianwang.video/sse', toolCount: 5, callCount: 8900, avgLatency: 850, createTime: '2026-02-20', updateTime: '2026-06-25' },
  { id: '4', name: '公文处理引擎', description: '本地公文处理服务，提供文档格式化、签章验证与模板填充功能', type: 'stdio', command: 'node mcp-document-server.js', status: '已连接', toolCount: 3, callCount: 12700, avgLatency: 120, createTime: '2026-03-01', updateTime: '2026-06-18' },
  { id: '5', name: '短信通知网关', description: '统一短信发送网关，用于告警通知、验证码发送和群发通知', type: 'SSE', status: '离线', endpoint: 'https://mcp.sms.gateway/sse', toolCount: 2, callCount: 5600, avgLatency: 450, createTime: '2026-04-10', updateTime: '2026-06-24' },
];

// ==================== 数据连接管理 ====================
export type DbType = 'MySQL' | 'Oracle' | 'PostgreSQL' | 'MongoDB' | 'Elasticsearch' | 'Redis';

export interface DataSourceItem {
  id: string;
  name: string;
  dbType: DbType;
  host: string;
  port: number;
  dbName: string;
  status: '已连接' | '连接异常' | '未连接';
  creator: string;
  createTime: string;
  updateTime: string;
  description: string;
}

export const mockDataSources: DataSourceItem[] = [
  { id: '1', name: '核心业务主库', dbType: 'MySQL', host: '192.168.1.100', port: 3306, dbName: 'core_business', status: '已连接', creator: '张三', createTime: '2026-01-10', updateTime: '2026-06-20', description: '存储核心业务数据，包括案件信息、人员档案、执法记录等' },
  { id: '2', name: '历史案件存档库', dbType: 'Oracle', host: '192.168.1.101', port: 1521, dbName: 'history_archive', status: '已连接', creator: '李四', createTime: '2025-11-20', updateTime: '2026-06-15', description: '历史案件数据归档库，存储5年以上的结案案件信息' },
  { id: '3', name: '用户画像分析库', dbType: 'PostgreSQL', host: '192.168.2.50', port: 5432, dbName: 'user_profiles', status: '已连接', creator: '王五', createTime: '2026-03-05', updateTime: '2026-06-18', description: '存储用户行为数据与画像标签，支撑智能推荐和个性化分析' },
  { id: '4', name: '日志采集库', dbType: 'Elasticsearch', host: '192.168.3.10', port: 9200, dbName: 'app-logs-2026', status: '连接异常', creator: '赵六', createTime: '2026-02-14', updateTime: '2026-06-25', description: '采集平台操作日志、API调用日志和系统运行日志，用于审计与监控' },
  { id: '5', name: '缓存服务', dbType: 'Redis', host: '192.168.1.200', port: 6379, dbName: 'cache-0', status: '已连接', creator: '张三', createTime: '2026-01-05', updateTime: '2026-06-22', description: 'Redis 缓存集群，用于会话管理、热点数据缓存和消息队列' },
];

// ==================== 智能体管理 ====================
export type AgentType = '标准智能体' | '流程智能体' | '自主智能体';
export type AgentStatus = '草稿' | '已发布' | '已下架';

export interface AgentItem {
  id: string;
  name: string;
  avatar?: string;
  type: AgentType;
  status: AgentStatus;
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
}

export const mockAgents: AgentItem[] = [
  { id: '1', name: '110接警警情分析助手', type: '标准智能体', status: '已发布', description: '从接警通话录音中提取标准警情要素，自动分类录入接处警系统', spaceName: '指挥中心', modelName: 'DeepSeek-Chat', creator: '李警官', createTime: '2026-05-18', publishTime: '2026-06-01', updateTime: '2026-06-20', callCount: 12860, successRate: 98.7, activeUsers: 45, tokenConsumption: 2560000, knowledgeBases: ['警情分类知识库', '接处警规程库'], tools: ['文书智能解析'] },
  { id: '2', name: '电诈资金穿透研判助手', type: '流程智能体', status: '已发布', description: '分析涉诈资金链路，识别可疑卡号集群，辅助反诈民警研判洗钱路径', spaceName: '反诈中心', modelName: 'DeepSeek-Reasoner', creator: '王大队', createTime: '2026-05-12', publishTime: '2026-06-05', updateTime: '2026-06-22', callCount: 5620, successRate: 96.1, activeUsers: 28, tokenConsumption: 4320000, knowledgeBases: ['反诈案例知识库', '洗钱模式特征库'], tools: ['关系图谱生成', '涉诈基站分析'] },
  { id: '3', name: '交通事故责任认定助手', type: '标准智能体', status: '已发布', description: '基于事故现场信息和监控描述，分析事故原因并判定责任方', spaceName: '交警支队', modelName: 'GPT-4o', creator: '赵警官', createTime: '2026-06-01', publishTime: '2026-06-12', updateTime: '2026-06-24', callCount: 2340, successRate: 94.5, activeUsers: 18, tokenConsumption: 1890000, knowledgeBases: ['道路交通安全法规库'], tools: ['车辆轨迹查询', '图像识别'] },
  { id: '4', name: '刑事案件案情摘要生成', type: '标准智能体', status: '已发布', description: '自动解析案件材料生成案情摘要报告，辅助刑侦民警快速梳理案情', spaceName: '刑警大队', modelName: 'Qwen-72B-Chat', creator: '陈队长', createTime: '2026-05-20', publishTime: '2026-06-08', updateTime: '2026-06-23', callCount: 8340, successRate: 97.3, activeUsers: 32, tokenConsumption: 3150000, knowledgeBases: ['案件卷宗库', '法律法规库'], tools: ['文书智能解析', '人口信息查询'] },
  { id: '5', name: '走失人员协查通报助手', type: '自主智能体', status: '已发布', description: '根据家属报案信息自动生成标准格式协查通报和寻人提示', spaceName: '治安支队', modelName: 'DeepSeek-Chat', creator: '张警官', createTime: '2026-04-30', publishTime: '2026-05-20', updateTime: '2026-06-18', callCount: 1980, successRate: 92.8, activeUsers: 15, tokenConsumption: 980000, tools: ['图像识别'] },
  { id: '6', name: '巡逻路线智能规划', type: '自主智能体', status: '草稿', description: '基于历史案发数据和实时警情分布，智能推荐最优巡逻路线', spaceName: '巡特警支队', modelName: 'GLM-4-Flash', creator: '刘队长', createTime: '2026-06-15', updateTime: '2026-06-24', callCount: 120, successRate: 89.0, activeUsers: 3, tokenConsumption: 45000, tools: ['警情统计分析'] },
  { id: '7', name: '笔录文书智能校对', type: '标准智能体', status: '已发布', description: '对笔录文书进行语法纠错、格式规范和法条引用校验', spaceName: '法制大队', modelName: 'GPT-4o', creator: '周科长', createTime: '2026-03-10', publishTime: '2026-04-15', updateTime: '2026-06-20', callCount: 15200, successRate: 99.1, activeUsers: 56, tokenConsumption: 5200000, knowledgeBases: ['法律法规库', '文书规范库'], tools: ['文书智能解析'] },
  { id: '8', name: '社区警务工作台', type: '标准智能体', status: '已发布', description: '辅助社区民警完成人员信息管理、重点人口走访记录和矛盾调解记录', spaceName: '派出所', modelName: 'Qwen-72B-Chat', creator: '管理员', createTime: '2026-04-01', publishTime: '2026-05-01', updateTime: '2026-06-21', callCount: 23400, successRate: 98.2, activeUsers: 128, tokenConsumption: 7800000, knowledgeBases: ['户籍信息库', '社区管理规范'], tools: ['人口信息查询'] },
];

// ==================== 空间运营 / 运维 ====================
export type SpaceStatus = '启用' | '停用' | '归档';

export interface SpaceItem {
  id: string;
  name: string;
  icon?: string;
  dept: string;
  type: '个人空间' | '工作空间';
  status: SpaceStatus;
  memberCount: number;
  agentCount: number;
  knowledgeCount: number;
  promptCount: number;
  toolCount: number;
  creator: string;
  createTime: string;
  updateTime: string;
  /** 配额 */
  modelQuotaUsed: number;
  modelQuotaLimit: number;
  storageUsed: number;
  storageLimit: number;
  agentQuotaUsed: number;
  agentQuotaLimit: number;
}

export const mockSpaces: SpaceItem[] = [
  { id: '1', name: '指挥中心空间', dept: '指挥中心', type: '工作空间', status: '启用', memberCount: 32, agentCount: 5, knowledgeCount: 8, promptCount: 12, toolCount: 6, creator: '李警官', createTime: '2026-01-15', updateTime: '2026-06-20', modelQuotaUsed: 45200, modelQuotaLimit: 100000, storageUsed: 2560, storageLimit: 10000, agentQuotaUsed: 5, agentQuotaLimit: 10 },
  { id: '2', name: '反诈中心空间', dept: '反诈中心', type: '工作空间', status: '启用', memberCount: 18, agentCount: 3, knowledgeCount: 5, promptCount: 8, toolCount: 4, creator: '王大队', createTime: '2026-02-01', updateTime: '2026-06-18', modelQuotaUsed: 32100, modelQuotaLimit: 50000, storageUsed: 1820, storageLimit: 5000, agentQuotaUsed: 3, agentQuotaLimit: 5 },
  { id: '3', name: '交警支队空间', dept: '交警支队', type: '工作空间', status: '启用', memberCount: 24, agentCount: 4, knowledgeCount: 6, promptCount: 10, toolCount: 5, creator: '赵警官', createTime: '2026-03-10', updateTime: '2026-06-15', modelQuotaUsed: 58000, modelQuotaLimit: 80000, storageUsed: 4200, storageLimit: 8000, agentQuotaUsed: 4, agentQuotaLimit: 8 },
  { id: '4', name: '刑警大队空间', dept: '刑警大队', type: '工作空间', status: '启用', memberCount: 28, agentCount: 6, knowledgeCount: 10, promptCount: 15, toolCount: 7, creator: '陈队长', createTime: '2026-01-20', updateTime: '2026-06-22', modelQuotaUsed: 72000, modelQuotaLimit: 120000, storageUsed: 6800, storageLimit: 12000, agentQuotaUsed: 6, agentQuotaLimit: 12 },
  { id: '5', name: '治安支队空间', dept: '治安支队', type: '工作空间', status: '停用', memberCount: 12, agentCount: 2, knowledgeCount: 3, promptCount: 5, toolCount: 2, creator: '张警官', createTime: '2026-04-01', updateTime: '2026-06-10', modelQuotaUsed: 8900, modelQuotaLimit: 20000, storageUsed: 1200, storageLimit: 3000, agentQuotaUsed: 2, agentQuotaLimit: 5 },
  { id: '6', name: '法制大队空间', dept: '法制大队', type: '工作空间', status: '启用', memberCount: 16, agentCount: 3, knowledgeCount: 12, promptCount: 20, toolCount: 3, creator: '周科长', createTime: '2026-03-01', updateTime: '2026-06-20', modelQuotaUsed: 38000, modelQuotaLimit: 50000, storageUsed: 5200, storageLimit: 8000, agentQuotaUsed: 3, agentQuotaLimit: 6 },
  { id: '7', name: '社区警务空间', dept: '派出所', type: '工作空间', status: '启用', memberCount: 45, agentCount: 4, knowledgeCount: 5, promptCount: 8, toolCount: 3, creator: '管理员', createTime: '2026-01-10', updateTime: '2026-06-21', modelQuotaUsed: 92000, modelQuotaLimit: 150000, storageUsed: 7800, storageLimit: 15000, agentQuotaUsed: 4, agentQuotaLimit: 8 },
  { id: '8', name: '科技信息化大队', dept: '科信大队', type: '工作空间', status: '启用', memberCount: 12, agentCount: 2, knowledgeCount: 4, promptCount: 3, toolCount: 5, creator: '技术员', createTime: '2025-12-01', updateTime: '2026-06-24', modelQuotaUsed: 15000, modelQuotaLimit: 30000, storageUsed: 3000, storageLimit: 5000, agentQuotaUsed: 2, agentQuotaLimit: 5 },
];

// ==================== 空间成员 ====================
export interface SpaceMember {
  id: string;
  name: string;
  avatar?: string;
  dept: string;
  role: '创建人' | '管理员' | '普通用户';
  joinTime: string;
  lastActive: string;
}

export const mockMembers: SpaceMember[] = [
  { id: '1', name: '演示用户', dept: '科信大队', role: '创建人', joinTime: '2025-12-01', lastActive: '2026-06-25 14:30' },
  { id: '2', name: '李警官', dept: '指挥中心', role: '管理员', joinTime: '2026-01-05', lastActive: '2026-06-25 10:15' },
  { id: '3', name: '王大队', dept: '反诈中心', role: '管理员', joinTime: '2026-02-10', lastActive: '2026-06-24 16:45' },
  { id: '4', name: '赵警官', dept: '交警支队', role: '普通用户', joinTime: '2026-03-15', lastActive: '2026-06-25 09:00' },
  { id: '5', name: '陈队长', dept: '刑警大队', role: '普通用户', joinTime: '2026-01-20', lastActive: '2026-06-25 11:30' },
  { id: '6', name: '张警官', dept: '治安支队', role: '普通用户', joinTime: '2026-04-01', lastActive: '2026-06-24 08:00' },
  { id: '7', name: '周科长', dept: '法制大队', role: '管理员', joinTime: '2026-03-01', lastActive: '2026-06-25 13:00' },
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
  { id: '1', time: '2026-06-25 14:30:22', operator: '演示用户', type: '发布', target: '交通事故责任认定助手', detail: '发布了智能体 v2.1 版本', spaceName: '交警支队' },
  { id: '2', time: '2026-06-25 13:15:08', operator: '李警官', type: '修改配置', target: '110接警警情分析助手', detail: '更新了提示词模板，优化接警分类逻辑', spaceName: '指挥中心' },
  { id: '3', time: '2026-06-25 11:45:33', operator: '周科长', type: '添加成员', target: '法制大队空间', detail: '添加成员：孙法官（管理员）', spaceName: '法制大队' },
  { id: '4', time: '2026-06-24 16:20:15', operator: '王大队', type: '创建', target: '涉诈APP分析助手', detail: '创建了新的自主智能体', spaceName: '反诈中心' },
  { id: '5', time: '2026-06-24 14:10:42', operator: '陈队长', type: '删除', target: '旧版案件摘要模板', detail: '删除了废弃的提示词模板', spaceName: '刑警大队' },
  { id: '6', time: '2026-06-24 09:30:18', operator: '演示用户', type: '修改设置', target: '空间基本设置', detail: '修改了空间图标和描述', spaceName: '科信大队' },
  { id: '7', time: '2026-06-23 17:00:55', operator: '赵警官', type: '下架', target: '图像识别工具', detail: '因维护需要暂时下架图像识别工具', spaceName: '交警支队' },
  { id: '8', time: '2026-06-23 10:25:30', operator: '张警官', type: '接口', target: 'PersonInfoAPI', detail: '接入了新的人口信息查询接口', spaceName: '治安支队' },
  { id: '9', time: '2026-06-22 15:40:12', operator: '管理员', type: '接入模型', target: 'DeepSeek-Chat', detail: '接入了 DeepSeek 对话模型，配置公网访问', spaceName: '派出所' },
  { id: '10', time: '2026-06-22 08:15:45', operator: '刘队长', type: '创建', target: '巡逻路线智能规划', detail: '基于案发数据创建了巡逻路线智能体', spaceName: '巡特警支队' },
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

export const mockTemplates: AgentTemplate[] = [
  { id: 't1', name: '接处警警情分析', description: '从接警通话中快速提取结构化警情要素并自动分类录入，适用于各级110接警中心', scene: '智慧警务', type: '系统预置', modelName: 'DeepSeek-Chat', knowledgeBases: ['警情分类知识库', '接处警规程库'], tools: ['文书智能解析', '人口信息查询'], useCount: 1280, createTime: '2026-01-10', tags: ['接警', '警情分析', '信息提取'] },
  { id: 't2', name: '交通事故认定', description: '基于现场勘查记录和监控描述自动分析事故原因并判定责任，辅助事故处理民警', scene: '交通管理', type: '系统预置', modelName: 'GPT-4o', knowledgeBases: ['道路交通安全法规库'], tools: ['车辆轨迹查询', '图像识别'], useCount: 856, createTime: '2026-02-15', tags: ['交通', '事故认定', '责任判定'] },
  { id: 't3', name: '反诈资金研判', description: '分析涉诈资金链路，识别可疑卡号和洗钱路径，反诈民警的标准研判工具', scene: '刑事侦查', type: '系统预置', modelName: 'DeepSeek-Reasoner', knowledgeBases: ['反诈案例知识库', '洗钱模式特征库'], tools: ['关系图谱生成', '涉诈基站分析'], useCount: 654, createTime: '2026-03-01', tags: ['反诈', '资金穿透', '洗钱'] },
  { id: 't4', name: '笔录智能校对', description: '对笔录文书进行语法纠错、格式规范和法律条款引用校验', scene: '执法规范', type: '系统预置', modelName: 'GPT-4o', knowledgeBases: ['法律法规库', '文书规范库'], tools: ['文书智能解析'], useCount: 1120, createTime: '2026-01-20', tags: ['笔录', '校对', '法条引用'] },
  { id: 't5', name: '社区警务助手', description: '社区民警的日常助手：人口管理、走访记录、矛盾调解一站式工作台', scene: '治安管理', type: '自定义', modelName: 'Qwen-72B-Chat', knowledgeBases: ['户籍信息库', '社区管理规范'], tools: ['人口信息查询'], useCount: 340, createTime: '2026-04-10', tags: ['社区', '走访', '户籍'] },
  { id: 't6', name: '案件摘要生成', description: '智能化案件材料解析与案情摘要自动生成，提升办案效率', scene: '刑事侦查', type: '自定义', modelName: 'Qwen-72B-Chat', knowledgeBases: ['案件卷宗库', '法律法规库'], tools: ['文书智能解析'], useCount: 210, createTime: '2026-05-20', tags: ['案件', '摘要', '自动化'] },
];
