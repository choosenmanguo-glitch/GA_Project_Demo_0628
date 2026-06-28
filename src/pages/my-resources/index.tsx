import React, { useState, useMemo } from 'react';
import { Input, Tag, Typography, Button, Segmented, Select, Empty, Space, Tooltip, message as antMsg, Modal, Checkbox } from 'antd';
import {
  SearchOutlined, CloudDownloadOutlined, SyncOutlined, KeyOutlined,
  CheckCircleFilled, CloseCircleFilled, MinusCircleOutlined, LoadingOutlined,
  CopyOutlined, EyeOutlined, EyeInvisibleOutlined,
  ApiOutlined, CodeOutlined, CloudServerOutlined, FolderOpenOutlined,
  ClockCircleOutlined,
  FileTextOutlined, ToolOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { ResourceDetailDrawer } from '@/components/ResourceDetailDrawer';
import { mockUserResources, type ResourceType, type UserResourceItem, type InstallStatus, type ResourceItem } from '@/mock/data';

const { Text } = Typography;

// ════════════════════════════════════════════════
// Config
// ════════════════════════════════════════════════

const typeConfig: Record<ResourceType, { color: string; bg: string; icon: React.ReactNode }> = {
  '模型':   { color: '#1677ff', bg: '#e6f4ff', icon: <CodeOutlined /> },
  'API':    { color: '#52c41a', bg: '#f6ffed', icon: <ApiOutlined /> },
  '连接器': { color: '#722ed1', bg: '#f9f0ff', icon: <CloudServerOutlined /> },
  '知识库':  { color: '#fa8c16', bg: '#fff7e6', icon: <FolderOpenOutlined /> },
  '提示词':  { color: '#13c2c2', bg: '#e6fffb', icon: <FileTextOutlined /> },
  '插件工具': { color: '#eb2f96', bg: '#fff0f6', icon: <ToolOutlined /> },
  '数据连接': { color: '#2f54eb', bg: '#f0f5ff', icon: <DatabaseOutlined /> },
};

const installConfig: Record<InstallStatus, { color: string; bg: string; label: string; icon?: React.ReactNode }> = {
  '已安装': { color: '#52c41a', bg: '#f6ffed', label: '已安装', icon: <CheckCircleFilled style={{ fontSize: 11 }} /> },
  '未安装': { color: 'rgba(0,0,0,0.34)', bg: 'rgba(0,0,0,0.04)', label: '未安装', icon: <MinusCircleOutlined style={{ fontSize: 11 }} /> },
  '安装失败': { color: '#ff4d4f', bg: '#fff2f0', label: '安装失败', icon: <CloseCircleFilled style={{ fontSize: 11 }} /> },
  '安装中': { color: '#1677ff', bg: '#e6f4ff', label: '安装中', icon: <LoadingOutlined style={{ fontSize: 11 }} /> },
};

const authSourceConfig: Record<string, { color: string }> = {
  '我申请的': { color: '#1677ff' },
  '共享给我的': { color: '#52c41a' },
  '管理员授权': { color: '#722ed1' },
};

const tabs = [
  { label: '全部', value: 'all' },
  { label: '模型', value: '模型' },
  { label: 'API', value: 'API' },
  { label: '连接器', value: '连接器' },
  { label: '知识库', value: '知识库' },
  { label: '提示词', value: '提示词' },
  { label: '插件工具', value: '插件工具' },
  { label: '数据连接', value: '数据连接' },
];

// ════════════════════════════════════════════════

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MyResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [installFilter, setInstallFilter] = useState<string | undefined>();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();

  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set());
  const [resourceStatuses, setResourceStatuses] = useState<Record<string, InstallStatus>>({});

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);

  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const getStatus = (ur: UserResourceItem): InstallStatus =>
    resourceStatuses[ur.id] ?? ur.installStatus;

  // ── Filter ──
  const filteredResources = useMemo(() => {
    return mockUserResources.filter(ur => {
      if (activeTab !== 'all' && ur.resource.type !== activeTab) return false;
      if (searchText) {
        const kw = searchText.toLowerCase();
        if (!ur.resource.name.toLowerCase().includes(kw) && !ur.resource.description.toLowerCase().includes(kw)) return false;
      }
      const st = getStatus(ur);
      if (installFilter && st !== installFilter) return false;
      if (sourceFilter && ur.authSource !== sourceFilter) return false;
      return true;
    });
  }, [activeTab, searchText, installFilter, sourceFilter, resourceStatuses]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = mockUserResources.length;
    const installed = mockUserResources.filter(u => getStatus(u) === '已安装').length;
    const uninstalled = mockUserResources.filter(u => getStatus(u) === '未安装').length;
    const expiringSoon = mockUserResources.filter(u => u.authExpireDate && daysUntil(u.authExpireDate) <= 7 && daysUntil(u.authExpireDate) >= 0).length;
    return { total, installed, uninstalled, expiringSoon };
  }, [resourceStatuses]);

  // ── Install ──
  const handleInstall = (ur: UserResourceItem) => {
    setInstallingIds(prev => new Set(prev).add(ur.id));
    setTimeout(() => {
      setInstallingIds(prev => { const next = new Set(prev); next.delete(ur.id); return next; });
      setResourceStatuses(prev => ({ ...prev, [ur.id]: '已安装' }));
      antMsg.success(`「${ur.resource.name}」安装成功`);
    }, 1500 + Math.random() * 1500);
  };

  const handleBatchInstall = () => {
    const toInstall = Array.from(selectedIds)
      .map(id => mockUserResources.find(ur => ur.id === id))
      .filter((ur): ur is UserResourceItem => !!ur && (getStatus(ur) !== '已安装'));

    if (toInstall.length === 0) { antMsg.warning('未选中可安装的资源'); return; }
    Modal.confirm({
      title: '批量安装确认',
      content: `即将安装以下 ${toInstall.length} 个资源：\n\n${toInstall.map(u => `· ${u.resource.name}`).join('\n')}`,
      okText: '确认安装',
      onOk: () => {
        setInstallingIds(prev => {
          const next = new Set(prev);
          toInstall.forEach(u => next.add(u.id));
          return next;
        });
        setTimeout(() => {
          setInstallingIds(new Set());
          setResourceStatuses(prev => {
            const next = { ...prev };
            toInstall.forEach(u => next[u.id] = '已安装');
            return next;
          });
          antMsg.success(`批量安装完成：${toInstall.length} 个资源安装成功`);
          setBatchMode(false);
          setSelectedIds(new Set());
        }, 2500);
      },
    });
  };

  const toggleSelectAll = () => {
    const installable = filteredResources.filter(u => getStatus(u) !== '已安装');
    if (selectedIds.size === installable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(installable.map(u => u.id)));
    }
  };

  // ── API Key ──
  const mockApiKey = 'sk-police-platform-8a7b3c2d1e4f5g6h7i8j9k0l';

  const copyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey).then(() => antMsg.success('API Key 已复制到剪贴板'));
  };

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="我的资源" hint="管理已获授权的资源，执行安装与查看个人调用凭证" />

      {/* ═══ Filter + Action Bar ═══ */}
      <div style={{
        background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3',
        padding: '14px 20px', marginTop: 12, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <Segmented
          value={activeTab}
          onChange={val => setActiveTab(val as string)}
          options={tabs.map(t => ({ label: t.label, value: t.value }))}
          style={{ borderRadius: 8 }}
        />
        <Input
          prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
          placeholder="搜索资源名称或描述..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 6 }}
        />
        <Select
          placeholder="安装状态"
          value={installFilter}
          onChange={setInstallFilter}
          allowClear
          style={{ width: 120, borderRadius: 6 }}
          options={[
            { label: '已安装', value: '已安装' },
            { label: '未安装', value: '未安装' },
            { label: '安装失败', value: '安装失败' },
          ]}
        />
        <Select
          placeholder="来源"
          value={sourceFilter}
          onChange={setSourceFilter}
          allowClear
          style={{ width: 120, borderRadius: 6 }}
          options={[
            { label: '我申请的', value: '我申请的' },
            { label: '共享给我的', value: '共享给我的' },
            { label: '管理员授权', value: '管理员授权' },
          ]}
        />
        <Text style={{ fontSize: 12, color: '#7A8599', whiteSpace: 'nowrap' }}>共 {filteredResources.length} 项</Text>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {batchMode ? (
            <>
              <Button size="small" onClick={toggleSelectAll}>{selectedIds.size === filteredResources.filter(u => u.installStatus === '未安装' || u.installStatus === '安装失败').length ? '取消全选' : '全选'}</Button>
              <Button size="small" onClick={() => { setBatchMode(false); setSelectedIds(new Set()); }}>取消</Button>
              <Button type="primary" size="small" onClick={handleBatchInstall} disabled={selectedIds.size === 0}>
                执行安装 ({selectedIds.size})
              </Button>
            </>
          ) : (
            <>
              <Button size="small" icon={<CloudDownloadOutlined />} onClick={() => setBatchMode(true)} style={{ borderRadius: 6 }}>一键安装</Button>
              <Button size="small" icon={<KeyOutlined />} onClick={() => setApiKeyModal(true)} style={{ borderRadius: 6 }}>API Key</Button>
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* ═══ Card Grid — 四列 ═══ */}
        {filteredResources.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {filteredResources.map(ur => {
              const tc = typeConfig[ur.resource.type];
              const statusNow = getStatus(ur);
              const ic = installConfig[statusNow];
              const isInstalling = installingIds.has(ur.id);
              const isSelected = selectedIds.has(ur.id);
              const isExpiring = ur.authExpireDate && daysUntil(ur.authExpireDate) <= 7 && daysUntil(ur.authExpireDate) >= 0;
              const as = authSourceConfig[ur.authSource];
              const installable = statusNow !== '已安装';

              return (
                <div
                  key={ur.id}
                  onClick={() => {
                    if (batchMode && installable) {
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        if (next.has(ur.id)) next.delete(ur.id); else next.add(ur.id);
                        return next;
                      });
                    } else if (!batchMode) {
                      setDetailResource(ur.resource);
                      setDetailOpen(true);
                    }
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    border: batchMode && isSelected ? '2px solid #1677ff' : '1px solid #E5EAF3',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: batchMode && isSelected ? '0 0 0 3px rgba(22,119,255,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    if (!batchMode) {
                      e.currentTarget.style.borderColor = '#BCC7DB';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = batchMode && isSelected ? '#1677ff' : '#E5EAF3';
                    e.currentTarget.style.boxShadow = batchMode && isSelected ? '0 0 0 3px rgba(22,119,255,0.12)' : '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Batch checkbox */}
                  {batchMode && (
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                      <Checkbox checked={isSelected} disabled={!installable} />
                    </div>
                  )}

                  {/* ── Header: icon + name + tags ── */}
                  <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 8, background: tc.bg, color: tc.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>
                      {tc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600, color: '#1D2129', lineHeight: '22px', marginBottom: 6,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ur.resource.name}
                      </div>
                      <Space size={5} wrap>
                        <Tag style={{
                          borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                          background: tc.bg, color: tc.color, border: 'none',
                        }}>
                          {ur.resource.type}
                        </Tag>
                        {isExpiring && (
                          <Tag style={{
                            borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                            color: '#fa8c16', background: '#fff7e6', border: 'none',
                          }}>
                            <ClockCircleOutlined style={{ fontSize: 10, marginRight: 2 }} />即将到期
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </div>

                  {/* ── Description ── */}
                  <div style={{ padding: '10px 18px 0' }}>
                    <Text style={{
                      fontSize: 13, color: '#5F6B7A', lineHeight: '21px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {ur.resource.description}
                    </Text>
                  </div>

                  {/* ── Footer: install status + action ── */}
                  <div style={{
                    padding: '12px 18px 16px', marginTop: 'auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Tag style={{
                      borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                      color: ic.color, background: 'transparent', border: 'none', padding: 0,
                    }}>
                      {ic.icon}<span style={{ marginLeft: 3 }}>{ic.label}</span>
                    </Tag>
                    {isInstalling ? (
                      <Button size="small" loading style={{ borderRadius: 6 }}>安装中</Button>
                    ) : statusNow === '已安装' ? (
                      <Button size="small" style={{ borderRadius: 6 }} icon={<SyncOutlined />}
                        onClick={(e) => { e.stopPropagation(); handleInstall(ur); }}>重新安装</Button>
                    ) : (
                      <Button type="primary" size="small" style={{ borderRadius: 6 }} icon={<CloudDownloadOutlined />}
                        onClick={(e) => { e.stopPropagation(); handleInstall(ur); }} disabled={batchMode}>
                        {statusNow === '安装失败' ? '重新安装' : '安装资源'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3',
            textAlign: 'center', padding: '80px 0',
          }}>
            <Empty description="暂无匹配的资源" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>

      {/* ═══ Resource Detail Drawer ═══ */}
      <ResourceDetailDrawer
        open={detailOpen}
        resource={detailResource}
        onClose={() => { setDetailOpen(false); setDetailResource(null); }}
      />

      {/* ═══ API Key Modal ═══ */}
      <Modal
        title={<Space><KeyOutlined style={{ color: '#1677ff' }} />空间 API Key</Space>}
        open={apiKeyModal}
        onCancel={() => { setApiKeyModal(false); setApiKeyVisible(false); }}
        footer={null}
        width={480}
        destroyOnHidden
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>
            此 Key 用于对接平台服务时进行身份认证，请妥善保管。
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F7F9FC', borderRadius: 8, padding: '14px 16px', border: '1px solid #E5EAF3' }}>
            <Text code style={{ flex: 1, fontSize: 13, userSelect: 'text', wordBreak: 'break-all' }}>
              {apiKeyVisible ? mockApiKey : mockApiKey.substring(0, 8) + '****' + mockApiKey.substring(mockApiKey.length - 4)}
            </Text>
            <Tooltip title={apiKeyVisible ? '隐藏' : '显示完整 Key'}>
              <Button size="small" type="text" icon={apiKeyVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setApiKeyVisible(!apiKeyVisible)} />
            </Tooltip>
            <Tooltip title="复制">
              <Button size="small" type="text" icon={<CopyOutlined />} onClick={copyApiKey} />
            </Tooltip>
          </div>
        </div>
      </Modal>
    </div>
  );
}
