import type { PublishApproval, ResourceApplication, ResourceAuditLog, ResourceItem, SpaceResourceGrant } from './types';

const intro = (name: string, usage: string) => `## ${name}\n\n${usage}\n\n### 接入说明\n\n1. 在资源广场获取资源。\n2. 前往“我的资源”完成安装。\n3. API Key 请在空间管理中查看。`;

export const initialResources: ResourceItem[] = [
  {
    id: '1', type: 'knowledge', name: '智能客服知识库',
    description: '基于大模型的自动化客户服务助手相关知识储备，支持常见问题自动回复与问题分类。',
    owner: '张三', updateTime: '2026-05-10', heat: 1200, status: 'view_only',
    publishStatus: 'published', publicStrategy: 'visible', resourceKey: 'customer-service-kb',
    gatewayPath: '/gateway/customer-service-kb', knowledgeType: '文档知识库',
    markdownIntro: intro('智能客服知识库', '提供客户服务制度、常见问题和标准回复模板的统一检索能力。'),
  },
  {
    id: '3', type: 'model', name: 'Qwen-Max', description: '通义千问超大规模语言模型，具备极强的理解和生成能力。',
    owner: '李四', updateTime: '2026-05-01', heat: 5400, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', isPinned: true, resourceKey: 'qwen-max', gatewayPath: '/gateway/qwen-max',
    modelType: 'LargeModel', deployment: '公网', modelName: 'qwen-max', baseurl: 'https://dashscope.aliyuncs.com', gatewayMode: 'builtin',
    path: '/chat/completions', markdownIntro: intro('Qwen-Max', '适用于复杂问答、内容生成和智能体推理场景。'),
  },
  {
    id: '4', type: 'model', name: 'BGE-M3', description: '多语言、多粒度、多任务的通用向量模型。',
    owner: '赵六', updateTime: '2026-04-20', heat: 3200, status: 'view_only', publishStatus: 'published',
    publicStrategy: 'visible', resourceKey: 'bge-m3', gatewayPath: '/gateway/bge-m3', modelType: 'VectorModel', gatewayMode: 'builtin',
    deployment: 'Local', path: '/embeddings', markdownIntro: intro('BGE-M3', '适用于知识库向量化和语义检索。'),
  },
  {
    id: '16', type: 'model', name: 'Existing-Qwen-Mock', description: '用于模拟已有数据拉取的预配置模型资源。',
    owner: '演示用户', updateTime: '2026-05-28', heat: 0, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', resourceKey: 'existing-qwen-mock', gatewayPath: '/gateway/existing-qwen-mock',
    modelType: 'LargeModel', deployment: 'Public', gatewayMode: 'builtin', markdownIntro: intro('Existing-Qwen-Mock', '用于演示已有模型资源的直接获取流程。'),
  },
  {
    id: '5', type: 'knowledge', name: '人力资源规章制度', description: '公司最新考勤、休假、报销等制度文档库。',
    owner: '钱七七', updateTime: '2026-05-11', heat: 450, status: 'authorized', publishStatus: 'offline',
    publicStrategy: 'visible', resourceKey: 'hr-rules', gatewayPath: '/gateway/hr-rules', knowledgeType: '文档知识库',
    markdownIntro: intro('人力资源规章制度', '演示已下架资源在我的资源中的状态表现。'),
  },
  {
    id: '9', type: 'api', name: '企业微信通知', description: '快速调用企微接口给指定人员或群发送消息。',
    owner: '李四', updateTime: '2026-01-20', heat: 5040, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', resourceKey: 'wechat-notify', gatewayPath: '/gateway/wechat-notify',
    apiEndpoint: '/cgi-bin/message/send', method: 'POST', authType: 'API Key',
    markdownIntro: intro('企业微信通知', '为智能体提供统一的消息通知能力。'),
  },
  {
    id: '10', type: 'mcp', name: 'GitHub MCP', description: 'GitHub Model Context Protocol 服务整合，允许模型读取代码库。',
    owner: '王五', updateTime: '2026-05-13', heat: 560, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', resourceKey: 'github-mcp', gatewayPath: '/gateway/github-mcp',
    mcpServerEndpoint: 'https://mcp.example.local/github', mcpServerIdentifier: 'github-mcp', mcpTransport: 'SSE',
    markdownIntro: intro('GitHub MCP', '为智能体提供代码仓库读取和检索能力。'),
  },
  {
    id: '13', type: 'model', name: '我的私有预训练模型', description: '我自己在本地训练的小模型，用于特定代码生成。',
    owner: '演示用户', updateTime: '2026-05-13', heat: 12, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', resourceKey: 'private-pretrain-model', gatewayPath: '/gateway/private-pretrain-model',
    modelType: 'LargeModel', deployment: 'Local', gatewayMode: 'builtin', markdownIntro: intro('我的私有预训练模型', '演示个人发布资源的管理、授权与审计。'),
  },
  {
    id: '14', type: 'knowledge', name: '个人积累的开发文档', description: '整理的常用开发环境配置指南及疑难问题解决方案。',
    owner: '演示用户', updateTime: '2026-05-10', heat: 5, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'visible', resourceKey: 'dev-notes-kb', gatewayPath: '/gateway/dev-notes-kb', knowledgeType: '文档知识库',
    markdownIntro: intro('个人积累的开发文档', '用于演示公开可见、授权可用的知识库资源。'),
  },
  {
    id: '15', type: 'knowledge', name: '自备工作笔记本', description: '这是一个新建发布到广场使用的自用工作笔记本。',
    owner: '演示用户', updateTime: '2026-05-14', heat: 0, status: 'authorized', publishStatus: 'offline',
    publicStrategy: 'whitelist', resourceKey: 'work-notebook', gatewayPath: '/gateway/work-notebook', knowledgeType: '文档知识库',
    visibleTargets: [{ id: 'v1', name: '行政部' }, { id: 'v2', name: '李想' }],
    markdownIntro: intro('自备工作笔记本', '用于演示仅授权对象可见资源。'),
  },
  {
    id: 'invalid-1', type: 'api', name: '被删除的旧天气API', description: '此 API 已被管理员删除，展示失效状态。',
    owner: '管理员', updateTime: '2026-06-01', heat: 10, status: 'authorized', publishStatus: 'offline',
    publicStrategy: 'public', isDeleted: true,
  },
  {
    id: 'invalid-2', type: 'model', name: '过期的临时活动大模型', description: '活动结束后授权已到期自动失效。',
    owner: '运营团队', updateTime: '2026-06-15', heat: 30, status: 'authorized', publishStatus: 'offline',
    publicStrategy: 'visible', modelType: 'LargeModel', gatewayMode: 'builtin',
  },
  {
    id: 'invalid-3', type: 'mcp', name: '收回授权的内部工具', description: '管理员已主动移除了您的授权。',
    owner: '安全部', updateTime: '2026-06-20', heat: 5, status: 'revoked', publishStatus: 'offline',
    publicStrategy: 'whitelist',
  },
  {
    id: 'pub-approval-demo', type: 'api', name: '用户发布的天气API',
    description: '普通用户提交发布审批的示例资源，用于演示审批流程。',
    owner: '演示用户', updateTime: '2026-06-25', heat: 0, status: 'authorized', publishStatus: 'reviewing',
    publicStrategy: 'public', resourceKey: 'weather-api-v2', gatewayPath: '/gateway/weather-api-v2',
    apiEndpoint: '/v1/weather', method: 'GET', authType: 'API Key',
  },
  {
    id: 'unpub-demo', type: 'knowledge', name: '待下架的业务文档',
    description: '演示用户申请下架的示例资源，当前处于下架审批中状态。',
    owner: '演示用户', updateTime: '2026-06-28', heat: 5, status: 'authorized', publishStatus: 'unpublishing',
    publicStrategy: 'visible', resourceKey: 'legacy-docs', gatewayPath: '/gateway/legacy-docs', knowledgeType: '文档知识库',
  },
  {
    id: 'pending-user-demo', type: 'model', name: '用户私有模型',
    description: '管理员创建但未上架的模型资源，待上架状态。',
    owner: '演示用户', updateTime: '2026-07-01', heat: 0, status: 'authorized', publishStatus: 'pending',
    publicStrategy: 'whitelist', resourceKey: 'private-model', gatewayPath: '/gateway/private-model',
    visibleTargets: [{ id: 'v1', name: '产品部' }, { id: 'v2', name: '技术部' }],
    modelType: 'LargeModel', deployment: 'Local', gatewayMode: 'builtin',
  },
  {
    id: 'pub-whitelist-demo', type: 'api', name: '仅授权可见的内部API',
    description: '普通用户创建的白名单资源，发布审批中，用于演示仅授权对象可见的审批流程。',
    owner: '演示用户', updateTime: '2026-07-05', heat: 0, status: 'authorized', publishStatus: 'reviewing',
    publicStrategy: 'whitelist', resourceKey: 'internal-whitelist-api', gatewayPath: '/gateway/internal-whitelist-api',
    visibleTargets: [{ id: 'v1', name: '产品部' }, { id: 'v2', name: '研发部' }],
    apiEndpoint: '/v1/internal', method: 'GET', authType: 'API Key',
  },
  {
    id: 'skill-1', type: 'skill', name: '警情分类与分级',
    description: '根据警情描述自动分类并判定紧急等级，支持多级分类标签。',
    owner: '演示用户', updateTime: '2026-08-01', heat: 320, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'public', resourceKey: 'police-classifier', gatewayPath: '/gateway/police-classifier',
    skillConfig: {
      inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { category: { type: 'string' }, level: { type: 'string' } } },
      timeout: 30, retryCount: 0,
      skillMd: '# 警情分类与分级\n\n## 使用场景\n\n适用于 110 接处警、线索核查等场景。\n\n## 用法\n\n- 输入：警情描述文本\n- 输出：警情类别与紧急等级',
    },
    markdownIntro: intro('警情分类与分级', '根据警情描述自动分类并判定紧急等级。'),
  },
  {
    id: 'skill-2', type: 'skill', name: '身份证信息核验',
    description: '调用人口信息查询接口，核验身份证号与姓名的匹配性。',
    owner: '张三', updateTime: '2026-08-10', heat: 150, status: 'authorized', publishStatus: 'published',
    publicStrategy: 'visible', resourceKey: 'id-card-verify', gatewayPath: '/gateway/id-card-verify',
    skillConfig: {
      inputSchema: { type: 'object', properties: { idNo: { type: 'string' }, name: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { matched: { type: 'boolean' } } },
      timeout: 10, retryCount: 1,
      skillMd: '# 身份证信息核验\n\n## 使用场景\n\n人员身份核验、实名认证等场景。\n\n## 用法\n\n- 输入：身份证号 + 姓名\n- 输出：是否匹配',
    },
    markdownIntro: intro('身份证信息核验', '核验身份证号与姓名的匹配性。'),
  },
];

