import React, { useMemo, useState } from 'react';
import { App as AntdApp, Button, Pagination, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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

export default function MyResourcesPage() {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const { currentSpace } = useWorkspace();
  const { resources, grants, getAccess, installResource, batchInstall, removeGrant } = useResourceCenter();
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', status: undefined, type: undefined, installStatus: undefined });
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);

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
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title={
          <span>
            <ArrowLeftOutlined
              onClick={() => navigate('/dev/resource-square')}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
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
            <Button type="primary" onClick={() => setBatchMode(true)}>一键安装</Button>
          )}
        </FilterBar>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div className="resource-card-grid" style={{ marginTop: 12 }}>
            {items.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map(resource => {
              const access = getAccess(resource.id, currentSpace.id);
              return (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  access={access}
                  mode="mine"
                  selectable={batchMode && !access.invalidReason && access.grant?.installStatus !== 'installed'}
                  selected={selectedIds.includes(resource.id)}
                  onSelect={checked => toggleSelected(resource.id, checked)}
                  onInstall={() => installResource(resource.id, currentSpace.id)}
                  onRemove={() => { removeGrant(resource.id, currentSpace.id); message.success('已从我的资源中移除该失效记录'); }}
                  onCardClick={() => setDetailResource(resource)}
                />
              );
            })}
          </div>
          <div className="resource-page-pagination">
            <Pagination
              current={cardPage}
              pageSize={cardPageSize}
              total={items.length}
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
    </div>
  );
}
