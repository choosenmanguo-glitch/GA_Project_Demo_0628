import React, { useState, useMemo } from 'react';
import { Input, Tag, Typography, Button, Segmented, Select, Empty, Space, Tooltip, message as antMsg, Modal, Checkbox } from 'antd';
import {
  SearchOutlined, CloudDownloadOutlined, SyncOutlined, KeyOutlined,
  CheckCircleFilled, CloseCircleFilled, MinusCircleOutlined, LoadingOutlined,
  CopyOutlined, EyeOutlined, EyeInvisibleOutlined,
  ApiOutlined, CodeOutlined, CloudServerOutlined, FolderOpenOutlined,
  ClockCircleOutlined, PushpinFilled,
  FileTextOutlined, ToolOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { mockUserResources, type ResourceType, type UserResourceItem, type InstallStatus } from '@/mock/data';

const { Text, Paragraph } = Typography;

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

  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);

  // ── Filter ──
  const filteredResources = useMemo(() => {
    return mockUserResources.filter(ur => {
      if (activeTab !== 'all' && ur.resource.type !== activeTab) return false;
      if (searchText) {
        const kw = searchText.toLowerCase();
        if (!ur.resource.name.toLowerCase().includes(kw) && !ur.resource.description.toLowerCase().includes(kw)) return false;
      }
      if (installFilter && ur.installStatus !== installFilter) return false;
      if (sourceFilter && ur.authSource !== sourceFilter) return false;
      return true;
    });
  }, [activeTab, searchText, installFilter, sourceFilter]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = mockUserResources.length;
    const installed = mockUserResources.filter(u => u.installStatus === '已安装').length;
    const uninstalled = mockUserResources.filter(u => u.installStatus === '未安装').length;
    const expiringSoon = mockUserResources.filter(u => u.authExpireDate && daysUntil(u.authExpireDate) <= 7 && daysUntil(u.authExpireDate) >= 0).length;
    return { total, installed, uninstalled, expiringSoon };
  }, []);

  // ── Install ──
  const handleInstall = (ur: UserResourceItem) => {
    setInstallingIds(prev => new Set(prev).add(ur.id));
    setTimeout(() => {
      setInstallingIds(prev => { const next = new Set(prev); next.delete(ur.id); return next; });
      antMsg.success(`「${ur.resource.name}」安装成功`);
    }, 1500 + Math.random() * 1500);
  };

  const handleBatchInstall = () => {
    const toInstall = Array.from(selectedIds)
      .map(id => mockUserResources.find(ur => ur.id === id))
      .filter((ur): ur is UserResourceItem => !!ur && (ur.installStatus === '未安装' || ur.installStatus === '安装失败'));

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
          antMsg.success(`批量安装完成：${toInstall.length} 个资源安装成功`);
          setBatchMode(false);
          setSelectedIds(new Set());
        }, 2500);
      },
    });
  };

  const toggleSelectAll = () => {
    const installable = filteredResources.filter(u => u.installStatus === '未安装' || u.installStatus === '安装失败');
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
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 24px' }}>
      <PageHeader title="我的资源" hint="管理已获授权的资源，执行安装与查看个人调用凭证" />

      {/* ═══ Stat Cards ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '已获授权', value: stats.total, color: '#1677ff' },
          { label: '已安装', value: stats.installed, color: '#52c41a' },
          { label: '未安装', value: stats.uninstalled, color: 'rgba(0,0,0,0.45)' },
          { label: '即将到期', value: stats.expiringSoon, color: '#fa8c16' },
        ].map(st => (
          <div key={st.label} style={{
            background: '#fff', borderRadius: 10, border: '1px solid #e8ebf0',
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: st.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{st.value}</span>
          </div>
        ))}
      </div>

      {/* ═══ Filter + Action Bar ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Segmented
          value={activeTab}
          onChange={val => setActiveTab(val as string)}
          options={tabs.map(t => ({ label: t.label, value: t.value }))}
          style={{ borderRadius: 8 }}
        />
        <Input
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          placeholder="搜索资源名称或描述..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 8 }}
        />
        <Select
          placeholder="安装状态"
          value={installFilter}
          onChange={setInstallFilter}
          allowClear
          style={{ width: 120 }}
          options={[
            { label: '全部', value: undefined },
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
          style={{ width: 120 }}
          options={[
            { label: '全部', value: undefined },
            { label: '我申请的', value: '我申请的' },
            { label: '共享给我的', value: '共享给我的' },
            { label: '管理员授权', value: '管理员授权' },
          ]}
        />

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
              <Button size="small" icon={<CloudDownloadOutlined />} onClick={() => setBatchMode(true)} style={{ borderRadius: 8 }}>一键安装</Button>
              <Button size="small" icon={<KeyOutlined />} onClick={() => setApiKeyModal(true)} style={{ borderRadius: 8 }}>API Key</Button>
            </>
          )}
        </div>
      </div>

      {/* ═══ Card Grid ═══ */}
      {filteredResources.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredResources.map(ur => {
            const tc = typeConfig[ur.resource.type];
            const ic = installConfig[ur.installStatus];
            const isInstalling = installingIds.has(ur.id);
            const isSelected = selectedIds.has(ur.id);
            const isExpiring = ur.authExpireDate && daysUntil(ur.authExpireDate) <= 7 && daysUntil(ur.authExpireDate) >= 0;

            return (
              <div
                key={ur.id}
                onClick={() => {
                  if (batchMode && (ur.installStatus === '未安装' || ur.installStatus === '安装失败')) {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      if (next.has(ur.id)) next.delete(ur.id); else next.add(ur.id);
                      return next;
                    });
                  }
                }}
                style={{
                  background: '#fff', borderRadius: 12, border: batchMode && isSelected ? '2px solid #1677ff' : '1px solid #e8ebf0',
                  padding: 0, overflow: 'hidden', transition: 'all 0.2s',
                  boxShadow: batchMode && isSelected ? '0 0 0 3px rgba(22,119,255,0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                  cursor: batchMode ? 'pointer' : 'default',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!batchMode) { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = batchMode && isSelected ? '0 0 0 3px rgba(22,119,255,0.12)' : '0 1px 2px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Batch checkbox */}
                {batchMode && (
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                    <Checkbox checked={isSelected}
                      disabled={ur.installStatus !== '未安装' && ur.installStatus !== '安装失败'} />
                  </div>
                )}

                {/* Card Header */}
                <div style={{ padding: '20px 20px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: tc.bg, color: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {tc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.88)', lineHeight: '20px', marginBottom: 6 }}>
                        {ur.resource.name}
                      </div>
                      <Space size={6} wrap>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 10, padding: '1px 8px', lineHeight: '18px', color: ic.color, background: ic.bg, border: 'none' }}>
                          {ic.icon}{ic.label}
                        </Tag>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 10, padding: '1px 8px', lineHeight: '18px', background: tc.bg, color: tc.color, border: 'none' }}>
                          {ur.resource.type}
                        </Tag>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 10, padding: '1px 8px', lineHeight: '18px', color: authSourceConfig[ur.authSource].color, background: authSourceConfig[ur.authSource].color + '14', border: 'none' }}>
                          {ur.authSource}
                        </Tag>
                        {isExpiring && (
                          <Tag style={{ borderRadius: 4, margin: 0, fontSize: 10, padding: '1px 8px', lineHeight: '18px', color: '#fa8c16', background: '#fff7e6', border: 'none' }}>
                            <ClockCircleOutlined style={{ fontSize: 10, marginRight: 2 }} />即将到期
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ padding: '0 20px 16px' }}>
                  <Text type="secondary" style={{ fontSize: 12, lineHeight: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ur.resource.description}
                  </Text>
                  {ur.authExpireDate && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        授权至 {ur.authExpireDate}
                        {isExpiring && <span style={{ color: '#fa8c16', marginLeft: 4 }}>（{daysUntil(ur.authExpireDate)}天后到期）</span>}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'flex-end' }}>
                  {isInstalling ? (
                    <Button size="small" loading style={{ borderRadius: 8 }}>安装中</Button>
                  ) : ur.installStatus === '已安装' ? (
                    <Button size="small" style={{ borderRadius: 8 }} icon={<SyncOutlined />} onClick={(e) => { e.stopPropagation(); handleInstall(ur); }}>重新安装</Button>
                  ) : ur.installStatus === '安装失败' ? (
                    <Button size="small" danger style={{ borderRadius: 8 }} icon={<SyncOutlined />} onClick={(e) => { e.stopPropagation(); handleInstall(ur); }}>重新安装</Button>
                  ) : (
                    <Button type="primary" size="small" style={{ borderRadius: 8 }} icon={<CloudDownloadOutlined />}
                      onClick={(e) => { e.stopPropagation(); handleInstall(ur); }} disabled={batchMode}>
                      安装资源
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Empty description="暂无匹配的资源" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}

      {/* ═══ API Key Modal ═══ */}
      <Modal
        title={<Space><KeyOutlined style={{ color: '#1677ff' }} />个人 API Key</Space>}
        open={apiKeyModal}
        onCancel={() => { setApiKeyModal(false); setApiKeyVisible(false); }}
        footer={null}
        width={480}
        destroyOnClose
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>
            此 Key 用于对接平台服务时进行身份认证，请妥善保管。
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', borderRadius: 10, padding: '14px 16px', border: '1px solid #f0f0f0' }}>
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