export const initialGrants: SpaceResourceGrant[] = [
  { id: '0:3', spaceId: '0', resourceId: '3', source: '完全公开', acquiredAt: '2026-05-01', installStatus: 'installed' },
  { id: '0:10', spaceId: '0', resourceId: '10', source: '完全公开', acquiredAt: '2026-05-13', installStatus: 'not_installed' },
  { id: '0:13', spaceId: '0', resourceId: '13', source: '管理员授权', acquiredAt: '2026-05-13', installStatus: 'installed' },
  { id: '0:14', spaceId: '0', resourceId: '14', source: '广场申请', acquiredAt: '2026-05-10', installStatus: 'not_installed' },
  { id: '0:invalid-1', spaceId: '0', resourceId: 'invalid-1', source: '管理员授权', acquiredAt: '2026-04-01', installStatus: 'failed' },
  { id: '0:invalid-2', spaceId: '0', resourceId: 'invalid-2', source: '广场申请', acquiredAt: '2026-04-12', expireDate: '2026-06-15', installStatus: 'installed', expired: true },
  { id: '0:invalid-3', spaceId: '0', resourceId: 'invalid-3', source: '管理员授权', acquiredAt: '2026-05-01', installStatus: 'installed', revoked: true },
  { id: '1:3', spaceId: '1', resourceId: '3', source: '管理员授权', acquiredAt: '2026-04-25', installStatus: 'installed' },
  { id: '1:9', spaceId: '1', resourceId: '9', source: '完全公开', acquiredAt: '2026-03-15', installStatus: 'installed' },
  { id: '2:4', spaceId: '2', resourceId: '4', source: '广场申请', acquiredAt: '2026-04-20', expireDate: '2026-12-31', installStatus: 'not_installed' },
  { id: '3:10', spaceId: '3', resourceId: '10', source: '管理员授权', acquiredAt: '2026-05-13', installStatus: 'failed' },
];

