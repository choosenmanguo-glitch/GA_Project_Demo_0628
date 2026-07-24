import React, { useEffect, useState } from 'react';
import {
  Alert, App as AntdApp, Button, Col, Drawer, Form, Input, InputNumber,
  Radio, Row, Select, Space, Tabs, Tooltip,
} from 'antd';
import {
  DeleteOutlined, GlobalOutlined, InfoCircleOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { CreateResourceInput, ResourceType } from '../types';
import { typeConfig } from '../ui';

interface ResourceTechnicalDrawerProps {
  open: boolean;
  type: ResourceType;
  initialValues: Partial<CreateResourceInput>;
  readOnly?: boolean;
  onClose: () => void;
  onSave: (values: Partial<CreateResourceInput>) => void;
}

const generateRandomPath = () => `/gateway/${Math.random().toString(36).slice(2, 10)}`;

const sectionTitle = (color: string, title: string, tooltip: string) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontWeight: 600 }}>
    <span style={{ width: 4, height: 14, borderRadius: 2, background: color }} />
    <span>{title}</span>
    <Tooltip title={tooltip}><InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 13 }} /></Tooltip>
  </div>
);

const ApiParameterEditor: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
    <section>
      {sectionTitle('#1677ff', '请求参数列表 (Request Parameters)', '定义客户端传入或解析得到的 Header、Body、Query 和路径参数。')}
      <Alert type="info" showIcon title="请勿录入鉴权方式相关的字段，避免重复" description="鉴权字段由系统根据上方配置自动注入，请勿重复添加 Authorization、X-API-KEY 等字段。" style={{ marginBottom: 12 }} />
      <Form.List name="requestParams">
        {(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
          {fields.map(({ key, name, ...rest }) => <Row key={key} gutter={8} align="middle">
            <Col span={5}><Form.Item {...rest} name={[name, 'paraName']} rules={[{ required: true, message: '必填' }]}><Input placeholder="参数名称" /></Form.Item></Col>
            <Col span={5}><Form.Item {...rest} name={[name, 'paraDesc']} rules={[{ required: true, message: '必填' }]}><Input placeholder="参数描述" /></Form.Item></Col>
            <Col span={4}><Form.Item {...rest} name={[name, 'paraPosition']} rules={[{ required: true }]}><Select options={['query', 'body', 'header', 'url'].map(value => ({ value, label: value === 'url' ? 'url (path)' : value }))} /></Form.Item></Col>
            <Col span={3}><Form.Item {...rest} name={[name, 'paraRequired']}><Select options={[{ value: 'yes', label: '是' }, { value: 'no', label: '否' }]} /></Form.Item></Col>
            <Col span={2}><Form.Item {...rest} name={[name, 'paraOrder']}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={3}><Form.Item {...rest} name={[name, 'paraDefaultValue']}><Input placeholder="默认值" /></Form.Item></Col>
            <Col span={2}><Button danger type="text" icon={<DeleteOutlined />} disabled={disabled} onClick={() => remove(name)} /></Col>
          </Row>)}
          {!disabled && <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add({ paraPosition: 'body', paraRequired: 'no', paraOrder: fields.length + 1 })}>添加参数项 (Request Parameter)</Button>}
        </Space>}
      </Form.List>
    </section>

    <section>
      {sectionTitle('#722ed1', '固定预设参数 (Constant / Preset Parameters)', '定义接口底层恒定或系统自动补充发送的固定参数。')}
      <Form.List name="constantParams">
        {(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
          {fields.map(({ key, name, ...rest }) => <Row key={key} gutter={8} align="middle">
            <Col span={6}><Form.Item {...rest} name={[name, 'constName']} rules={[{ required: true }]}><Input placeholder="参数名称" /></Form.Item></Col>
            <Col span={6}><Form.Item {...rest} name={[name, 'constValue']} rules={[{ required: true }]}><Input placeholder="固定参数值" /></Form.Item></Col>
            <Col span={4}><Form.Item {...rest} name={[name, 'constPosition']}><Select options={['header', 'query', 'body'].map(value => ({ value }))} /></Form.Item></Col>
            <Col span={6}><Form.Item {...rest} name={[name, 'constDesc']} rules={[{ required: true }]}><Input placeholder="参数说明" /></Form.Item></Col>
            <Col span={2}><Button danger type="text" icon={<DeleteOutlined />} disabled={disabled} onClick={() => remove(name)} /></Col>
          </Row>)}
          {!disabled && <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add({ constPosition: 'header' })}>添加固定预设参数 (Constant Parameter)</Button>}
        </Space>}
      </Form.List>
    </section>

    <section>
      {sectionTitle('#52c41a', '返回响应参数列表 (Response Fields)', '描述接口成功响应体中的字段名称和业务含义。')}
      <Form.List name="responseParams">
        {(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
          {fields.map(({ key, name, ...rest }) => <Row key={key} gutter={8} align="middle">
            <Col span={10}><Form.Item {...rest} name={[name, 'respName']} rules={[{ required: true }]}><Input placeholder="例如：data.records" /></Form.Item></Col>
            <Col span={12}><Form.Item {...rest} name={[name, 'respDesc']} rules={[{ required: true }]}><Input placeholder="字段含义" /></Form.Item></Col>
            <Col span={2}><Button danger type="text" icon={<DeleteOutlined />} disabled={disabled} onClick={() => remove(name)} /></Col>
          </Row>)}
          {!disabled && <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add()}>添加返回值项 (Response Parameter)</Button>}
        </Space>}
      </Form.List>
    </section>

    <section>
      {sectionTitle('#ff4d4f', '异常错误响应代码 (Error Codes)', '记录接口的自定义异常返回码及调用方处理说明。')}
      <Form.List name="errorCodes">
        {(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>
          {fields.map(({ key, name, ...rest }) => <Row key={key} gutter={8} align="middle">
            <Col span={10}><Form.Item {...rest} name={[name, 'errorCode']} rules={[{ required: true }]}><Input placeholder="例如：INVALID_TOKEN" /></Form.Item></Col>
            <Col span={12}><Form.Item {...rest} name={[name, 'errorDesc']} rules={[{ required: true }]}><Input placeholder="错误原因及处理方式" /></Form.Item></Col>
            <Col span={2}><Button danger type="text" icon={<DeleteOutlined />} disabled={disabled} onClick={() => remove(name)} /></Col>
          </Row>)}
          {!disabled && <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add()}>添加异常状态码 (Error Code)</Button>}
        </Space>}
      </Form.List>
    </section>
  </div>
);

