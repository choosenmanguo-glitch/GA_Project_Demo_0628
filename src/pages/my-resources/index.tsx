import React, { useMemo, useState } from 'react';
import { App as AntdApp, Button, Drawer, Pagination, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import type { FilterField } from '@/components/FilterBar';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceDetailDrawer from '@/features/resource-center/components/ResourceDetailDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { ResourceItem } from '@/features/resource-center/types';
import { typeConfig } from '@/features/resource-center/ui';

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索资源名称或描述', width: 240 },
  { type: 'select', key: 'status', placeholder: '有效性', width: 110, options: [
    { label: '全部', value: 'all' },
    { label: '正常', value: 'normal' },
    { label: '失效', value: 'invalid' },
  ]},
  { type: 'select', key: 'type', placeholder: '资源类型', width: 120, options: [
    { label: '全部类型', value: 'all' },
    ...Object.entries(typeConfig).map(([value, config]) => ({ label: config.label, value })),
  ]},
  { type: 'select', key: 'installStatus', placeholder: '安装状态', width: 120, options: [
    { label: '全部', value: 'all' },
    { label: '已安装', value: 'installed' },
    { label: '未安装', value: 'not_installed' },
    { label: '安装失败', value: 'failed' },
    { label: '安装中', value: 'installing' },
  ]},
];

interface MyResourcesPageProps {
  /** 紧凑模式：在资源广场 tab 内嵌时使用，隐藏 PageHeader，无外层 padding */
  compact?: boolean;
}

