import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { App as AntdApp, Avatar, Badge, Button, Card, Descriptions, Drawer, Dropdown, Empty, Input, List, Modal, Popconfirm, Space, Table, Tabs, Tag } from 'antd';
import {
  AppstoreOutlined, PlusOutlined, SearchOutlined, StarOutlined,
  EditOutlined, SendOutlined, EyeOutlined, UserOutlined, DeleteOutlined,
  FileTextOutlined, MoreOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import PaginationBar from '@/components/PaginationBar';
import MyResourcesPage from '@/pages/my-resources';
import ResourceApplyModal from '@/features/resource-center/components/ResourceApplyModal';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ApprovalTableSection from '@/features/resource-center/components/ApprovalTableSection';
import ResourceDetailDrawer from '@/features/resource-center/components/ResourceDetailDrawer';
import ResourceFormDrawer from '@/features/resource-center/components/ResourceFormDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { CreateResourceInput, PublishStatus, ResourceApplication, ResourceItem, ResourceType } from '@/features/resource-center/types';
import { publishConfig, strategyConfig, typeConfig } from '@/features/resource-center/ui';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import type { MenuProps } from 'antd';

const tabKeys: { key: 'all' | ResourceType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'model', label: '模型' },
  { key: 'api', label: 'API' },
  { key: 'mcp', label: 'MCP' },
  { key: 'knowledge', label: '知识库' },
];

const publishFilterOptions: { label: string; value: PublishStatus | 'all' }[] = [
  { label: '全部状态', value: 'all' },
  { label: '待上架', value: 'pending' },
  { label: '发布审批中', value: 'reviewing' },
  { label: '已上架', value: 'published' },
  { label: '下架审批中', value: 'unpublishing' },
  { label: '已下架', value: 'offline' },
];

const myPublishFilterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索资源名称', width: 200 },
  { type: 'select', key: 'type', placeholder: '资源类型', width: 110, options: [
    { label: '模型', value: 'model' },
    { label: 'API', value: 'api' },
    { label: 'MCP', value: 'mcp' },
    { label: '知识库', value: 'knowledge' },
  ]},
  { type: 'select', key: 'status', placeholder: '发布状态', width: 130, options: publishFilterOptions },
];

