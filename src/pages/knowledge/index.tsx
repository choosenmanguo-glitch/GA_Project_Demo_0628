import React, { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Progress,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ApiOutlined,
  ArrowLeftOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  CodeSandboxOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FolderOutlined,
  LinkOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type KBCategory = 'easy' | 'professional' | 'external';
type KBStatus = 'available' | 'processing' | 'error';
type RagflowSyncStatus = 'none' | 'creating' | 'synced' | 'failed';

interface KnowledgeBase {
  id: string;
  name: string;
  category: KBCategory;
  typeTag: string;
  desc: string;
  owner: string;
  date: string;
  fileCount: number | null;
  active: boolean;
  status: KBStatus;
  ragflowDatasetId?: string;
  ragflowTenantId?: string;
  ragflowUserId?: string;
  ragflowPageUrl?: string;
  ragflowSyncStatus?: RagflowSyncStatus;
  syncError?: string;
  embeddingModelId?: string;
  chunkMethod?: string;
  parserConfig?: {
    chunkSize: number;
    delimiter: string;
    overlap: number;
    enableTableContext: boolean;
    enableParentChild: boolean;
    autoMetadata: boolean;
  };
  apiEndpoint?: string;
  externalKbId?: string;
}

interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  status: string;
  updatedAt: string;
}

const categoryConfig: Record<KBCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  easy: { label: '简易知识库', color: '#1677ff', bg: '#e6f4ff', icon: <FileTextOutlined /> },
  professional: { label: '专业知识库', color: '#722ed1', bg: '#f9f0ff', icon: <BlockOutlined /> },
  external: { label: '外部知识库', color: '#fa8c16', bg: '#fff7e6', icon: <ApiOutlined /> },
};

const statusConfig: Record<KBStatus, { label: string; color: string; badge: 'success' | 'processing' | 'error' }> = {
  available: { label: '可用', color: 'success', badge: 'success' },
  processing: { label: '处理中', color: 'processing', badge: 'processing' },
  error: { label: '异常', color: 'error', badge: 'error' },
};

const syncConfig: Record<RagflowSyncStatus, { label: string; color: string; icon: React.ReactNode }> = {
  none: { label: '标准能力', color: 'default', icon: <CheckCircleOutlined /> },
  creating: { label: '创建中', color: 'processing', icon: <LoadingOutlined /> },
  synced: { label: '已就绪', color: 'success', icon: <CheckCircleOutlined /> },
  failed: { label: '创建失败', color: 'error', icon: <ExclamationCircleOutlined /> },
};

const defaultEmbeddingModel = {
  id: 'model-bge-m3',
  displayName: 'BGE-M3',
  ragflowModel: 'bge-m3@BAAI',
};

const initialKBList: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: '反诈案例专业知识库',
    category: 'professional',
    typeTag: '专业知识库',
    desc: '沉淀电信网络诈骗案件材料、资金穿透研判报告和处置规范，用于专业检索与智能体问答。',
    owner: '王大队',
    date: '2026-06-18',
    fileCount: 203,
    active: true,
    status: 'available',
    ragflowDatasetId: 'rf_ds_fz_20260618',
    ragflowTenantId: 'tenant-police-demo',
    ragflowUserId: 'rf_user_wang',
    ragflowPageUrl: '/ragflow/proxy/datasets/rf_ds_fz_20260618',
    ragflowSyncStatus: 'synced',
    embeddingModelId: defaultEmbeddingModel.id,
    chunkMethod: 'General',
    parserConfig: {
      chunkSize: 512,
      delimiter: '\\n',
      overlap: 10,
      enableTableContext: true,
      enableParentChild: true,
      autoMetadata: true,
    },
  },
  {
    id: 'kb-002',
    name: '警情分类知识库',
    category: 'easy',
    typeTag: '文档知识库',
    desc: '面向 110 接警场景的警情分类标准、处置流程和常见问答。',
    owner: '李警官',
    date: '2026-05-22',
    fileCount: 128,
    active: true,
    status: 'available',
    ragflowSyncStatus: 'none',
  },
  {
    id: 'kb-003',
    name: '法律法规外部库',
    category: 'external',
    typeTag: '外部 API 接入',
    desc: '通过第三方法规检索服务接入现行法律法规、司法解释和执法规范。',
    owner: '周科长',
    date: '2026-05-09',
    fileCount: null,
    active: true,
    status: 'available',
    ragflowSyncStatus: 'none',
    apiEndpoint: 'https://law.example.com/api/retrieval',
    externalKbId: 'law-kb-prod',
  },
  {
    id: 'kb-004',
    name: '卷宗证据链知识库',
    category: 'professional',
    typeTag: '专业知识库',
    desc: '用于刑事卷宗材料解析、证据链要素抽取与检索增强。',
    owner: '陈队长',
    date: '2026-06-24',
    fileCount: 0,
    active: true,
    status: 'error',
    ragflowSyncStatus: 'failed',
    syncError: '专业知识库服务连接超时，请稍后重试。',
    embeddingModelId: defaultEmbeddingModel.id,
    chunkMethod: 'Q&A',
    parserConfig: {
      chunkSize: 768,
      delimiter: '\\n\\n',
      overlap: 15,
      enableTableContext: true,
      enableParentChild: false,
      autoMetadata: true,
    },
  },
  {
    id: 'kb-005',
    name: '道路交通安全法规库',
    category: 'easy',
    typeTag: '文档知识库',
    desc: '交通事故责任认定、道路交通安全法及地方实施细则。',
    owner: '赵警官',
    date: '2026-04-16',
    fileCount: 84,
    active: true,
    status: 'processing',
    ragflowSyncStatus: 'none',
  },
];