export default function MyResourcesPage({ compact }: MyResourcesPageProps) {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone');
  const { currentSpace } = useWorkspace();
  const { resources, grants, applications, getAccess, installResource, batchInstall, removeGrant } = useResourceCenter();
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, type: undefined, installStatus: undefined });
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [showApplicationRecords, setShowApplicationRecords] = useState(false);

  const currentGrants = useMemo(() => grants.filter(grant => grant.spaceId === currentSpace.id), [currentSpace.id, grants]);
  const items = useMemo(() => currentGrants
    .map(grant => resources.find(resource => resource.id === grant.resourceId))
    .filter((resource): resource is ResourceItem => !!resource)
    .filter(resource => {
      const access = getAccess(resource.id, currentSpace.id);
      const invalid = !!access.invalidReason;
      if (filters.status === 'normal' && invalid) return false;
      if (filters.status === 'invalid' && !invalid) return false;
      if (filters.type && resource.type !== filters.type) return false;
      if (filters.installStatus && access.grant?.installStatus !== filters.installStatus) return false;
      const word = (filters.keyword || '').trim().toLowerCase();
      return !word || resource.name.toLowerCase().includes(word) || resource.description.toLowerCase().includes(word);
    }), [currentGrants, currentSpace.id, filters, getAccess, resources]);

  const myApplications = useMemo(() => applications.filter(a => a.spaceId === currentSpace.id), [applications, currentSpace.id]);

  const toggleSelected = (id: string, checked: boolean) => {
    if (checked && selectedIds.length >= 10) {
      message.warning('批量一键安装最多只能选择 10 个资源');
      return;
    }
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const finishBatch = () => {
    if (selectedIds.length === 0) return message.warning('请先选择需要安装的资源');
    batchInstall(selectedIds, currentSpace.id);
    message.success(`已开始安装 ${selectedIds.length} 个资源`);
    setSelectedIds([]);
    setBatchMode(false);
  };

  return (
    <div style={{ flex: 1, padding: compact ? 0 : '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {!compact && (
        <PageHeader
          title={
            <span>
              <ArrowLeftOutlined
                onClick={() => navigate(isStandalone ? '/standalone/resource-square' : '/dev/resource-square')}
                style={{ marginRight: 8, cursor: 'pointer', color: 'rgba(0,0,0,0.45)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1677ff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.45)')}
              />
              我的资源
            </span>
          }
          hint="当前工作空间已经获取的资源"
          extra={<Tag color="blue">{currentSpace.name}</Tag>}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: compact ? 'transparent' : '#fff', borderRadius: compact ? 0 : 8, overflow: 'hidden' }}>
        <FilterBar
          filters={filterFields}
          filterValues={filters}
          onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); }}
          onSearch={() => {}}
          onReset={() => { setFilters({ keyword: '', status: undefined, type: undefined, installStatus: undefined }); setCardPage(1); }}
        >
          {batchMode ? (
            <>
              <Button icon={<CloseOutlined />} onClick={() => { setBatchMode(false); setSelectedIds([]); }}>取消多选</Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={finishBatch}>执行安装（{selectedIds.length}）</Button>
            </>
          ) : (
            <>
              <Button type="primary" onClick={() => { setBatchMode(true); setCardPage(1); }}>一键安装</Button>
              <Button onClick={() => setShowApplicationRecords(true)}>申请记录</Button>
            </>
          )}
        </FilterBar>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div className="resource-card-grid" style={{ marginTop: 12 }}>
            {(batchMode ? items.filter(r => !getAccess(r.id, currentSpace.id).invalidReason) : items).slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map(resource => {
              const access = getAccess(resource.id, currentSpace.id);
              return (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  access={access}
                  mode="mine"
                  selectable={batchMode && !access.invalidReason}
                  selected={selectedIds.includes(resource.id)}
                  onSelect={checked => toggleSelected(resource.id, checked)}
                  onInstall={() => installResource(resource.id, currentSpace.id)}
                  onRemove={() => { removeGrant(resource.id, currentSpace.id); message.success('已从我的资源中移除该失效记录'); }}
                  onCardClick={batchMode ? undefined : () => setDetailResource(resource)}
                />
              );
            })}
          </div>
          <div className="resource-page-pagination">
            <Pagination
              current={cardPage}
              pageSize={cardPageSize}
              total={batchMode ? items.filter(r => !getAccess(r.id, currentSpace.id).invalidReason).length : items.length}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              pageSizeOptions={['8', '12', '16', '24']}
              onChange={(page, size) => { setCardPage(page); setCardPageSize(size); }}
            />
          </div>
        </div>
      </div>

      <ResourceDetailDrawer
        open={!!detailResource}
        resource={detailResource}
        access={detailResource ? getAccess(detailResource.id, currentSpace.id) : null}
        spaceName={currentSpace.name}
        onClose={() => setDetailResource(null)}
        onAcquire={() => undefined}
        onApply={() => undefined}
      />

      <Drawer
        title="申请记录"
        open={showApplicationRecords}
        onClose={() => setShowApplicationRecords(false)}
        size={480}
        destroyOnHidden
      >
        {myApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#B0B8C8', fontSize: 13 }}>
            暂无申请记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myApplications.map(app => {
              const res = resources.find(r => r.id === app.resourceId);
              const type = res ? typeConfig[res.type] : null;
              const statusMap: Record<string, { label: string; color: string }> = {
                pending: { label: '待审核', color: 'orange' },
                approved: { label: '已通过', color: 'green' },
                rejected: { label: '已驳回', color: 'red' },
              };
              const s = statusMap[app.status] || { label: app.status, color: 'default' };
              return (
                <div
                  key={app.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1px solid #E5EAF3',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: type?.bg || '#f0f0f0',
                      color: type?.color || '#999',
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {type?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#1D2129' }}>{res?.name || app.resourceId}</span>
                      <Tag color={s.color} style={{ borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px' }}>
                        {s.label}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#7A8599' }}>
                      申请于 {app.applyTime}
                    </div>
                    <div style={{ fontSize: 12, color: '#7A8599', marginTop: 2 }}>
                      使用期限：{app.duration === 'permanent' ? '永久' : `至 ${app.expireDate}`}
                    </div>
                    {app.status === 'rejected' && app.opinion && (
                      <div style={{
                        marginTop: 6,
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: '#fff2f0',
                        border: '1px solid #ffccc7',
                        fontSize: 12,
                        color: '#cf1322',
                      }}>
                        驳回原因：{app.opinion}
                      </div>
                    )}
                    {app.status === 'approved' && app.opinion && (
                      <div style={{
                        marginTop: 6,
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        fontSize: 12,
                        color: '#389e0d',
                      }}>
                        审批意见：{app.opinion}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
}
