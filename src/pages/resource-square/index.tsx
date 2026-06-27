import React, { useState, useMemo } from 'react';
import { Input, Tag, Typography, Button, Drawer, Segmented, Modal, DatePicker, Empty, Space, message as antMsg } from 'antd';
import {
  SearchOutlined, PushpinFilled,
  CalendarOutlined, ApiOutlined,
  CodeOutlined, FolderOpenOutlined, CheckCircleFilled, ClockCircleOutlined,
  QuestionCircleOutlined,
  FileTextOutlined, ToolOutlined, DatabaseOutlined,
  CloudServerOutlined, ThunderboltOutlined, PlusOutlined,
} from '@ant-design/icons';
import { mockResources, type ResourceItem, type ResourceType } from '@/mock/data';

const { Text, Paragraph, Title } = Typography;

// ════════════════════════════════════════════════
// Design tokens — resource type → color / icon
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

const strategyConfig: Record<string, { color: string; label: string }> = {
  '完全公开':           { color: '#52c41a', label: '完全公开' },
  '公开可见授权可用': { color: '#1677ff', label: '公开可见·授权可用' },
  '授权可见':           { color: '#fa8c16', label: '授权可见' },
};

/** 模拟调用次数——基于安装次数换算，实际应来自后端 */
const mockCallCount = (installCount: number): number => {
  const seed = (installCount * 17 + 3) % 47;
  return installCount * 12 + seed * 31;
};

// ════════════════════════════════════════════════

