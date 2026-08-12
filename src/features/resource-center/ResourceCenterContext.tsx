import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialApplications, initialAuditLogs, initialGrants, initialPublishApprovals, initialResources } from './mock';
import type {
  CreateResourceInput, InstallStatus, PublicStrategy, PublishApproval, ResourceAccessView,
  ResourceApplication, ResourceAuditLog, ResourceItem, SpaceResourceGrant,
} from './types';

interface ApplyInput {
  resourceId: string;
  spaceId: string;
  applicant: string;
  dept: string;
  duration: 'permanent' | 'custom';
  expireDate?: string;
  reason: string;
}

interface ResourceCenterValue {
  resources: ResourceItem[];
  grants: SpaceResourceGrant[];
  applications: ResourceApplication[];
  auditLogs: ResourceAuditLog[];
  publishApprovals: PublishApproval[];
  getAccess: (resourceId: string, spaceId: string) => ResourceAccessView;
  acquire: (resourceId: string, spaceId: string, source?: SpaceResourceGrant['source']) => boolean;
  applyForResource: (input: ApplyInput) => boolean;
  approveApplication: (id: string, opinion: string) => void;
  rejectApplication: (id: string, opinion: string) => void;
  installResource: (resourceId: string, spaceId: string) => void;
  batchInstall: (resourceIds: string[], spaceId: string) => void;
  removeGrant: (resourceId: string, spaceId: string) => void;
  revokeGrant: (resourceId: string, spaceId: string) => void;
  createResource: (input: CreateResourceInput, asUser?: boolean) => ResourceItem;
  updateResource: (id: string, patch: Partial<ResourceItem>) => void;
  togglePublish: (id: string) => void;
  togglePinned: (id: string) => void;
  setStrategy: (id: string, strategy: PublicStrategy) => void;
  deleteResource: (id: string) => void;
  transferResource: (id: string, owner: string) => void;
  submitPublish: (resourceId: string) => void;
  approvePublish: (approvalId: string, opinion: string) => void;
  rejectPublish: (approvalId: string, reason: string) => void;
  submitOffline: (resourceId: string, reason: string) => void;
  approveOffline: (approvalId: string, opinion: string) => void;
  rejectOffline: (approvalId: string, reason: string) => void;
  getMyPublishedResources: () => ResourceItem[];
  getPendingApprovalsForMyResources: () => ResourceApplication[];
}

const ResourceCenterContext = createContext<ResourceCenterValue | null>(null);

const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');

