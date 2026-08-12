import React, { useEffect, useMemo, useState } from 'react';
import {
  App as AntdApp, Avatar, Button, Card, Col, Drawer, Empty, Form, Input,
  Modal, Radio, Row, Select, Space, Steps, Table, Tag,
} from 'antd';
import {
  BuildOutlined, CheckOutlined, CloudDownloadOutlined, DeleteOutlined,
  RightOutlined, SettingOutlined, UserOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { CreateResourceInput, PublicStrategy, ResourceItem, ResourceType } from '../types';
import { strategyConfig, typeConfig } from '../ui';
import ResourceTechnicalDrawer from './ResourceTechnicalDrawer';

interface ResourceFormDrawerProps {
  open: boolean;
  resource?: ResourceItem | null;
  readOnly?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateResourceInput) => void;
}

interface FormValues extends CreateResourceInput {
  source: 'workshop' | 'new';
  workshopId?: string;
  workshopSpaceId?: string;
}

const workshopItems = [
  { id: 'w1', type: 'api' as const, name: '内部地址解析API', description: '工坊内未发布的地址库查询接口。', resourceKey: 'inner-address-api', gatewayPath: '/gateway/inner-address-api' },
  { id: 'w2', type: 'model' as const, name: 'Qwen-2.5-Mock', description: '模拟的现有模型资源以供拉取测试。', resourceKey: 'qwen-2.5-mock', gatewayPath: '/gateway/qwen-2.5-mock' },
  { id: 'w3', type: 'knowledge' as const, name: '技术面试题库', description: '各级岗位的面试真题汇总。', resourceKey: 'tech-interview-bank', gatewayPath: '/gateway/tech-interview-bank' },
  { id: 'w4', type: 'mcp' as const, name: 'Notion MCP', description: '未发布的 Notion 笔记连接器。', resourceKey: 'notion-mcp', gatewayPath: '/gateway/notion-mcp' },
];

const strategyDescriptions: Record<PublicStrategy, string> = {
  public: '全员可见并可直接使用',
  visible: '全员可见，但使用需提交申请',
  whitelist: '仅授权对象可见',
};

