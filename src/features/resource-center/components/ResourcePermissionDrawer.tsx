import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, App as AntdApp, Avatar, Button, DatePicker, Drawer, Empty, Form, Input,
  Radio, Select, Space, Table, Tabs, Tag,
} from 'antd';
import {
  EyeOutlined, HistoryOutlined, LockOutlined, SafetyCertificateOutlined, SettingOutlined, UnlockOutlined,
  UserAddOutlined, UserOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useResourceCenter } from '../ResourceCenterContext';
import type { PublicStrategy, ResourceItem } from '../types';
import { strategyConfig, typeConfig } from '../ui';

interface ResourcePermissionDrawerProps {
  open: boolean;
  resource: ResourceItem | null;
  onClose: () => void;
}

const descriptions: Record<PublicStrategy, string> = {
  public: '广场无条件展示，全员默认拥有“使用权”。',
  visible: '广场公开展示，全员默认“仅可见”，需申请并审批通过后方可使用。',
  whitelist: '仅对授权对象可见，对其他用户绝对隐藏（不可搜索）。',
};

const strategyIcons: Record<PublicStrategy, React.ReactNode> = {
  public: <UnlockOutlined />,
  visible: <EyeOutlined />,
  whitelist: <LockOutlined />,
};

const strategyColors: Record<PublicStrategy, string> = {
  public: '#52c41a',
  visible: '#1677ff',
  whitelist: '#595959',
};

