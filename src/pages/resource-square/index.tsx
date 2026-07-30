import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { App as AntdApp, Badge, Input, Tag, Tabs } from 'antd';
import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import PaginationBar from '@/components/PaginationBar';
import MyResourcesPage from '@/pages/my-resources';
import ResourceApplyModal from '@/features/resource-center/components/ResourceApplyModal';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceDetailDrawer from '@/features/resource-center/components/ResourceDetailDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { ResourceItem, ResourceType } from '@/features/resource-center/types';

const tabKeys: { key: 'all' | ResourceType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'model', label: '模型' },
  { key: 'api', label: 'API' },
  { key: 'mcp', label: 'MCP' },
  { key: 'knowledge', label: '知识库' },
];

export default function ResourceSquarePage() {
  const { message } = AntdApp.useApp();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith('/standalone');
  const { currentSpace } = useWorkspace();
  const { resources, grants, getAccess, acquire, applyForResource } = useResourceCenter();

  // 从 URL 参数读取预选类型 tab
  const initialType = useMemo(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    return tabKeys.some(t => t.key === tab) ? (tab as ResourceType) : undefined;
  }, [location.search]);

  const [mainTab, setMainTab] = useState<'all' | 'mine'>('all');
  const [activeType, setActiveType] = useState<'all' | ResourceType>(initialType || 'all');
  const [keyword, setKeyword] = useState('');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [applyResource, setApplyResource] = useState<ResourceItem | null>(null);

  /** 我的资源数量 */
  const myResourcesCount = useMemo(() => {
    return grants.filter(grant => grant.spaceId === currentSpace.id).length;
  }, [grants, currentSpace.id]);

  const publishedResources = useMemo(() => resources
    .filter(resource => resource.publishStatus === 'published' && !resource.isDeleted),
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

  const detailAccess = detailResource ? getAccess(detailResource.id, currentSpace.id) : null;

  const handleAcquire = () => {
    if (!detailResource) return;
    const created = acquire(detailResource.id, currentSpace.id, '完全公开');
    if (created) message.success(`获取成功，已加入「${currentSpace.name} / 我的资源」`);
    else message.info('当前空间已获取该资源，无需重复操作');
  };

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

      {/* Main Tabs Row — outside white container */}
      <div style={{
        margin: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Tabs
          activeKey={mainTab}
          onChange={key => setMainTab(key as 'all' | 'mine')}
          tabBarStyle={{ marginBottom: 0, paddingTop: 4, paddingBottom: 4 }}
          items={[
            { key: 'all', label: '全部资源' },
            {
              key: 'mine',
              label: (
                <span>
                  我的资源
                  <Badge count={myResourcesCount} overflowCount={999} style={{ marginLeft: 6, backgroundColor: '#1677ff' }} />
                </span>
              ),
            },
          ]}
        />
        {isStandalone ? (
          <WorkspaceSwitcher inline />
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
        flex: 1, margin: '12px 24px 24px', display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* 全部资源 */}
        {mainTab === 'all' && (
          <>
            {/* Type Tabs + Search */}
            <div style={{
              padding: '0 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Tabs
                activeKey={activeType}
                onChange={key => { setActiveType(key as 'all' | ResourceType); setCardPage(1); }}
                tabBarStyle={{ marginBottom: 0, paddingTop: 4, paddingBottom: 4 }}
                items={tabKeys.map(item => ({
                  key: item.key,
                  label: (
                    <span>
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

            {/* Cards + Pagination */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
              <div className="resource-card-grid" style={{ marginTop: 16 }}>
                {visibleResources.slice((cardPage - 1) * cardPageSize, cardPage * cardPageSize).map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    access={getAccess(resource.id, currentSpace.id)}
                    mode="square"
                    onCardClick={() => setDetailResource(resource)}
                  />
                ))}
              </div>
              <PaginationBar current={cardPage} pageSize={cardPageSize} total={visibleResources.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
            </div>
          </>
        )}

        {/* 我的资源 */}
        {mainTab === 'mine' && <MyResourcesPage compact />}
      </div>

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