const ResourceFormDrawer: React.FC<ResourceFormDrawerProps> = ({ open, resource, readOnly, onClose, onSubmit }) => {
  const { message } = AntdApp.useApp();
  const { spaces } = useWorkspace();
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [creationSource, setCreationSource] = useState<'workshop' | 'new'>('workshop');
  const [creationType, setCreationType] = useState<ResourceType>('api');
  const [technicalValues, setTechnicalValues] = useState<Partial<CreateResourceInput>>({});
  const [technicalConfigured, setTechnicalConfigured] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [visibleObjects, setVisibleObjects] = useState([
    { id: 'v1', name: '行政部', description: '全员', type: '部门' },
    { id: 'v2', name: '李想', description: '产品经理', type: '个人' },
  ]);
  const [addObjectModalOpen, setAddObjectModalOpen] = useState(false);
  const source = creationSource;
  const resourceType = resource?.type || creationType;
  const selectedWorkshop = Form.useWatch('workshopId', form);
  const markdown = Form.useWatch('markdownIntro', form) || '';
  const editing = !!resource;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setTechnicalOpen(false);
    setTechnicalValues(resource || {});
    setTechnicalConfigured(!!resource);
    form.resetFields();
    if (resource) {
      setCreationSource('new');
      setCreationType(resource.type);
      form.setFieldsValue({ ...resource, source: 'new', type: resource.type, owner: resource.owner } as FormValues);
    } else {
      setCreationSource('workshop');
      setCreationType('api');
      form.setFieldsValue({ source: 'workshop', type: 'api', owner: '演示用户', publicStrategy: 'public', workshopSpaceId: spaces[0]?.id });
    }
  }, [form, open, resource, spaces]);

  const typeOptions = useMemo(() => Object.entries(typeConfig).map(([key, config]) => ({ key: key as ResourceType, ...config })), []);

  const selectType = (type: ResourceType) => {
    setCreationType(type);
    form.setFieldsValue({ type, workshopId: undefined });
    setTechnicalValues({});
    setTechnicalConfigured(source === 'workshop');
  };

  const next = async () => {
    if (step === 0) {
      if (source === 'workshop') await form.validateFields(['type', 'workshopSpaceId', 'workshopId']);
      const selected = workshopItems.find(item => item.id === selectedWorkshop);
      if (selected) {
        form.setFieldsValue({ ...selected, owner: '演示用户' });
        setTechnicalValues(selected);
        setTechnicalConfigured(true);
      }
      setStep(1);
      return;
    }
    await form.validateFields(['name', 'resourceKey', 'description']);
    if (source === 'new' && !technicalConfigured && ['api', 'mcp', 'knowledge'].includes(resourceType)) {
      message.warning('请完成“技术细节配置”后再进行下一步');
      return;
    }
    setStep(2);
  };

  const finish = async () => {
    const values = await form.validateFields();
    onSubmit({ ...values, ...technicalValues, type: resourceType, owner: resource?.owner || '演示用户', visibleTargets: visibleObjects });
  };

  const saveEdit = async () => {
    const values = await form.validateFields(['name', 'description', 'markdownIntro']);
    onSubmit({ ...resource!, ...values, ...technicalValues, type: resource!.type, owner: resource!.owner, resourceKey: resource!.resourceKey || '', visibleTargets: visibleObjects });
  };

  const technicalCard = (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>详细配置</div>
      <Card hoverable styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, background: '#fcfcfc' }} onClick={() => setTechnicalOpen(true)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={12}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: technicalConfigured ? '#f6ffed' : '#f0f0f0', display: 'grid', placeItems: 'center' }}><SettingOutlined style={{ color: technicalConfigured ? '#52c41a' : '#666', fontSize: 20 }} /></div>
            <div>
              <Space><strong>{resourceType.toUpperCase()} 技术细节配置</strong>{!editing && source === 'new' && <Tag color={technicalConfigured ? 'success' : 'error'}>{technicalConfigured ? '已配置' : '待配置'}</Tag>}</Space>
              <div style={{ color: '#8f959e', fontSize: 12 }}>{source === 'workshop' ? '拉取自已有数据，支持配置编辑' : '手动维护底层资源数据'}</div>
            </div>
          </Space>
          <RightOutlined style={{ color: '#bfbfbf' }} />
        </div>
      </Card>
    </div>
  );

  const createStepSource = <div>
    <div style={{ fontWeight: 600, marginBottom: 12 }}>1. 选择资源类型</div>
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      {typeOptions.map(type => <Col span={6} key={type.key}><div onClick={() => selectType(type.key)} style={{ padding: '14px 8px', textAlign: 'center', border: resourceType === type.key ? '1px solid #1677ff' : '1px solid #f0f0f0', background: resourceType === type.key ? '#f0f7ff' : '#fff', color: resourceType === type.key ? '#1677ff' : '#1f2329', borderRadius: 8, cursor: 'pointer' }}><div style={{ fontSize: 21, marginBottom: 4 }}>{type.icon}</div>{type.label}</div></Col>)}
    </Row>
    <div style={{ fontWeight: 600, marginBottom: 12 }}>2. 关联来源方式</div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { value: 'workshop' as const, title: '从已有数据拉取', desc: '拉取未发布的现有资源', icon: <CloudDownloadOutlined />, color: '#1677ff' },
          { value: 'new' as const, title: '全新创建', desc: '直接在我的资源中创建资源信息', icon: <BuildOutlined />, color: '#52c41a' },
        ].map(option => <Col span={12} key={option.value}><div onClick={() => { setCreationSource(option.value); form.setFieldValue('source', option.value); setTechnicalConfigured(option.value === 'workshop'); }} style={{ position: 'relative', height: '100%', padding: 16, border: source === option.value ? '1px solid #1677ff' : '1px solid #f0f0f0', background: source === option.value ? '#f0f7ff' : '#fafafa', borderRadius: 12, cursor: 'pointer' }}><Space align="start"><Avatar shape="square" icon={option.icon} style={{ color: option.color, background: option.value === 'workshop' ? '#e6f4ff' : '#f6ffed' }} /><div><strong>{option.title}</strong><div style={{ color: '#8f959e', fontSize: 12, marginTop: 4 }}>{option.desc}</div></div></Space>{source === option.value && <span style={{ position: 'absolute', right: -1, top: -1, width: 24, height: 24, borderRadius: '0 12px 0 12px', background: '#1677ff', color: '#fff', display: 'grid', placeItems: 'center' }}><CheckOutlined /></span>}</div></Col>)}
      </Row>
    {source === 'workshop' && <>
      <Form.Item name="workshopSpaceId" label="3. 选择所在空间" rules={[{ required: true, message: '请选择所在空间' }]}>
        <Select
          showSearch
          optionFilterProp="label"
          optionRender={(option) => (
            <Space>
              <Avatar size={32} style={{ background: '#1677ff', flexShrink: 0 }}>{option.data.label?.charAt(0)}</Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.data.label}</div>
                <div style={{ color: '#8c8c8c', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.data.description}</div>
              </div>
            </Space>
          )}
          options={spaces.map(space => ({ value: space.id, label: space.name, description: space.description }))}
        />
      </Form.Item>
      <Form.Item name="workshopId" label="4. 选择现有资源" rules={[{ required: true, message: '请选择现有资源' }]}>
        <Select
          showSearch
          optionFilterProp="label"
          placeholder={`请选择已存在的 ${typeConfig[resourceType].label} 资源`}
          optionRender={(option) => (
            <Space>
              <Avatar size={32} icon={typeConfig[resourceType].icon} style={{ background: typeConfig[resourceType].bg, color: typeConfig[resourceType].color, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.data.label}</div>
                <div style={{ color: '#8c8c8c', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.data.description}</div>
              </div>
            </Space>
          )}
          options={workshopItems.filter(item => item.type === resourceType).map(item => ({ value: item.id, label: item.name, description: item.description }))}
          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`暂无未发布的 ${typeConfig[resourceType].label} 资源`} />}
        />
      </Form.Item>
    </>}
  </div>;

  const coreFields = <>
    <div style={{ padding: 16, marginBottom: 24, border: '1px solid #f0f0f0', borderRadius: 8, background: '#fafafa' }}>
      <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>资源类型 {editing ? '' : '& 来源'}</div>
      <Space><Tag color="blue" icon={typeConfig[resourceType].icon}>{typeConfig[resourceType].label}</Tag>{!editing && <Tag color={source === 'workshop' ? 'cyan' : 'green'}>{source === 'workshop' ? '已有拉取' : '全新创建'}</Tag>}</Space>
    </div>
    <Form.Item name="name" label="资源名称" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="输入资源在广场展示的名称" maxLength={40} showCount /></Form.Item>
    <Form.Item name="resourceKey" label="唯一标识 (Key)" tooltip="创建后不允许编辑" extra={!editing ? '包含小写字母、数字和特殊字符（-.），不能以特殊字符开头和结尾。' : undefined} rules={[{ required: true }, { pattern: /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/, message: '格式不正确，例如 inner-address-api' }]}><Input disabled={editing} /></Form.Item>
    <Form.Item name="description" label="描述信息" rules={[{ required: true }]}><Input.TextArea rows={3} maxLength={200} showCount placeholder="简洁描述资源的功能和价值" /></Form.Item>
    <Form.Item name="markdownIntro" label={<span>资源介绍 (Markdown) <Button type="link" size="small" onClick={() => setPreviewOpen(true)}>预览</Button></span>}><Input.TextArea rows={6} placeholder="支持 Markdown，用于介绍资源详细说明" /></Form.Item>
    {technicalCard}
  </>;

  const strategyStep = <div>
    <div style={{ fontWeight: 600, marginBottom: 12 }}>设置公开策略</div>
    <Form.Item name="publicStrategy" rules={[{ required: true }]}>
      <Radio.Group style={{ width: '100%' }}>
        <Space orientation="vertical" style={{ width: '100%' }} size={12}>
          {(Object.keys(strategyConfig) as PublicStrategy[]).map(value => <Form.Item noStyle key={value} shouldUpdate>{({ getFieldValue, setFieldValue }) => { const active = getFieldValue('publicStrategy') === value; return <div onClick={() => setFieldValue('publicStrategy', value)} style={{ padding: '14px 16px', border: active ? '1px solid #1677ff' : '1px solid #f0f0f0', background: active ? '#f0f7ff' : '#fff', borderRadius: 8, cursor: 'pointer' }}><Radio value={value}><strong>{strategyConfig[value].label}</strong><div style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>{strategyDescriptions[value]}</div></Radio></div>; }}</Form.Item>)}
        </Space>
      </Radio.Group>
    </Form.Item>
    <Form.Item noStyle shouldUpdate>{({ getFieldValue }) => getFieldValue('publicStrategy') === 'whitelist' ? <div style={{ marginTop: 24 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><strong>可见范围设定</strong><Button size="small" type="primary" onClick={() => setAddObjectModalOpen(true)}>添加对象</Button></div><Table rowKey="id" pagination={false} dataSource={visibleObjects} columns={[{ title: '可见对象', render: (_, item) => <Space><Avatar icon={<UserOutlined />} /><div><div>{item.name}</div><small style={{ color: '#999' }}>{item.description}</small></div></Space> }, { title: '对象类型', dataIndex: 'type', render: value => <Tag>{value}</Tag> }, { title: '操作', render: (_, item) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => setVisibleObjects(prev => prev.filter(value => value.id !== item.id))} /> }]} /></div> : null}</Form.Item>
  </div>;

  const footer = readOnly ? <Button type="primary" onClick={onClose}>关闭</Button> : editing ? <Space><Button onClick={onClose}>取消</Button><Button type="primary" onClick={saveEdit}>保存修改</Button></Space> : <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><Button onClick={onClose}>取消</Button><Space>{step > 0 && <Button onClick={() => setStep(value => value - 1)}>上一步</Button>}{step < 2 ? <Button type="primary" disabled={step === 0 && source === 'workshop' && !selectedWorkshop} onClick={next}>下一步</Button> : <Button type="primary" onClick={finish}>提交创建</Button>}</Space></div>;

  return <>
    <Drawer
      title={editing ? `${readOnly ? '资源详情' : '编辑资源'} - ${resource?.name}` : '创建并发布资源'}
      open={open}
      onClose={onClose}
      size="large"
      destroyOnHidden
      styles={{ body: { padding: editing ? '24px 32px 88px' : 0 } }}
      footer={<div style={{ display: 'flex', justifyContent: 'flex-end' }}>{footer}</div>}
    >
      <Form form={form} layout="vertical" disabled={readOnly} preserve>
        {editing ? coreFields : <>
          <div style={{ padding: '24px 24px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}><Steps current={step} size="small" items={[{ title: '选择来源' }, { title: '完善信息' }, { title: '发布策略' }]} /></div>
          <div style={{ padding: 24 }}>{step === 0 ? createStepSource : step === 1 ? coreFields : strategyStep}</div>
        </>}
      </Form>
    </Drawer>
    <ResourceTechnicalDrawer open={technicalOpen} type={resourceType} initialValues={{ ...resource, ...form.getFieldsValue(), ...technicalValues }} readOnly={readOnly} onClose={() => setTechnicalOpen(false)} onSave={values => { setTechnicalValues(prev => ({ ...prev, ...values })); setTechnicalConfigured(true); setTechnicalOpen(false); message.success('详细配置保存成功'); }} />
    <Modal title="Markdown 预览" open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} size="large"><div style={{ minHeight: 220, padding: 12 }}><ReactMarkdown>{markdown || '暂无内容'}</ReactMarkdown></div></Modal>
    <Modal
      title="添加可见对象"
      open={addObjectModalOpen}
      onCancel={() => setAddObjectModalOpen(false)}
      footer={<Button onClick={() => setAddObjectModalOpen(false)}>关闭</Button>}
    >
      <div style={{ padding: '32px 0', textAlign: 'center' }}>
        <InfoCircleOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 16 }} />
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>复用人员 / 部门选择组件</div>
        <div style={{ color: '#8c8c8c', fontSize: 13, lineHeight: '22px' }}>
          此处应复用项目中已有的成员选择组件（<code>MemberSelect</code>）与部门选择组件，<br />
          支持按人员姓名或部门名称搜索并添加至可见范围列表。
        </div>
      </div>
    </Modal>
  </>;
};

export default ResourceFormDrawer;