export default function ResourceSquarePage() {
  const { message } = AntdApp.useApp();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone');
  const { currentSpace, spaces } = useWorkspace();
  const {
    resources, grants, getAccess, acquire, applyForResource,
    createResource, updateResource, submitPublish, submitOffline, deleteResource,
    getMyPublishedResources, getPendingApprovalsForMyResources,
    approveApplication, rejectApplication, applications,
  } = useResourceCenter();

  // 主 Tab
  const [mainTab, setMainTab] = useState<'all' | 'mine' | 'myPublish'>('all');

  // --- 全部资源 ---
  const [activeType, setActiveType] = useState<'all' | ResourceType>('all');
  const [keyword, setKeyword] = useState('');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [detailFromMyPublish, setDetailFromMyPublish] = useState(false);
  const [applyResource, setApplyResource] = useState<ResourceItem | null>(null);

  // --- 我的发布 ---
  const [myPublishFilters, setMyPublishFilters] = useState<Record<string, any>>({ keyword: '', type: undefined, status: undefined });
  const [publishPage, setPublishPage] = useState(1);
  const [publishPageSize, setPublishPageSize] = useState(12);
  // 表单抽屉
  const [publishFormOpen, setPublishFormOpen] = useState(false);
  const [publishEditing, setPublishEditing] = useState<ResourceItem | null>(null);
  // 下架模态框
  const [offlineTarget, setOfflineTarget] = useState<ResourceItem | null>(null);
  const [offlineReason, setOfflineReason] = useState('');
  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
  // 使用申请抽屉
  const [usageDrawerOpen, setUsageDrawerOpen] = useState(false);
  // 待审批详情
  const [pendingDetailApp, setPendingDetailApp] = useState<ResourceApplication | null>(null);
  const [pendingDetailOpen, setPendingDetailOpen] = useState(false);
  const [pendingOpinion, setPendingOpinion] = useState('');
  // 审批记录详情
  const [historyDetailApp, setHistoryDetailApp] = useState<ResourceApplication | null>(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);

  const myPublishResources = useMemo(() => getMyPublishedResources(), [getMyPublishedResources]);
  const filteredMyPublish = useMemo(() => {
    let list = myPublishResources;
    const nameFilter = (myPublishFilters.keyword || '').trim().toLowerCase();
    if (nameFilter) list = list.filter(r => r.name.toLowerCase().includes(nameFilter));
    if (myPublishFilters.type) list = list.filter(r => r.type === myPublishFilters.type);
    if (myPublishFilters.status) list = list.filter(r => r.publishStatus === myPublishFilters.status);
    return list;
  }, [myPublishResources, myPublishFilters]);

  const creatorPendingApps = useMemo(() => getPendingApprovalsForMyResources(), [getPendingApprovalsForMyResources]);
  const creatorHistoryApps = useMemo(() => {
    const myResourceIds = resources.filter(r => r.owner === '演示用户' && !r.isDeleted).map(r => r.id);
    return applications.filter(a => a.status !== 'pending' && myResourceIds.includes(a.resourceId) && a.currentNode === 'creator');
  }, [resources, applications]);

  const pendingUsageCount = creatorPendingApps.length;

  // --- 全部资源逻辑 ---
  const publishedResources = useMemo(() => resources
    .filter(resource => (resource.publishStatus === 'published' || resource.publishStatus === 'unpublishing') && !resource.isDeleted),
  [resources]);

  const visibleResources = useMemo(() => publishedResources
    .filter(resource => {
      const access = getAccess(resource.id, currentSpace.id);
      if (resource.publicStrategy === 'whitelist' && !access.isAcquired && access.status !== 'reviewing') return false;
      if (activeType !== 'all' && resource.type !== activeType) return false;
      const word = keyword.trim().toLowerCase();
      return !word || resource.name.toLowerCase().includes(word) || resource.description.toLowerCase().includes(word) || resource.owner.toLowerCase().includes(word);
    })
    .sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned)),
  [activeType, currentSpace.id, getAccess, keyword, publishedResources]);

  const typeCounts = useMemo(() => {
    const base = publishedResources.filter(resource => {
      const access = getAccess(resource.id, currentSpace.id);
      if (resource.publicStrategy === 'whitelist' && !access.isAcquired && access.status !== 'reviewing') return false;
      return true;
    });
    return {
      all: base.length,
      model: base.filter(r => r.type === 'model').length,
      api: base.filter(r => r.type === 'api').length,
      mcp: base.filter(r => r.type === 'mcp').length,
      knowledge: base.filter(r => r.type === 'knowledge').length,
    };
  }, [currentSpace.id, getAccess, publishedResources]);

  const detailAccess = detailFromMyPublish ? null : (detailResource ? getAccess(detailResource.id, currentSpace.id) : null);

  const handleAcquire = () => {
    if (!detailResource) return;
    const created = acquire(detailResource.id, currentSpace.id, '完全公开');
    if (created) message.success(`获取成功，已加入「${currentSpace.name} / 我的资源」`);
    else message.info('当前空间已获取该资源，无需重复操作');
  };

  // --- 我的发布操作 ---
  const handleSubmitPublish = (resourceId: string) => {
    submitPublish(resourceId);
    message.success('已提交发布审批，请等待管理员审核');
  };

  const handleEditMyPublish = (resource: ResourceItem) => {
    setPublishEditing(resource);
    setPublishFormOpen(true);
  };

  const handleSubmitMyPublish = (values: CreateResourceInput) => {
    if (publishEditing) {
      updateResource(publishEditing.id, values);
      message.success('资源修改已保存');
    } else {
      // 用户创建 → 发布审批中
      createResource(values, true);
      message.success('资源已创建并提交发布审批！');
    }
    setPublishFormOpen(false);
    setPublishEditing(null);
  };

  const handleOpenOffline = (resource: ResourceItem) => {
    setOfflineTarget(resource);
    setOfflineReason('');
  };

  const handleConfirmOffline = () => {
    if (!offlineTarget || !offlineReason.trim()) {
      message.warning('请填写下架原因');
      return;
    }
    submitOffline(offlineTarget.id, offlineReason.trim());
    message.success('已提交下架审批，请等待管理员审核');
    setOfflineTarget(null);
    setOfflineReason('');
  };

  const handleDeleteMyPublish = (resource: ResourceItem) => {
    setDeleteTarget(resource);
  };

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Banner */}
      <div style={{
        margin: '24px 24px 0',
        padding: '36px 32px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 40%, #69b1ff 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        boxShadow: '0 4px 20px rgba(22, 119, 255, 0.25)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, flexShrink: 0,
        }}>
          <AppstoreOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '32px' }}>资源广场</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6, lineHeight: '22px' }}>
            浏览、获取或申请平台共享的模型、API、MCP 与知识库资源
          </div>
        </div>
      </div>

      {/* Main Tabs Row */}
      <div style={{
        margin: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Tabs
          className="resource-main-tabs"
          activeKey={mainTab}
          onChange={key => setMainTab(key as 'all' | 'mine' | 'myPublish')}
          tabBarStyle={{ marginBottom: 0, paddingTop: 4, paddingBottom: 4 }}
          items={[
            {
              key: 'all',
              label: (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: mainTab === 'all' ? '#1677ff' : undefined,
                  fontWeight: mainTab === 'all' ? 600 : undefined,
                }}>
                  <AppstoreOutlined />
                  全部资源
                </span>
              ),
            },
            {
              key: 'mine',
              label: (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: mainTab === 'mine' ? '#1677ff' : undefined,
                  fontWeight: mainTab === 'mine' ? 600 : undefined,
                }}>
                  <StarOutlined />
                  我的资源
                </span>
              ),
            },
            {
              key: 'myPublish',
              label: (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: mainTab === 'myPublish' ? '#1677ff' : undefined,
                  fontWeight: mainTab === 'myPublish' ? 600 : undefined,
                }}>
                  <FileTextOutlined />
                  我的发布
                </span>
              ),
            },
          ]}
        />
        {isStandalone ? (
          <WorkspaceSwitcher inline standalone />
        ) : (
          <Tag style={{
            color: 'rgba(0,0,0,0.65)', border: '1px solid #d9d9d9',
            borderRadius: 8, padding: '4px 14px', fontSize: 13,
            background: '#fff',
          }}>
            当前空间：{currentSpace.name}
          </Tag>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, margin: '0 24px 24px', display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* 全部资源 */}
        {mainTab === 'all' && (
          <>
            <div style={{
              padding: '0 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Tabs
                className="resource-type-tabs"
                activeKey={activeType}
                onChange={key => { setActiveType(key as 'all' | ResourceType); setCardPage(1); }}
                tabBarStyle={{ marginBottom: 0, paddingTop: 4, paddingBottom: 4 }}
                items={tabKeys.map(item => ({
                  key: item.key,
                  label: (
                    <span style={{ fontWeight: activeType === item.key ? 600 : undefined }}>
                      {item.label}{' '}
                      <Tag variant="filled" style={{ marginInlineEnd: 0, fontSize: 11, minWidth: 20, textAlign: 'center' }}>
                        {typeCounts[item.key]}
                      </Tag>
                    </span>
                  ),
                }))}
              />
              <Input
                allowClear
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={event => { setKeyword(event.target.value); setCardPage(1); }}
                placeholder="搜索资源名称、描述、所有权人"
                style={{ width: 280 }}
              />
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
              <div className="resource-card-grid" style={{ marginTop: 16 }}>
                {visibleResources.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    access={getAccess(resource.id, currentSpace.id)}
                    mode="square"
                    onCardClick={() => { setDetailFromMyPublish(false); setDetailResource(resource); }}
                  />
                ))}
              </div>
              <PaginationBar current={cardPage} pageSize={cardPageSize} total={visibleResources.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
            </div>
          </>
        )}

        {/* 我的资源 */}
        {mainTab === 'mine' && <MyResourcesPage compact />}

        {/* 我的发布 */}
        {mainTab === 'myPublish' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FilterBar
              filters={myPublishFilterFields}
              filterValues={myPublishFilters}
              onFilterChange={(key, value) => { setMyPublishFilters(prev => ({ ...prev, [key]: value })); setPublishPage(1); }}
              onSearch={() => {}}
              onReset={() => { setMyPublishFilters({ keyword: '', type: undefined, status: undefined }); setPublishPage(1); }}
              extra={
                <Space size={8}>
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => setUsageDrawerOpen(true)}
                  >
                    使用申请
                    {pendingUsageCount > 0 && (
                      <Badge count={pendingUsageCount} style={{ backgroundColor: '#ff4d4f', marginLeft: 6 }} />
                    )}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setPublishEditing(null); setPublishFormOpen(true); }}
                  >
                    发布资源
                  </Button>
                </Space>
              }
            />

            {/* 卡片网格 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
              <div className="resource-card-grid" style={{ marginTop: 16 }}>
                {filteredMyPublish.slice((publishPage - 1) * publishPageSize, publishPage * publishPageSize).map(resource => {
                  const isReviewing = resource.publishStatus === 'reviewing' || resource.publishStatus === 'unpublishing';
                  const cardMenuItems: MenuProps['items'] = [
                    { key: 'view', icon: <EyeOutlined />, label: '查看详情', onClick: () => { setDetailFromMyPublish(true); setDetailResource(resource); } },
                  ];
                  if (resource.publishStatus === 'pending') {
                    cardMenuItems.push(
                      { key: 'edit', icon: <EditOutlined />, label: '编辑资源', onClick: () => handleEditMyPublish(resource) },
                      { key: 'submit', icon: <SendOutlined />, label: '提交发布', onClick: () => handleSubmitPublish(resource.id) },
                    );
                  }
                  if (resource.publishStatus === 'published') {
                    cardMenuItems.push({ key: 'offline', icon: <SendOutlined />, label: '申请下架', onClick: () => handleOpenOffline(resource) });
                  }
                  if (resource.publishStatus === 'offline') {
                    cardMenuItems.push({ key: 'resubmit', icon: <SendOutlined />, label: '重新发布', onClick: () => handleSubmitPublish(resource.id) });
                  }
                  // 删除：pending 和 offline 状态可删除，审批中不可删除
                  if (resource.publishStatus === 'pending' || resource.publishStatus === 'offline') {
                    cardMenuItems.push({ type: 'divider' });
                    cardMenuItems.push({ key: 'delete', icon: <DeleteOutlined />, label: '删除资源', danger: true, onClick: () => handleDeleteMyPublish(resource) });
                  }
                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      mode="square"
                      onCardClick={() => { setDetailFromMyPublish(true); setDetailResource(resource); }}
                      footer={
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Dropdown menu={{ items: cardMenuItems }} trigger={['click']}>
                            <Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, fontSize: 12 }} onClick={(e) => e.stopPropagation()} />
                          </Dropdown>
                        </div>
                      }
                    />
                  );
                })}
              </div>
              <PaginationBar current={publishPage} pageSize={publishPageSize} total={filteredMyPublish.length} onChange={(p, s) => { setPublishPage(p); setPublishPageSize(s); }} />
            </div>
          </div>
        )}
      </div>

      {/* 资源详情 Drawer */}
      <ResourceDetailDrawer
        open={!!detailResource}
        resource={detailResource}
        access={detailAccess}
        spaceName={currentSpace.name}
        onClose={() => setDetailResource(null)}
        onAcquire={handleAcquire}
        onApply={() => detailResource && setApplyResource(detailResource)}
      />

      {/* 使用申请 Modal */}
      <ResourceApplyModal
        open={!!applyResource}
        resource={applyResource}
        spaceName={currentSpace.name}
        onCancel={() => setApplyResource(null)}
        onSubmit={values => {
          if (!applyResource) return;
          const created = applyForResource({
            resourceId: applyResource.id,
            spaceId: currentSpace.id,
            applicant: '演示用户',
            dept: currentSpace.dept,
            ...values,
          });
          if (created) message.success('申请已提交至资源所有权人');
          else message.info('当前空间已有待审批申请，请勿重复提交');
          setApplyResource(null);
        }}
      />

      {/* 发布资源表单 Drawer */}
      <ResourceFormDrawer
        open={publishFormOpen}
        resource={publishEditing}
        onClose={() => { setPublishFormOpen(false); setPublishEditing(null); }}
        onSubmit={handleSubmitMyPublish}
      />

      {/* 删除确认 Modal */}
      <ConfirmActionModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteResource(deleteTarget.id);
          setDeleteTarget(null);
          message.success('资源已删除，已有获取记录将显示为失效');
        }}
        title="删除资源"
        targetName={deleteTarget?.name || ''}
        severity="danger"
        description={[
          `全站不可用：已有 ${deleteTarget ? grants.filter(item => item.resourceId === deleteTarget.id && !item.revoked).length : 0} 个空间获取该资源，删除后其引用服务可能立即报错或中断。`,
          '资产回收：资源数据、API 接口和底层关联将永久闭合。',
          '权限解绑：当前可见范围和授权使用记录将转为资源已删除的失效状态。',
        ]}
        requireAcknowledgement
        acknowledgementText="我已知晓并核实删除此资源带来的潜在服务中断风险，并自愿承担相应的技术影响与责任风险。"
        requireNameInput
        cancelText="取消，我再想想"
        okText="确认，永久删除此资产"
      />

      {/* 申请下架 Modal */}
      <Modal
        title="申请下架"
        open={!!offlineTarget}
        onCancel={() => { setOfflineTarget(null); setOfflineReason(''); }}
        onOk={handleConfirmOffline}
        okText="提交申请"
        cancelText="取消"
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#595959' }}>资源名称</div>
          <Input value={offlineTarget?.name || ''} disabled style={{ color: 'rgba(0,0,0,0.65)' }} />
        </div>
        <div>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#595959' }}>
            下架原因 <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <Input.TextArea
            value={offlineReason}
            onChange={e => setOfflineReason(e.target.value)}
            placeholder="请输入下架原因（必填，最多 200 字）"
            maxLength={200}
            rows={4}
            showCount
          />
        </div>
      </Modal>

      {/* 使用申请 Drawer */}
      <Drawer
        title="使用申请"
        open={usageDrawerOpen}
        onClose={() => setUsageDrawerOpen(false)}
        width="72%"
        styles={{ body: { background: '#f5f7fa', padding: '0 24px 16px' } }}
      >
        <ApprovalTableSection
          mode="tabs"
          compact
          pendingData={creatorPendingApps}
          historyData={creatorHistoryApps}
          getResource={(id) => resources.find(r => r.id === id)}
          getSpaceName={getSpaceName}
          pendingCount={pendingUsageCount}
          onRowClick={(app) => {
            if (app.status === 'pending') {
              setPendingDetailApp(app); setPendingDetailOpen(true);
            } else {
              setHistoryDetailApp(app); setHistoryDetailOpen(true);
            }
          }}
          onApprove={(app, opinion) => {
            approveApplication(app.id, opinion || '同意使用');
            message.success('已通过使用申请');
            setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion('');
          }}
          onReject={(app, opinion) => {
            rejectApplication(app.id, opinion || '暂不符合使用条件');
            message.info('已驳回使用申请');
            setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion('');
          }}
        />

        {/* 待审批详情 Drawer（嵌套在"使用申请"抽屉内） */}
        <Drawer
          title="待审批详情"
          open={pendingDetailOpen}
          onClose={() => { setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion(''); }}
          width={560}
          styles={{ body: { background: '#f5f7fa', padding: 20 } }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => { setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion(''); }}>取消</Button>
              <Button danger onClick={() => {
                if (!pendingDetailApp) return;
                if (!pendingOpinion.trim()) { message.warning('请填写审批意见'); return; }
                rejectApplication(pendingDetailApp.id, pendingOpinion.trim());
                message.info(`已驳回用户 [${pendingDetailApp.applicant}] 的使用申请`);
                setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion('');
              }}>驳回</Button>
              <Button type="primary" onClick={() => {
                if (!pendingDetailApp) return;
                approveApplication(pendingDetailApp.id, pendingOpinion.trim() || '同意使用');
                message.success(`已通过 [${pendingDetailApp.applicant}] 的使用申请`);
                setPendingDetailOpen(false); setPendingDetailApp(null); setPendingOpinion('');
              }}>通过</Button>
            </div>
          }
        >
          {pendingDetailApp && (() => {
            const app = pendingDetailApp;
            const res = resources.find(r => r.id === app.resourceId);
            const type = res?.type ? typeConfig[res.type] : null;
            const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
            return (
              <>
                {res ? (
                  <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      {type && (
                        <div style={{ width: 52, height: 52, borderRadius: 10, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 26 }}>
                          {type.icon}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 650 }}>{res.name}</div>
                        <Space size={4} style={{ marginTop: 6 }}>
                          {type && <Tag color={type.color}>{type.label}</Tag>}
                        </Space>
                      </div>
                    </div>
                    <Descriptions column={2} size="small" items={[
                      { key: 'owner', label: '创建人', children: res.owner },
                      { key: 'date', label: '更新时间', children: res.updateTime },
                      { key: 'key', label: '资源标识', children: res.resourceKey || '—' },
                      { key: 'strategy', label: '可见范围', children: strategy ? <Tag color={strategy.color}>{strategy.label}</Tag> : '—' },
                      { key: 'desc', label: '资源描述', span: 2, children: res.description },
                    ]} />
                  </Card>
                ) : (
                  <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                    <Empty description="被申请的资源已不存在" />
                  </Card>
                )}

                <Card title="申请信息" styles={{ body: { padding: 20 } }}>
                  <Descriptions column={2} size="small" items={[
                    {
                      key: 'applicant', label: '申请人',
                      children: (
                        <Space size={8}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                          <span style={{ fontWeight: 500 }}>{app.applicant}</span>
                          <span style={{ color: '#8c8c8c' }}>{app.dept}</span>
                        </Space>
                      ),
                    },
                    { key: 'space', label: '申请空间', children: getSpaceName(app.spaceId) },
                    { key: 'time', label: '申请时间', children: app.applyTime },
                    { key: 'duration', label: '使用期限', children: app.duration === 'permanent' ? '永久有效' : app.expireDate },
                    { key: 'reason', label: '申请理由', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.reason || '未填写理由'}</span> },
                  ]} />
                </Card>

                <Card title="审批意见" styles={{ body: { padding: 20 } }} style={{ marginTop: 16 }}>
                  <Input.TextArea
                    value={pendingOpinion}
                    onChange={e => setPendingOpinion(e.target.value)}
                    placeholder="请输入审批意见（驳回时必填）"
                    rows={4}
                  />
                </Card>
              </>
            );
          })()}
        </Drawer>

        {/* 审批记录详情 Drawer（嵌套在"使用申请"抽屉内） */}
        <Drawer
          title="审批记录详情"
          open={historyDetailOpen}
          onClose={() => { setHistoryDetailOpen(false); setHistoryDetailApp(null); }}
          width={560}
          styles={{ body: { background: '#f5f7fa', padding: 20 } }}
          footer={null}
        >
          {historyDetailApp && (() => {
            const app = historyDetailApp;
            const res = resources.find(r => r.id === app.resourceId);
            const type = res?.type ? typeConfig[res.type] : null;
            const strategy = res?.publicStrategy ? strategyConfig[res.publicStrategy] : null;
            const isApproved = app.status === 'approved';
            return (
              <>
                {res ? (
                  <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      {type && (
                        <div style={{ width: 52, height: 52, borderRadius: 10, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 26 }}>
                          {type.icon}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 650 }}>{res.name}</div>
                        <Space size={4} style={{ marginTop: 6 }}>
                          {type && <Tag color={type.color}>{type.label}</Tag>}
                        </Space>
                      </div>
                    </div>
                    <Descriptions column={2} size="small" items={[
                      { key: 'owner', label: '创建人', children: res.owner },
                      { key: 'date', label: '更新时间', children: res.updateTime },
                      { key: 'key', label: '资源标识', children: res.resourceKey || '—' },
                      { key: 'strategy', label: '可见范围', children: strategy ? <Tag color={strategy.color}>{strategy.label}</Tag> : '—' },
                      { key: 'desc', label: '资源描述', span: 2, children: res.description },
                    ]} />
                  </Card>
                ) : (
                  <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                    <Empty description="被申请的资源已不存在" />
                  </Card>
                )}

                <Card title="申请信息" styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
                  <Descriptions column={2} size="small" items={[
                    {
                      key: 'applicant', label: '申请人',
                      children: (
                        <Space size={8}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                          <span style={{ fontWeight: 500 }}>{app.applicant}</span>
                          <span style={{ color: '#8c8c8c' }}>{app.dept}</span>
                        </Space>
                      ),
                    },
                    { key: 'space', label: '申请空间', children: getSpaceName(app.spaceId) },
                    { key: 'time', label: '申请时间', children: app.applyTime },
                    { key: 'duration', label: '使用期限', children: app.duration === 'permanent' ? '永久有效' : app.expireDate },
                    { key: 'reason', label: '申请理由', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.reason || '未填写理由'}</span> },
                  ]} />
                </Card>

                <Card title="审批结果" styles={{ body: { padding: 20 } }}>
                  <Descriptions column={2} size="small" items={[
                    {
                      key: 'status', label: '审批决策',
                      children: <Tag color={isApproved ? 'success' : 'error'} style={{ fontWeight: 500 }}>{isApproved ? '审批通过' : '已驳回'}</Tag>,
                    },
                    { key: 'operator', label: '审批人', children: app.operator || '—' },
                    { key: 'approvalTime', label: '审批时间', children: app.approvalTime || '—' },
                    { key: 'opinion', label: '审批意见', span: 2, children: <span style={{ whiteSpace: 'pre-wrap' }}>{app.opinion || '—'}</span> },
                  ]} />
                </Card>
              </>
            );
          })()}
        </Drawer>
      </Drawer>
    </div>
  );
}
