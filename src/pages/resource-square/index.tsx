import React, { useMemo, useState } from 'react';
import { App as AntdApp, Empty, Input, Row, Col, Tabs, Tag } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import ResourceApplyModal from '@/features/resource-center/components/ResourceApplyModal';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceDetailDrawer from '@/features/resource-center/components/ResourceDetailDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { ResourceItem, ResourceType } from '@/features/resource-center/types';
import { pageContainerStyle, panelStyle, typeConfig } from '@/features/resource-center/ui';

const tabItems: { key: 'all' | ResourceType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'model', label: '模型' },
  { key: 'api', label: 'API' },
  { key: 'mcp', label: 'MCP' },
  { key: 'knowledge', label: '知识库' },
];

export default function ResourceSquarePage() {
  const { message } = AntdApp.useApp();
  const { currentSpace } = useWorkspace();
  const { resources, getAccess, acquire, applyForResource } = useResourceCenter();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ResourceType | 'all') || 'all';
  const [activeType, setActiveType] = useState<'all' | ResourceType>(initialTab);
  const [keyword, setKeyword] = useState('');
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [applyResource, setApplyResource] = useState<ResourceItem | null>(null);

  const visibleResources = useMemo(() => resources
    .filter(resource => resource.publishStatus === 'published' && !resource.isDeleted)
    .filter(resource => {
      const access = getAccess(resource.id, currentSpace.id);
      if (resource.publicStrategy === 'whitelist' && !access.isAcquired && access.status !== 'reviewing') return false;
      if (activeType !== 'all' && resource.type !== activeType) return false;
      const word = keyword.trim().toLowerCase();
      if (!word) return true;
      return resource.name.toLowerCase().includes(word)
        || resource.description.toLowerCase().includes(word)
        || resource.owner.toLowerCase().includes(word);
    })
    .sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned)),
  [activeType, currentSpace.id, getAccess, keyword, resources]);

  const detailAccess = detailResource ? getAccess(detailResource.id, currentSpace.id) : null;

  const handleAcquire = () => {
    if (!detailResource) return;
    const created = acquire(detailResource.id, currentSpace.id, '完全公开');
    if (created) message.success(`获取资源成功，已加入「${currentSpace.name} / 我的资源」`);
    else message.info('当前空间已获取该资源，无需重复操作');
  };

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="资源广场"
        hint="浏览、获取或申请平台共享的模型、API、MCP 与知识库资源"
        extra={<Tag color="blue">当前空间：{currentSpace.name}</Tag>}
      />

      <div style={{ ...panelStyle, marginTop: 4, marginBottom: 18 }}>
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Tabs
            activeKey={activeType}
            onChange={key => setActiveType(key as 'all' | ResourceType)}
            items={tabItems.map(item => ({
              key: item.key,
              label: <span>{item.label} <Tag variant="filled" style={{ marginInlineEnd: 0 }}>{item.key === 'all' ? resources.filter(resource => resource.publishStatus === 'published' && !resource.isDeleted).length : resources.filter(resource => resource.publishStatus === 'published' && resource.type === item.key && !resource.isDeleted).length}</Tag></span>,
            }))}
            style={{ flex: 1, minWidth: 420 }}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="搜索资源名称、描述、所有权人"
            style={{ width: 320, marginBottom: 16 }}
          />
        </div>
      </div>

      {visibleResources.length === 0 ? (
        <div style={{ ...panelStyle, padding: 80 }}><Empty description="没有符合条件的资源" /></div>
      ) : (
        <Row gutter={[16, 16]}>
          {visibleResources.map(resource => (
            <Col key={resource.id} xs={24} md={12} xl={8}>
              <ResourceCard
                resource={resource}
                access={getAccess(resource.id, currentSpace.id)}
                mode="square"
                onDetail={() => setDetailResource(resource)}
              />
            </Col>
          ))}
        </Row>
      )}

      <ResourceDetailDrawer
        open={!!detailResource}
        resource={detailResource}
        access={detailAccess}
        spaceName={currentSpace.name}
        onClose={() => setDetailResource(null)}
        onAcquire={handleAcquire}
        onApply={() => detailResource && setApplyResource(detailResource)}
      />

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
    </div>
  );
}
