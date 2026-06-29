import React, { useState, useMemo } from 'react';
import {
  Input, Button, Switch, Dropdown, Modal, Drawer, Form, Select, InputNumber,
  Slider, Upload, Tree, Table, Tag, message, Space, Radio, Tabs, Pagination
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EllipsisOutlined, ArrowLeftOutlined,
  FileTextOutlined, BlockOutlined, ApiOutlined, DatabaseOutlined,
  FolderOutlined, UploadOutlined, DownloadOutlined, SettingOutlined,
  ReloadOutlined, DeleteOutlined, SendOutlined, FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';

const { TextArea } = Input;

// ═══════════════════════════════════════════════════
// Types & Config
// ═══════════════════════════════════════════════════

type KBCategory = 'easy' | 'professional' | 'external';
type KBStatus = 'available' | 'processing' | 'error';
type DetailTab = 'files' | 'retrieval' | 'logs' | 'settings';

interface KnowledgeBase {
  id: string;
  name: string;
  category: KBCategory;
  typeTag: string;
  desc: string;
  date: string;
  owner: string;
  active: boolean;
  fileCount: number | null;
  status: KBStatus;
  // External
  apiEndpoint?: string;
  apiKey?: string;
  externalKbId?: string;
  topK?: number;
  score?: number;
  scoreEnabled?: boolean;
  // Professional
  embeddingModel?: string;
  parseMethod?: string;
  builtinMethod?: string;
}

interface KBFile {
  id: string;
  name: string;
  format: string;
  size: string;
  status: string;
  dir: string;
  uploadDate: string;
}

const categoryConfig: Record<KBCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  easy: { label: '简易', color: '#1677ff', bg: '#e6f4ff', icon: <FileTextOutlined /> },
  professional: { label: '专业', color: '#722ed1', bg: '#f9f0ff', icon: <BlockOutlined /> },
  external: { label: '外部', color: '#fa8c16', bg: '#fff7e6', icon: <ApiOutlined /> },
};

const statusConfig: Record<KBStatus, { label: string; color: string }> = {
  available: { label: '可用', color: '#52c41a' },
  processing: { label: '向量化中', color: '#faad14' },
  error: { label: '异常', color: '#ff4d4f' },
};

// ═══════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════

const initialKBList: KnowledgeBase[] = [
  { id: '1', name: '产品文档库', category: 'easy', typeTag: '文档知识库', desc: '包含产品需求、操作指南和技术架构等核心文档的完整知识库。', date: '2026-05-20', owner: '管理员', active: true, fileCount: 45, status: 'available' },
  { id: '2', name: '技术架构图谱', category: 'professional', typeTag: '结构化知识库', desc: '系统架构及微服务依赖关系图谱，支撑技术方案评审与架构演进决策。', date: '2026-04-11', owner: '管理员', active: true, fileCount: 128, status: 'processing' },
  { id: '3', name: 'HR规章制度', category: 'easy', typeTag: '文档知识库', desc: '公司人力资源相关的制度和政策文件汇编。', date: '2026-04-30', owner: '李人事', active: true, fileCount: 12, status: 'error' },
  { id: '4', name: '法务合规库', category: 'external', typeTag: '外部接入', desc: '接入外部律师事务所提供的合规知识库接口。', date: '2026-05-01', owner: '王法务', active: true, fileCount: null, status: 'available', apiEndpoint: 'https://api.dify.ai/v1/retrieval', apiKey: 'sk-abcdef1234567890', externalKbId: 'lawyer-kb-001', topK: 4, score: 0.65, scoreEnabled: true },
  { id: '5', name: '政策知识库', category: 'professional', typeTag: '结构化知识库', desc: '包含历年政策法规相关资料及实施细则。', date: '2026-04-10', owner: '张主任', active: true, fileCount: 8, status: 'available', embeddingModel: 'bge-m3', parseMethod: 'builtin', builtinMethod: 'general' },
  { id: '6', name: '运维手册', category: 'easy', typeTag: '文档知识库', desc: '系统运维操作手册及故障排查指南。', date: '2026-03-15', owner: '陈运维', active: false, fileCount: 23, status: 'available' },
  { id: '7', name: '客服知识库', category: 'external', typeTag: '外部接入', desc: '通过API对接第三方智能客服知识库平台。', date: '2026-05-10', owner: '管理员', active: true, fileCount: null, status: 'available', apiEndpoint: 'https://kb.example.com/api/v2', apiKey: 'kb-api-key-xxxxx', externalKbId: 'cs-kb-2026', topK: 5, score: 0.7, scoreEnabled: true },
  { id: '8', name: '安全审计库', category: 'professional', typeTag: '结构化知识库', desc: '安全审计标准、检查项及历史审计报告。', date: '2026-02-20', owner: '赵安全', active: true, fileCount: 56, status: 'available', embeddingModel: 'text-embedding-v2', parseMethod: 'builtin', builtinMethod: 'qa' },
  { id: '9', name: '培训材料库', category: 'easy', typeTag: '文档知识库', desc: '新员工入职培训、技能提升培训相关材料。', date: '2026-01-08', owner: '周培训', active: true, fileCount: 34, status: 'available' },
];