const mockFiles: KnowledgeFile[] = [
  { id: 'file-1', name: '2026年Q2电信诈骗新趋势分析.pdf', size: '8.4 MB', status: '已解析', updatedAt: '2026-06-20 16:22' },
  { id: 'file-2', name: '涉诈资金穿透研判报告.docx', size: '2.1 MB', status: '已解析', updatedAt: '2026-06-19 10:15' },
  { id: 'file-3', name: '高发诈骗话术样本.xlsx', size: '768 KB', status: '解析中', updatedAt: '2026-06-18 09:30' },
];

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5EAF3',
  borderRadius: 8,
  padding: 18,
};

const getKnowledgeCode = (kb: KnowledgeBase) => kb.id.replace('kb-', 'KB-').toUpperCase();

const TypeSelectModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSelect: (category: KBCategory) => void;
}> = ({ open, onCancel, onSelect }) => (
  <Modal title="选择知识库类型" open={open} footer={null} onCancel={onCancel} width={720} destroyOnClose>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingTop: 8 }}>
      {(Object.keys(categoryConfig) as KBCategory[]).map((category) => {
        const item = categoryConfig[category];
        const desc = {
          easy: '快速上传文档，适合轻量知识沉淀和常规问答。',
          professional: '提供高级解析、切片管理、检索测试等能力，适合复杂业务资料治理。',
          external: '连接已有第三方知识库 API，平台统一调用检索能力。',
        }[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            style={{
              ...cardStyle,
              minHeight: 174,
              cursor: 'pointer',
              textAlign: 'left',
              borderColor: category === 'professional' ? '#d3adf7' : '#E5EAF3',
              boxShadow: category === 'professional' ? '0 4px 16px rgba(114,46,209,0.08)' : 'none',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 14,
              }}
            >
              {item.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1D2129', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 12, lineHeight: '20px', color: '#5F6B7A' }}>{desc}</div>
            {category === 'professional' && <Tag color="purple" style={{ marginTop: 12 }}>专业能力</Tag>}
          </button>
        );
      })}
    </div>
  </Modal>
);

const ProfessionalCreateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Drawer
      title="创建专业知识库"
      width={620}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" icon={<CloudSyncOutlined />} onClick={handleSubmit}>
            创建专业知识库
          </Button>
        </div>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message="将创建专业知识库"
        description={`模型由平台统一配置，当前默认向量模型为 ${defaultEmbeddingModel.displayName}。`}
      />
      <Form form={form} layout="vertical" initialValues={{ chunkMethod: 'General', chunkSize: 512, overlap: 10, delimiter: '\\n', enableTableContext: true, enableParentChild: true, autoMetadata: true }}>
        <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input placeholder="例如：反诈案例专业知识库" maxLength={50} />
        </Form.Item>
        <Form.Item name="desc" label="知识库描述">
          <TextArea rows={3} placeholder="说明知识库的内容范围和使用场景" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="chunkMethod" label="解析方式">
          <Select
            options={[
              { label: 'General 通用文档解析', value: 'General' },
              { label: 'Q&A 问答对解析', value: 'Q&A' },
              { label: 'Manual 手动切片', value: 'Manual' },
              { label: 'Pipeline 自定义流水线', value: 'Pipeline' },
            ]}
          />
        </Form.Item>
        <Form.Item label="切片大小">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="chunkSize" noStyle>
              <InputNumber min={128} max={2048} style={{ width: 110 }} />
            </Form.Item>
            <Form.Item name="chunkSizeSlider" noStyle>
              <Slider min={128} max={2048} style={{ flex: 1, marginInline: 16 }} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item name="delimiter" label="分段符">
          <Input placeholder="例如：\\n 或 \\n\\n" />
        </Form.Item>
        <Form.Item label="重叠比例">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="overlap" noStyle>
              <InputNumber min={0} max={50} addonAfter="%" style={{ width: 110 }} />
            </Form.Item>
            <Form.Item name="overlapSlider" noStyle>
              <Slider min={0} max={50} style={{ flex: 1, marginInline: 16 }} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
        <Form.Item name="enableTableContext" label="图片与表格上下文窗口" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="enableParentChild" label="父子块检索" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="autoMetadata" label="自动元数据" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

