import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
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
  PauseCircleOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  LoadingOutlined,
  MoreOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type KBCategory = 'easy' | 'professional' | 'external';
type KBStatus = 'available' | 'processing' | 'error';
type RagflowSyncStatus = 'none' | 'creating' | 'synced' | 'failed';
type KBSubType = 'document' | 'structured' | 'graph';

type KBSource = '自定义' | '广场资源';

interface KnowledgeBase {
  id: string;
  name: string;
  category: KBCategory;
  subType?: KBSubType;
  typeTag: string;
  desc: string;
  owner: string;
  date: string;
  source: KBSource;
  fileCount: number | null;
  active: boolean;
  status?: KBStatus;
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
  avatar?: IconPickerValue;
  llmModelId?: string;
  topK?: number;
  scoreThreshold?: number;
}

interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  status: string;
  updatedAt: string;
}

interface ExternalApiConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  remark?: string;
}

const categoryConfig: Record<KBCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  easy: { label: '普通知识库', color: '#1677ff', bg: '#e6f4ff', icon: <FileTextOutlined /> },
  professional: { label: '专业知识库', color: '#722ed1', bg: '#f9f0ff', icon: <BlockOutlined /> },
  external: { label: '外部知识库', color: '#fa8c16', bg: '#fff7e6', icon: <ApiOutlined /> },
};

const subTypeConfig: Record<KBSubType, { label: string; color: string; desc: string }> = {
  document: { label: '文档知识库', color: '#1677ff', desc: '支持 PDF、Word、TXT 等格式批量导入，自动切分段落并向量化，依托语义检索实现即问即答。' },
  structured: { label: '结构化知识库', color: '#13c2c2', desc: '基于结构化数据库，依托语义检索实现数据查询与即问即答。' },
  graph: { label: '图知识库', color: '#eb2f96', desc: '基于图数据库，依托语义检索与图谱模型，实现数据的多维查询与即问即答。' },
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

type KBNavKey = 'data' | 'test' | 'logs' | 'config';

const kbNavItems: { key: KBNavKey; label: string; icon: React.ReactNode }[] = [
  { key: 'data', label: '数据', icon: <DatabaseOutlined /> },
  { key: 'test', label: '测试', icon: <ExperimentOutlined /> },
  { key: 'logs', label: '日志', icon: <FileTextOutlined /> },
  { key: 'config', label: '配置', icon: <SettingOutlined /> },
];

const defaultEmbeddingModel = {
  id: 'model-bge-m3',
  displayName: 'BGE-M3',
  ragflowModel: 'bge-m3@BAAI',
};

const embeddingModelOptions = [
  { label: 'BGE-M3', value: 'model-bge-m3' },
  { label: 'BGE-Large-zh', value: 'model-bge-large-zh' },
  { label: 'M3E-Base', value: 'model-m3e-base' },
  { label: 'Text2Vec-Large-Chinese', value: 'model-text2vec' },
];

const llmModelOptions = [
  { label: 'DeepSeek-V3', value: 'llm-deepseek-v3' },
  { label: 'Qwen3-Max', value: 'llm-qwen3-max' },
  { label: 'GPT-4o', value: 'llm-gpt4o' },
  { label: 'Claude 4 Sonnet', value: 'llm-claude4' },
];

const initialKBList: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: '反诈案例专业知识库',
    category: 'professional',
    typeTag: '专业知识库',
    source: '自定义',
    desc: '沉淀电信网络诈骗案件材料、资金穿透研判报告和处置规范，用于专业检索与智能体问答。',
    owner: '王大队',
    date: '2026-06-18',
    fileCount: 203,
    active: true,
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
    subType: 'document',
    typeTag: '文档知识库',
    source: '自定义',
    desc: '面向 110 接警场景的警情分类标准、处置流程和常见问答。',
    owner: '李警官',
    date: '2026-05-22',
    fileCount: 128,
    active: true,
    ragflowSyncStatus: 'none',
  },
  {
    id: 'kb-003',
    name: '法律法规外部库',
    category: 'external',
    typeTag: '外部 API 接入',
    source: '自定义',
    desc: '通过第三方法规检索服务接入现行法律法规、司法解释和执法规范。',
    owner: '周科长',
    date: '2026-05-09',
    fileCount: null,
    active: true,
    ragflowSyncStatus: 'none',
    apiEndpoint: 'https://law.example.com/api/retrieval',
    externalKbId: 'law-kb-prod',
  },
  {
    id: 'kb-004',
    name: '卷宗证据链知识库',
    category: 'professional',
    typeTag: '专业知识库',
    source: '广场资源',
    desc: '用于刑事卷宗材料解析、证据链要素抽取与检索增强。',
    owner: '陈队长',
    date: '2026-06-24',
    fileCount: 0,
    active: true,
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
    subType: 'document',
    typeTag: '文档知识库',
    source: '广场资源',
    desc: '交通事故责任认定、道路交通安全法及地方实施细则。',
    owner: '赵警官',
    date: '2026-04-16',
    fileCount: 84,
    active: true,
    ragflowSyncStatus: 'none',
  },
];

const mockFiles: KnowledgeFile[] = [
  { id: 'file-1', name: '2026年Q2电信诈骗新趋势分析.pdf', size: '8.4 MB', status: '已解析', updatedAt: '2026-06-20 16:22' },
  { id: 'file-2', name: '涉诈资金穿透研判报告.docx', size: '2.1 MB', status: '已解析', updatedAt: '2026-06-19 10:15' },
  { id: 'file-3', name: '高发诈骗话术样本.xlsx', size: '768 KB', status: '解析中', updatedAt: '2026-06-18 09:30' },
];

const getKnowledgeCode = (kb: KnowledgeBase) => kb.id.replace('kb-', 'KB-').toUpperCase();

const TypeSelectModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSelect: (category: KBCategory, subType?: KBSubType) => void;
}> = ({ open, onCancel, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<KBSubType>('document');

  const handleNext = () => {
    if (!selectedCategory) return;
    onSelect(selectedCategory, selectedCategory === 'easy' ? selectedSubType : undefined);
    setSelectedCategory(null);
    setSelectedSubType('document');
  };

  const reset = () => {
    setSelectedCategory(null);
    setSelectedSubType('document');
    onCancel();
  };

  return (
    <Modal
      title="选择知识库类型"
      open={open}
      onCancel={reset}
      width={720}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" disabled={!selectedCategory} onClick={handleNext}>下一步</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingTop: 8 }}>
        {(Object.keys(categoryConfig) as KBCategory[]).map((category) => {
          const item = categoryConfig[category];
          const desc = {
            easy: '支持文档、结构化、图三种类型，快速上传文档进行轻量知识沉淀和常规问答。',
            professional: '提供高级解析、切片管理、检索测试等能力，适合复杂业务资料治理。',
            external: '连接已有第三方知识库 API，平台统一调用检索能力。',
          }[category];
          const isSelected = selectedCategory === category;
          return (
            <Card
              key={category}
              hoverable
              onClick={() => setSelectedCategory(category)}
              style={{
                borderColor: isSelected ? '#1677ff' : '#f0f0f0',
                boxShadow: isSelected ? '0 0 0 2px rgba(22,119,255,0.2)' : 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              styles={{ body: { minHeight: 174, padding: 18 } }}
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
            </Card>
          );
        })}
      </div>
      {selectedCategory === 'easy' && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', marginBottom: 12 }}>选择子类型</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(Object.keys(subTypeConfig) as KBSubType[]).map((st) => {
              const config = subTypeConfig[st];
              const isActive = selectedSubType === st;
              return (
                <div
                  key={st}
                  onClick={() => setSelectedSubType(st)}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: `1px solid ${isActive ? '#1677ff' : '#e8e8e8'}`,
                    background: isActive ? '#e6f4ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#1677ff' : '#1D2129', marginBottom: 6 }}>{config.label}</div>
                  <div style={{ fontSize: 11, lineHeight: '18px', color: '#7A8599' }}>{config.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

const chunkMethodOptions = [
  { label: 'General 通用文档解析', value: 'General' },
  { label: 'Q&A 问答对解析', value: 'Q&A' },
  { label: 'Resume 简历解析', value: 'Resume' },
  { label: 'Manual 手动切片', value: 'Manual' },
  { label: 'Table 表格解析', value: 'Table' },
  { label: 'Paper 论文解析', value: 'Paper' },
  { label: 'Book 书籍解析', value: 'Book' },
  { label: 'Laws 法律文书解析', value: 'Laws' },
  { label: 'Presentation 演示文稿解析', value: 'Presentation' },
  { label: 'One 单段落', value: 'One' },
  { label: 'Tag 标签解析', value: 'Tag' },
];

const LabelWithTip: React.FC<{ label: string; tip: string }> = ({ label, tip }) => (
  <Space size={4}>
    <span>{label}</span>
    <Tooltip title={tip}>
      <QuestionCircleOutlined style={{ color: '#8C8C8C', cursor: 'help', fontSize: 14 }} />
    </Tooltip>
  </Space>
);

const ExternalApiFormDrawer: React.FC<{
  open: boolean;
  editingId: string | null;
  initialData: ExternalApiConfig | null;
  onClose: () => void;
  onSave: (config: ExternalApiConfig) => void;
}> = ({ open, editingId, initialData, onClose, onSave }) => {
  const [form] = Form.useForm();
  const isEdit = editingId !== null;

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [open, isEdit, initialData, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const config: ExternalApiConfig = {
      id: isEdit ? editingId! : `ext-api-${Date.now()}`,
      name: values.name,
      endpoint: values.endpoint,
      apiKey: values.apiKey,
      remark: values.remark,
    };
    onSave(config);
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEdit ? '编辑外部知识库 API' : '添加外部知识库 API'}
      width={500}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>确定</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
        <Form.Item name="name" label="外部知识库名称" rules={[{ required: true, message: '请输入外部知识库名称' }]}>
          <Input placeholder="例如：反诈数据检索 API" maxLength={50} />
        </Form.Item>
        <Form.Item name="endpoint" label="API Endpoint" rules={[{ required: true, message: '请输入 API Endpoint' }]}>
          <Input placeholder="https://api.example.com/v1/retrieval" />
        </Form.Item>
        <Form.Item name="apiKey" label="API Key" rules={[{ required: true, message: '请输入 API Key' }]}>
          <Input.Password placeholder="输入 API Key" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="备注信息（可选）" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

const ExternalApiManageDrawer: React.FC<{
  open: boolean;
  externalApiList: ExternalApiConfig[];
  kbList: KnowledgeBase[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (api: ExternalApiConfig) => void;
  onDelete: (apiId: string) => void;
}> = ({ open, externalApiList, kbList, onClose, onAdd, onEdit, onDelete }) => {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!open) setKeyword('');
  }, [open]);

  const filteredList = useMemo(() => {
    if (!keyword) return externalApiList;
    const word = keyword.toLowerCase();
    return externalApiList.filter((api) =>
      api.name.toLowerCase().includes(word) || (api.remark || '').toLowerCase().includes(word)
    );
  }, [externalApiList, keyword]);

  const getRefCount = (api: ExternalApiConfig) => {
    return kbList.filter((kb) => kb.category === 'external' && kb.apiEndpoint === api.endpoint).length;
  };

  const columns: ColumnsType<ExternalApiConfig> = [
    { title: '名称', dataIndex: 'name', width: 180 },
    { title: 'Endpoint', dataIndex: 'endpoint', ellipsis: true },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: (v) => v || <Text type="secondary">-</Text> },
    { title: '操作', key: 'action', width: 140, render: (_, record) => {
      const refCount = getRefCount(record);
      return (
        <Space size={2}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>编辑</Button>
          <Popconfirm
            title={refCount > 0 ? `该 API 正被 ${refCount} 个知识库使用，删除后可能影响知识库检索功能，确定删除？` : '确定删除该 API 配置？'}
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      );
    }},
  ];

  return (
    <Drawer
      title="外部 API 管理"
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FilterBar
          placeholder="搜索名称或备注"
          onSubmit={() => {}}
          onReset={() => setKeyword('')}
          onCreate={onAdd}
          createText="添加外部 API"
          style={{ borderTop: 'none', paddingLeft: 0, paddingRight: 0 }}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
          <Table
            columns={columns}
            dataSource={filteredList}
            rowKey="id"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        </div>
      </div>
    </Drawer>
  );
};

const ProfessionalCreateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>, avatar: IconPickerValue) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState<IconPickerValue>({ mode: 'text', text: '', textBgColor: '#722ed1', textColor: '#fff' });

  useEffect(() => {
    if (open) {
      setAvatar({ mode: 'text', text: '', textBgColor: '#722ed1', textColor: '#fff' });
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values, avatar);
    form.resetFields();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name && avatar.mode === 'text') {
      setAvatar({ ...avatar, text: name.charAt(0) });
    }
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
          <Button type="primary" onClick={handleSubmit}>创建</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ embeddingModelId: 'model-bge-m3', chunkMethod: 'General' }}>
        <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input maxLength={50} onChange={handleNameChange} />
        </Form.Item>
        <Form.Item name="desc" label="描述">
          <TextArea rows={3} maxLength={200} showCount />
        </Form.Item>
        <Form.Item label="知识库头像">
          <IconPicker value={avatar} onChange={setAvatar} size={64} defaultName="" />
        </Form.Item>
        <Form.Item name="embeddingModelId" label={<LabelWithTip label="向量化模型" tip="选择用于文档向量化的模型，不同模型在检索精度和性能上有所差异" />} rules={[{ required: true, message: '请选择向量化模型' }]}>
          <Select options={embeddingModelOptions} />
        </Form.Item>
        <Form.Item name="chunkMethod" label={<LabelWithTip label="解析方法" tip="选择文档内容的解析方式，不同方式适用于不同格式和类型的文档" />}>
          <Select options={chunkMethodOptions} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

const SimpleCreateDrawer: React.FC<{
  open: boolean;
  category: Exclude<KBCategory, 'professional'>;
  defaultSubType?: KBSubType;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>, avatar: IconPickerValue) => void;
  externalApiList: ExternalApiConfig[];
  onOpenApiCreate: () => void;
}> = ({ open, category, defaultSubType, onClose, onSubmit, externalApiList, onOpenApiCreate }) => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState<IconPickerValue>({ mode: 'text', text: '', textBgColor: '#1677ff', textColor: '#fff' });
  const isExternal = category === 'external';

  const externalApiOptions = useMemo(() => {
    return externalApiList.map((api) => ({ label: api.name, value: api.id }));
  }, [externalApiList]);

  useEffect(() => {
    if (open) {
      setAvatar({ mode: 'text', text: '', textBgColor: '#1677ff', textColor: '#fff' });
      form.resetFields();
    }
  }, [open, category, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values, avatar);
    form.resetFields();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name && avatar.mode === 'text') {
      setAvatar({ ...avatar, text: name.charAt(0) });
    }
  };

  return (
    <Drawer
      title={isExternal ? '连接外部知识库' : '创建普通知识库'}
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>创建</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {!isExternal && defaultSubType && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: '#f6f8fa', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>子类型</Text>
            <Tag color={subTypeConfig[defaultSubType].color}>{subTypeConfig[defaultSubType].label}</Tag>
          </div>
        )}
        <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input maxLength={50} onChange={handleNameChange} />
        </Form.Item>
        <Form.Item name="desc" label="描述">
          <TextArea rows={3} maxLength={200} showCount />
        </Form.Item>
        <Form.Item label="知识库头像">
          <IconPicker value={avatar} onChange={setAvatar} size={64} defaultName="" />
        </Form.Item>
        {!isExternal && (
          <>
            <Form.Item name="embeddingModelId" label={<LabelWithTip label="向量化模型" tip="选择用于知识库内容向量化的模型，不同模型影响检索精度和性能" />} rules={[{ required: true, message: '请选择向量化模型' }]} initialValue="model-bge-m3">
              <Select options={embeddingModelOptions} />
            </Form.Item>
            {defaultSubType === 'graph' && (
              <Form.Item name="llmModelId" label={<LabelWithTip label="LLM 大模型" tip="图结构知识库需配置大语言模型进行图谱推理和语义理解" />} rules={[{ required: true, message: '请选择 LLM 大模型' }]} initialValue="llm-deepseek-v3">
                <Select options={llmModelOptions} />
              </Form.Item>
            )}
          </>
        )}
        {isExternal ? (
          <>
            <Form.Item name="apiEndpoint" label={<LabelWithTip label="外部知识库 API" tip="选择已创建的外部知识库 API 连接配置，也可新建 API" />} rules={[{ required: true, message: '请选择外部知识库 API' }]}>
              <Select
                placeholder="选择已创建的 API"
                style={{ width: '100%' }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button type="link" icon={<PlusOutlined />} onClick={onOpenApiCreate} style={{ padding: '0 12px 8px', height: 32 }}>
                      新建外部知识库 API
                    </Button>
                  </>
                )}
              >
                {externalApiOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="externalKbId" label={<LabelWithTip label="外部知识库 ID" tip="第三方知识库系统中对应的唯一标识，用于关联检索" />} rules={[{ required: true, message: '请输入外部知识库 ID' }]}>
              <Input placeholder="输入外部知识库的唯一标识" />
            </Form.Item>
            <div style={{ marginBottom: 24 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>召回设置</Text>
              <Space style={{ width: '100%' }} size={16}>
                <Form.Item name="topK" label={<LabelWithTip label="Top K" tip="检索时返回的最相关结果数量" />} rules={[{ required: true, message: '请输入' }]} initialValue={3} style={{ marginBottom: 0 }}>
                  <InputNumber min={1} max={100} style={{ width: 140 }} />
                </Form.Item>
                <Form.Item name="scoreThreshold" label={<LabelWithTip label="Score 阈值" tip="低于此相似度分数的结果将被过滤" />} rules={[{ required: true, message: '请输入' }]} initialValue={0.5} style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={1} step={0.01} precision={2} style={{ width: 140 }} />
                </Form.Item>
              </Space>
            </div>
          </>
        ) : null}
      </Form>
    </Drawer>
  );
};

