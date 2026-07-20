import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
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
  CheckCircleOutlined,
  CloudSyncOutlined,
  CodeSandboxOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
  LoadingOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';
import PageHeader from '@/components/PageHeader';
import StatCards, { type StatCardItem } from '@/components/StatCards';
import FilterBar from '@/components/FilterBar';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type KBCategory = 'easy' | 'professional' | 'external';
type KBStatus = 'available' | 'processing' | 'error';
type RagflowSyncStatus = 'none' | 'creating' | 'synced' | 'failed';
type KBSubType = 'document' | 'structured' | 'graph';

interface KnowledgeBase {
  id: string;
  name: string;
  category: KBCategory;
  subType?: KBSubType;
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
  avatar?: IconPickerValue;
  embeddingModelId?: string;
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

const ExternalApiCreateModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (config: ExternalApiConfig) => void;
}> = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const newConfig: ExternalApiConfig = {
      id: `ext-api-${Date.now()}`,
      name: values.name,
      endpoint: values.endpoint,
      apiKey: values.apiKey,
    };
    onSave(newConfig);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="新建外部知识库 API"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="保存"
      cancelText="取消"
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical" style={{ paddingTop: 16 }}>
        <Form.Item name="name" label="外部知识库名称" rules={[{ required: true, message: '请输入外部知识库名称' }]}>
          <Input placeholder="例如：反诈数据检索 API" maxLength={50} />
        </Form.Item>
        <Form.Item name="endpoint" label="API Endpoint" rules={[{ required: true, message: '请输入 API Endpoint' }]}>
          <Input placeholder="https://api.example.com/v1/retrieval" />
        </Form.Item>
        <Form.Item name="apiKey" label="API Key" rules={[{ required: true, message: '请输入 API Key' }]}>
          <Input.Password placeholder="输入 API Key" />
        </Form.Item>
      </Form>
    </Modal>
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
            <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0' }} styles={{ body: { padding: 16 } }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>基础信息</div>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label="知识库编号">{getKnowledgeCode(kb)}</Descriptions.Item>
                <Descriptions.Item label="创建人">{kb.owner}</Descriptions.Item>
                <Descriptions.Item label="所属空间">{kb.ragflowTenantId ? '当前工作空间' : '默认空间'}</Descriptions.Item>
                <Descriptions.Item label="解析方式">{kb.chunkMethod || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0' }} styles={{ body: { padding: 16 } }}>
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
            </Card>
          </div>

          <Card style={{ borderRadius: 8, borderColor: '#f0f0f0', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
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
          </Card>
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
        <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0', marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
          <Descriptions column={3} size="small">
            <Descriptions.Item label="类型">{kb.typeTag}</Descriptions.Item>
            <Descriptions.Item label="创建人">{kb.owner}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{kb.date}</Descriptions.Item>
            <Descriptions.Item label="状态">{statusConfig[kb.status].label}</Descriptions.Item>
            <Descriptions.Item label="文件数">{kb.fileCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="启用状态">{kb.active ? '启用' : '停用'}</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ margin: '12px 0 0', color: '#5F6B7A' }}>{kb.desc}</Paragraph>
        </Card>
        {kb.category === 'external' ? (
          <Card size="small" style={{ borderRadius: 8, borderColor: '#f0f0f0' }} styles={{ body: { padding: 16 } }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="API Endpoint">{kb.apiEndpoint}</Descriptions.Item>
              <Descriptions.Item label="外部知识库 ID">{kb.externalKbId}</Descriptions.Item>
            </Descriptions>
          </Card>
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
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false);
  const [simpleDrawerCategory, setSimpleDrawerCategory] = useState<Exclude<KBCategory, 'professional'> | null>(null);
  const [defaultSubType, setDefaultSubType] = useState<KBSubType | undefined>();
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null);
  const [activeKB, setActiveKB] = useState<KnowledgeBase | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({ keyword: '', status: undefined });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [externalApiList, setExternalApiList] = useState<ExternalApiConfig[]>([
    { id: 'ext-api-mock-1', name: '反诈数据检索 API', endpoint: 'https://antifraud.police.cn/v1/retrieval', apiKey: 'sk-mock-********' },
    { id: 'ext-api-mock-2', name: '户籍信息知识库 API', endpoint: 'https://household.police.cn/api/kb/query', apiKey: 'sk-mock-********' },
  ]);
  const [externalApiCreateModalOpen, setExternalApiCreateModalOpen] = useState(false);

  const pageSize = 8;
  const categoryKeys: ('all' | KBCategory)[] = ['all', 'easy', 'professional', 'external'];

  const stats: StatCardItem[] = useMemo(() => {
    const professional = kbList.filter((item) => item.category === 'professional');
    return [
      { title: '知识库总数', value: kbList.length, color: '#1677ff', onClick: () => { setActiveCategory('all'); setPage(1); } },
      { title: '普通知识库', value: kbList.filter((item) => item.category === 'easy').length, color: '#1677ff', onClick: () => { setActiveCategory('easy'); setPage(1); } },
      { title: '专业知识库', value: professional.length, color: '#722ed1', onClick: () => { setActiveCategory('professional'); setPage(1); } },
      { title: '外部知识库', value: kbList.filter((item) => item.category === 'external').length, color: '#fa8c16', onClick: () => { setActiveCategory('external'); setPage(1); } },
    ];
  }, [kbList]);

  const activeStatIndex = categoryKeys.indexOf(activeCategory);

  const filteredList = useMemo(() => {
    return kbList.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (keyword && !item.name.includes(keyword) && !item.desc.includes(keyword)) return false;
      if (statusFilter !== undefined && item.active !== statusFilter) return false;
      return true;
    });
  }, [activeCategory, kbList, keyword, statusFilter]);

  const pagedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

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

  const handleReset = () => {
    setKeyword('');
    setStatusFilter(undefined);
    setActiveCategory('all');
    setPage(1);
    setFilterValues({ keyword: '', status: undefined });
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
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          title="知识库"
          hint="平台统一管理普通知识库、专业知识库和外部知识库。专业知识库适合复杂资料解析、分段治理和高质量检索场景。"
        />

        <StatCards
          items={stats}
          activeIndex={activeStatIndex}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <FilterBar
            filterValues={filterValues}
            onFilterChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
              if (key === 'keyword') setKeyword(value);
              if (key === 'status') {
                setStatusFilter(value === 'true' ? true : value === 'false' ? false : undefined);
                setPage(1);
              }
            }}
            placeholder="搜索知识库名称或描述"
            statusOptions={[
              { label: '启用', value: 'true' },
              { label: '停用', value: 'false' },
            ]}
            onSearch={() => setPage(1)}
            onReset={handleReset}
            onCreate={() => setTypeModalOpen(true)}
            createText="创建知识库"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }}>
            {pagedList.length > 0 ? (
              viewMode === 'card' ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 16,
                      paddingTop: 16,
                    }}
                  >
                    {pagedList.map((kb) => {
                      const cat = categoryConfig[kb.category];
                      return (
                        <div
                          key={kb.id}
                          style={{
                            background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
                            padding: '20px 20px 16px', cursor: 'pointer',
                            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                            display: 'flex', flexDirection: 'column', gap: 12,
                            position: 'relative', overflow: 'hidden',
                          }}
                          onClick={() => setActiveKB(kb)}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = '#1677ff';
                            el.style.boxShadow = '0 6px 20px rgba(22,119,255,0.08)';
                            el.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.borderColor = '#f0f0f0';
                            el.style.boxShadow = 'none';
                            el.style.transform = 'none';
                          }}
                        >
                          {/* 顶部强调色条 */}
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: cat.color }} />

                          {/* 头部：头像 + 名称 + 标签 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                              {/* 头像 */}
                              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                background: kb.avatar?.mode === 'image'
                                  ? `url(${kb.avatar.imageSrc}) center/cover no-repeat`
                                  : (kb.avatar?.textBgColor || cat.color),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: kb.avatar?.textColor || '#fff', fontWeight: 700, fontSize: 16,
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
                                  <Tag color={cat.color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{cat.label}</Tag>
                                  {kb.subType && (
                                    <Tag color={subTypeConfig[kb.subType].color} style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{subTypeConfig[kb.subType].label}</Tag>
                                  )}
                                </Space>
                              </div>
                            </div>
                            <Tag color={kb.active ? 'success' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
                              {kb.active ? '已启用' : '已停用'}
                            </Tag>
                          </div>

                          {/* 描述文本（最多两行） */}
                          <Text type="secondary" style={{ fontSize: 13, lineHeight: '20px' }} className="line-clamp-2">
                            {kb.desc}
                          </Text>

                          {/* 底部：创建人/时间 + 操作 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>{kb.owner} · {kb.date}</Text>
                            <Dropdown
                              menu={{
                                items: [
                                  { key: 'edit', label: '编辑', onClick: ({ domEvent }) => { domEvent.stopPropagation(); setEditingKB(kb); } },
                                  { key: 'toggle', label: kb.active ? '停用' : '启用', onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleToggleActive(kb); } },
                                  { key: 'delete', label: '删除', danger: true, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDelete(kb); } },
                                ],
                              }}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<EllipsisOutlined />}
                                style={{ borderRadius: 6, fontSize: 12 }}
                                onClick={(event) => event.stopPropagation()}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={filteredList.length}
                      showTotal={(total) => `共 ${total} 个知识库`}
                      onChange={setPage}
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
                          <Button type="link" size="small" onClick={(event) => { event.stopPropagation(); setEditingKB(record); }}>编辑</Button>
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
          onOpenApiCreate={() => setExternalApiCreateModalOpen(true)}
        />
      )}
      <ExternalApiCreateModal
        open={externalApiCreateModalOpen}
        onClose={() => setExternalApiCreateModalOpen(false)}
        onSave={(config) => {
          setExternalApiList((prev) => [...prev, config]);
          message.success('外部知识库 API 已创建');
        }}
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
