import React, { useMemo, useState } from 'react';
import { App as AntdApp, Button, Col, Empty, Input, Row, Segmented, Select, Space, Tag } from 'antd';
import { CheckOutlined, CloudDownloadOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceDetailDrawer from '@/features/resource-center/components/ResourceDetailDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { InstallStatus, ResourceItem, ResourceType } from '@/features/resource-center/types';
import { pageContainerStyle, panelStyle, typeConfig } from '@/features/resource-center/ui';

type ValidFilter = 'all' | 'normal' | 'invalid';

export default function MyResourcesPage() {
  const { message } = AntdApp.useApp();
  const { currentSpace } = useWorkspace();
  const { resources, grants, getAccess, installResource, batchInstall, removeGrant } = useResourceCenter();
  const [validFilter, setValidFilter] = useState<ValidFilter>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all');
  const [installFilter, setInstallFilter] = useState<'all' | InstallStatus>('all');
  const [keyword, setKeyword] = useState('');
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
      if (validFilter === 'normal' && invalid) return false;
      if (validFilter === 'invalid' && !invalid) return false;
      if (typeFilter !== 'all' && resource.type !== typeFilter) return false;
      if (installFilter !== 'all' && access.grant?.installStatus !== installFilter) return false;
      const word = keyword.trim().toLowerCase();
      return !word || resource.name.toLowerCase().includes(word) || resource.description.toLowerCase().includes(word);
    }), [currentGrants, currentSpace.id, getAccess, installFilter, keyword, resources, typeFilter, validFilter]);

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
    <div style={pageContainerStyle}>
      <PageHeader
        title="我的资源"
        hint="当前工作空间已经获取的资源"
        extra={<Space><Tag color="blue">{currentSpace.name}</Tag><Tag>{currentGrants.length} 个资源</Tag></Space>}
      />

      <div style={{ ...panelStyle, padding: 16, marginTop: 4, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Space wrap>
            <Segmented value={validFilter} onChange={value => setValidFilter(value as ValidFilter)} options={[{ label: '全部', value: 'all' }, { label: '正常', value: 'normal' }, { label: '失效', value: 'invalid' }]} />
            <Input allowClear prefix={<SearchOutlined />} value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索资源名称或描述" style={{ width: 240 }} />
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 130 }} options={[{ label: '全部类型', value: 'all' }, ...Object.entries(typeConfig).map(([value, config]) => ({ label: config.label, value }))]} />
            <Select value={installFilter} onChange={setInstallFilter} style={{ width: 130 }} options={[
              { label: '全部安装状态', value: 'all' }, { label: '已安装', value: 'installed' }, { label: '未安装', value: 'not_installed' }, { label: '安装失败', value: 'failed' }, { label: '安装中', value: 'installing' },
            ]} />
          </Space>
          <Space>
            {batchMode ? (
              <>
                <Button icon={<CloseOutlined />} onClick={() => { setBatchMode(false); setSelectedIds([]); }}>取消多选</Button>
                <Button type="primary" icon={<CheckOutlined />} onClick={finishBatch}>执行安装（{selectedIds.length}）</Button>
              </>
            ) : <Button type="primary" icon={<CloudDownloadOutlined />} onClick={() => setBatchMode(true)}>一键安装</Button>}
          </Space>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ ...panelStyle, padding: 80 }}><Empty description="当前空间暂无符合条件的已获取资源" /></div>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map(resource => {
            const access = getAccess(resource.id, currentSpace.id);
            return (
              <Col key={resource.id} xs={24} md={12} xl={8}>
                <ResourceCard
                  resource={resource}
                  access={access}
                  mode="mine"
                  selectable={batchMode && !access.invalidReason && access.grant?.installStatus !== 'installed'}
                  selected={selectedIds.includes(resource.id)}
                  onSelect={checked => toggleSelected(resource.id, checked)}
                  onInstall={() => installResource(resource.id, currentSpace.id)}
                  onRemove={() => { removeGrant(resource.id, currentSpace.id); message.success('已从我的资源中移除该失效记录'); }}
                  onDetail={() => setDetailResource(resource)}
                />
              </Col>
            );
          })}
        </Row>
      )}

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