const EditDrawer: React.FC<{
  kb: KnowledgeBase | null;
  onClose: () => void;
  onSave: (kb: KnowledgeBase) => void;
}> = ({ kb, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState<IconPickerValue>({ mode: 'text', text: '', textBgColor: '#1677ff', textColor: '#fff' });

  useEffect(() => {
    if (kb) {
      form.setFieldsValue({
        name: kb.name,
        desc: kb.desc,
      });
      setAvatar(kb.avatar || { mode: 'text', text: kb.name.charAt(0), textBgColor: '#1677ff', textColor: '#fff' });
    }
  }, [kb, form]);

  const handleSubmit = async () => {
    if (!kb) return;
    const values = await form.validateFields();
    onSave({ ...kb, ...values, avatar });
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title="编辑知识库"
      width={560}
      open={!!kb}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>保存</Button>
        </div>
      }
    >
      {kb && (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="desc" label="描述">
            <TextArea rows={3} maxLength={200} showCount />
          </Form.Item>
          <Form.Item label="知识库头像">
            <IconPicker value={avatar} onChange={setAvatar} size={64} defaultName="" />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};

const DataPanel: React.FC<{ kb: KnowledgeBase }> = ({ kb }) => {
  const isExternal = kb.category === 'external';
  if (isExternal) {
    return (
      <div style={{ padding: 24 }}>
        <Card title="API 连接状态" size="small" style={{ borderRadius: 8, maxWidth: 600 }}>
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label="API Endpoint">{kb.apiEndpoint || '-'}</Descriptions.Item>
            <Descriptions.Item label="外部知识库 ID">{kb.externalKbId || '-'}</Descriptions.Item>
            <Descriptions.Item label="连接状态">
              <Tag color="success" icon={<CheckCircleOutlined />}>已连接</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  }

  const columns: ColumnsType<KnowledgeFile> = [
    { title: '文件名', dataIndex: 'name', render: (name: string) => <a>{name}</a> },
    { title: '大小', dataIndex: 'size', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120, render: (s: string) => <Tag color={s === '已解析' ? 'success' : 'processing'}>{s}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14 }}>知识库数据</Text>
        <Button icon={<UploadOutlined />} type="primary" size="small">上传文档</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={mockFiles} pagination={false} style={{ background: '#fff', borderRadius: 8 }} />
    </div>
  );
};

const TestPanel: React.FC<{ kb: KnowledgeBase }> = ({ kb }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: number; content: string; score: number; source: string }[]>([]);
  const [tested, setTested] = useState(false);

  const handleTest = () => {
    if (!query.trim()) return;
    setTested(true);
    setResults([
      { id: 1, content: '根据《刑法》第二百六十六条，诈骗公私财物，数额较大的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金……', score: 0.94, source: kb.name },
      { id: 2, content: '电信网络诈骗犯罪中，涉案金额超过50万元的属于"数额特别巨大"情形，依法应从重处罚。', score: 0.87, source: kb.name },
      { id: 3, content: '公安机关在办理电信诈骗案件时，应重点收集资金流转记录、通讯记录和受害人陈述等证据材料。', score: 0.81, source: kb.name },
    ]);
  };

  return (
    <div style={{ padding: 24 }}>
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>检索测试</Text>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Input.Search
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="输入检索查询内容，测试知识库检索效果"
          enterButton="检索"
          onSearch={handleTest}
          style={{ maxWidth: 600 }}
        />
      </div>
      {tested && (
        <div>
          {results.length > 0 ? (
            results.map(r => (
              <Card key={r.id} size="small" style={{ marginBottom: 8, borderRadius: 8, maxWidth: 800 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>
                  来源: {r.source} | 相似度: {(r.score * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 13, lineHeight: '22px', color: '#333' }}>{r.content}</div>
              </Card>
            ))
          ) : (
            <Empty description="未检索到相关内容" />
          )}
        </div>
      )}
    </div>
  );
};

const LogsPanel: React.FC<{ kb: KnowledgeBase }> = () => (
  <div style={{ padding: 24 }}>
    <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>操作日志</Text>
    <Table
      rowKey="id"
      dataSource={[
        { id: 1, action: '知识库创建', operator: '王大队', time: '2026-07-18 09:30:00', detail: '创建专业知识库' },
        { id: 2, action: '文档上传', operator: '王大队', time: '2026-07-18 14:22:00', detail: '上传 3 个文档' },
        { id: 3, action: '配置更新', operator: '李警官', time: '2026-07-19 10:15:00', detail: '修改向量化模型为 BGE-Large-zh' },
        { id: 4, action: '检索查询', operator: 'system', time: '2026-07-19 16:45:00', detail: 'API 调用 35 次' },
      ]}
      columns={[
        { title: '操作', dataIndex: 'action', width: 120 },
        { title: '操作人', dataIndex: 'operator', width: 120 },
        { title: '时间', dataIndex: 'time', width: 200 },
        { title: '详情', dataIndex: 'detail' },
      ]}
      pagination={false}
      size="small"
      style={{ maxWidth: 800 }}
    />
  </div>
);

const ConfigPanel: React.FC<{ kb: KnowledgeBase }> = ({ kb }) => {
  const isExternal = kb.category === 'external';
  const cat = categoryConfig[kb.category];

  if (isExternal) {
    return (
      <div style={{ padding: 24 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>外部知识库配置</Text>
        <Card size="small" style={{ borderRadius: 8, maxWidth: 600 }}>
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label="API Endpoint">{kb.apiEndpoint || '-'}</Descriptions.Item>
            <Descriptions.Item label="外部知识库 ID">{kb.externalKbId || '-'}</Descriptions.Item>
            <Descriptions.Item label="Top K">{kb.topK ?? 3}</Descriptions.Item>
            <Descriptions.Item label="Score 阈值">{kb.scoreThreshold ?? 0.5}</Descriptions.Item>
            <Descriptions.Item label="启用状态">
              <Text style={{ color: kb.active ? '#52c41a' : '#999' }}>{kb.active ? '已启用' : '已停用'}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>知识库配置</Text>
      <Card size="small" style={{ borderRadius: 8, maxWidth: 600 }}>
        <Descriptions column={1} size="small" colon={false}>
          <Descriptions.Item label="类型">{cat.label}</Descriptions.Item>
          {kb.subType && <Descriptions.Item label="子类型">{subTypeConfig[kb.subType].label}</Descriptions.Item>}
          <Descriptions.Item label="向量化模型">
            {embeddingModelOptions.find(m => m.value === kb.embeddingModelId)?.label || defaultEmbeddingModel.displayName}
          </Descriptions.Item>
          {kb.llmModelId && (
            <Descriptions.Item label="LLM 大模型">
              {llmModelOptions.find(m => m.value === kb.llmModelId)?.label || kb.llmModelId}
            </Descriptions.Item>
          )}
          {kb.chunkMethod && <Descriptions.Item label="解析方法">{kb.chunkMethod}</Descriptions.Item>}
          <Descriptions.Item label="启用状态">
            <Text style={{ color: kb.active ? '#52c41a' : '#999' }}>{kb.active ? '已启用' : '已停用'}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

const KnowledgeBaseDetail: React.FC<{
  kb: KnowledgeBase;
  onBack: () => void;
  onEdit: (kb: KnowledgeBase) => void;
}> = ({ kb, onBack, onEdit }) => {
  const [activeNav, setActiveNav] = useState<KBNavKey>('data');
  const cat = categoryConfig[kb.category];
  const DS = { navWidth: 200, blue: '#1677ff', blueLight: '#e6f4ff', white: '#ffffff', bg: '#f5f6f8', text: 'rgba(0,0,0,0.88)', textSec: 'rgba(0,0,0,0.52)', divider: '#f0f1f3', radiusXs: 6 };

  const st = kb.active ? { color: '#52c41a', bg: '#f6ffed', label: '已启用' } : { color: '#999', bg: 'rgba(0,0,0,0.04)', label: '已停用' };

  const renderPanel = () => {
    switch (activeNav) {
      case 'data': return <DataPanel kb={kb} />;
      case 'test': return <TestPanel kb={kb} />;
      case 'logs': return <LogsPanel kb={kb} />;
      case 'config': return <ConfigPanel kb={kb} />;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: DS.bg }}>
      {/* Header Bar */}
      <div style={{ height: 52, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: DS.white, borderBottom: `1px solid ${DS.divider}`, flexShrink: 0 }}>
        <Space size={12}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ color: DS.textSec, fontWeight: 500, fontSize: 13 }}>返回</Button>
          <Divider type="vertical" style={{ margin: 0, borderColor: DS.divider }} />
          <div style={{ width: 30, height: 30, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontSize: 15 }}>{cat.icon}</div>
          <span style={{ fontSize: 14, fontWeight: 650, color: DS.text }}>{kb.name}</span>
          <Tag style={{ border: 'none', borderRadius: 4, background: cat.bg, color: cat.color, fontWeight: 500, fontSize: 12, padding: '0 10px', lineHeight: '22px' }}>{cat.label}</Tag>
          {kb.subType && (
            <Tag style={{ border: 'none', borderRadius: 4, background: subTypeConfig[kb.subType].color + '18', color: subTypeConfig[kb.subType].color, fontWeight: 500, fontSize: 12, padding: '0 10px', lineHeight: '22px' }}>{subTypeConfig[kb.subType].label}</Tag>
          )}
          <Tag style={{ border: 'none', borderRadius: 4, background: st.bg, color: st.color, fontWeight: 500, fontSize: 12, padding: '0 10px', lineHeight: '22px' }}>{st.label}</Tag>
          <Tag style={{ border: 'none', borderRadius: 4, background: kb.source === '自定义' ? '#f2f3f5' : '#fff7e6', color: kb.source === '自定义' ? '#5f6b7a' : '#fa8c16', fontWeight: 500, fontSize: 12, padding: '0 10px', lineHeight: '22px' }}>{kb.source}</Tag>
        </Space>
        {kb.source !== '广场资源' && <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(kb)} style={{ color: DS.textSec, fontSize: 12 }}>编辑信息</Button>}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: DS.navWidth, minWidth: DS.navWidth, borderRight: `1px solid ${DS.divider}`, display: 'flex', flexDirection: 'column', padding: '16px 10px', background: DS.white }}>
          <div style={{ padding: '0 6px 16px', borderBottom: `1px solid ${DS.divider}`, marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: '18px' }}>{kb.desc}</Text>
          </div>
          {kbNavItems.map(item => {
            const active = activeNav === item.key;
            return (
              <div key={item.key} onClick={() => setActiveNav(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 2px', padding: '9px 12px', borderRadius: DS.radiusXs,
                  cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: active ? DS.blueLight : 'transparent', color: active ? DS.blue : DS.textSec, fontWeight: active ? 600 : 400, fontSize: 13,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = DS.bg; e.currentTarget.style.color = DS.text; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = DS.textSec; } }}
              >
                <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto' }}>{renderPanel()}</div>
        </div>
      </div>
    </div>
  );
};

const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [kbList, setKbList] = useState<KnowledgeBase[]>(initialKBList);
  const [activeCategory, setActiveCategory] = useState<'all' | KBCategory>('all');
  const [activeStatKey, setActiveStatKey] = useState<'all' | KBCategory | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [sourceFilter, setSourceFilter] = useState<KBSource | undefined>();
  const [page, setPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(12);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false);
  const [simpleDrawerCategory, setSimpleDrawerCategory] = useState<Exclude<KBCategory, 'professional'> | null>(null);
  const [defaultSubType, setDefaultSubType] = useState<KBSubType | undefined>();
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null);
  const [activeKB, setActiveKB] = useState<KnowledgeBase | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({ keyword: '', category: undefined, status: undefined, source: undefined });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [externalApiList, setExternalApiList] = useState<ExternalApiConfig[]>([
    { id: 'ext-api-mock-1', name: '反诈数据检索 API', endpoint: 'https://antifraud.police.cn/v1/retrieval', apiKey: 'sk-mock-********' },
    { id: 'ext-api-mock-2', name: '户籍信息知识库 API', endpoint: 'https://household.police.cn/api/kb/query', apiKey: 'sk-mock-********' },
  ]);
  const [externalApiManageOpen, setExternalApiManageOpen] = useState(false);
  const [externalApiFormOpen, setExternalApiFormOpen] = useState(false);
  const [editingApiId, setEditingApiId] = useState<string | null>(null);

  const pageSize = 8;
  const categoryKeys: ('all' | KBCategory)[] = ['all', 'easy', 'professional', 'external'];

  const statCards = useMemo(() => [
    { key: 'all', title: '知识库总数', value: kbList.length, color: '#1677ff', icon: <DatabaseOutlined />, bg: '#e6f4ff' },
    { key: 'easy', title: '普通知识库', value: kbList.filter(d => d.category === 'easy').length, color: '#1677ff', icon: <FileTextOutlined />, bg: '#e6f4ff' },
    { key: 'professional', title: '专业知识库', value: kbList.filter(d => d.category === 'professional').length, color: '#1677ff', icon: <BlockOutlined />, bg: '#e6f4ff' },
    { key: 'external', title: '外部知识库', value: kbList.filter(d => d.category === 'external').length, color: '#1677ff', icon: <ApiOutlined />, bg: '#e6f4ff' },
  ], [kbList]);

  const activeStatIndex = activeStatKey ? categoryKeys.indexOf(activeStatKey) : -1;

  const filteredList = useMemo(() => {
    return kbList.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (keyword && !item.name.includes(keyword) && !item.desc.includes(keyword)) return false;
      if (statusFilter !== undefined && item.active !== statusFilter) return false;
      if (sourceFilter && item.source !== sourceFilter) return false;
      return true;
    });
  }, [activeCategory, kbList, keyword, statusFilter, sourceFilter]);

  const pagedList = viewMode === 'card'
    ? filteredList.slice((page - 1) * cardPageSize, page * cardPageSize)
    : filteredList.slice((page - 1) * pageSize, page * pageSize);

  const openCreateByType = (category: KBCategory, subType?: KBSubType) => {
    setTypeModalOpen(false);
    if (category === 'professional') setProfessionalDrawerOpen(true);
    else {
      setSimpleDrawerCategory(category);
      setDefaultSubType(subType);
    }
  };

  const handleProfessionalSubmit = (values: Record<string, unknown>, avatar: IconPickerValue) => {
    const timestamp = Date.now();
    const syncSucceeded = String(values.name).includes('失败') ? false : true;
    const newKB: KnowledgeBase = {
      id: `kb-${timestamp}`,
      name: String(values.name),
      category: 'professional',
      typeTag: '专业知识库',
      source: '自定义',
      desc: String(values.desc || '暂无描述'),
      owner: '当前用户',
      date: new Date().toISOString().slice(0, 10),
      fileCount: 0,
      active: true,
      ragflowSyncStatus: syncSucceeded ? 'synced' : 'failed',
      ragflowDatasetId: syncSucceeded ? `rf_ds_${timestamp}` : undefined,
      ragflowTenantId: 'tenant-police-demo',
      ragflowUserId: 'rf_user_current',
      ragflowPageUrl: syncSucceeded ? `/ragflow/proxy/datasets/rf_ds_${timestamp}` : undefined,
      syncError: syncSucceeded ? undefined : '模拟：专业知识库创建失败。',
      embeddingModelId: String(values.embeddingModelId || defaultEmbeddingModel.id),
      chunkMethod: String(values.chunkMethod || 'General'),
      avatar,
    };
    setKbList((prev) => [newKB, ...prev]);
    setProfessionalDrawerOpen(false);
    message.success(syncSucceeded ? '专业知识库已创建' : '专业知识库创建失败，请稍后重试');
  };

  const handleSimpleSubmit = (values: Record<string, unknown>, avatar: IconPickerValue) => {
    if (!simpleDrawerCategory) return;
    const isExternal = simpleDrawerCategory === 'external';
    const newKB: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: String(values.name),
      category: simpleDrawerCategory,
      subType: isExternal ? undefined : (defaultSubType || 'document'),
      typeTag: isExternal ? '外部 API 接入' : (subTypeConfig[defaultSubType || 'document']?.label || '文档知识库'),
      source: '自定义',
      desc: String(values.desc || '暂无描述'),
      owner: '当前用户',
      date: new Date().toISOString().slice(0, 10),
      fileCount: isExternal ? null : 0,
      active: true,
      ragflowSyncStatus: 'none',
      apiEndpoint: (() => {
        const selectedId = String(values.apiEndpoint || '');
        const found = externalApiList.find((a) => a.id === selectedId);
        return found ? found.endpoint : selectedId;
      })(),
      externalKbId: String(values.externalKbId || ''),
      topK: isExternal ? Number(values.topK || 3) : undefined,
      scoreThreshold: isExternal ? Number(values.scoreThreshold || 0.5) : undefined,
      avatar,
      embeddingModelId: isExternal ? undefined : (String(values.embeddingModelId || 'model-bge-m3')),
      llmModelId: isExternal ? undefined : (String(values.llmModelId || '')),
    };
    setKbList((prev) => [newKB, ...prev]);
    setSimpleDrawerCategory(null);
    message.success(simpleDrawerCategory === 'external' ? '外部知识库已连接' : '普通知识库已创建');
  };

  const handleRetrySync = (id: string) => {
    setKbList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
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

  const handleToggleActive = (kb: KnowledgeBase) => {
    const willEnable = !kb.active;
    Modal.confirm({
      title: willEnable ? '启用知识库' : '停用知识库',
      content: willEnable
        ? `确定启用「${kb.name}」吗？启用后，该知识库将恢复参与检索和问答服务。`
        : `确定停用「${kb.name}」吗？停用后，该知识库将不再参与检索和问答服务，智能体将无法访问其内容。`,
      okText: willEnable ? '启用' : '停用',
      cancelText: '取消',
      onOk: () => {
        setKbList((prev) => prev.map((item) => (item.id === kb.id ? { ...item, active: !item.active } : item)));
        message.success(willEnable ? '知识库已启用' : '知识库已停用');
      },
    });
  };

  const handleSaveEdit = (kb: KnowledgeBase) => {
    const updated = { ...kb };
    if (kb.subType && subTypeConfig[kb.subType]) {
      updated.typeTag = subTypeConfig[kb.subType].label;
    }
    setKbList((prev) => prev.map((item) => (item.id === kb.id ? updated : item)));
    message.success('知识库已更新');
  };

  // 外部 API 管理 CRUD
  const editingApiData = useMemo(() => {
    if (!editingApiId) return null;
    return externalApiList.find((a) => a.id === editingApiId) || null;
  }, [editingApiId, externalApiList]);

  const handleSaveApi = (config: ExternalApiConfig) => {
    if (editingApiId) {
      setExternalApiList((prev) => prev.map((a) => (a.id === editingApiId ? config : a)));
      message.success('外部 API 已更新');
    } else {
      setExternalApiList((prev) => [...prev, config]);
      message.success('外部 API 已创建');
    }
  };

  const handleEditApi = (api: ExternalApiConfig) => {
    setEditingApiId(api.id);
    setExternalApiFormOpen(true);
  };

  const handleDeleteApi = (id: string) => {
    setExternalApiList((prev) => prev.filter((a) => a.id !== id));
    message.success('外部 API 已删除');
  };

  const handleOpenAddApi = () => {
    setEditingApiId(null);
    setExternalApiFormOpen(true);
  };

  const handleReset = () => {
    setKeyword('');
    setStatusFilter(undefined);
    setSourceFilter(undefined);
    setActiveCategory('all');
    setActiveStatKey(null);
    setPage(1);
    setFilterValues({ keyword: '', category: undefined, status: undefined, source: undefined });
  };

  if (activeKB) {
    return <KnowledgeBaseDetail kb={activeKB} onBack={() => setActiveKB(null)} onEdit={setEditingKB} />;
  }

  return (
    <>
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="知识库"
          hint="管理平台知识库，支持普通知识库、专业知识库和外部知识库，为智能体提供领域知识检索与增强生成能力"
        />

        <Row gutter={16} style={{ padding: '0 0 12px' }}>
          {statCards.map((item, idx) => {
            const isActive = activeStatIndex === idx;
            const handleClick = () => {
              setActiveCategory(item.key as 'all' | KBCategory);
              setActiveStatKey(item.key as 'all' | KBCategory);
              setFilterValues((prev) => ({
                ...prev,
                category: item.key === 'all' ? undefined : item.key,
              }));
              setPage(1);
            };
            return (
              <Col span={24 / statCards.length} key={item.key}>
                <Card
                  className="resource-stat-card"
                  size="small"
                  onClick={handleClick}
                  style={{
                    borderRadius: 10,
                    borderColor: isActive ? item.color : '#f0f0f0',
                    cursor: 'pointer',
                    background: isActive ? item.bg : '#fff',
                    boxShadow: isActive ? `0 2px 8px ${item.color}18` : 'none',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, fontSize: 20,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                      <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: '32px' }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filters={[
              { type: 'search', key: 'keyword', placeholder: '搜索知识库名称或描述', width: 240 },
              { type: 'select', key: 'source', placeholder: '来源', width: 120, options: [
                { label: '自定义', value: '自定义' },
                { label: '广场资源', value: '广场资源' },
              ]},
              { type: 'select', key: 'category', placeholder: '知识库类型', width: 140, options: [
                { label: '普通知识库', value: 'easy' },
                { label: '专业知识库', value: 'professional' },
                { label: '外部知识库', value: 'external' },
              ]},
              { type: 'select', key: 'status', placeholder: '状态筛选', width: 120, options: [
                { label: '启用', value: 'true' },
                { label: '停用', value: 'false' },
              ]},
            ]}
            filterValues={filterValues}
            onFilterChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
              if (key === 'keyword') { setKeyword(value); setPage(1); }
              if (key === 'source') {
                setSourceFilter((value || undefined) as KBSource | undefined);
                setPage(1);
              }
              if (key === 'category') {
                setActiveCategory((value || 'all') as 'all' | KBCategory);
                setActiveStatKey(null);
                setPage(1);
              }
              if (key === 'status') {
                setStatusFilter(value === 'true' ? true : value === 'false' ? false : undefined);
                setPage(1);
                setActiveStatKey(null);
              }
            }}
            onSearch={() => setPage(1)}
            onReset={handleReset}
            onCreate={() => setTypeModalOpen(true)}
            createText="创建知识库"
            extra={
              <Space size={8}>
                <Button icon={<SettingOutlined />} onClick={() => setExternalApiManageOpen(true)}>外部 API 管理</Button>
                <Button icon={<ShoppingOutlined />} onClick={() => navigate('/dev/resource-square?tab=knowledge')}>
                  从广场获取
                </Button>
              </Space>
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px', display: 'flex', flexDirection: 'column' }}>
            {pagedList.length > 0 ? (
              viewMode === 'card' ? (
                <>
                  <div
                    className="resource-card-grid"
                    style={{
                      paddingTop: 16,
                    }}
                  >
                    {pagedList.map((kb) => {
                      const cat = categoryConfig[kb.category];
                      return (
                        <div
                          key={kb.id}
                          className="resource-card"
                          style={{
                            background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
                            padding: '20px 20px 16px', cursor: 'pointer',
                            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                            display: 'flex', flexDirection: 'column', gap: 12,
                            position: 'relative', overflow: 'hidden',
                          }}
                          onClick={() => setEditingKB(kb)}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = '#1677ff';
                            el.style.boxShadow = '0 6px 20px rgba(22,119,255,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = '#f0f0f0';
                            el.style.boxShadow = 'none';
                          }}
                        >
                          {/* 顶部强调色条 */}
                          <div className="resource-card-accent" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />

                          {/* 头部：头像 + 名称 + 标签 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                              {/* 头像 */}
                              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                background: kb.avatar?.mode === 'image'
                                  ? `url(${kb.avatar.imageSrc}) center/cover no-repeat`
                                  : '#e6f4ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: kb.avatar?.mode === 'image' ? (kb.avatar?.textColor || '#fff') : '#1677ff', fontWeight: 700, fontSize: 16,
                                overflow: 'hidden',
                              }}>
                                {kb.name.charAt(0)}
                              </div>
                              {/* 名称 + 标签 */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {kb.name}
                                </div>
                                <Space size={4}>
                                  <Tag className="resource-tag-primary" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{cat.label}</Tag>
                                  {kb.subType && (
                                    <Tag className="resource-tag-neutral" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{subTypeConfig[kb.subType].label}</Tag>
                                  )}
                                </Space>
                              </div>
                            </div>
                            <Tag color={kb.active ? 'success' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
                              {kb.active ? '已启用' : '已停用'}
                            </Tag>
                          </div>

                          {/* 描述文本（最多两行固定高度截断） */}
                          <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px', height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {kb.desc}
                          </Text>

                          {/* 底部：来源/创建人/日期 + 操作 */}
                          <div className="resource-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>{kb.source} · {kb.owner} · {kb.date}</Text>
                            <Dropdown
                              menu={{
                                items: [
                                  ...(kb.source !== '广场资源' ? [{ key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); setEditingKB(kb); } }] : []),
                                  { key: 'toggle', icon: kb.active ? <PauseCircleOutlined /> : <CheckCircleOutlined />, label: kb.active ? '停用' : '启用', onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); handleToggleActive(kb); } },
                                  { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: ({ domEvent }: any) => { domEvent.stopPropagation(); handleDelete(kb); } },
                                ],
                              }}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                style={{ borderRadius: 6, fontSize: 12 }}
                                onClick={(event) => event.stopPropagation()}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="resource-page-pagination">
                    <Pagination
                      current={page}
                      pageSize={cardPageSize}
                      total={filteredList.length}
                      showSizeChanger
                      showTotal={(total) => `共 ${total} 个知识库`}
                      pageSizeOptions={['8', '12', '16', '24']}
                      onChange={(p, s) => { setPage(p); setCardPageSize(s); }}
                    />
                  </div>
                </>
              ) : (
                <Table<KnowledgeBase>
                  rowKey="id"
                  dataSource={pagedList}
                  style={{ marginTop: 16 }}
                  pagination={{
                    current: page,
                    pageSize,
                    total: filteredList.length,
                    showTotal: (total) => `共 ${total} 个知识库`,
                    showSizeChanger: true,
                    onChange: setPage,
                  }}
                  onRow={(record) => ({
                    onClick: () => setActiveKB(record),
                    style: { cursor: 'pointer' },
                  })}
                  columns={[
                    {
                      title: '名称',
                      dataIndex: 'name',
                      width: 240,
                      render: (name: string, record) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: categoryConfig[record.category].bg,
                              color: categoryConfig[record.category].color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 16,
                              flexShrink: 0,
                            }}
                          >
                            {categoryConfig[record.category].icon}
                          </div>
                          <span style={{ fontWeight: 500 }}>{name}</span>
                        </div>
                      ),
                    },
                    {
                      title: '类型',
                      dataIndex: 'category',
                      width: 120,
                      render: (cat: KBCategory) => (
                        <Tag color={categoryConfig[cat].color}>{categoryConfig[cat].label}</Tag>
                      ),
                    },
                    {
                      title: '子类型',
                      dataIndex: 'subType',
                      width: 120,
                      render: (sub: KBSubType | undefined) =>
                        sub ? (
                          <Tag color={subTypeConfig[sub].color}>{subTypeConfig[sub].label}</Tag>
                        ) : (
                          <Text type="secondary">-</Text>
                        ),
                    },
                    { title: '来源', dataIndex: 'source', width: 100, render: (v: KBSource) => (
                      <Tag style={{ borderRadius: 4, background: v === '自定义' ? '#f2f3f5' : '#fff7e6', color: v === '自定义' ? '#5f6b7a' : '#fa8c16', border: 'none', margin: 0 }}>{v}</Tag>
                    )},
                    {
                      title: '文件数',
                      dataIndex: 'fileCount',
                      width: 90,
                      render: (count: number | null, record) =>
                        record.category === 'external' ? (
                          <Text type="secondary">-</Text>
                        ) : (
                          <span>{count ?? 0}</span>
                        ),
                    },
                    { title: '创建人', dataIndex: 'owner', width: 100 },
                    { title: '创建日期', dataIndex: 'date', width: 120 },
                    {
                      title: '状态',
                      dataIndex: 'active',
                      width: 80,
                      render: (active: boolean) => (
                        <Text style={{ color: active ? '#52c41a' : '#999' }}>{active ? '已启用' : '已停用'}</Text>
                      ),
                    },
                    {
                      title: '操作',
                      width: 180,
                      render: (_, record) => (
                        <Space size={0}>
                          {record.source !== '广场资源' && <Button type="link" size="small" onClick={(event) => { event.stopPropagation(); setEditingKB(record); }}>编辑</Button>}
                          <Button
                            type="link"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleActive(record);
                            }}
                          >
                            {record.active ? '停用' : '启用'}
                          </Button>
                          <Button type="link" size="small" danger onClick={(event) => { event.stopPropagation(); handleDelete(record); }}>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              )
            ) : (
              <Empty
                description="未找到匹配的知识库"
                style={{ paddingTop: 80 }}
              />
            )}
          </div>
        </div>
      </div>

      <TypeSelectModal open={typeModalOpen} onCancel={() => setTypeModalOpen(false)} onSelect={openCreateByType} />
      <ProfessionalCreateDrawer open={professionalDrawerOpen} onClose={() => setProfessionalDrawerOpen(false)} onSubmit={handleProfessionalSubmit} />
      {simpleDrawerCategory && (
        <SimpleCreateDrawer
          open={Boolean(simpleDrawerCategory)}
          category={simpleDrawerCategory}
          defaultSubType={defaultSubType}
          onClose={() => setSimpleDrawerCategory(null)}
          onSubmit={handleSimpleSubmit}
          externalApiList={externalApiList}
          onOpenApiCreate={() => { setEditingApiId(null); setExternalApiFormOpen(true); }}
        />
      )}
      <ExternalApiManageDrawer
        open={externalApiManageOpen}
        externalApiList={externalApiList}
        kbList={kbList}
        onClose={() => setExternalApiManageOpen(false)}
        onAdd={handleOpenAddApi}
        onEdit={handleEditApi}
        onDelete={handleDeleteApi}
      />
      <ExternalApiFormDrawer
        open={externalApiFormOpen}
        editingId={editingApiId}
        initialData={editingApiData}
        onClose={() => { setExternalApiFormOpen(false); setEditingApiId(null); }}
        onSave={handleSaveApi}
      />
      <EditDrawer
        kb={editingKB}
        onClose={() => setEditingKB(null)}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default KnowledgeBasePage;
