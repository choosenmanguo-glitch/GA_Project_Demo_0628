export type ResourceType = 'model' | 'api' | 'mcp' | 'knowledge';
export type ResourceStatus = 'authorized' | 'view_only' | 'reviewing' | 'revoked';
export type PublishStatus = 'published' | 'offline' | 'publishing' | 'pending';
export type InstallStatus = 'installed' | 'not_installed' | 'failed' | 'installing';
export type PublicStrategy = 'public' | 'visible' | 'whitelist';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface RequestParameter {
  paraName: string;
  paraDesc: string;
  paraPosition: 'query' | 'body' | 'header' | 'url';
  paraRequired: 'yes' | 'no';
  paraOrder?: number;
  paraDefaultValue?: string;
}

export interface ConstantParameter {
  constName: string;
  constValue: string;
  constPosition: 'query' | 'body' | 'header';
  constDesc: string;
}

export interface ResponseParameter {
  respName: string;
  respDesc: string;
}

export interface ErrorCodeParameter {
  errorCode: string;
  errorDesc: string;
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  owner: string;
  updateTime: string;
  heat: number;
  status: ResourceStatus;
  publishStatus: PublishStatus;
  publicStrategy: PublicStrategy;
  pendingStrategy?: PublicStrategy;
  isPinned?: boolean;
  isDeleted?: boolean;
  resourceKey?: string;
  gatewayPath?: string;
  deployment?: string;
  deploymentMode?: 'Internal' | 'Public';
  modelType?: 'LargeModel' | 'VectorModel' | 'RerankModel';
  knowledgeType?: string;
  kbId?: string;
  markdownIntro?: string;
  baseurl?: string;
  path?: string;
  modelName?: string;
  apikey?: string;
  apiEndpoint?: string;
  url?: string;
  method?: string;
  authType?: string;
  authPrefix?: string;
  authKey?: string;
  authValue?: string;
  mcpServerEndpoint?: string;
  mcpServerIdentifier?: string;
  mcpTransport?: 'HTTP' | 'SSE';
  mcpHeaders?: Array<{ key: string; value: string }>;
  swaggerSchema?: string;
  requestParams?: RequestParameter[];
  constantParams?: ConstantParameter[];
  responseParams?: ResponseParameter[];
  errorCodes?: ErrorCodeParameter[];
}

export interface SpaceResourceGrant {
  id: string;
  spaceId: string;
  resourceId: string;
  source: '完全公开' | '广场申请' | '管理员授权';
  acquiredAt: string;
  expireDate?: string;
  installStatus: InstallStatus;
  revoked?: boolean;
  expired?: boolean;
}

export interface ResourceApplication {
  id: string;
  resourceId: string;
  spaceId: string;
  applicant: string;
  dept: string;
  applyTime: string;
  duration: 'permanent' | 'custom';
  expireDate?: string;
  reason: string;
  status: ApplicationStatus;
  operator?: string;
  opinion?: string;
  approvalTime?: string;
}

export interface ResourceAuditLog {
  id: string;
  resourceId: string;
  time: string;
  operator: string;
  action: string;
  detail: string;
}

export interface ResourceAccessView {
  status: ResourceStatus;
  isAcquired: boolean;
  grant?: SpaceResourceGrant;
  pendingApplication?: ResourceApplication;
  invalidReason?: 'deleted' | 'expired' | 'revoked';
}

export interface CreateResourceInput {
  type: ResourceType;
  name: string;
  description: string;
  owner: string;
  resourceKey: string;
  gatewayPath?: string;
  publicStrategy: PublicStrategy;
  deployment?: string;
  deploymentMode?: ResourceItem['deploymentMode'];
  modelType?: ResourceItem['modelType'];
  knowledgeType?: string;
  kbId?: string;
  baseurl?: string;
  path?: string;
  modelName?: string;
  apikey?: string;
  apiEndpoint?: string;
  url?: string;
  method?: string;
  authType?: string;
  authPrefix?: string;
  authKey?: string;
  authValue?: string;
  mcpServerEndpoint?: string;
  mcpServerIdentifier?: string;
  mcpTransport?: ResourceItem['mcpTransport'];
  mcpHeaders?: ResourceItem['mcpHeaders'];
  markdownIntro?: string;
  swaggerSchema?: string;
  requestParams?: RequestParameter[];
  constantParams?: ConstantParameter[];
  responseParams?: ResponseParameter[];
  errorCodes?: ErrorCodeParameter[];
}