const SimpleCreateDrawer: React.FC<{
  open: boolean;
  category: Exclude<KBCategory, 'professional'>;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}> = ({ open, category, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const isExternal = category === 'external';
  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Drawer
      title={isExternal ? '连接外部知识库' : '创建简易知识库'}
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>{isExternal ? '连接' : '创建'}</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input maxLength={50} />
        </Form.Item>
        <Form.Item name="desc" label="描述">
          <TextArea rows={3} maxLength={200} showCount />
        </Form.Item>
        {isExternal ? (
          <>
            <Form.Item name="apiEndpoint" label="API Endpoint" rules={[{ required: true, message: '请输入 API Endpoint' }]}>
              <Input placeholder="https://api.example.com/v1/retrieval" />
            </Form.Item>
            <Form.Item name="externalKbId" label="外部知识库 ID" rules={[{ required: true, message: '请输入外部知识库 ID' }]}>
              <Input />
            </Form.Item>
          </>
        ) : (
          <Form.Item label="上传文档">
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

const RagflowEmbeddedPreview: React.FC<{ kb: KnowledgeBase }> = ({ kb }) => {
  const srcDoc = `
    <html>
      <head>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #1d2129; background: #fff; }
          .wrap { padding: 22px 24px; }
          .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
          .tabs { display: flex; gap: 22px; border-bottom: 1px solid #edf0f5; margin-bottom: 18px; }
          .tab { padding: 0 0 12px; font-size: 14px; color: #5f6b7a; }
          .active { color: #1677ff; border-bottom: 2px solid #1677ff; font-weight: 600; }
          .btn { background: #1677ff; color: #fff; border-radius: 6px; padding: 8px 14px; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
          .panel { border: 1px solid #e5eaf3; border-radius: 8px; padding: 16px; min-height: 180px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; color: #7a8599; background: #f8f9fb; padding: 10px; font-weight: 500; }
          td { padding: 12px 10px; border-bottom: 1px solid #f0f2f5; }
          .tag { color: #389e0d; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; padding: 2px 7px; }
          .muted { color: #7a8599; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="toolbar">
            <div>
              <div style="font-size:18px;font-weight:700;">${kb.name}</div>
              <div class="muted">专业知识库编号：${getKnowledgeCode(kb)}</div>
            </div>
            <div class="btn">上传文档</div>
          </div>
          <div class="tabs">
            <div class="tab active">文档</div>
            <div class="tab">分段</div>
            <div class="tab">检索测试</div>
            <div class="tab">配置</div>
          </div>
          <div class="grid">
            <div class="panel">
              <table>
                <thead><tr><th>名称</th><th>状态</th><th>分段数</th><th>更新时间</th></tr></thead>
                <tbody>
                  <tr><td>2026年Q2电信诈骗新趋势分析.pdf</td><td><span class="tag">已解析</span></td><td>356</td><td>06-20 16:22</td></tr>
                  <tr><td>涉诈资金穿透研判报告.docx</td><td><span class="tag">已解析</span></td><td>148</td><td>06-19 10:15</td></tr>
                  <tr><td>高发诈骗话术样本.xlsx</td><td><span class="tag">解析中</span></td><td>--</td><td>06-18 09:30</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel">
              <div style="font-size:14px;font-weight:700;margin-bottom:12px;">解析配置</div>
              <div class="muted">向量模型</div>
              <div style="margin-bottom:12px;">${defaultEmbeddingModel.displayName}</div>
              <div class="muted">解析方式</div>
              <div style="margin-bottom:12px;">${kb.chunkMethod || 'General'}</div>
              <div class="muted">切片大小</div>
              <div>${kb.parserConfig?.chunkSize || 512}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <iframe
      title="专业知识库详情预览"
      srcDoc={srcDoc}
      sandbox=""
      style={{ width: '100%', minHeight: 520, border: 0, background: '#fff', display: 'block' }}
    />
  );
};

const RagflowDetail: React.FC<{
  kb: KnowledgeBase;
  onBack: () => void;
  onRetry: (id: string) => void;
}> = ({ kb, onBack, onRetry }) => {
  const sync = syncConfig[kb.ragflowSyncStatus ?? 'none'];
  const isSynced = kb.ragflowSyncStatus === 'synced';

  return (
    <div style={{ flex: 1, background: '#F5F7FA', overflow: 'auto' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #F0F2F5', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size={14}>
          <ArrowLeftOutlined onClick={onBack} style={{ color: '#5F6B7A', cursor: 'pointer' }} />
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f9f0ff', color: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BlockOutlined />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{kb.name}</span>
              <Tag color="purple">专业知识库</Tag>
              <Tag color={sync.color} icon={sync.icon}>{sync.label}</Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              文档管理 / 分段管理 / 检索测试
            </Text>
          </div>
        </Space>
        <Space>
          <Tooltip title="模型由平台统一配置">
            <Tag icon={<CodeSandboxOutlined />}>{defaultEmbeddingModel.displayName}</Tag>
          </Tooltip>
          {kb.ragflowPageUrl && (
            <Button icon={<LinkOutlined />} onClick={() => message.info('已在当前平台内打开专业知识库详情')}>
              打开详情
            </Button>
          )}
          {kb.ragflowSyncStatus === 'failed' && (
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => onRetry(kb.id)}>
              重试创建
            </Button>
          )}
        </Space>
      </div>

      <div style={{ padding: '18px 28px 28px' }}>
        <Alert
          type={isSynced ? 'success' : kb.ragflowSyncStatus === 'failed' ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
          message={isSynced ? '专业知识库已就绪' : '专业知识库尚未可用'}
          description={
            isSynced
              ? '你可以在这里完成文档上传、解析管理、分段查看和检索测试等操作。'
              : kb.syncError || '系统正在创建专业知识库，请稍后刷新。'
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>基础信息</div>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label="知识库编号">{getKnowledgeCode(kb)}</Descriptions.Item>
                <Descriptions.Item label="创建人">{kb.owner}</Descriptions.Item>
                <Descriptions.Item label="所属空间">{kb.ragflowTenantId ? '当前工作空间' : '默认空间'}</Descriptions.Item>
                <Descriptions.Item label="解析方式">{kb.chunkMethod || '-'}</Descriptions.Item>
              </Descriptions>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>统一配置</div>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>平台默认向量模型</Text>
                  <div style={{ fontWeight: 600 }}>{defaultEmbeddingModel.displayName}</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>切片大小</Text>
                  <div>{kb.parserConfig?.chunkSize ?? 512}</div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>重叠比例</Text>
                  <div>{kb.parserConfig?.overlap ?? 0}%</div>
                </div>
              </Space>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E5EAF3', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: 42, borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: '#fff' }}>
              <Space>
                <Badge status={isSynced ? 'success' : 'error'} />
                <Text strong>专业知识库工作区</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>文档、分段、检索配置统一管理</Text>
            </div>
            {isSynced ? (
              <RagflowEmbeddedPreview kb={kb} />
            ) : (
              <div style={{ minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={kb.ragflowSyncStatus === 'failed' ? '专业知识库创建失败，重试后可进入详情' : '正在创建专业知识库'}
                >
                  {kb.ragflowSyncStatus === 'failed' && <Button type="primary" onClick={() => onRetry(kb.id)}>重试创建</Button>}
                </Empty>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NativeDetail: React.FC<{ kb: KnowledgeBase; onBack: () => void }> = ({ kb, onBack }) => {
  const columns: ColumnsType<KnowledgeFile> = [
    { title: '文件名', dataIndex: 'name', render: (name: string) => <a>{name}</a> },
    { title: '大小', dataIndex: 'size', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120, render: (status: string) => <Tag color={status === '已解析' ? 'success' : 'processing'}>{status}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
  ];

  return (
    <div style={{ flex: 1, background: '#F5F7FA', overflow: 'auto' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #F0F2F5', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <ArrowLeftOutlined onClick={onBack} style={{ color: '#5F6B7A', cursor: 'pointer' }} />
        <div style={{ width: 32, height: 32, borderRadius: 8, background: categoryConfig[kb.category].bg, color: categoryConfig[kb.category].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {categoryConfig[kb.category].icon}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{kb.name}</span>
        <Tag color={categoryConfig[kb.category].color}>{categoryConfig[kb.category].label}</Tag>
      </div>
      <div style={{ padding: '20px 28px' }}>
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="类型">{kb.typeTag}</Descriptions.Item>
            <Descriptions.Item label="创建人">{kb.owner}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{kb.date}</Descriptions.Item>
            <Descriptions.Item label="状态">{statusConfig[kb.status].label}</Descriptions.Item>
            <Descriptions.Item label="文件数">{kb.fileCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="启用状态">{kb.active ? '启用' : '停用'}</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ margin: '12px 0 0', color: '#5F6B7A' }}>{kb.desc}</Paragraph>
        </div>
        {kb.category === 'external' ? (
          <div style={cardStyle}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="API Endpoint">{kb.apiEndpoint}</Descriptions.Item>
              <Descriptions.Item label="外部知识库 ID">{kb.externalKbId}</Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={mockFiles} pagination={false} style={{ background: '#fff', borderRadius: 8 }} />
        )}
      </div>
    </div>
  );
};

const KnowledgeBasePage: React.FC = () => {
  const [kbList, setKbList] = useState<KnowledgeBase[]>(initialKBList);
  const [activeCategory, setActiveCategory] = useState<'all' | KBCategory>('all');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<KBStatus | undefined>();
  const [page, setPage] = useState(1);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false);
  const [simpleDrawerCategory, setSimpleDrawerCategory] = useState<Exclude<KBCategory, 'professional'> | null>(null);
  const [activeKB, setActiveKB] = useState<KnowledgeBase | null>(null);

  const pageSize = 8;

  const stats = useMemo(() => {
    const professional = kbList.filter((item) => item.category === 'professional');
    return [
      { key: 'all', label: '知识库总数', value: kbList.length, sub: `${kbList.filter((item) => item.status === 'available').length} 个可用`, color: '#1677ff' },
      { key: 'easy', label: '简易知识库', value: kbList.filter((item) => item.category === 'easy').length, sub: '平台轻量能力', color: '#1677ff' },
      { key: 'professional', label: '专业知识库', value: professional.length, sub: `${professional.filter((item) => item.ragflowSyncStatus === 'synced').length} 个已就绪`, color: '#722ed1' },
      { key: 'external', label: '外部知识库', value: kbList.filter((item) => item.category === 'external').length, sub: '第三方 API 接入', color: '#fa8c16' },
    ];
  }, [kbList]);

  const filteredList = useMemo(() => {
    return kbList.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (keyword && !item.name.includes(keyword) && !item.desc.includes(keyword)) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [activeCategory, kbList, keyword, statusFilter]);

  const pagedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  const openCreateByType = (category: KBCategory) => {
    setTypeModalOpen(false);
    if (category === 'professional') setProfessionalDrawerOpen(true);
    else setSimpleDrawerCategory(category);
  };

  const handleProfessionalSubmit = (values: Record<string, unknown>) => {
    const timestamp = Date.now();
    const syncSucceeded = String(values.name).includes('失败') ? false : true;
    const newKB: KnowledgeBase = {
      id: `kb-${timestamp}`,
      name: String(values.name),
      category: 'professional',
      typeTag: '专业知识库',
      desc: String(values.desc || '暂无描述'),
      owner: '当前用户',
      date: new Date().toISOString().slice(0, 10),
      fileCount: 0,
      active: true,
      status: syncSucceeded ? 'available' : 'error',
      ragflowSyncStatus: syncSucceeded ? 'synced' : 'failed',
      ragflowDatasetId: syncSucceeded ? `rf_ds_${timestamp}` : undefined,
      ragflowTenantId: 'tenant-police-demo',
      ragflowUserId: 'rf_user_current',
      ragflowPageUrl: syncSucceeded ? `/ragflow/proxy/datasets/rf_ds_${timestamp}` : undefined,
      syncError: syncSucceeded ? undefined : '模拟：专业知识库创建失败。',
      embeddingModelId: defaultEmbeddingModel.id,
      chunkMethod: String(values.chunkMethod || 'General'),
      parserConfig: {
        chunkSize: Number(values.chunkSize || 512),
        delimiter: String(values.delimiter || '\\n'),
        overlap: Number(values.overlap || 0),
        enableTableContext: Boolean(values.enableTableContext),
        enableParentChild: Boolean(values.enableParentChild),
        autoMetadata: Boolean(values.autoMetadata),
      },
    };
    setKbList((prev) => [newKB, ...prev]);
    setProfessionalDrawerOpen(false);
    message.success(syncSucceeded ? '专业知识库已创建' : '专业知识库创建失败，请稍后重试');
  };

  const handleSimpleSubmit = (values: Record<string, unknown>) => {
    if (!simpleDrawerCategory) return;
    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: String(values.name),
      category: simpleDrawerCategory,
      typeTag: simpleDrawerCategory === 'external' ? '外部 API 接入' : '文档知识库',
      desc: String(values.desc || '暂无描述'),
      owner: '当前用户',
      date: new Date().toISOString().slice(0, 10),
      fileCount: simpleDrawerCategory === 'external' ? null : 0,
      active: true,
      status: 'available',
      ragflowSyncStatus: 'none',
      apiEndpoint: String(values.apiEndpoint || ''),
      externalKbId: String(values.externalKbId || ''),
    };
    setKbList((prev) => [newKB, ...prev]);
    setSimpleDrawerCategory(null);
    message.success(simpleDrawerCategory === 'external' ? '外部知识库已连接' : '简易知识库已创建');
  };

  const handleRetrySync = (id: string) => {
    setKbList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'available',
              ragflowSyncStatus: 'synced',
              syncError: undefined,
              ragflowDatasetId: item.ragflowDatasetId || `rf_ds_retry_${Date.now()}`,
              ragflowPageUrl: item.ragflowPageUrl || `/ragflow/proxy/datasets/rf_ds_retry_${Date.now()}`,
              ragflowUserId: item.ragflowUserId || 'rf_user_current',
            }
          : item,
      ),
    );
    setActiveKB((prev) =>
      prev?.id === id
        ? {
            ...prev,
            status: 'available',
            ragflowSyncStatus: 'synced',
            syncError: undefined,
            ragflowDatasetId: prev.ragflowDatasetId || `rf_ds_retry_${Date.now()}`,
            ragflowPageUrl: prev.ragflowPageUrl || `/ragflow/proxy/datasets/rf_ds_retry_${Date.now()}`,
            ragflowUserId: prev.ragflowUserId || 'rf_user_current',
          }
        : prev,
    );
    message.success('专业知识库已重新创建');
  };

  const handleDelete = (kb: KnowledgeBase) => {
    Modal.confirm({
      title: '删除知识库',
      content: `确定删除「${kb.name}」吗？删除后相关文档、分段与检索配置将不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setKbList((prev) => prev.filter((item) => item.id !== kb.id));
        message.success('知识库已删除');
      },
    });
  };

  if (activeKB) {
    return activeKB.category === 'professional' ? (
      <RagflowDetail kb={activeKB} onBack={() => setActiveKB(null)} onRetry={handleRetrySync} />
    ) : (
      <NativeDetail kb={activeKB} onBack={() => setActiveKB(null)} />
    );
  }

  return (
    <>
      <div style={{ flex: 1, background: '#F5F7FA', overflow: 'auto' }}>
        <div style={{ padding: '24px 28px 40px' }}>
          <PageHeader
            title="知识库"
            hint="平台统一管理简易知识库、专业知识库和外部知识库。专业知识库适合复杂资料解析、分段治理和高质量检索场景。"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTypeModalOpen(true)}>
                创建知识库
              </Button>
            }
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
            {stats.map((stat) => {
              const active = activeCategory === stat.key;
              return (
                <button
                  type="button"
                  key={stat.key}
                  onClick={() => {
                    setActiveCategory(stat.key as 'all' | KBCategory);
                    setPage(1);
                  }}
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderColor: active ? `${stat.color}66` : '#E5EAF3',
                    boxShadow: active ? `0 4px 14px ${stat.color}18` : 'none',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, lineHeight: '34px', color: stat.color, fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#A0A8B8', marginTop: 4 }}>{stat.sub}</div>
                </button>
              );
            })}
          </div>

          <div style={{ ...cardStyle, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Radio.Group
                value={activeCategory}
                onChange={(event) => {
                  setActiveCategory(event.target.value);
                  setPage(1);
                }}
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: '全部', value: 'all' },
                  { label: '简易知识库', value: 'easy' },
                  { label: '专业知识库', value: 'professional' },
                  { label: '外部知识库', value: 'external' },
                ]}
              />
              <Select
                allowClear
                placeholder="状态"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                style={{ width: 140 }}
                options={[
                  { label: '可用', value: 'available' },
                  { label: '处理中', value: 'processing' },
                  { label: '异常', value: 'error' },
                ]}
              />
              <Input
                prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
                placeholder="搜索知识库名称或描述"
                allowClear
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
                style={{ width: 260, marginLeft: 'auto' }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStatusFilter(undefined);
                  setActiveCategory('all');
                  setPage(1);
                }}
              >
                重置
              </Button>
            </div>
          </div>

          {pagedList.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                {pagedList.map((kb) => {
                  const category = categoryConfig[kb.category];
                  const status = statusConfig[kb.status];
                  const sync = syncConfig[kb.ragflowSyncStatus ?? 'none'];
                  return (
                    <div
                      key={kb.id}
                      onClick={() => setActiveKB(kb)}
                      style={{ ...cardStyle, minHeight: 232, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 8, background: category.bg, color: category.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                          {category.icon}
                        </div>
                        <Tooltip title="更多操作">
                          <Button
                            type="text"
                            icon={<EllipsisOutlined />}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(kb);
                            }}
                          />
                        </Tooltip>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1D2129', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={kb.name}>
                        {kb.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        <Tag color={category.color}>{category.label}</Tag>
                        <Tag color={status.color}>
                          <Badge status={status.badge} text={status.label} />
                        </Tag>
                      </div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#5F6B7A', fontSize: 12, lineHeight: '20px', margin: '10px 0 0', minHeight: 40 }}>
                        {kb.desc}
                      </Paragraph>
                      {kb.category === 'professional' ? (
                        <div style={{ background: '#FAF8FF', border: '1px solid #EFE1FF', borderRadius: 6, padding: '8px 10px', marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <Tag color={sync.color} icon={sync.icon} style={{ margin: 0 }}>{sync.label}</Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>{kb.ragflowSyncStatus === 'synced' ? '专业能力已开启' : '待完成'}</Text>
                          </div>
                          {kb.ragflowSyncStatus === 'failed' ? (
                            <Text type="danger" style={{ fontSize: 11 }}>{kb.syncError}</Text>
                          ) : (
                            <Progress percent={kb.ragflowSyncStatus === 'synced' ? 100 : 40} size="small" showInfo={false} strokeColor="#722ed1" />
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: 12, fontSize: 12, color: '#7A8599' }}>
                          {kb.fileCount !== null ? <><DatabaseOutlined /> {kb.fileCount} 个文件</> : <><ApiOutlined /> {kb.externalKbId}</>}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0F2F5' }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>{kb.date} / {kb.owner}</Text>
                        <Switch size="small" checked={kb.active} onClick={(_, event) => event.stopPropagation()} onChange={(checked) => setKbList((prev) => prev.map((item) => item.id === kb.id ? { ...item, active: checked } : item))} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <Pagination current={page} pageSize={pageSize} total={filteredList.length} showTotal={(total) => `共 ${total} 个知识库`} onChange={setPage} />
              </div>
            </>
          ) : (
            <div style={{ ...cardStyle, padding: 60 }}>
              <Empty description="未找到匹配的知识库" />
            </div>
          )}
        </div>
      </div>

      <TypeSelectModal open={typeModalOpen} onCancel={() => setTypeModalOpen(false)} onSelect={openCreateByType} />
      <ProfessionalCreateDrawer open={professionalDrawerOpen} onClose={() => setProfessionalDrawerOpen(false)} onSubmit={handleProfessionalSubmit} />
      {simpleDrawerCategory && (
        <SimpleCreateDrawer
          open={Boolean(simpleDrawerCategory)}
          category={simpleDrawerCategory}
          onClose={() => setSimpleDrawerCategory(null)}
          onSubmit={handleSimpleSubmit}
        />
      )}
    </>
  );
};

export default KnowledgeBasePage;