const mockFiles: KBFile[] = [
  { id: 'f1', name: '平台部署指南.md', format: 'md', size: '4.29 KB', status: '已向量化', dir: '全部/技术文档', uploadDate: '2026-05-20' },
  { id: 'f2', name: '企业文化手册.pdf', format: 'pdf', size: '2.1 MB', status: '已向量化', dir: '全部/公司制度', uploadDate: '2026-04-30' },
  { id: 'f3', name: 'API接口文档.docx', format: 'docx', size: '856 KB', status: '向量化中', dir: '全部/技术文档', uploadDate: '2026-05-18' },
  { id: 'f4', name: '产品需求规格书.pdf', format: 'pdf', size: '3.4 MB', status: '已向量化', dir: '全部/产品文档', uploadDate: '2026-05-15' },
  { id: 'f5', name: '系统架构设计.pptx', format: 'pptx', size: '5.7 MB', status: '失败', dir: '全部/技术文档', uploadDate: '2026-05-10' },
];

const mockLogs = [
  { time: '2026-06-16 14:30:22', operator: '管理员', action: '上传文件', detail: '上传《平台部署指南.md》' },
  { time: '2026-06-15 10:15:00', operator: '管理员', action: '修改配置', detail: '将嵌入模型从 text-embedding-v2 切换为 bge-m3' },
  { time: '2026-06-14 09:00:00', operator: '管理员', action: '创建知识库', detail: '创建知识库"产品文档库"' },
  { time: '2026-06-13 16:45:00', operator: '李人事', action: '删除文件', detail: '删除《旧版考勤制度.pdf》' },
];

const logColumns: ColumnsType<typeof mockLogs[0]> = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '操作类型', dataIndex: 'action', key: 'action', width: 100, render: (v: string) => <Tag>{v}</Tag> },
  { title: '详情', dataIndex: 'detail', key: 'detail' },
];

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

