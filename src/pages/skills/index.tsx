import React, { useMemo, useState } from 'react';
import {
  Table, Tag, Button, Drawer, Form, Input, App as AntdApp, Typography, Space, Modal, Switch,
  Upload, Descriptions, Dropdown, List, Divider,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, DownloadOutlined, MoreOutlined,
  ShoppingOutlined, InboxOutlined, PauseCircleOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import PaginationBar from '@/components/PaginationBar';
import IconPicker, { IconAvatar, type IconPickerValue } from '@/components/IconPicker';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
import { mockSkills, SkillItem, SkillConfig } from '@/mock/data';
import type { ColumnsType } from 'antd/es/table';
import type { FilterField } from '@/components/FilterBar';

const { Text } = Typography;

const filterFields: FilterField[] = [
  { type: 'search', key: 'keyword', placeholder: '搜索技能名称或描述', width: 220 },
  { type: 'select', key: 'source', placeholder: '来源', width: 120, options: [
    { label: '自定义', value: 'local' },
    { label: '广场资源', value: 'square' },
  ]},
];

const sourceConfig: Record<string, { label: string; color: string; bg: string }> = {
  local: { label: '自定义', color: '#5f6b7a', bg: '#f2f3f5' },
  square: { label: '广场资源', color: '#5f6b7a', bg: '#f2f3f5' },
};

const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const SkillsPage: React.FC = () => {
  const { message } = AntdApp.useApp();
  const [data, setData] = useState<SkillItem[]>(mockSkills);
  const [filters, setFilters] = useState<Record<string, any>>({ keyword: '', source: undefined });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);

  // 创建技能（上传技能包）
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedConfig, setParsedConfig] = useState<SkillConfig | null>(null);
  const [parsedSkillMd, setParsedSkillMd] = useState('');
  const [createAvatar, setCreateAvatar] = useState<IconPickerValue>({ mode: 'text' });
  const createName = Form.useWatch('name', createForm);

  // 编辑技能
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm] = Form.useForm();
  const [editAvatar, setEditAvatar] = useState<IconPickerValue>({ mode: 'text' });
  const editName = Form.useWatch('name', editForm);

  // 详情
  const [detailSkill, setDetailSkill] = useState<SkillItem | null>(null);

  // 删除（确认 / 阻止）
  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<SkillItem | null>(null);

  // 停用/启用确认
  const [toggleTarget, setToggleTarget] = useState<SkillItem | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = (filters.keyword || '').trim().toLowerCase();
      if (keyword && !item.name.toLowerCase().includes(keyword) && !item.description.toLowerCase().includes(keyword)) return false;
      if (filters.source && item.source !== filters.source) return false;
      return true;
    });
  }, [data, filters]);

  const pagedCards = useMemo(() => {
    const start = (cardPage - 1) * cardPageSize;
    return filteredData.slice(start, start + cardPageSize);
  }, [filteredData, cardPage, cardPageSize]);

  // ===== 创建技能（上传技能包） =====
  const openCreate = () => {
    setCreateOpen(true);
    setUploadedFile(null);
    setParsedConfig(null);
    setParsedSkillMd('');
    setCreateAvatar({ mode: 'text' });
    createForm.resetFields();
  };

  const handleBeforeUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      message.error('仅支持 ZIP 格式的技能包');
      return Upload.LIST_IGNORE;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('文件过大，请压缩后重试（建议 10 MB 以内）');
      return Upload.LIST_IGNORE;
    }
    const skillName = file.name.replace(/\.zip$/i, '');
    if (data.some((d) => d.resourceKey === skillName)) {
      message.error('唯一标识已存在，请修改后重试');
      return Upload.LIST_IGNORE;
    }
    // 模拟解析 skill.md：将技能名称写入技能名称与唯一标识，并回显 skill.md 内容
    setUploadedFile(file);
    setParsedConfig({ timeout: 30, retryCount: 0, inputSchema: { type: 'object' }, outputSchema: { type: 'object' } });
    setParsedSkillMd(`# ${skillName}\n\n（从技能包解析的 skill.md 内容）\n\n## 使用场景\n\n（待补充）\n\n## 用法\n\n（待补充）`);
    createForm.setFieldsValue({ name: skillName, resourceKey: skillName });
    message.success('技能包解析成功，请确认表单信息');
    return false;
  };

  const handleCreate = async () => {
    if (!uploadedFile || !parsedConfig) {
      message.warning('请先上传技能包');
      return;
    }
    const values = await createForm.validateFields();
    if (data.some((d) => d.name === values.name)) {
      message.error('技能名称已存在，请修改后重试');
      return;
    }
    if (data.some((d) => d.resourceKey === values.resourceKey)) {
      message.error('唯一标识已存在，请修改后重试');
      return;
    }
    const newItem: SkillItem = {
      id: `sk-${Date.now()}`,
      name: values.name,
      resourceKey: values.resourceKey,
      description: values.description || '',
      avatar: createAvatar.mode === 'text' && !createAvatar.text
        ? { ...createAvatar, text: (values.name || '').charAt(0) }
        : createAvatar,
      source: 'local',
      config: parsedConfig,
      callCount: 0,
      status: 'active',
      createTime: now(),
      updateTime: now(),
      creator: '当前用户',
      tags: [],
      packageName: values.resourceKey,
      packageDescription: values.description || '',
      usageMarkdown: parsedSkillMd || `## 使用场景\n\n（待补充）\n\n## 用法\n\n（待补充）`,
    };
    setData((prev) => [newItem, ...prev]);
    message.success('技能创建成功');
    setCreateOpen(false);
  };

  // ===== 编辑技能 =====
  const openEdit = (item: SkillItem) => {
    setEditingId(item.id);
    editForm.setFieldsValue({ name: item.name, description: item.description });
    setEditAvatar(item.avatar || { mode: 'text', text: item.name.charAt(0) });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    const values = await editForm.validateFields();
    if (data.some((d) => d.name === values.name && d.id !== editingId)) {
      message.error('技能名称已存在');
      return;
    }
    setData((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...values, avatar: editAvatar, updateTime: now() } : d)));
    message.success('编辑成功');
    setEditOpen(false);
  };

  // ===== 删除技能 =====
  const handleDelete = (item: SkillItem) => {
    const refs = item.referencedAgents || [];
    if (item.callCount > 0 || refs.length > 0) {
      setDeleteBlocked(item);
      return;
    }
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    message.success('删除成功');
    setDeleteTarget(null);
  };

  // ===== 状态开关 =====
  const requestToggleStatus = (item: SkillItem) => setToggleTarget(item);

  const confirmToggleStatus = () => {
    if (!toggleTarget) return;
    const item = toggleTarget;
    const willDisable = item.status === 'active';
    setData((prev) => prev.map((d) =>
      d.id === item.id ? { ...d, status: willDisable ? 'inactive' as const : 'active' as const, updateTime: now() } : d
    ));
    message.success(willDisable ? '技能已停用' : '技能已启用');
    setToggleTarget(null);
  };

  // ===== 下载技能 =====
  const handleDownload = async (item: SkillItem) => {
    const skillName = item.packageName || item.resourceKey || item.name;
    const md = [
      `# ${skillName}`,
      '',
      item.packageDescription || item.description || '',
      '',
      item.usageMarkdown || '',
    ].join('\n');
    const zip = new JSZip();
    zip.file('skill.md', md);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skillName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('技能包已导出');
  };

  const columns: ColumnsType<SkillItem> = [
    {
      title: '技能名称', dataIndex: 'name', width: 260,
      render: (_, item) => (
        <Space size={8}>
          <IconAvatar value={item.avatar} size={30} defaultName={item.name} />
          <a style={{ fontWeight: 500 }} onClick={() => setDetailSkill(item)}>{item.name}</a>
        </Space>
      ),
    },
    { title: '来源', dataIndex: 'source', width: 110, render: (v) => {
      const sc = sourceConfig[v];
      return <Tag style={{ borderRadius: 4, background: sc?.bg, color: sc?.color, border: 'none', margin: 0 }}>{sc?.label}</Tag>;
    }},
    { title: '更新时间', dataIndex: 'updateTime', width: 180 },
    { title: '状态', dataIndex: 'status', width: 90, render: (v, item) => (
      <Switch checked={v === 'active'} onChange={() => requestToggleStatus(item)} />
    )},
    {
      title: '操作', key: 'action', width: 180, fixed: 'right',
      render: (_, item) => (
        <Space size={2}>
          {item.source === 'local' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)}>编辑</Button>
          )}
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item)}>删除</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'download', icon: <DownloadOutlined />, label: '下载', onClick: () => handleDownload(item) },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="技能管理"
          hint="管理可复用的技能单元，支持上传技能包创建、编辑、删除、下载，并可从资源广场获取技能"
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={filterFields}
            filterValues={filters}
            onFilterChange={(key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setCardPage(1); }}
            onSearch={() => {}}
            onReset={() => { setFilters({ keyword: '', source: undefined }); setCardPage(1); }}
            onCreate={openCreate}
            createText="创建技能"
            extra={
              <Space size={8}>
                <Button icon={<ShoppingOutlined />} onClick={() => window.open('/standalone/resource-square?tab=skill', '_blank')}>
                  从广场获取
                </Button>
              </Space>
            }
            viewMode={viewMode}
            onViewModeChange={(mode) => { setViewMode(mode); setCardPage(1); }}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'table' ? (
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                scroll={{ x: 920 }}
                style={{ marginTop: 12 }}
              />
            ) : (
              <>
                <div className="resource-card-grid" style={{ marginTop: 12 }}>
                  {pagedCards.map((item) => (
                    <div
                      key={item.id}
                      className="resource-card"
                      onClick={() => setDetailSkill(item)}
                      style={{
                        background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
                        padding: '20px 20px 16px', cursor: 'pointer',
                        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                        display: 'flex', flexDirection: 'column', gap: 12,
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = '#eb2f96';
                        el.style.boxShadow = '0 6px 20px rgba(235,47,150,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.borderColor = '#f0f0f0';
                        el.style.boxShadow = 'none';
                      }}
                    >
                      <div className="resource-card-accent" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <IconAvatar value={item.avatar} size={40} defaultName={item.name} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name}
                            </div>
                            {item.resourceKey && (
                              <div style={{ fontSize: 12, color: '#999', lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.resourceKey}
                              </div>
                            )}
                          </div>
                        </div>
                        <Tag color={item.status === 'active' ? 'green' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
                          {item.status === 'active' ? '已启用' : '已停用'}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.description}
                      </Text>
                      <div className="resource-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>{sourceConfig[item.source].label} · {item.creator} · {item.createTime.slice(0, 10)}</Text>
                        <Dropdown
                          menu={{
                            items: [
                              ...(item.source === 'local' ? [{ key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); openEdit(item); } }] : []),
                              { key: 'toggle', icon: item.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />, label: item.status === 'active' ? '停用' : '启用', onClick: ({ domEvent }) => { domEvent.stopPropagation(); requestToggleStatus(item); } },
                              { key: 'download', icon: <DownloadOutlined />, label: '下载', onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDownload(item); } },
                              { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDelete(item); } },
                            ],
                          }}
                          trigger={['click']}
                        >
                          <Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, fontSize: 12 }} onClick={(e) => e.stopPropagation()} />
                        </Dropdown>
                      </div>
                    </div>
                  ))}
                </div>
                <PaginationBar current={cardPage} pageSize={cardPageSize} total={filteredData.length} onChange={(p, s) => { setCardPage(p); setCardPageSize(s); }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 创建技能（上传技能包） */}
      <Drawer
        title="创建技能"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={560}
        placement="right"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button onClick={() => setCreateOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleCreate}>确定</Button>
            </Space>
          </div>
        }
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="技能名称" rules={[{ required: true, message: '请输入技能名称' }]}>
            <Input placeholder="从 skill.md 解析，可修改" maxLength={50} showCount />
          </Form.Item>
          <Form.Item name="resourceKey" label="唯一标识 (Key)" tooltip="创建后不允许编辑" extra="包含小写字母、数字和连字符（-），不能以连字符开头和结尾。" rules={[{ required: true, message: '请输入唯一标识' }, { pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, message: '格式不正确，例如 police-incident-classifier' }]}>
            <Input placeholder="例如 police-incident-classifier" maxLength={64} />
          </Form.Item>
          <Form.Item name="description" label="技能描述" rules={[{ required: true, message: '请输入技能描述' }]}>
            <Input.TextArea rows={3} placeholder="从 skill.md 解析，可修改" maxLength={300} showCount />
          </Form.Item>
          <Form.Item label="头像">
            <IconPicker value={createAvatar} onChange={setCreateAvatar} size={64} defaultName={createName || '技能'} />
          </Form.Item>
          <Form.Item label="技能压缩包" extra="上传后支持自动提取技能名称和技能描述">
            {!uploadedFile ? (
              <Upload accept=".zip" showUploadList={false} beforeUpload={handleBeforeUpload}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px dashed #d9d9d9', borderRadius: 8, background: '#fafafa', cursor: 'pointer' }}>
                  <InboxOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.88)' }}>点击上传技能包</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>仅支持 .zip 格式，大小不超过 10MB，根目录需包含 skill.md</div>
                  </div>
                </div>
              </Upload>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #b7eb8f', borderRadius: 6, background: '#f6ffed' }}>
                <span style={{ color: '#389e0d', fontSize: 13 }}>已上传：{uploadedFile.name}</span>
                <Button type="link" size="small" onClick={() => { setUploadedFile(null); setParsedConfig(null); setParsedSkillMd(''); createForm.setFieldsValue({ name: '', resourceKey: '' }); }}>移除</Button>
              </div>
            )}
          </Form.Item>
          <Form.Item label="skill.md">
            <div className="resource-markdown" style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', maxHeight: 240, overflow: 'auto' }}>
              {parsedSkillMd ? <ReactMarkdown>{parsedSkillMd}</ReactMarkdown> : <Text type="secondary">上传技能包后解析回显 skill.md 内容</Text>}
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 编辑技能 */}
      <Drawer
        title="编辑技能"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={480}
        placement="right"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button onClick={() => setEditOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleEdit}>保存</Button>
            </Space>
          </div>
        }
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="技能名称" rules={[{ required: true, message: '请输入技能名称' }]}>
            <Input placeholder="请输入技能名称" maxLength={50} showCount />
          </Form.Item>
          <Form.Item name="description" label="技能描述" rules={[{ required: true, message: '请输入技能描述' }]}>
            <Input.TextArea rows={3} placeholder="请输入技能描述" maxLength={300} showCount />
          </Form.Item>
          <Form.Item label="头像">
            <IconPicker value={editAvatar} onChange={setEditAvatar} size={64} defaultName={editName || '技能'} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 技能详情（只读） */}
      <Drawer
        title="技能详情"
        open={!!detailSkill}
        onClose={() => setDetailSkill(null)}
        width={560}
        placement="right"
      >
        {detailSkill && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <IconAvatar value={detailSkill.avatar} size={40} defaultName={detailSkill.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2 }}>{detailSkill.name}</div>
                  {detailSkill.resourceKey && (
                    <div style={{ fontSize: 12, color: '#999', lineHeight: '18px' }}>{detailSkill.resourceKey}</div>
                  )}
                </div>
              </div>
              <Tag color={detailSkill.status === 'active' ? 'green' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>{detailSkill.status === 'active' ? '已启用' : '已停用'}</Tag>
            </div>

            <div style={{ fontSize: 14, lineHeight: '22px', color: 'rgba(0,0,0,0.65)', marginBottom: 16 }}>{detailSkill.description || '—'}</div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>技能包信息（SKILL）</div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="SKILL 名称">{detailSkill.packageName || detailSkill.name}</Descriptions.Item>
              <Descriptions.Item label="SKILL 描述">{detailSkill.packageDescription || detailSkill.description}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>skill.md</div>
            <div className="resource-markdown" style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px' }}>
              <ReactMarkdown>{detailSkill.usageMarkdown || '暂无内容'}</ReactMarkdown>
            </div>
          </>
        )}
      </Drawer>

      {/* 删除确认（无引用） */}
      <Modal
        title="删除技能"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p>删除后该技能将无法恢复，确定删除「{deleteTarget?.name}」？</p>
      </Modal>

      {/* 删除阻止（有引用） */}
      <Modal
        title="无法删除"
        open={!!deleteBlocked}
        onCancel={() => setDeleteBlocked(null)}
        footer={<Button type="primary" onClick={() => setDeleteBlocked(null)}>知道了</Button>}
      >
        <p>该技能已被 {deleteBlocked?.callCount || deleteBlocked?.referencedAgents?.length || 0} 个智能体引用，请先解除绑定后再删除。</p>
        {deleteBlocked?.referencedAgents && deleteBlocked.referencedAgents.length > 0 && (
          <List
            size="small"
            header={<div>引用智能体列表</div>}
            bordered
            dataSource={deleteBlocked.referencedAgents}
            renderItem={(name) => <List.Item>{name}</List.Item>}
          />
        )}
      </Modal>

      {/* 停用/启用确认 */}
      <ConfirmActionModal
        open={!!toggleTarget}
        onCancel={() => setToggleTarget(null)}
        onConfirm={confirmToggleStatus}
        title={toggleTarget?.status === 'active' ? '停用技能' : '启用技能'}
        targetName={toggleTarget?.name ?? ''}
        severity={toggleTarget?.status === 'active' ? 'warning' : 'info'}
        description={
          toggleTarget?.status === 'active'
            ? ['停用后该技能将不可被智能体引用', '已绑定的智能体不受影响']
            : ['启用后该技能可被智能体引用']
        }
        okText={toggleTarget?.status === 'active' ? '确认停用' : '确认启用'}
      />
    </>
  );
};

export default SkillsPage;