const GatewayPathField: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div style={{ marginTop: 24, padding: '16px 20px', border: '1px dashed #d9d9d9', borderRadius: 8, background: '#fafafa' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontWeight: 600 }}>
      <GlobalOutlined style={{ color: '#1677ff' }} />
      <span>网关代理路径 (gatewayPath)</span>
      <Tooltip title="用于 API 网关代理；一经创建即不可修改。"><InfoCircleOutlined style={{ color: '#8c8c8c' }} /></Tooltip>
    </div>
    <Space.Compact style={{ width: '100%' }}>
      <Form.Item noStyle name="gatewayPath" rules={[{ required: true, message: '请直接输入或使用一键生成' }, { pattern: /^\/[a-zA-Z0-9_\-./]+$/, message: '必须以 / 开头，且只能包含英文、数字和 -./_' }]}>
        <Input disabled={disabled} placeholder="/gateway/default-path" />
      </Form.Item>
      {!disabled && <Form.Item noStyle shouldUpdate>{({ setFieldValue }) => <Button onClick={() => setFieldValue('gatewayPath', generateRandomPath())}>一键随机生成</Button>}</Form.Item>}
    </Space.Compact>
  </div>
);

const ResourceTechnicalDrawer: React.FC<ResourceTechnicalDrawerProps> = ({ open, type, initialValues, readOnly, onClose, onSave }) => {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<Partial<CreateResourceInput>>();
  const [apiMode, setApiMode] = useState<'manual' | 'openapi'>('manual');
  const authType = Form.useWatch('authType', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      method: 'POST', authType: 'none', authPrefix: 'bearer', mcpTransport: 'HTTP', gatewayPath: generateRandomPath(),
      requestParams: [], constantParams: [], responseParams: [], errorCodes: [], ...initialValues,
    });
    setApiMode(initialValues.swaggerSchema ? 'openapi' : 'manual');
  }, [form, initialValues, open]);

  const save = async () => {
    let values: Partial<CreateResourceInput>;
    try {
      values = type === 'api' && apiMode === 'openapi'
        ? { ...form.getFieldsValue(), ...(await form.validateFields(['swaggerSchema', 'gatewayPath'])) }
        : await form.validateFields();
    } catch {
      // Ant Design 已在对应字段下展示校验信息，阻止提交即可。
      return;
    }
    if (type === 'api' && apiMode === 'openapi') {
      try {
        const schema = JSON.parse(values.swaggerSchema || '') as { openapi?: string; swagger?: string };
        if (!schema.openapi && !schema.swagger) return message.error('OpenAPI 配置缺少 openapi 或 swagger 版本字段');
      } catch {
        return message.error('OpenAPI/Swagger 配置不是合法 JSON');
      }
    }
    onSave(values);
  };

  const modelFields = <>
    <Form.Item name="modelType" label="模型类型" rules={[{ required: true }]}><Select onChange={value => form.setFieldValue('path', value === 'LargeModel' ? '/chat/completions' : value === 'VectorModel' ? '/embeddings' : '/rerank')} options={[{ value: 'LargeModel', label: '大模型' }, { value: 'VectorModel', label: '向量化模型' }, { value: 'RerankModel', label: 'rerank 模型' }]} /></Form.Item>
    <Form.Item name="baseurl" label="Base URL" rules={[{ required: true }]}><Input placeholder="https://..." /></Form.Item>
    <Form.Item name="path" label="Path" tooltip="当服务路径与标准不一致时可自主修改"><Input placeholder="/chat/completions" /></Form.Item>
    <Form.Item name="apikey" label="API Key"><Input.Password placeholder="输入 API Key" /></Form.Item>
    <Form.Item name="modelName" label="模型名称" rules={[{ required: true }, { pattern: /^[a-zA-Z0-9_.-]+$/, message: '只能包含字母、数字、下划线、短横线或点' }]}><Input /></Form.Item>
    <Form.Item name="deploymentMode" label="部署方式" rules={[{ required: true }]}><Radio.Group options={[{ value: 'Internal', label: '内网' }, { value: 'Public', label: '公网' }]} /></Form.Item>
    <GatewayPathField disabled={readOnly || !!initialValues.gatewayPath} />
  </>;

  const knowledgeFields = <>
    <Form.Item name="kbId" label="知识库 ID" tooltip="填写外部知识库系统的知识库 ID" rules={[{ required: true }]}><Input placeholder="输入知识库的唯一标识" /></Form.Item>
    <Form.Item name="apiEndpoint" label="API Endpoint" rules={[{ required: true }]}><Input placeholder="https://..." /></Form.Item>
    <Form.Item name="apikey" label="API Key"><Input.Password placeholder="输入 API Key" /></Form.Item>
    <GatewayPathField disabled={readOnly || !!initialValues.gatewayPath} />
  </>;

  const mcpFields = <>
    <Form.Item name="mcpTransport" label="MCP Transport" rules={[{ required: true }]}><Select options={[{ value: 'HTTP' }, { value: 'SSE', label: 'SSE (Server-Sent Events)' }]} /></Form.Item>
    <Form.Item name="mcpServerEndpoint" label="服务端点 URL" dependencies={['mcpTransport']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, value) => getFieldValue('mcpTransport') !== 'SSE' || /\/sse$/i.test(value || '') ? Promise.resolve() : Promise.reject(new Error('SSE 模式要求 URL 以 /sse 结尾')) })]}><Input placeholder="https://..." /></Form.Item>
    <Form.Item name="mcpServerIdentifier" label="服务器标识符" rules={[{ required: true }, { pattern: /^[a-z0-9_-]+$/, message: '仅支持小写字母、数字、下划线和连字符' }, { max: 24 }]}><Input /></Form.Item>
    <Form.Item label="请求头（非必填）"><Form.List name="mcpHeaders">{(fields, { add, remove }) => <Space orientation="vertical" style={{ width: '100%' }}>{fields.map(({ key, name, ...rest }) => <Space key={key} align="baseline"><Form.Item {...rest} name={[name, 'key']} rules={[{ required: true }]}><Input placeholder="Key" /></Form.Item><Form.Item {...rest} name={[name, 'value']} rules={[{ required: true }]}><Input placeholder="Value" /></Form.Item><Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} /></Space>)}{!readOnly && <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add()}>添加请求头</Button>}</Space>}</Form.List></Form.Item>
    <GatewayPathField disabled={readOnly || !!initialValues.gatewayPath} />
  </>;

  const manualApi = <>
    <Row gutter={16}><Col span={8}><Form.Item name="method" label="Method" rules={[{ required: true }]}><Select options={['GET', 'POST', 'PUT', 'DELETE'].map(value => ({ value }))} /></Form.Item></Col><Col span={16}><Form.Item name="url" label="URL" rules={[{ required: true }]}><Input placeholder="https://api.example.com/v1/..." /></Form.Item></Col></Row>
    <Form.Item name="authType" label="鉴权方式"><Select options={[{ value: 'none', label: '无鉴权 (Public)' }, { value: 'header', label: '请求头 (Header)' }, { value: 'query', label: '查询参数 (Query)' }]} /></Form.Item>
    {authType === 'header' && <Row gutter={16}><Col span={8}><Form.Item name="authPrefix" label="鉴权前缀"><Select options={['basic', 'bearer', 'custom'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /></Form.Item></Col><Col span={8}><Form.Item name="authKey" label="Key"><Input placeholder="Authorization" /></Form.Item></Col><Col span={8}><Form.Item name="authValue" label="Token"><Input.Password /></Form.Item></Col></Row>}
    {authType === 'query' && <Row gutter={16}><Col span={12}><Form.Item name="authKey" label="Key"><Input /></Form.Item></Col><Col span={12}><Form.Item name="authValue" label="Value"><Input.Password /></Form.Item></Col></Row>}
    <GatewayPathField disabled={readOnly || !!initialValues.gatewayPath} />
    <ApiParameterEditor disabled={readOnly} />
  </>;

  const apiFields = <Tabs activeKey={apiMode} onChange={key => setApiMode(key as 'manual' | 'openapi')} items={[
    { key: 'manual', label: '手动维护字段', children: manualApi },
    { key: 'openapi', label: 'OpenAPI / Swagger', children: <><Alert type="info" showIcon title="导入接口规范" description="粘贴完整 OpenAPI 3.x 或 Swagger 2.0 JSON，保存时进行基础结构校验。" style={{ marginBottom: 16 }} /><Form.Item name="swaggerSchema" label="规范 JSON" rules={[{ required: apiMode === 'openapi' }]}><Input.TextArea rows={18} placeholder={'{\n  "openapi": "3.0.0",\n  "paths": {}\n}'} /></Form.Item><GatewayPathField disabled={readOnly || !!initialValues.gatewayPath} /></> },
  ]} />;

  return <Drawer
    title={`${typeConfig[type].label} 详细配置`}
    open={open}
    onClose={onClose}
    destroyOnHidden
    styles={{ wrapper: { width: type === 'api' ? 960 : 560 }, body: { padding: '20px 24px 84px' } }}
    footer={<div style={{ textAlign: 'right' }}>{readOnly ? <Button type="primary" onClick={onClose}>关闭</Button> : <Space><Button onClick={onClose}>取消</Button><Button type="primary" onClick={save}>保存</Button></Space>}</div>}
  >
    <Form form={form} layout="vertical" disabled={readOnly} preserve>
      {type === 'model' && modelFields}
      {type === 'api' && apiFields}
      {type === 'mcp' && mcpFields}
      {type === 'knowledge' && knowledgeFields}
    </Form>
  </Drawer>;
};

export default ResourceTechnicalDrawer;