/** Type Selection Modal */
const TypeSelectModal: React.FC<{
  open: boolean;
  onSelect: (type: KBCategory) => void;
  onCancel: () => void;
}> = ({ open, onSelect, onCancel }) => {
  const types: { key: KBCategory; title: string; desc: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { key: 'easy', title: '简易知识库', desc: '只需上传文件即可自动切块并形成向量表示，适合不懂知识库构建的人群快速上手使用。', icon: <FolderOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { key: 'professional', title: '专业知识库', desc: '提供自定义切分策略和数据清洗能力，适合知识库专家针对特定业务进行个性化整理和干预。', icon: <SettingOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { key: 'external', title: '外部知识库', desc: '无缝接入外部已有的知识库服务或 API，用于为当前系统和智能体构建提供更丰富的上下文数据支持。', icon: <ApiOutlined />, color: '#fa8c16', bg: '#fff7e6' },
  ];

  return (
    <Modal
      title={<div style={{ fontSize: 16, fontWeight: 600 }}>选择知识库类型</div>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={620}
      destroyOnClose
      styles={{ body: { padding: '24px 28px 28px' } }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {types.map(t => (
          <div
            key={t.key}
            onClick={() => onSelect(t.key)}
            style={{
              border: '1px solid #E5EAF3',
              borderRadius: 8,
              padding: '24px 16px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              background: '#fff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = t.color;
              e.currentTarget.style.boxShadow = `0 4px 16px ${t.color}15`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5EAF3';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: t.bg, color: t.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 12px', transition: 'transform 0.2s ease',
            }}
              className="type-icon"
            >
              {t.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1D2129', marginBottom: 8 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: '#7A8599', lineHeight: '20px' }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <style>{`
        .type-select-card:hover .type-icon { transform: scale(1.1); }
      `}</style>
    </Modal>
  );
};

/** Rename Modal */
const RenameModal: React.FC<{
  open: boolean;
  currentName: string;
  onOk: (name: string) => void;
  onCancel: () => void;
}> = ({ open, currentName, onOk, onCancel }) => {
  const [name, setName] = useState(currentName);
  React.useEffect(() => { setName(currentName); }, [currentName]);
  return (
    <Modal
      title="重命名知识库"
      open={open}
      onOk={() => { if (name.trim()) onOk(name.trim()); }}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={420}
      destroyOnClose
    >
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: '#5F6B7A', marginBottom: 8 }}>请输入新名称</div>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="知识库名称" maxLength={50} />
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════
// Easy KB Create Drawer
// ═══════════════════════════════════════════════════

const EasyCreateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [avatarType, setAvatarType] = useState<'preset' | 'upload'>('preset');
  const presetIcons = ['📄', '📚', '📖', '📝', '📋', '📑', '📔', '📕'];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch { /* validation failed */ }
  };

  return (
    <Drawer
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>创建简易知识库</span>}
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>提交</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input placeholder="请输入知识库名称" maxLength={50} />
        </Form.Item>

        <Form.Item name="kbType" label="知识库类型" rules={[{ required: true }]} initialValue="文档知识库">
          <Select
            options={[
              { label: '文档知识库', value: '文档知识库' },
              { label: '结构化数据知识库', value: '结构化数据知识库' },
            ]}
          />
        </Form.Item>

        <div style={{ background: '#e6f4ff', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#1677ff', lineHeight: '22px' }}>
          支持 PDF、Word、TXT 等格式批量导入，自动切分段落并向量化，依托语义检索实现即问即答。
        </div>

        <Form.Item label="知识库头像">
          <Radio.Group value={avatarType} onChange={e => setAvatarType(e.target.value)} style={{ marginBottom: 12 }}>
            <Radio.Button value="preset">选择头像</Radio.Button>
            <Radio.Button value="upload">上传头像</Radio.Button>
          </Radio.Group>
          {avatarType === 'preset' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {presetIcons.map((icon, i) => (
                <div key={i} style={{
                  width: 44, height: 44, borderRadius: 8, border: '1px solid #E5EAF3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, cursor: 'pointer', background: '#fff',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1677ff'; e.currentTarget.style.background = '#e6f4ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5EAF3'; e.currentTarget.style.background = '#fff'; }}
                >
                  {icon}
                </div>
              ))}
            </div>
          ) : (
            <Upload.Dragger accept="image/*" maxCount={1} style={{ padding: '20px 0' }}>
              <p className="text-gray-400 text-2xl"><UploadOutlined /></p>
              <p className="text-gray-500 text-sm">点击或拖拽文件至此区域上传</p>
              <p className="text-gray-400 text-xs">支持 PNG、JPG，最大 2MB</p>
            </Upload.Dragger>
          )}
        </Form.Item>

        <Form.Item name="desc" label="知识库介绍">
          <TextArea rows={3} placeholder="请简要描述知识库的内容和用途（选填）" maxLength={200} showCount />
        </Form.Item>

        <Form.Item name="embeddingModel" label="向量化模型" initialValue="bge-m3">
          <Select
            options={[
              { label: 'bge-m3', value: 'bge-m3' },
              { label: 'text-embedding-v2', value: 'text-embedding-v2' },
            ]}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ═══════════════════════════════════════════════════
// Professional KB Create Drawer
// ═══════════════════════════════════════════════════

const ProfessionalCreateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch { /* validation failed */ }
  };

  return (
    <Drawer
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>创建专业知识库</span>}
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>保存</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
          <Input placeholder="请输入知识库名称" maxLength={50} />
        </Form.Item>

        <Form.Item name="embeddingModel" label="嵌入模型" rules={[{ required: true }]} initialValue="bge-m3">
          <Select
            options={[
              { label: 'bge-m3', value: 'bge-m3' },
              { label: 'text-embedding-v2', value: 'text-embedding-v2' },
            ]}
          />
        </Form.Item>

        <Form.Item name="parseMethod" label="解析方法" initialValue="builtin">
          <Radio.Group>
            <Radio.Button value="builtin">内置</Radio.Button>
            <Radio.Button value="pipeline">选择 pipeline</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="builtinMethod" label="内置方法" initialValue="general">
          <Select
            options={[
              { label: 'General', value: 'general' },
              { label: 'Q&A', value: 'qa' },
              { label: 'Resume', value: 'resume' },
              { label: 'Manual', value: 'manual' },
            ]}
          />
        </Form.Item>

        <Form.Item name="desc" label="描述">
          <TextArea rows={2} placeholder="简要描述该知识库的用途（选填）" />
        </Form.Item>

        <Form.Item label="头像">
          <Upload.Dragger accept="image/*" maxCount={1} style={{ padding: '16px 0' }}>
            <p className="text-gray-400 text-xl"><UploadOutlined /></p>
            <p className="text-gray-500 text-sm">点击或拖拽上传头像</p>
            <p className="text-gray-400 text-xs">最大 4MB</p>
          </Upload.Dragger>
        </Form.Item>

        {/* Ingestion Pipeline */}
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', margin: '24px 0 12px', paddingBottom: 8, borderBottom: '1px solid #F0F2F5' }}>
          Ingestion Pipeline 配置
        </div>

        <Form.Item name="pdfParser" label="PDF解析器" initialValue="deepdoc">
          <Select options={[{ label: 'DeepDOC', value: 'deepdoc' }, { label: 'Default', value: 'default' }]} />
        </Form.Item>

        <Form.Item label="建议文本块大小">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Form.Item name="chunkSize" noStyle initialValue={512}>
              <InputNumber min={0} max={2048} style={{ width: 90 }} />
            </Form.Item>
            <Form.Item name="chunkSizeSlider" noStyle initialValue={512}>
              <Slider min={0} max={2048} style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item name="delimiter" label="文本分段标识符" initialValue="\n">
          <Input />
        </Form.Item>

        <Form.Item name="childChunk" label="Child Chunk Retrieval" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="pageIndex" label="PageIndex" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="图像与表格上下文窗口">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Form.Item name="contextWindow" noStyle initialValue={2}>
              <InputNumber min={0} max={10} style={{ width: 90 }} />
            </Form.Item>
            <Form.Item name="contextWindowSlider" noStyle initialValue={2}>
              <Slider min={0} max={10} style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item name="autoMetadata" label="自动元数据" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Overlapped %">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Form.Item name="overlapped" noStyle initialValue={0}>
              <InputNumber min={0} max={100} style={{ width: 90 }} />
            </Form.Item>
            <Form.Item name="overlappedSlider" noStyle initialValue={0}>
              <Slider min={0} max={100} style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ═══════════════════════════════════════════════════
// External KB Drawer (Create / Edit)
// ═══════════════════════════════════════════════════

const ExternalKBDrawer: React.FC<{
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: KnowledgeBase | null;
  onClose: () => void;
  onSubmit: (values: any) => void;
}> = ({ open, mode, initialData, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [connecting, setConnecting] = useState(false);
  const [scoreEnabled, setScoreEnabled] = useState(initialData?.scoreEnabled ?? true);

  React.useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        desc: initialData.desc === '暂无描述信息' ? undefined : initialData.desc,
        apiEndpoint: initialData.apiEndpoint,
        apiKey: initialData.apiKey,
        externalKbId: initialData.externalKbId,
        topK: initialData.topK ?? 4,
        score: initialData.score ?? 0.5,
      });
      setScoreEnabled(initialData.scoreEnabled ?? true);
    }
    if (open && mode === 'create') {
      form.resetFields();
      form.setFieldsValue({ topK: 4, score: 0.5 });
      setScoreEnabled(true);
    }
  }, [open, mode, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConnecting(true);
      // Simulate connection check
      await new Promise(r => setTimeout(r, 1500));
      if (values.apiKey === 'error') throw new Error('连接外部知识库失败，请检查 API Endpoint 或 Key 是否正确');
      onSubmit({ ...values, scoreEnabled });
      setConnecting(false);
    } catch (e: any) {
      setConnecting(false);
      if (e.message) message.error(e.message);
    }
  };

  return (
    <Drawer
      title={<span style={{ fontSize: 16, fontWeight: 600 }}>{mode === 'create' ? '连接外部知识库' : '编辑外部知识库'}</span>}
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={connecting} onClick={handleSubmit}>
            {mode === 'create' ? '连接' : '保存'}
          </Button>
        </div>
      }
    >
      <div style={{ background: '#e6f4ff', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#1677ff', lineHeight: '22px' }}>
        通过 API 和知识库 ID 连接到外部知识库。目前仅支持检索功能，暂不支持对知识库内容进行增删改操作。
      </div>

      <Form form={form} layout="vertical">
        <Form.Item name="name" label="外部知识库名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入外部知识库名称" />
        </Form.Item>

        <Form.Item name="desc" label="知识库描述">
          <TextArea rows={2} placeholder="简要描述该外部知识库（选填）" />
        </Form.Item>

        <Form.Item
          name="apiEndpoint"
          label={<span>API Endpoint <a href="#" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>了解如何创建外部知识库API</a></span>}
          rules={[{ required: true, message: '请输入 API Endpoint' }]}
        >
          <Input placeholder="https://api.example.com/v1/retrieval" />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[{ required: true, message: '请输入 API Key' }]}
          extra={<span style={{ fontSize: 12, color: '#7A8599' }}>您的 API Token 将进行加密存储</span>}
        >
          <Input.Password placeholder="请输入 API Key" />
        </Form.Item>

        <Form.Item name="externalKbId" label="外部知识库 ID" rules={[{ required: true, message: '请输入外部知识库 ID' }]}>
          <Input placeholder="请输入外部知识库 ID" />
        </Form.Item>

        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', margin: '24px 0 12px', paddingBottom: 8, borderBottom: '1px solid #F0F2F5' }}>
          召回设置
        </div>

        <Form.Item label="Top K">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Form.Item name="topK" noStyle initialValue={4}>
              <InputNumber min={1} max={10} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="topKSlider" noStyle initialValue={4}>
              <Slider min={1} max={10} style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label="Score 阈值">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Switch checked={scoreEnabled} onChange={setScoreEnabled} size="small" />
            <Form.Item name="score" noStyle initialValue={0.5}>
              <InputNumber min={0} max={1} step={0.01} disabled={!scoreEnabled} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="scoreSlider" noStyle initialValue={0.5}>
              <Slider min={0} max={1} step={0.01} disabled={!scoreEnabled} style={{ flex: 1 }} />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ═══════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════

const KnowledgeBasePage: React.FC = () => {
  // ── View State ──
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [activeKB, setActiveKB] = useState<KnowledgeBase | null>(null);

  // ── List State ──
  const [kbList, setKbList] = useState<KnowledgeBase[]>(initialKBList);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<KBStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // ── Modal/Drawer State ──
  const [typeSelectOpen, setTypeSelectOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<KnowledgeBase | null>(null);
  const [easyDrawerOpen, setEasyDrawerOpen] = useState(false);
  const [professionalDrawerOpen, setProfessionalDrawerOpen] = useState(false);
  const [externalDrawerOpen, setExternalDrawerOpen] = useState(false);
  const [externalDrawerMode, setExternalDrawerMode] = useState<'create' | 'edit'>('create');
  const [externalEditTarget, setExternalEditTarget] = useState<KnowledgeBase | null>(null);

  // ── Detail State ──
  const [detailTab, setDetailTab] = useState<DetailTab>('files');

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const total = kbList.length;
    const easy = kbList.filter(k => k.category === 'easy');
    const professional = kbList.filter(k => k.category === 'professional');
    const external = kbList.filter(k => k.category === 'external');
    const available = kbList.filter(k => k.status === 'available').length;
    const processing = kbList.filter(k => k.status === 'processing').length;
    const error = kbList.filter(k => k.status === 'error').length;
    return [
      { label: '知识库总数', value: total, sub: `${available} 可用 / ${processing} 向量化中 / ${error} 异常`, key: 'all', color: '#1677ff' },
      { label: '简易知识库', value: easy.length, sub: `${easy.reduce((s, k) => s + (k.fileCount ?? 0), 0)} 个文件`, key: 'easy', color: '#1677ff' },
      { label: '专业知识库', value: professional.length, sub: `${professional.reduce((s, k) => s + (k.fileCount ?? 0), 0)} 个文件`, key: 'professional', color: '#722ed1' },
      { label: '外部知识库', value: external.length, sub: `${external.filter(k => k.status === 'available').length} 已连接 / ${external.filter(k => k.status === 'error').length} 异常`, key: 'external', color: '#fa8c16' },
    ];
  }, [kbList]);

  const tabs = useMemo(() => {
    const counts: Record<string, number> = { all: kbList.length };
    ['easy', 'professional', 'external'].forEach(c => { counts[c] = kbList.filter(k => k.category === c).length; });
    return [
      { label: '全部', key: 'all', count: counts.all },
      { label: '简易知识库', key: 'easy', count: counts.easy },
      { label: '专业知识库', key: 'professional', count: counts.professional },
      { label: '外部知识库', key: 'external', count: counts.external },
    ];
  }, [kbList]);

  // ── Filtered List ──
  const filteredList = useMemo(() => {
    return kbList.filter(k => {
      if (activeCategoryTab !== 'all' && k.category !== activeCategoryTab) return false;
      if (searchText && !k.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(k.status)) return false;
      return true;
    });
  }, [kbList, activeCategoryTab, searchText, statusFilter]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  // Reset page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [activeCategoryTab, searchText, statusFilter]);

  // ── Handlers ──
  const handleStatClick = (key: string) => {
    setActiveCategoryTab(key);
    setStatusFilter([]);
  };

  const handleCreateClick = () => setTypeSelectOpen(true);

  const handleTypeSelect = (type: KBCategory) => {
    setTypeSelectOpen(false);
    if (type === 'easy') setEasyDrawerOpen(true);
    else if (type === 'professional') setProfessionalDrawerOpen(true);
    else {
      setExternalDrawerMode('create');
      setExternalEditTarget(null);
      setExternalDrawerOpen(true);
    }
  };

  const addKB = (kb: KnowledgeBase) => setKbList(prev => [kb, ...prev]);

  const handleEasySubmit = (values: any) => {
    const newKB: KnowledgeBase = {
      id: Date.now().toString(),
      name: values.name,
      category: 'easy',
      typeTag: values.kbType || '文档知识库',
      desc: values.desc || '暂无描述信息',
      date: new Date().toISOString().slice(0, 10),
      owner: '当前用户',
      active: true,
      fileCount: 0,
      status: 'available',
    };
    addKB(newKB);
    setEasyDrawerOpen(false);
    message.success('简易知识库创建成功');
  };

  const handleProfessionalSubmit = (values: any) => {
    const newKB: KnowledgeBase = {
      id: Date.now().toString(),
      name: values.name,
      category: 'professional',
      typeTag: '结构化知识库',
      desc: values.desc || '暂无描述信息',
      date: new Date().toISOString().slice(0, 10),
      owner: '当前用户',
      active: true,
      fileCount: 0,
      status: 'available',
      embeddingModel: values.embeddingModel,
      parseMethod: values.parseMethod,
      builtinMethod: values.builtinMethod,
    };
    addKB(newKB);
    setProfessionalDrawerOpen(false);
    message.success('专业知识库创建成功');
  };

  const handleExternalSubmit = (values: any) => {
    if (externalDrawerMode === 'create') {
      const newKB: KnowledgeBase = {
        id: Date.now().toString(),
        name: values.name,
        category: 'external',
        typeTag: '外部接入',
        desc: values.desc || '暂无描述信息',
        date: new Date().toISOString().slice(0, 10),
        owner: '当前用户',
        active: true,
        fileCount: null,
        status: 'available',
        apiEndpoint: values.apiEndpoint,
        apiKey: values.apiKey,
        externalKbId: values.externalKbId,
        topK: values.topK,
        score: values.score,
        scoreEnabled: values.scoreEnabled,
      };
      addKB(newKB);
      message.success('已成功连接到外部知识库');
    } else if (externalEditTarget) {
      setKbList(prev => prev.map(k => k.id === externalEditTarget.id ? {
        ...k,
        name: values.name,
        desc: values.desc || '暂无描述信息',
        apiEndpoint: values.apiEndpoint,
        apiKey: values.apiKey,
        externalKbId: values.externalKbId,
        topK: values.topK,
        score: values.score,
        scoreEnabled: values.scoreEnabled,
      } : k));
      setActiveKB(prev => prev?.id === externalEditTarget.id ? {
        ...prev,
        name: values.name,
        desc: values.desc || '暂无描述信息',
        apiEndpoint: values.apiEndpoint,
        apiKey: values.apiKey,
        externalKbId: values.externalKbId,
        topK: values.topK,
        score: values.score,
        scoreEnabled: values.scoreEnabled,
      } : prev);
      message.success('外部知识库配置已更新');
    }
    setExternalDrawerOpen(false);
  };

  const handleEditExternal = (kb: KnowledgeBase) => {
    setExternalEditTarget(kb);
    setExternalDrawerMode('edit');
    setExternalDrawerOpen(true);
  };

  const handleRename = (kb: KnowledgeBase) => {
    setRenameTarget(kb);
    setRenameOpen(true);
  };

  const handleRenameOk = (newName: string) => {
    if (renameTarget) {
      setKbList(prev => prev.map(k => k.id === renameTarget.id ? { ...k, name: newName } : k));
      if (activeKB?.id === renameTarget.id) setActiveKB(prev => prev ? { ...prev, name: newName } : null);
    }
    setRenameOpen(false);
    setRenameTarget(null);
    message.success('重命名成功');
  };

  const handleToggleActive = (kbId: string, checked: boolean) => {
    setKbList(prev => prev.map(k => k.id === kbId ? { ...k, active: checked } : k));
    if (activeKB?.id === kbId) setActiveKB(prev => prev ? { ...prev, active: checked } : null);
  };

  const handleDelete = (kb: KnowledgeBase) => {
    Modal.confirm({
      title: '删除知识库',
      content: `确定要删除知识库「${kb.name}」吗？删除后不可恢复。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setKbList(prev => prev.filter(k => k.id !== kb.id));
        message.success('知识库已删除');
      },
    });
  };

  const openDetail = (kb: KnowledgeBase) => {
    setActiveKB(kb);
    setDetailTab('files');
    setViewMode('detail');
  };

  const closeDetail = () => { setActiveKB(null); setViewMode('list'); };

  // ════════════════════ Render: List View ════════════════════
  const renderListView = () => (
    <div style={{ flex: 1, overflow: 'auto', background: '#F5F7FA' }}>
      <div style={{ padding: '24px 28px 40px' }}>
        {/* Header */}
        <PageHeader
          title="知识库"
          hint="知识库为智能体提供可检索的高质量上下文数据支撑。支持简易知识库、专业知识库和外部知识库三种类型。"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick} style={{ borderRadius: 6, fontWeight: 500 }}>
              创建知识库
            </Button>
          }
        />

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {stats.map(st => {
            const active = activeCategoryTab === st.key;
            return (
              <div
                key={st.key}
                onClick={() => handleStatClick(st.key)}
                style={{
                  background: '#fff', borderRadius: 8, border: `1px solid ${active ? st.color + '40' : '#E5EAF3'}`,
                  padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: active ? `0 2px 8px ${st.color}15` : '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 4 }}>{st.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: st.color, lineHeight: '36px' }}>{st.value}</div>
                <div style={{ fontSize: 11, color: '#B0B8C8', marginTop: 2 }}>{st.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Capsule Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {tabs.map(tab => {
              const active = activeCategoryTab === tab.key;
              const tabColor = tab.key === 'professional' ? '#722ed1' : tab.key === 'external' ? '#fa8c16' : '#1677ff';
              return (
                <div
                  key={tab.key}
                  onClick={() => setActiveCategoryTab(tab.key)}
                  style={{
                    background: active ? tabColor + '10' : '#fff',
                    borderRadius: 6,
                    border: `1px solid ${active ? tabColor + '30' : '#E5EAF3'}`,
                    padding: '6px 14px', cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 13, color: active ? tabColor : '#5F6B7A', fontWeight: active ? 600 : 400 }}>{tab.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: active ? tabColor : '#B0B8C8',
                    background: active ? tabColor + '15' : '#F2F3F8', borderRadius: 10,
                    padding: '0 7px', lineHeight: '18px', minWidth: 22, textAlign: 'center',
                  }}>{tab.count}</span>
                </div>
              );
            })}
          </div>

          {/* Status Filter */}
          <Select
            mode="multiple"
            placeholder="状态筛选"
            allowClear
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '可用', value: 'available' },
              { label: '向量化中', value: 'processing' },
              { label: '异常', value: 'error' },
            ]}
          />

          <Input
            prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
            placeholder="搜索知识库名称…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240, borderRadius: 6, marginLeft: 'auto' }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter([]); setActiveCategoryTab('all'); }}>
            重置
          </Button>
        </div>

        {/* Card Grid */}
        {paginatedList.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {paginatedList.map(kb => {
                const cfg = categoryConfig[kb.category];
                const st = statusConfig[kb.status];
                return (
                  <div
                    key={kb.id}
                    onClick={() => openDetail(kb)}
                    style={{
                      background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3',
                      padding: '20px 20px 16px', cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column',
                      minHeight: 200,
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
                    {/* Top: Icon + Tag + More */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10, background: cfg.bg, color: cfg.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                        }}>
                          {cfg.icon}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 500, color: '#5F6B7A', background: '#F2F3F8',
                          borderRadius: 3, padding: '1px 6px', lineHeight: '18px',
                        }}>{cfg.label}</span>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <Dropdown menu={{
                          items: [
                            { key: 'rename', label: '重命名', onClick: () => handleRename(kb) },
                            ...(kb.category === 'external'
                              ? [{ key: 'edit', label: '编辑配置', onClick: () => handleEditExternal(kb) }]
                              : [{ key: 'edit', label: '编辑配置', disabled: true }]),
                            { type: 'divider' as const },
                            { key: 'delete', label: <span style={{ color: '#ff4d4f' }}>删除知识库</span>, onClick: () => handleDelete(kb) },
                          ],
                        }} trigger={['click']}>
                          <div style={{ color: '#8A94A6', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F2F3F8'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <EllipsisOutlined style={{ fontSize: 18 }} />
                          </div>
                        </Dropdown>
                      </div>
                    </div>

                    {/* Name + Type */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={kb.name}>
                        {kb.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#7A8599', marginTop: 2 }}>{kb.typeTag}</div>
                    </div>

                    {/* Description */}
                    <div style={{
                      fontSize: 12, color: '#5F6B7A', lineHeight: '20px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', flex: 1, marginBottom: 12,
                    }}>
                      {kb.desc}
                    </div>

                    {/* File count + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      {kb.fileCount !== null ? (
                        <span style={{ fontSize: 12, color: '#5F6B7A', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DatabaseOutlined style={{ color: '#B0B8C8' }} />{kb.fileCount} 个文件
                        </span>
                      ) : <span />}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: st.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                        {st.label}
                      </span>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0F2F5' }}>
                      <span style={{ fontSize: 11, color: '#B0B8C8' }}>{kb.date} | {kb.owner}</span>
                      <span onClick={e => e.stopPropagation()}>
                        <Switch size="small" checked={kb.active} onChange={checked => handleToggleActive(kb.id, checked)} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredList.length > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination
                  current={currentPage}
                  total={filteredList.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger
                  pageSizeOptions={['12', '24', '48']}
                  showTotal={(total) => `共 ${total} 个知识库`}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 48, color: '#D0D5DD', marginBottom: 16 }}><SearchOutlined /></div>
            <div style={{ fontSize: 14, color: '#7A8599' }}>未找到匹配的知识库</div>
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════ Render: Detail View ════════════════════

  const renderEasyProDetail = () => {
    if (!activeKB) return null;
    const isEasy = activeKB.category === 'easy';

    const easyFileColumns: ColumnsType<KBFile> = [
      { title: '序号', dataIndex: 'id', key: 'id', width: 70, render: (_: any, __: any, idx: number) => idx + 1 },
      {
        title: '文件名称', dataIndex: 'name', key: 'name',
        render: (text: string) => <a style={{ color: '#1677ff' }}>{text}</a>,
      },
      { title: '格式', dataIndex: 'format', key: 'format', width: 80 },
      { title: '文件体积', dataIndex: 'size', key: 'size', width: 100, sorter: (a: any, b: any) => a.size.localeCompare(b.size) },
      {
        title: '文件状态', dataIndex: 'status', key: 'status', width: 120,
        render: (s: string) => (
          <span style={{ color: s === '已向量化' ? '#52c41a' : s === '向量化中' ? '#faad14' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s === '已向量化' ? '#52c41a' : s === '向量化中' ? '#faad14' : '#ff4d4f', display: 'inline-block' }} />{s}
          </span>
        ),
      },
      { title: '所在目录', dataIndex: 'dir', key: 'dir', width: 160 },
      { title: '操作', key: 'action', width: 80, render: () => <a style={{ color: '#1677ff' }}>删除</a> },
    ];

    const proFileColumns: ColumnsType<KBFile> = [
      { title: '名称', dataIndex: 'name', key: 'name', render: (t: string) => <a style={{ color: '#1677ff' }}>{t}</a> },
      { title: '上传日期', dataIndex: 'uploadDate', key: 'uploadDate', width: 120, sorter: (a: any, b: any) => a.uploadDate.localeCompare(b.uploadDate) },
      { title: '文件体积', dataIndex: 'size', key: 'size', width: 100 },
      {
        title: '文件状态', dataIndex: 'status', key: 'status', width: 100,
        render: (s: string) => <Tag color={s === '已向量化' ? 'success' : s === '向量化中' ? 'processing' : 'error'}>{s}</Tag>,
      },
      {
        title: '操作', key: 'action', width: 120,
        render: () => <Space size={4}><Switch size="small" defaultChecked /><a style={{ color: '#ff4d4f' }}>删除</a></Space>,
      },
    ];

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F5F7FA', overflow: 'auto' }}>
        {/* Detail Header */}
        <div style={{ background: '#fff', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #F0F2F5' }}>
          <ArrowLeftOutlined style={{ fontSize: 16, cursor: 'pointer', color: '#5F6B7A' }} onClick={closeDetail} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: categoryConfig[activeKB.category].bg,
              color: categoryConfig[activeKB.category].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              {categoryConfig[activeKB.category].icon}
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1D2129' }}>{activeKB.name}</span>
            <Tag style={{ borderRadius: 4, margin: 0 }}>{categoryConfig[activeKB.category].label}</Tag>
          </div>
        </div>

        {/* Detail Content with Tabs */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 28px 28px' }}>
          <Tabs
            activeKey={detailTab}
            onChange={k => setDetailTab(k as DetailTab)}
            style={{ marginTop: 16 }}
            items={[
              {
                key: 'files',
                label: '文件',
                children: (
                  <div>
                    {!isEasy && (
                      <div style={{ background: '#e6f4ff', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#1677ff' }}>
                        知识库文档在修改或上传后需要一定的时间进行向量化加载，请耐心等待。在此期间，知识库文档可能无法被检索。
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <Space>
                        {isEasy && <Button icon={<UploadOutlined />}>上传文件</Button>}
                        {isEasy && <Button icon={<DownloadOutlined />}>导入文件</Button>}
                        {!isEasy && <Button icon={<UploadOutlined />}>批量导入</Button>}
                        <Button disabled>批量操作</Button>
                      </Space>
                      <Space>
                        {isEasy && (
                          <>
                            <Input prefix={<SearchOutlined />} placeholder="文件名称" style={{ width: 180 }} />
                            <Select placeholder="文件状态" style={{ width: 120 }} options={[
                              { label: '全部', value: 'all' }, { label: '已向量化', value: 'done' }, { label: '向量化中', value: 'processing' }, { label: '失败', value: 'failed' },
                            ]} />
                            <Button icon={<SearchOutlined />}>搜索</Button>
                            <Button icon={<ReloadOutlined />}>重置</Button>
                          </>
                        )}
                      </Space>
                    </div>

                    <Table
                      columns={isEasy ? easyFileColumns : proFileColumns}
                      dataSource={mockFiles}
                      rowKey="id"
                      size="middle"
                      rowSelection={isEasy ? { type: 'checkbox' } : undefined}
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
                      style={{ background: '#fff', borderRadius: 8 }}
                    />
                  </div>
                ),
              },
              {
                key: 'retrieval',
                label: '检索测试',
                children: (
                  <div>
                    <div style={{
                      background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3', padding: 24,
                      maxWidth: 720,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>知识库检索测试</div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <Input.Search
                          placeholder="输入检索内容进行测试…"
                          enterButton={<><SendOutlined /> 检索</>}
                          size="large"
                          style={{ flex: 1 }}
                          onSearch={v => message.info(`检索: ${v}`)}
                        />
                      </div>
                      <div style={{
                        textAlign: 'center', padding: '40px 0', color: '#B0B8C8',
                        border: '1px dashed #E5EAF3', borderRadius: 8, fontSize: 13,
                      }}>
                        输入检索内容，测试知识库的语义检索效果
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'logs',
                label: '操作记录',
                children: (
                  <Table
                    columns={logColumns}
                    dataSource={mockLogs}
                    rowKey="time"
                    size="middle"
                    pagination={{ pageSize: 10 }}
                    style={{ background: '#fff', borderRadius: 8 }}
                  />
                ),
              },
              {
                key: 'settings',
                label: '基础设置',
                children: (
                  <div style={{
                    background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3', padding: 24, maxWidth: 640,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>基础配置信息</div>
                    <div style={{ display: 'grid', gap: 16 }}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>知识库类型</span>
                        <span style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.typeTag}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>嵌入模型</span>
                        <span style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.embeddingModel || 'bge-m3'}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>解析方法</span>
                        <span style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.parseMethod === 'builtin' ? `内置 (${activeKB.builtinMethod || 'general'})` : 'pipeline'}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>创建日期</span>
                        <span style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.date}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>创建人</span>
                        <span style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.owner}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 100, fontSize: 13, color: '#7A8599' }}>服务状态</span>
                        <span>{activeKB.active ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>}</span>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  };

  const renderExternalDetail = () => {
    if (!activeKB) return null;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F5F7FA', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ background: '#fff', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F2F5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ArrowLeftOutlined style={{ fontSize: 16, cursor: 'pointer', color: '#5F6B7A' }} onClick={closeDetail} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: categoryConfig.external.bg,
                color: categoryConfig.external.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                <ApiOutlined />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1D2129' }}>{activeKB.name}</span>
              <Tag style={{ borderRadius: 4, margin: 0 }}>外部</Tag>
            </div>
          </div>
          <Button type="primary" onClick={() => handleEditExternal(activeKB)}>编辑配置</Button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 40px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5EAF3', overflow: 'hidden' }}>
            {/* Basic Info */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F2F5' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1D2129', marginBottom: 16 }}>基本信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 4 }}>知识库名称</div>
                  <div style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 4 }}>状态</div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a' }} />可用
                  </span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 4 }}>描述</div>
                  <div style={{ fontSize: 13, color: '#1D2129' }}>{activeKB.desc}</div>
                </div>
              </div>
            </div>

            {/* API Config */}
            <div style={{ background: '#F8F9FB', padding: '14px 24px', borderBottom: '1px solid #F0F2F5', fontWeight: 600, fontSize: 14, color: '#1D2129' }}>API 配置</div>
            <div style={{ padding: '20px 24px', display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 6 }}>API Endpoint</div>
                <div style={{ background: '#F8F9FB', borderRadius: 6, border: '1px solid #E5EAF3', padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: '#3A4556', wordBreak: 'break-all' }}>
                  {activeKB.apiEndpoint || 'https://api.dify.ai/v1/retrieval'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 6 }}>API Key</div>
                <div style={{ background: '#F8F9FB', borderRadius: 6, border: '1px solid #E5EAF3', padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: '#3A4556' }}>
                  {activeKB.apiKey ? '●'.repeat(16) + (activeKB.apiKey.slice(-4) || 'xxxx') : 'sk-********************************'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 6 }}>外部知识库 ID</div>
                <div style={{ background: '#F8F9FB', borderRadius: 6, border: '1px solid #E5EAF3', padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: '#3A4556' }}>
                  {activeKB.externalKbId || '8454d87c707442279dd26f1113fa7965'}
                </div>
              </div>
            </div>

            {/* Recall Settings */}
            <div style={{ background: '#F8F9FB', padding: '14px 24px', borderBottom: '1px solid #F0F2F5', fontWeight: 600, fontSize: 14, color: '#1D2129' }}>召回设置</div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 32 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 8 }}>Top K</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <InputNumber value={activeKB.topK ?? 4} disabled style={{ width: 72 }} />
                    <Slider value={activeKB.topK ?? 4} min={1} max={10} disabled style={{ flex: 1 }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#7A8599', marginBottom: 8 }}>Score 阈值</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <InputNumber value={activeKB.score ?? 0.5} disabled step={0.01} style={{ width: 72 }} />
                    <Slider value={activeKB.score ?? 0.5} min={0} max={1} step={0.01} disabled style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════ Main Render ════════════════════
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {viewMode === 'list' ? renderListView() : (
        activeKB?.category === 'external' ? renderExternalDetail() : renderEasyProDetail()
      )}

      {/* Type Select Modal */}
      <TypeSelectModal
        open={typeSelectOpen}
        onSelect={handleTypeSelect}
        onCancel={() => setTypeSelectOpen(false)}
      />

      {/* Rename Modal */}
      <RenameModal
        open={renameOpen}
        currentName={renameTarget?.name || ''}
        onOk={handleRenameOk}
        onCancel={() => { setRenameOpen(false); setRenameTarget(null); }}
      />

      {/* Easy Create Drawer */}
      <EasyCreateDrawer
        open={easyDrawerOpen}
        onClose={() => setEasyDrawerOpen(false)}
        onSubmit={handleEasySubmit}
      />

      {/* Professional Create Drawer */}
      <ProfessionalCreateDrawer
        open={professionalDrawerOpen}
        onClose={() => setProfessionalDrawerOpen(false)}
        onSubmit={handleProfessionalSubmit}
      />

      {/* External KB Drawer */}
      <ExternalKBDrawer
        open={externalDrawerOpen}
        mode={externalDrawerMode}
        initialData={externalEditTarget}
        onClose={() => { setExternalDrawerOpen(false); setExternalEditTarget(null); }}
        onSubmit={handleExternalSubmit}
      />
    </div>
  );
};

export default KnowledgeBasePage;