export const initialApplications: ResourceApplication[] = [
  { id: 'app-1', resourceId: '1', spaceId: '2', applicant: '张三', dept: '反诈中心', applyTime: '2026-05-13 10:20', duration: 'permanent', reason: '需要使用此知识库进行自动化文案回复。', status: 'pending' },
  { id: 'app-2', resourceId: '4', spaceId: '3', applicant: '李四', dept: '交警支队', applyTime: '2026-05-13 11:05', duration: 'custom', expireDate: '2026-12-31', reason: '辅助业务数据语义检索。', status: 'pending' },
  { id: 'app-3', resourceId: '10', spaceId: '4', applicant: '王五', dept: '刑警大队', applyTime: '2026-05-13 11:45', duration: 'permanent', reason: '项目工程自动化提效实践。', status: 'pending' },
  { id: 'history-1', resourceId: '9', spaceId: '1', applicant: '赵六', dept: '指挥中心', applyTime: '2026-05-12 14:20', duration: 'permanent', reason: '运营消息通知。', status: 'approved', operator: '演示用户', opinion: '业务场景需要，审批通过', approvalTime: '2026-05-12 15:00' },
  { id: 'history-2', resourceId: '1', spaceId: '3', applicant: '钱七七', dept: '交警支队', applyTime: '2026-05-11 09:12', duration: 'custom', expireDate: '2026-08-31', reason: '知识库复用。', status: 'rejected', operator: '演示用户', opinion: '共享范围不符合规范', approvalTime: '2026-05-11 10:30' },
  // 当前默认空间（spaceId: '0'）的申请记录
  { id: 'my-app-1', resourceId: '14', spaceId: '0', applicant: '演示用户', dept: '研发中心', applyTime: '2026-07-20 09:15', duration: 'permanent', reason: '需要参考开发文档进行环境配置和问题排查。', status: 'approved', operator: '管理员', opinion: '业务需要，审批通过', approvalTime: '2026-07-20 14:30' },
  { id: 'my-app-2', resourceId: '10', spaceId: '0', applicant: '演示用户', dept: '研发中心', applyTime: '2026-07-25 10:30', duration: 'custom', expireDate: '2026-12-31', reason: '项目需要集成GitHub代码库读取能力。', status: 'pending' },
  { id: 'my-app-3', resourceId: '4', spaceId: '0', applicant: '演示用户', dept: '研发中心', applyTime: '2026-07-18 16:00', duration: 'permanent', reason: '需要使用BGE-M3向量模型进行语义检索实验。', status: 'rejected', operator: '管理员', opinion: '向量模型资源暂不对个人开放，请使用团队共享资源。', approvalTime: '2026-07-19 09:00' },
  // 创建人审批节点上的使用申请（演示用户作为资源创建者需要审批的）
  { id: 'creator-app-1', resourceId: '13', spaceId: '2', applicant: '张三', dept: '反诈中心', applyTime: '2026-06-26 10:00', duration: 'permanent', reason: '需要使用此模型进行特定代码生成任务。', status: 'pending', currentNode: 'creator' },
  { id: 'creator-app-2', resourceId: '14', spaceId: '3', applicant: '李四', dept: '交警支队', applyTime: '2026-06-27 14:30', duration: 'custom', expireDate: '2026-12-31', reason: '用于团队开发环境搭建参考。', status: 'pending', currentNode: 'creator' },
  { id: 'creator-app-history', resourceId: '13', spaceId: '4', applicant: '王五', dept: '刑警大队', applyTime: '2026-06-20 09:00', duration: 'permanent', reason: '项目预训练模型需求。', status: 'approved', operator: '演示用户', opinion: '业务明确，同意授权', approvalTime: '2026-06-20 15:00', currentNode: 'creator' },
];