const ResourcePermissionDrawer: React.FC<ResourcePermissionDrawerProps> = ({ open, resource, onClose }) => {
  const { message, modal } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const { grants, auditLogs, acquire, revokeGrant, setStrategy, updateResource } = useResourceCenter();
  const [strategy, setLocalStrategy] = useState<PublicStrategy>('public');
  const [visibleKeyword, setVisibleKeyword] = useState('');
  const [grantKeyword, setGrantKeyword] = useState('');
  const [batchAuthDrawerVisible, setBatchAuthDrawerVisible] = useState(false);
  const [batchAuthForm] = Form.useForm();
  const [visibleObjects, setVisibleObjects] = useState([
    { id: 'visible-1', name: '行政部', description: '全员', type: '部门' },
    { id: 'visible-2', name: '李想', description: '产品经理', type: '个人' },
  ]);

  useEffect(() => {
    if (open && resource) {
      setLocalStrategy(resource.pendingStrategy || resource.publicStrategy);
      setVisibleKeyword('');
      setGrantKeyword('');
    }
  }, [open, resource]);

  const resourceGrants = useMemo(() => grants.filter(item => item.resourceId === resource?.id && !item.revoked), [grants, resource?.id]);
  const resourceLogs = useMemo(() => auditLogs.filter(item => item.resourceId === resource?.id), [auditLogs, resource?.id]);
  const filteredVisible = visibleObjects.filter(item => `${item.name}${item.description}`.includes(visibleKeyword));
  const filteredGrants = resourceGrants.filter(item => (spaces.find(space => space.id === item.spaceId)?.name || '').includes(grantKeyword));

  if (!resource) return null;

  const chooseStrategy = (next: PublicStrategy) => {
    if (resource.publicStrategy === 'public' && resource.publishStatus === 'published' && next !== 'public') {
      modal.confirm({
        title: '调整全局公开策略警告',
        content: '该资源当前处于已发布且完全公开状态。降级后可能导致已经安装该资源的用户无法继续使用，是否确定修改？',
        okText: '确定修改', cancelText: '取消', okButtonProps: { danger: true },
        onOk: () => setLocalStrategy(next),
      });
      return;
    }
    setLocalStrategy(next);
  };

  const saveStrategy = () => {
    if (strategy === resource.publicStrategy) {
      message.success('权限配置方案已保存');
      onClose();
      return;
    }
    if (resource.publishStatus === 'published') {
      updateResource(resource.id, { publishStatus: 'publishing', pendingStrategy: strategy });
      message.info('策略变更已提交审核，审核通过前将维持原策略');
    } else {
      setStrategy(resource.id, strategy);
      updateResource(resource.id, { pendingStrategy: undefined });
      message.success('权限配置方案已保存');
    }
    onClose();
  };

  const handleBatchAuthSubmit = () => {
    batchAuthForm.validateFields().then((values: { spaceIds: string[]; authDurationType: 'permanent' | 'custom'; expireDate?: any }) => {
      const { spaceIds } = values;
      let count = 0;
      spaceIds.forEach(sid => {
        if (acquire(resource!.id, sid, '管理员授权')) count += 1;
      });
      message.success(`已成功完成 ${count} 条空间资源授权`);
      setBatchAuthDrawerVisible(false);
      batchAuthForm.resetFields();
    });
  };

  const openBatchAuthDrawer = () => {
    const existingSpaceIds = resourceGrants.map(g => g.spaceId);
    batchAuthForm.setFieldsValue({ spaceIds: existingSpaceIds, authDurationType: 'permanent' });
    setBatchAuthDrawerVisible(true);
  };

  const strategyPanel = <div>
    <Alert type="info" showIcon title="全局公开策略决定了资源在广场中的可见性。设置后立即对全平台用户生效。" style={{ marginBottom: 24 }} />
    {(Object.keys(strategyConfig) as PublicStrategy[]).map(value => <div key={value} onClick={() => chooseStrategy(value)} style={{ display: 'flex', alignItems: 'center', padding: 20, marginBottom: 16, border: strategy === value ? '1px solid #1677ff' : '1px solid #d9d9d9', boxShadow: strategy === value ? '0 0 0 2px rgba(22,119,255,.1)' : 'none', borderRadius: 8, cursor: 'pointer' }}>
      <div style={{ width: 48, height: 48, marginRight: 16, borderRadius: 8, background: strategyColors[value], color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24 }}>{strategyIcons[value]}</div>
      <div><div style={{ fontWeight: 600, fontSize: 16 }}>{strategyConfig[value].label}</div><div style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4 }}>{descriptions[value]}</div></div>
    </div>)}
    {resource.pendingStrategy && resource.publishStatus === 'publishing' && <Alert type="warning" showIcon title={`存在待审核策略：${strategyConfig[resource.pendingStrategy].label}`} description="审核通过前资源仍按当前公开策略运行。" />}
    <div style={{ marginTop: 32, textAlign: 'right' }}><Space><Button onClick={onClose}>取消</Button><Button type="primary" onClick={saveStrategy}>保存</Button></Space></div>
  </div>;

  const visiblePanel = strategy === 'public' || strategy === 'visible' ? <Alert type="warning" showIcon title="当前已设为全局公开，所有用户自动拥有可见权限，无需在此设置。" /> : <>
    <div style={{ padding: 16, marginBottom: 16, borderRadius: 8, background: '#f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
      <Input.Search allowClear value={visibleKeyword} onChange={event => setVisibleKeyword(event.target.value)} placeholder="搜索已添加对象..." style={{ width: 240 }} />
      <Button type="primary" icon={<UserAddOutlined />} onClick={() => setVisibleObjects(prev => [...prev, { id: `visible-${Date.now()}`, name: '新增可见对象', description: '待配置', type: '个人' }])}>添加可见对象</Button>
    </div>
    <Table rowKey="id" pagination={false} dataSource={filteredVisible} columns={[
      { title: '可见对象', render: (_, item) => <Space><Avatar icon={<UserOutlined />} /><div><div>{item.name}</div><small style={{ color: '#999' }}>{item.description}</small></div></Space> },
      { title: '对象类型', dataIndex: 'type', render: value => <Tag>{value}</Tag> },
      { title: '操作', render: (_, item) => <Button danger type="link" onClick={() => setVisibleObjects(prev => prev.filter(value => value.id !== item.id))}>移除</Button> },
    ]} />
  </>;

  const grantPanel = strategy === 'public' ? <Alert type="warning" showIcon title="当前已设为完全公开，所有用户自动拥有使用权限，无需在此设置。" /> : <>
    <div style={{ padding: 16, marginBottom: 16, borderRadius: 8, background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <Input.Search allowClear value={grantKeyword} onChange={event => setGrantKeyword(event.target.value)} placeholder="搜索已添加空间..." style={{ width: 220 }} />
      <Button type="primary" icon={<UserAddOutlined />} onClick={openBatchAuthDrawer}>添加授权空间</Button>
    </div>
    {filteredGrants.length ? <Table rowKey="id" pagination={false} dataSource={filteredGrants} columns={[
      { title: '授权对象', render: (_, item) => {
        const space = spaces.find(s => s.id === item.spaceId);
        return <Space><Avatar shape="square" size="small" style={{ backgroundColor: '#1677ff' }}>{space?.name?.charAt(0) || '空'}</Avatar><span>{space?.name || item.spaceId}</span></Space>;
      }},
      { title: '空间类型', render: (_, item) => {
        const space = spaces.find(s => s.id === item.spaceId);
        return space?.type || '-';
      }},
      { title: '到期时间', render: (_, item) => item.expireDate || '永久有效' },
      { title: '操作', render: (_, item) => <Button danger type="link" onClick={() => revokeGrant(resource.id, item.spaceId)}>移除</Button> },
    ]} /> : <Empty description="暂无授权空间" />}
  </>;

  const historyPanel = resourceLogs.length ? <Table rowKey="id" size="small" pagination={{ pageSize: 8 }} dataSource={resourceLogs} columns={[
    { title: '操作时间', dataIndex: 'time', width: 170 },
    { title: '操作人', dataIndex: 'operator', width: 110 },
    { title: '动作', dataIndex: 'action', width: 150, render: value => <Tag>{value}</Tag> },
    { title: '内容详情', dataIndex: 'detail' },
  ]} /> : <Empty description="暂无权限变更记录" />;

  return <Drawer title={`权限管理 - ${resource.name}`} open={open} onClose={onClose} size="large" destroyOnHidden styles={{ body: { padding: '0 24px 24px' } }}>
    <Tabs defaultActiveKey="strategy" tabBarStyle={{ marginBottom: 24 }} items={[
      { key: 'strategy', label: <span><SettingOutlined /> 全局公开策略</span>, children: strategyPanel },
      { key: 'visible', label: <span><EyeOutlined /> 可见范围</span>, children: visiblePanel },
      { key: 'grant', label: <span><UserOutlined /> 授权范围</span>, children: grantPanel },
      { key: 'history', label: <span><HistoryOutlined /> 权限变更记录</span>, children: historyPanel },
    ]} />

    {/* 批量授权二级抽屉 */}
    <Drawer
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SafetyCertificateOutlined style={{ color: '#1677ff' }} /><span>添加授权</span></div>}
      placement="right"
      styles={{ wrapper: { width: 520 } }}
      onClose={() => { setBatchAuthDrawerVisible(false); batchAuthForm.resetFields(); }}
      open={batchAuthDrawerVisible}
      forceRender
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '10px 16px' }}>
          <Button onClick={() => { setBatchAuthDrawerVisible(false); batchAuthForm.resetFields(); }}>取消</Button>
          <Button type="primary" onClick={handleBatchAuthSubmit}>确认直接授权</Button>
        </div>
      }
    >
      <div style={{ padding: '8px 0' }}>
        <div style={{ marginBottom: 20, padding: '12px 16px', backgroundColor: '#e6f4ff', border: '1px solid #91caff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          在此处执行的批量授权为<b>使用权</b>，选中的空间将直接获取目标资源的合规调用凭证，无需再次经过多级审批流程。
        </div>
        <Form form={batchAuthForm} layout="vertical">
          <Form.Item name="spaceIds" label="授权空间" rules={[{ required: true, message: '请选择至少一个被授权空间' }]} extra="支持检索且可多选多个空间">
            <Select mode="multiple" placeholder="请搜索或选择被授权的空间..." style={{ width: '100%' }} optionFilterProp="label" allowClear>
              {spaces.map(s => (
                <Select.Option key={s.id} value={s.id} label={`${s.name} (${s.type})`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#1677ff' }} />
                    <span>{s.name}</span>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>({s.type})</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="目标资源">
            <Input
              value={`${resource.name} · ${typeConfig[resource.type]?.label}`}
              disabled
              prefix={<SafetyCertificateOutlined style={{ color: '#1677ff' }} />}
            />
            <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>授权范围限定于当前资源，不可更改</div>
          </Form.Item>
          <Form.Item name="authDurationType" label="授权时效" initialValue="permanent">
            <Radio.Group>
              <Radio value="permanent">长期有效</Radio>
              <Radio value="custom">指定日期</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.authDurationType !== cur.authDurationType}>
            {({ getFieldValue }) =>
              getFieldValue('authDurationType') === 'custom' ? (
                <Form.Item name="expireDate" label="授权截止日期" rules={[{ required: true, message: '请选择授权截止日期' }]}>
                  <DatePicker placeholder="请选择授权截止日期" style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  </Drawer>;
};

export default ResourcePermissionDrawer;
