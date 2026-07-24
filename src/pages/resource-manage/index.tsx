import React, { useMemo, useState } from 'react';
import { Alert, App as AntdApp, Button, Card, Col, Dropdown, Form, Input, Modal, Row, Select, Space, Tag } from 'antd';
import {
  DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined, GlobalOutlined,
  PlusOutlined, PushpinOutlined, SafetyCertificateOutlined, SendOutlined, SwapOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import PageHeader from '@/components/PageHeader';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import ResourceCard from '@/features/resource-center/components/ResourceCard';
import ResourceFormDrawer from '@/features/resource-center/components/ResourceFormDrawer';
import ResourcePermissionDrawer from '@/features/resource-center/components/ResourcePermissionDrawer';
import { useResourceCenter } from '@/features/resource-center/ResourceCenterContext';
import type { CreateResourceInput, PublishStatus, ResourceItem, ResourceType } from '@/features/resource-center/types';
import { pageContainerStyle, panelStyle, strategyConfig, typeConfig } from '@/features/resource-center/ui';

export default function ResourceManagePage() {
  const { message } = AntdApp.useApp();
  const {
    resources, createResource, updateResource, togglePublish, togglePinned,
    grants, deleteResource, transferResource,
  } = useResourceCenter();
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PublishStatus>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [detail, setDetail] = useState<ResourceItem | null>(null);
  const [permissionTarget, setPermissionTarget] = useState<ResourceItem | null>(null);
  const [transferTarget, setTransferTarget] = useState<ResourceItem | null>(null);
  const [transferOwner, setTransferOwner] = useState('');
  const [transferReceiverAccount, setTransferReceiverAccount] = useState('');
  const [transferRemark, setTransferRemark] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
  const transferCandidates = [
    { value: 'zhangsan', label: '张三', dept: '总裁办' },
    { value: 'lisi', label: '李四', dept: '系统架构部' },
    { value: 'wangwu', label: '王五', dept: '平台开发部' },
  ];

  const activeResources = resources.filter(resource => !resource.isDeleted);
  const filtered = useMemo(() => activeResources.filter(resource => {
    if (typeFilter !== 'all' && resource.type !== typeFilter) return false;
    if (statusFilter !== 'all' && resource.publishStatus !== statusFilter) return false;
    const word = keyword.trim().toLowerCase();
    return !word || resource.name.toLowerCase().includes(word) || resource.owner.toLowerCase().includes(word);
  }), [activeResources, keyword, statusFilter, typeFilter]);

  const stats = [
    { label: '资源总数', value: activeResources.length, color: '#1677ff' },
    ...(['knowledge', 'model', 'api', 'mcp'] as ResourceType[]).map(type => ({ label: typeConfig[type].label, value: activeResources.filter(resource => resource.type === type).length, color: typeConfig[type].color })),
  ];

  const editResource = (resource: ResourceItem) => {
    if (resource.publishStatus === 'published' || resource.publishStatus === 'publishing') {
      message.warning('温馨提示：为了保障工作流与下游关联服务的安全稳定，编辑功能仅在“待上架”或“已下架”状态下可用。请先将该资源下架，再进行编辑修改。');
      return;
    }
    setEditing(resource);
    setFormOpen(true);
  };

  const menuItems = (resource: ResourceItem): MenuProps['items'] => [
    { key: 'view', icon: <EyeOutlined />, label: '查看详情', onClick: () => setDetail(resource) },
    { key: 'edit', icon: <EditOutlined />, label: '编辑资源', onClick: () => editResource(resource) },
    { key: 'publish', icon: <SendOutlined />, label: resource.publishStatus === 'published' ? '下架资源' : '上架资源', onClick: () => { togglePublish(resource.id); message.success(resource.publishStatus === 'published' ? '资源已下架' : '资源已上架'); } },
    { key: 'pin', icon: <PushpinOutlined />, label: resource.isPinned ? '取消置顶' : '置顶资源', onClick: () => togglePinned(resource.id) },
    { key: 'strategy', icon: <SafetyCertificateOutlined />, label: '权限管理', onClick: () => setPermissionTarget(resource) },
    { key: 'transfer', icon: <SwapOutlined />, label: '转移所有权', onClick: () => { setTransferTarget(resource); setTransferOwner(''); setTransferReceiverAccount(''); setTransferRemark(''); } },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, danger: true, label: '删除资源', onClick: () => setDeleteTarget(resource) },
  ];

  const submitResource = (values: CreateResourceInput) => {
    if (editing) {
      updateResource(editing.id, values);
      message.success('资源修改已保存');
    } else {
      createResource(values);
      message.success('资源创建成功！初始状态为待上架，请在资源管理中手动上架发布。');
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div style={pageContainerStyle}>
      <PageHeader
        title="资源管理"
        hint="平台共享资源的创建、上架、公开策略、授权与安全删除"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>创建资源</Button>}
      />

      <Row gutter={12} style={{ margin: '4px 0 16px' }}>
        {stats.map(stat => <Col key={stat.label} flex="1"><Card styles={{ body: { padding: '14px 18px' } }}><div style={{ color: '#7a8494', fontSize: 13 }}>{stat.label}</div><div style={{ fontSize: 26, fontWeight: 650, color: stat.color }}>{stat.value}</div></Card></Col>)}
      </Row>

      <div style={{ ...panelStyle, padding: 14, marginBottom: 16, display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space wrap>
          <Input.Search allowClear value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索资源名称、所有权人" style={{ width: 280 }} />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 130 }} options={[{ value: 'all', label: '全部类型' }, ...Object.entries(typeConfig).map(([value, config]) => ({ value, label: config.label }))]} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }} options={[{ value: 'all', label: '全部状态' }, { value: 'published', label: '已上架' }, { value: 'publishing', label: '发布审核中' }, { value: 'offline', label: '已下架' }, { value: 'pending', label: '待上架' }]} />
        </Space>
        <Tag>共 {filtered.length} 个资源</Tag>
      </div>

      <Row gutter={[16, 16]}>
        {filtered.map(resource => (
          <Col key={resource.id} xs={24} md={12} xl={8}>
            <ResourceCard
              resource={resource}
              mode="manage"
              footer={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={4}>
                  <Tag color={resource.publishStatus === 'published' ? 'success' : resource.publishStatus === 'publishing' ? 'processing' : 'default'}>{resource.publishStatus === 'published' ? '已上架' : resource.publishStatus === 'publishing' ? '发布审核中' : resource.publishStatus === 'pending' ? '待上架' : '已下架'}</Tag>
                  <Tag icon={<GlobalOutlined />} color={strategyConfig[resource.publicStrategy].color} style={{ cursor: 'pointer' }} onClick={() => setPermissionTarget(resource)}>{strategyConfig[resource.publicStrategy].label}</Tag>
                </Space>
                <Dropdown menu={{ items: menuItems(resource) }} trigger={['click']}><Button type="text" icon={<EllipsisOutlined style={{ fontSize: 20 }} />} /></Dropdown>
              </div>}
            />
          </Col>
        ))}
      </Row>

      <ResourceFormDrawer open={formOpen} resource={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={submitResource} />
      <ResourceFormDrawer open={!!detail} resource={detail} readOnly onClose={() => setDetail(null)} onSubmit={() => undefined} />
      <ResourcePermissionDrawer open={!!permissionTarget} resource={permissionTarget} onClose={() => setPermissionTarget(null)} />

      <Modal
        title="所有权转移"
        open={!!transferTarget}
        onCancel={() => setTransferTarget(null)}
        okText="确认转移"
        okButtonProps={{ disabled: !transferOwner || transferReceiverAccount !== transferOwner }}
        onOk={() => {
          const receiver = transferCandidates.find(item => item.value === transferOwner);
          if (!receiver || transferReceiverAccount !== receiver.value) return;
          if (transferTarget) transferResource(transferTarget.id, receiver.label);
          setTransferTarget(null);
          message.success('转移审批已提交');
        }}
        destroyOnHidden
      >
        <Alert title="转移所有权是一项敏感操作。成功后，您将失去该资源的所有控制权，身份将自动降级为“可使用”状态。" type="warning" showIcon style={{ marginBottom: 24 }} />
        <Form layout="vertical">
          <Form.Item label="选择接收人" required><Select value={transferOwner || undefined} onChange={value => { setTransferOwner(value); setTransferReceiverAccount(''); }} placeholder="搜索内部用户..." options={transferCandidates.map(item => ({ value: item.value, label: `${item.label} · ${item.dept}` }))} /></Form.Item>
          <Form.Item label="转移备注"><Input.TextArea value={transferRemark} onChange={event => setTransferRemark(event.target.value)} placeholder="请说明转移原因..." rows={4} /></Form.Item>
          <Form.Item label="确认接收人账号" required extra={transferOwner ? `请输入账号 ${transferOwner} 完成确认` : '请先选择接收人'}><Input disabled={!transferOwner} value={transferReceiverAccount} onChange={event => setTransferReceiverAccount(event.target.value)} placeholder="请输入接收人的登录账号以确认" /></Form.Item>
        </Form>
      </Modal>

      <ConfirmActionModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteResource(deleteTarget.id); setDeleteTarget(null); message.success('资源已删除，已有获取记录将显示为失效'); }}
        title="删除资源"
        targetName={deleteTarget?.name || ''}
        severity="danger"
        description={[
          `全站不可用：已有 ${deleteTarget ? grants.filter(item => item.resourceId === deleteTarget.id && !item.revoked).length : 0} 个空间获取该资源，删除后其引用服务可能立即报错或中断。`,
          '资产回收：API 接口、数据映射、模型依赖和底层物理通路将永久闭合。',
          '权限解绑：当前可见范围和授权使用记录将转为资源已删除的失效状态。',
        ]}
        requireAcknowledgement
        acknowledgementText="我已知晓并核实删除此资源带来的潜在服务中断风险，并自愿承担相应的技术影响与责任风险。"
        requireNameInput
        cancelText="取消，我再想想"
        okText="确认，永久删除此资产"
      />
    </div>
  );
}