export const ResourceCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [grants, setGrants] = useState<SpaceResourceGrant[]>(initialGrants);
  const [applications, setApplications] = useState<ResourceApplication[]>(initialApplications);
  const [auditLogs, setAuditLogs] = useState<ResourceAuditLog[]>(initialAuditLogs);
  const [publishApprovals, setPublishApprovals] = useState<PublishApproval[]>(initialPublishApprovals);

  const appendLog = useCallback((resourceId: string, action: string, detail: string, operator = '演示用户') => {
    setAuditLogs(prev => [{ id: `log-${Date.now()}-${Math.random()}`, resourceId, time: nowText(), operator, action, detail }, ...prev]);
  }, []);

  const getAccess = useCallback((resourceId: string, spaceId: string): ResourceAccessView => {
    const resource = resources.find(item => item.id === resourceId);
    const grant = grants.find(item => item.resourceId === resourceId && item.spaceId === spaceId);
    const pendingApplication = applications.find(item => item.resourceId === resourceId && item.spaceId === spaceId && item.status === 'pending');
    if (resource?.isDeleted) return { status: 'revoked', isAcquired: !!grant, grant, invalidReason: 'deleted' };
    if (grant?.expired) return { status: 'revoked', isAcquired: true, grant, invalidReason: 'expired' };
    if (grant?.revoked || resource?.status === 'revoked') return { status: 'revoked', isAcquired: !!grant, grant, invalidReason: 'revoked' };
    if (pendingApplication) return { status: 'reviewing', isAcquired: false, grant, pendingApplication };
    if (grant) return { status: 'authorized', isAcquired: true, grant };
    return { status: resource?.status === 'authorized' ? 'authorized' : 'view_only', isAcquired: false };
  }, [applications, grants, resources]);

  const acquire = useCallback((resourceId: string, spaceId: string, source: SpaceResourceGrant['source'] = '完全公开') => {
    if (grants.some(item => item.resourceId === resourceId && item.spaceId === spaceId && !item.revoked && !item.expired)) return false;
    setGrants(prev => [...prev, { id: `${spaceId}:${resourceId}`, spaceId, resourceId, source, acquiredAt: nowText(), installStatus: 'not_installed' }]);
    appendLog(resourceId, '获取资源', `空间 ${spaceId} 获取资源`);
    return true;
  }, [appendLog, grants]);

  const applyForResource = useCallback((input: ApplyInput) => {
    if (applications.some(item => item.resourceId === input.resourceId && item.spaceId === input.spaceId && item.status === 'pending')) return false;
    setApplications(prev => [{
        id: `app-${Date.now()}`, resourceId: input.resourceId, spaceId: input.spaceId,
        applicant: input.applicant, dept: input.dept, applyTime: nowText(), duration: input.duration,
        expireDate: input.expireDate, reason: input.reason, status: 'pending',
      }, ...prev]);
    appendLog(input.resourceId, '提交使用申请', `${input.applicant} 代表空间 ${input.spaceId} 提交使用申请`);
    return true;
  }, [applications, appendLog]);

  const approveApplication = useCallback((id: string, opinion: string) => {
    const target = applications.find(item => item.id === id);
    if (!target) return;
    setApplications(prev => prev.map(item => item.id === id ? { ...item, status: 'approved', opinion, operator: '演示用户', approvalTime: nowText() } : item));
    setGrants(prev => prev.some(item => item.spaceId === target.spaceId && item.resourceId === target.resourceId && !item.revoked && !item.expired)
      ? prev
      : [...prev, { id: `${target.spaceId}:${target.resourceId}`, spaceId: target.spaceId, resourceId: target.resourceId, source: '广场申请', acquiredAt: nowText(), expireDate: target.expireDate, installStatus: 'not_installed' }]);
    appendLog(target.resourceId, '使用申请审批通过', `${target.applicant} 的申请已通过：${opinion}`);
  }, [applications, appendLog]);

  const rejectApplication = useCallback((id: string, opinion: string) => {
    const target = applications.find(item => item.id === id);
    if (!target) return;
    setApplications(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected', opinion, operator: '演示用户', approvalTime: nowText() } : item));
    appendLog(target.resourceId, '使用申请驳回', `${target.applicant} 的申请已驳回：${opinion}`);
  }, [applications, appendLog]);

  const setInstallStatus = useCallback((resourceId: string, spaceId: string, status: InstallStatus) => {
    setGrants(prev => prev.map(item => item.resourceId === resourceId && item.spaceId === spaceId ? { ...item, installStatus: status } : item));
  }, []);

  const installResource = useCallback((resourceId: string, spaceId: string) => {
    setInstallStatus(resourceId, spaceId, 'installing');
    window.setTimeout(() => {
      setInstallStatus(resourceId, spaceId, 'installed');
      appendLog(resourceId, '安装资源', `空间 ${spaceId} 完成资源安装`);
    }, 700);
  }, [appendLog, setInstallStatus]);

  const batchInstall = useCallback((resourceIds: string[], spaceId: string) => {
    resourceIds.slice(0, 10).forEach(id => installResource(id, spaceId));
  }, [installResource]);

  const removeGrant = useCallback((resourceId: string, spaceId: string) => {
    setGrants(prev => prev.filter(item => !(item.resourceId === resourceId && item.spaceId === spaceId)));
    appendLog(resourceId, '移除我的资源', `空间 ${spaceId} 移除资源记录`);
  }, [appendLog]);

  const revokeGrant = useCallback((resourceId: string, spaceId: string) => {
    setGrants(prev => prev.map(item => item.resourceId === resourceId && item.spaceId === spaceId ? { ...item, revoked: true } : item));
    appendLog(resourceId, '撤销授权', `撤销空间 ${spaceId} 的资源使用权`);
  }, [appendLog]);

  const createResource = useCallback((input: CreateResourceInput, asUser = false) => {
    const initialStatus = asUser ? 'reviewing' : 'pending';
    const statusText = asUser ? '发布审批中' : '待上架';
    const item: ResourceItem = {
      ...input, id: `resource-${Date.now()}`, updateTime: new Date().toISOString().slice(0, 10), heat: 0,
      status: 'authorized', publishStatus: initialStatus, gatewayPath: input.gatewayPath || `/gateway/${input.resourceKey}`,
      visibleTargets: input.visibleTargets || [],
    };
    setResources(prev => [item, ...prev]);
    appendLog(item.id, '创建资源', `创建 ${item.name}，初始状态为${statusText}`);
    // 用户创建时自动创建发布审批记录
    if (asUser) {
      setPublishApprovals(prev => [{
        id: `pub-${Date.now()}`, resourceId: item.id, applicant: item.owner,
        applyType: 'publish', applyTime: nowText(), status: 'pending',
      }, ...prev]);
    }
    return item;
  }, [appendLog]);

  const updateResource = useCallback((id: string, patch: Partial<ResourceItem>) => {
    setResources(prev => prev.map(item => item.id === id ? { ...item, ...patch, updateTime: new Date().toISOString().slice(0, 10) } : item));
    appendLog(id, '编辑资源', '更新资源基础信息或技术配置');
  }, [appendLog]);

  const togglePublish = useCallback((id: string) => {
    let action = '';
    setResources(prev => prev.map(item => {
      if (item.id !== id) return item;
      let publishStatus: ResourceItem['publishStatus'];
      if (item.publishStatus === 'published') {
        publishStatus = 'offline';
        action = '下架资源';
      } else if (item.publishStatus === 'offline' || item.publishStatus === 'pending') {
        publishStatus = 'published';
        action = '上架资源';
      } else {
        return item;
      }
      return { ...item, publishStatus, updateTime: new Date().toISOString().slice(0, 10) };
    }));
    if (action) appendLog(id, action, action);
  }, [appendLog]);

  const togglePinned = useCallback((id: string) => {
    setResources(prev => prev.map(item => item.id === id ? { ...item, isPinned: !item.isPinned } : item));
    appendLog(id, '调整置顶', '切换资源置顶状态');
  }, [appendLog]);

  const setStrategy = useCallback((id: string, publicStrategy: PublicStrategy) => {
    setResources(prev => prev.map(item => item.id === id ? { ...item, publicStrategy } : item));
    appendLog(id, '公开策略变更', `公开策略调整为 ${publicStrategy}`);
  }, [appendLog]);

  const deleteResource = useCallback((id: string) => {
    setResources(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true, publishStatus: 'offline' } : item));
    appendLog(id, '删除资源', '资源已删除，已有获取关系转为失效');
  }, [appendLog]);

  const transferResource = useCallback((id: string, owner: string) => {
    setResources(prev => prev.map(item => item.id === id ? { ...item, owner } : item));
    appendLog(id, '转移所有权', `资源所有权转移至 ${owner}`);
  }, [appendLog]);

  // --- 发布审批状态机 ---

  const submitPublish = useCallback((resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || !(resource.publishStatus === 'pending' || resource.publishStatus === 'offline')) return;
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, publishStatus: 'reviewing', updateTime: new Date().toISOString().slice(0, 10) } : r));
    setPublishApprovals(prev => [{
      id: `pub-${Date.now()}`, resourceId, applicant: resource.owner,
      applyType: 'publish', applyTime: nowText(), status: 'pending',
    }, ...prev]);
    appendLog(resourceId, '提交发布审批', `${resource.owner} 提交资源发布审批`);
  }, [resources, appendLog]);

  const approvePublish = useCallback((approvalId: string, opinion: string) => {
    const approval = publishApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    setPublishApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'approved', opinion, operator: '管理员', approvalTime: nowText() } : a));
    setResources(prev => prev.map(r => r.id === approval.resourceId ? { ...r, publishStatus: 'published', updateTime: new Date().toISOString().slice(0, 10) } : r));
    appendLog(approval.resourceId, '发布审批通过', `管理员审批通过发布申请：${opinion}`);
  }, [publishApprovals, appendLog]);

  const rejectPublish = useCallback((approvalId: string, reason: string) => {
    const approval = publishApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    setPublishApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'rejected', opinion: reason, operator: '管理员', approvalTime: nowText() } : a));
    setResources(prev => prev.map(r => r.id === approval.resourceId ? { ...r, publishStatus: 'pending', updateTime: new Date().toISOString().slice(0, 10) } : r));
    appendLog(approval.resourceId, '发布审批驳回', `管理员驳回发布申请：${reason}`);
  }, [publishApprovals, appendLog]);

  const submitOffline = useCallback((resourceId: string, reason: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || resource.publishStatus !== 'published') return;
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, publishStatus: 'unpublishing', updateTime: new Date().toISOString().slice(0, 10) } : r));
    setPublishApprovals(prev => [{
      id: `pub-${Date.now()}`, resourceId, applicant: resource.owner,
      applyType: 'offline', applyTime: nowText(), status: 'pending', reason,
    }, ...prev]);
    appendLog(resourceId, '提交下架审批', `${resource.owner} 提交资源下架审批，原因：${reason}`);
  }, [resources, appendLog]);

  const approveOffline = useCallback((approvalId: string, opinion: string) => {
    const approval = publishApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    setPublishApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'approved', opinion, operator: '管理员', approvalTime: nowText() } : a));
    setResources(prev => prev.map(r => r.id === approval.resourceId ? { ...r, publishStatus: 'offline', updateTime: new Date().toISOString().slice(0, 10) } : r));
    appendLog(approval.resourceId, '下架审批通过', `管理员审批通过下架申请：${opinion}`);
  }, [publishApprovals, appendLog]);

  const rejectOffline = useCallback((approvalId: string, reason: string) => {
    const approval = publishApprovals.find(a => a.id === approvalId);
    if (!approval) return;
    setPublishApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: 'rejected', opinion: reason, operator: '管理员', approvalTime: nowText() } : a));
    setResources(prev => prev.map(r => r.id === approval.resourceId ? { ...r, publishStatus: 'published', updateTime: new Date().toISOString().slice(0, 10) } : r));
    appendLog(approval.resourceId, '下架审批驳回', `管理员驳回下架申请：${reason}`);
  }, [publishApprovals, appendLog]);

  const getMyPublishedResources = useCallback(() => {
    return resources.filter(r => r.owner === '演示用户' && !r.isDeleted);
  }, [resources]);

  const getPendingApprovalsForMyResources = useCallback(() => {
    const myResourceIds = resources.filter(r => r.owner === '演示用户' && !r.isDeleted).map(r => r.id);
    return applications.filter(a => a.status === 'pending' && myResourceIds.includes(a.resourceId) && a.currentNode === 'creator');
  }, [resources, applications]);

  const value = useMemo<ResourceCenterValue>(() => ({
    resources, grants, applications, auditLogs, publishApprovals, getAccess, acquire, applyForResource,
    approveApplication, rejectApplication, installResource, batchInstall, removeGrant, revokeGrant,
    createResource, updateResource, togglePublish, togglePinned, setStrategy, deleteResource, transferResource,
    submitPublish, approvePublish, rejectPublish, submitOffline, approveOffline, rejectOffline,
    getMyPublishedResources, getPendingApprovalsForMyResources,
  }), [
    resources, grants, applications, auditLogs, publishApprovals, getAccess, acquire, applyForResource,
    approveApplication, rejectApplication, installResource, batchInstall, removeGrant, revokeGrant,
    createResource, updateResource, togglePublish, togglePinned, setStrategy, deleteResource, transferResource,
    submitPublish, approvePublish, rejectPublish, submitOffline, approveOffline, rejectOffline,
    getMyPublishedResources, getPendingApprovalsForMyResources,
  ]);

  return <ResourceCenterContext.Provider value={value}>{children}</ResourceCenterContext.Provider>;
};

export function useResourceCenter() {
  const value = useContext(ResourceCenterContext);
  if (!value) throw new Error('useResourceCenter must be used inside ResourceCenterProvider');
  return value;
}