export const initialAuditLogs: ResourceAuditLog[] = [
  { id: 'log-1', resourceId: '1', time: '2026-06-04 16:30', operator: '系统自动', action: '授权到期自动失效', detail: '授权到期后自动移除使用权限。' },
  { id: 'log-2', resourceId: '1', time: '2026-06-04 14:15', operator: '系统管理员', action: '权限审计批量授权', detail: '向指定工作空间批量下发资源使用权。' },
  { id: 'log-3', resourceId: '13', time: '2026-05-15 14:20', operator: '张三', action: '公开策略变更', detail: '仅授权可见变更为全员可见。' },
  { id: 'log-4', resourceId: '5', time: '2026-05-10 10:00', operator: '王五', action: '提交发布申请', detail: '申请发布至资源广场。' },
];

export interface ExternalGatewayModel {
  modelName: string;
  cluster: string;
  name: string;
  resourceKey: string;
  description: string;
  baseurl: string;
  path: string;
}

/** 模拟外部大模型网关「模型路由选择接口」返回的模型路由数据 */
export const externalGatewayModels: ExternalGatewayModel[] = [
  { modelName: 'gpt-4o', cluster: '249', name: 'GPT-4o 大模型', resourceKey: 'gpt-4o', description: '外部网关提供的 GPT-4o 大模型服务，用于复杂推理与内容生成。', baseurl: 'https://api.external-gw.com/v1', path: '/chat/completions' },
  { modelName: 'claude-3-5-sonnet', cluster: '249', name: 'Claude 3.5 Sonnet', resourceKey: 'claude-3-5-sonnet', description: '外部网关提供的 Claude 大模型服务，擅长长文本与代码理解。', baseurl: 'https://api.external-gw.com/v1', path: '/chat/completions' },
  { modelName: 'deepseek-v3', cluster: '249', name: 'DeepSeek-V3', resourceKey: 'deepseek-v3', description: '外部网关提供的 DeepSeek 大模型服务，兼顾性能与成本。', baseurl: 'https://api.external-gw.com/v1', path: '/chat/completions' },
  { modelName: 'bge-large-zh', cluster: '249', name: 'BGE-Large 向量模型', resourceKey: 'bge-large-zh', description: '外部网关提供的中文向量化模型服务。', baseurl: 'https://api.external-gw.com/v1', path: '/embeddings' },
];