const tabs: { label: string; value: string }[] = [
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
// Page
// ════════════════════════════════════════════════

export default function ResourceSquarePage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [applyModal, setApplyModal] = useState<ResourceItem | null>(null);
  const [applyDuration, setApplyDuration] = useState<'long' | 'date'>('long');
  const [applyDate, setApplyDate] = useState<any>(null);
  const [applyReason, setApplyReason] = useState('');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // ── Data ──
  const publishedResources = useMemo(
    () => mockResources.filter(r => r.publishStatus === '已上架'),
    [],
  );

  const filteredResources = useMemo(() => {
    return publishedResources.filter(r => {
      if (activeTab === 'featured' && !r.isTop) return false;
      if (activeTab !== 'all' && activeTab !== 'featured' && r.type !== activeTab) return false;
      if (searchText) {
        const kw = searchText.toLowerCase();
        if (!r.name.toLowerCase().includes(kw) && !r.description.toLowerCase().includes(kw) && !r.owner.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [publishedResources, activeTab, searchText]);

  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return b.publishDate.localeCompare(a.publishDate);
    });
  }, [filteredResources]);

  // ── KPI stats (compact) ──
  const stats = useMemo(() => {
    const byType = (t: ResourceType) => publishedResources.filter(r => r.type === t).length;
    return [
      { label: '资源总数', value: publishedResources.length, color: '#1677ff', key: 'all', primary: true },
      { label: '精选推荐', value: publishedResources.filter(r => r.isTop).length, color: '#1677ff', key: 'featured' },
      { label: '模型', value: byType('模型'), color: '#1677ff', key: '模型' },
      { label: 'API', value: byType('API'), color: '#52c41a', key: 'API' },
      { label: '连接器', value: byType('连接器'), color: '#722ed1', key: '连接器' },
      { label: '知识库', value: byType('知识库'), color: '#fa8c16', key: '知识库' },
      { label: '提示词', value: byType('提示词'), color: '#13c2c2', key: '提示词' },
      { label: '插件工具', value: byType('插件工具'), color: '#eb2f96', key: '插件工具' },
      { label: '数据连接', value: byType('数据连接'), color: '#2f54eb', key: '数据连接' },
    ];
  }, [publishedResources]);

  // ── Apply ──
  const handleApply = () => {
    if (!applyModal) return;
    if (!applyReason.trim() && applyDuration === 'date' && !applyDate) return;
    setAppliedIds(prev => new Set(prev).add(applyModal.id));
    antMsg.success(`已提交对「${applyModal.name}」的使用申请`);
    setApplyModal(null);
    setApplyReason('');
    setApplyDate(null);
    setApplyDuration('long');
  };

  // ── Render ──
  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#F5F7FA' }}>
      <div style={{ padding: '24px 28px 40px' }}>
        {/* ═══ 1. Header ═══ */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
              资源广场
            </Title>
            <Text style={{ color: '#5F6B7A', fontSize: 13, lineHeight: '22px', display: 'inline-block', marginTop: 4 }}>
              发现、申请并集成平台内的模型、API、连接器、知识库与工具能力
            </Text>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              发布资源
            </Button>
          </div>
        </div>

        {/* ═══ 2. Filter & Stats (merged) ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          {/* 类型Tab（含计数） */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {stats.map(st => {
              const active = activeTab === st.key;
              return (
                <div
                  key={st.key}
                  onClick={() => setActiveTab(st.key === 'all' ? 'all' : st.key)}
                  style={{
                    background: active ? st.color + '10' : '#fff',
                    borderRadius: 6,
                    border: `1px solid ${active ? st.color + '30' : '#E5EAF3'}`,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    userSelect: 'none',
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    color: active ? st.color : '#5F6B7A',
                    fontWeight: active ? 600 : 400,
                  }}>
                    {st.label}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: active ? st.color : '#B0B8C8',
                    background: active ? st.color + '15' : '#F2F3F8',
                    borderRadius: 10,
                    padding: '0 7px',
                    lineHeight: '18px',
                    minWidth: 22,
                    textAlign: 'center',
                    display: 'inline-block',
                  }}>
                    {st.value}
                  </span>
                </div>
              );
            })}
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
            placeholder="搜索资源名称、描述或所有权人…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{
              width: 280,
              borderRadius: 6,
              borderColor: '#E5EAF3',
              marginLeft: 'auto',
            }}
          />
          <Text style={{ fontSize: 12, color: '#7A8599', whiteSpace: 'nowrap' }}>共 {sortedResources.length} 个资源</Text>
        </div>

        {/* ═══ 4. Card Grid ═══ */}
        {sortedResources.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}>
            {sortedResources.map(resource => {
              const tc = typeConfig[resource.type];
              const isApplied = appliedIds.has(resource.id);
              const calls = mockCallCount(resource.installCount);
              return (
                <div
                  key={resource.id}
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #E5EAF3',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#BCC7DB';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#E5EAF3';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* ── Header: icon + name + pin ── */}
                  <div style={{ padding: '18px 18px 0', position: 'relative' }}>
                    {resource.isTop && activeTab !== 'featured' && (
                      <div style={{
                        position: 'absolute',
                        top: 16,
                        right: 18,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: '#8A94A6',
                        fontWeight: 500,
                      }}>
                        <PushpinFilled style={{ fontSize: 9, color: '#B0B8C8' }} />精选
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Icon */}
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: tc.bg,
                        color: tc.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}>
                        {tc.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1D2129',
                          lineHeight: '22px',
                          marginBottom: 6,
                          paddingRight: resource.isTop && activeTab !== 'featured' ? 44 : 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {resource.name}
                        </div>
                        <Space size={5} wrap>
                          <Tag style={{
                            borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                            background: tc.bg, color: tc.color, border: 'none',
                          }}>
                            {resource.type}
                          </Tag>
                          <Tag style={{
                            borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                            color: '#5F6B7A', background: '#F2F3F8', border: 'none',
                          }}>
                            {resource.subType}
                          </Tag>
                          <Tag style={{
                            borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px',
                            color: resource.deployType === '内网' ? '#52c41a' : '#1677ff',
                            background: resource.deployType === '内网' ? '#F0FBE9' : '#EBF2FF',
                            border: 'none',
                          }}>
                            {resource.deployType}
                          </Tag>
                        </Space>
                      </div>
                    </div>
                  </div>

                  {/* ── Description ── */}
                  <div style={{ padding: '10px 18px 0' }}>
                    <Text style={{
                      fontSize: 13,
                      color: '#5F6B7A',
                      lineHeight: '21px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {resource.description}
                    </Text>
                  </div>

                  {/* ── Metrics ── */}
                  <div style={{
                    margin: '14px 18px 0',
                    paddingTop: 11,
                    borderTop: '1px solid #F0F2F5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#7A8599' }}>安装</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#3A4556' }}>
                        {resource.installCount.toLocaleString()}
                      </span>
                    </div>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#CBD3DF' }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#7A8599' }}>调用</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1D2129' }}>
                        {calls.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ── Footer: owner + action ── */}
                  <div style={{
                    padding: '12px 18px 16px',
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarOutlined style={{ fontSize: 12, color: '#B0B8C8' }} />
                      <Text style={{
                        fontSize: 12,
                        color: '#7A8599',
                        maxWidth: 140,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {resource.owner} · {resource.publishDate}
                      </Text>
                    </div>
                    {isApplied ? (
                      <Tag style={{
                        borderRadius: 4,
                        margin: 0,
                        fontSize: 12,
                        background: '#EBFFF2',
                        color: '#52c41a',
                        border: '1px solid #BFF2CF',
                        fontWeight: 500,
                        lineHeight: '22px',
                      }}>
                        <CheckCircleFilled style={{ marginRight: 4, fontSize: 11 }} />已申请
                      </Tag>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          borderRadius: 6,
                          fontWeight: 500,
                          fontSize: 12,
                          height: 30,
                        }}
                        onClick={() => setDetailResource(resource)}
                      >
                        查看详情
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 8 }}>
            <Empty description="未找到匹配的资源" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}

        {/* ═══ 5. Detail Drawer (unchanged structure) ═══ */}
        <Drawer
          title={null}
          placement="right"
          width={600}
          open={detailResource !== null}
          onClose={() => setDetailResource(null)}
          destroyOnClose
          styles={{ body: { padding: 0 } }}
        >
          {detailResource && (() => {
            const tc = typeConfig[detailResource.type];
            const isApplied = appliedIds.has(detailResource.id);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
                  {/* Drawer header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: tc.bg, color: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {tc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', lineHeight: '26px' }}>{detailResource.name}</div>
                      <Space size={6} style={{ marginTop: 6 }}>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, background: tc.bg, color: tc.color, border: 'none' }}>{detailResource.type}</Tag>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, background: '#F2F3F8', border: 'none', color: '#5F6B7A' }}>{detailResource.subType}</Tag>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, color: detailResource.deployType === '内网' ? '#52c41a' : '#1677ff', background: detailResource.deployType === '内网' ? '#F0FBE9' : '#EBF2FF', border: 'none' }}>{detailResource.deployType}</Tag>
                      </Space>
                    </div>
                  </div>

                  {/* Drawer stats */}
                  <div style={{ display: 'flex', gap: 24, padding: '14px 18px', borderRadius: 8, background: '#F7F9FC', marginBottom: 20 }}>
                    <div>
                      <Text style={{ fontSize: 11, color: '#7A8599' }}>安装次数</Text>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>{detailResource.installCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#7A8599' }}>调用次数</Text>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>{mockCallCount(detailResource.installCount).toLocaleString()}</div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#7A8599' }}>所有权人</Text>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{detailResource.owner}</div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#7A8599' }}>发布日期</Text>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{detailResource.publishDate}</div>
                    </div>
                    <div>
                      <Text style={{ fontSize: 11, color: '#7A8599' }}>公开策略</Text>
                      <div>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: 11, color: strategyConfig[detailResource.publicStrategy]?.color, background: strategyConfig[detailResource.publicStrategy]?.color + '14', border: 'none' }}>
                          {strategyConfig[detailResource.publicStrategy]?.label || detailResource.publicStrategy}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Auth status */}
                  <div style={{
                    padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                    background: isApplied ? '#EBFFF2' : '#FFFBE6',
                    border: `1px solid ${isApplied ? '#BFF2CF' : '#FFE58F'}`,
                  }}>
                    {isApplied ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#52c41a' }}>已申请使用</span>
                        <span style={{ fontSize: 12, color: '#7A8599' }}>审核通过后即可使用此资源</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <QuestionCircleOutlined style={{ color: '#D48806', fontSize: 16 }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#D48806' }}>您当前没有此资源的调用权限</span>
                        <span style={{ fontSize: 12, color: '#7A8599' }}>点击下方按钮提交使用申请</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', marginBottom: 8 }}>资源描述</div>
                    <Text style={{ fontSize: 13, lineHeight: '22px', color: '#5F6B7A' }}>{detailResource.description}</Text>
                  </div>

                  {/* Detail content */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1D2129', marginBottom: 8 }}>技术文档</div>
                    <div style={{
                      background: '#F7F9FC', borderRadius: 8, padding: '18px 22px',
                      fontSize: 13, lineHeight: '24px', color: '#5F6B7A',
                      fontFamily: 'system-ui, sans-serif',
                    }}>
                      <Paragraph style={{ fontSize: 13, lineHeight: '24px', margin: 0, whiteSpace: 'pre-line' }}>
                        {detailResource.detail}
                      </Paragraph>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 28px', borderTop: '1px solid #E8ECF1', background: '#fff' }}>
                  {isApplied ? (
                    <Button block disabled style={{ borderRadius: 6, height: 40 }}>
                      <ClockCircleOutlined />审核中
                    </Button>
                  ) : (
                    <Button type="primary" block size="large" style={{ borderRadius: 6, height: 44, fontWeight: 600, fontSize: 14 }}
                      onClick={() => { setApplyModal(detailResource); setDetailResource(null); }}>
                      申请使用
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </Drawer>

        {/* ═══ 6. Apply Modal (unchanged) ═══ */}
        <Modal
          title="申请使用"
          open={applyModal !== null}
          onOk={handleApply}
          onCancel={() => { setApplyModal(null); setApplyReason(''); setApplyDate(null); setApplyDuration('long'); }}
          okText="提交申请"
          cancelText="取消"
          width={480}
          destroyOnClose
        >
          {applyModal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6B7A', marginBottom: 6 }}>资源名称</div>
                <Input value={applyModal.name} disabled style={{ borderRadius: 6 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6B7A', marginBottom: 6 }}>所有权人</div>
                <Input value={applyModal.owner} disabled style={{ borderRadius: 6 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6B7A', marginBottom: 8 }}>授权时效</div>
                <Segmented
                  value={applyDuration}
                  onChange={val => setApplyDuration(val as 'long' | 'date')}
                  options={[
                    { label: '长期有效', value: 'long' },
                    { label: '指定日期', value: 'date' },
                  ]}
                  style={{ borderRadius: 6 }}
                />
                {applyDuration === 'date' && (
                  <DatePicker
                    style={{ width: '100%', marginTop: 12, borderRadius: 6 }}
                    value={applyDate}
                    onChange={setApplyDate}
                    placeholder="选择授权截止日期"
                  />
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6B7A', marginBottom: 6 }}>申请理由 <Text type="secondary" style={{ fontWeight: 400 }}>(选填，最多100字)</Text></div>
                <Input.TextArea
                  rows={3}
                  maxLength={100}
                  value={applyReason}
                  onChange={e => setApplyReason(e.target.value)}
                  placeholder="请简要说明使用目的…"
                  style={{ borderRadius: 6 }}
                  showCount
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
