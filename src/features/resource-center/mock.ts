import type { ResourceApplication, ResourceAuditLog, ResourceItem, SpaceResourceGrant } from './types';

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
];

export const initialAuditLogs: ResourceAuditLog[] = [
  { id: 'log-1', resourceId: '1', time: '2026-06-04 16:30', operator: '系统自动', action: '授权到期自动失效', detail: '授权到期后自动移除使用权限。' },
  { id: 'log-2', resourceId: '1', time: '2026-06-04 14:15', operator: '系统管理员', action: '权限审计批量授权', detail: '向指定工作空间批量下发资源使用权。' },
  { id: 'log-3', resourceId: '13', time: '2026-05-15 14:20', operator: '张三', action: '公开策略变更', detail: '仅授权可见变更为全员可见。' },
  { id: 'log-4', resourceId: '5', time: '2026-05-10 10:00', operator: '王五', action: '提交发布申请', detail: '申请发布至资源广场。' },
];