export const initialPublishApprovals: PublishApproval[] = [
  {
    id: 'pub-pending-1', resourceId: 'pub-approval-demo', applicant: '演示用户',
    applyType: 'publish', applyTime: '2026-06-25 09:00', status: 'pending',
  },
  {
    id: 'pub-pending-2', resourceId: 'unpub-demo', applicant: '演示用户',
    applyType: 'offline', applyTime: '2026-06-28 11:00', status: 'pending',
    reason: '该文档内容已过时，不再维护。',
  },
  {
    id: 'pub-pending-3', resourceId: 'pub-whitelist-demo', applicant: '演示用户',
    applyType: 'publish', applyTime: '2026-07-05 14:30', status: 'pending',
  },
  {
    id: 'pub-history-1', resourceId: '13', applicant: '演示用户',
    applyType: 'publish', applyTime: '2026-05-12 08:30', status: 'approved',
    operator: '管理员', opinion: '内容合规，同意发布', approvalTime: '2026-05-12 12:00',
  },
  {
    id: 'pub-history-2', resourceId: '15', applicant: '演示用户',
    applyType: 'publish', applyTime: '2026-05-13 10:00', status: 'rejected',
    operator: '管理员', opinion: '描述不够清晰，请完善后重新提交', approvalTime: '2026-05-13 14:00',
  },
];

