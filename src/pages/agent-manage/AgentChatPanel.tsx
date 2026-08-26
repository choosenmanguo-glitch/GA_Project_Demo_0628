import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Input, Button, Tag, Modal, Select, Switch, Dropdown, Space, Tooltip, App as AntdApp,
  Upload, Popover,
} from 'antd';
import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  SettingOutlined,
  RightOutlined,
  DownOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  PaperClipOutlined,
  PushpinOutlined,
  PushpinFilled,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
  ApartmentOutlined,
  FormOutlined,
  ApiOutlined,
  LoadingOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  CloseOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
} from '@ant-design/icons';

// ════════════════════════════════════════════════
// 设计令牌（对齐平台视觉规范：主色 #1677ff / 背景 #f5f7fa / 文字 #1d2129 系）
// ════════════════════════════════════════════════

const DS = {
  primary: '#1677ff',
  primaryHover: '#4096ff',
  primaryLight: '#e6f4ff',
  primaryBg: '#f0f5ff',
  primaryBorder: '#91caff',
  bg: '#f5f7fa',
  white: '#ffffff',
  text: '#1d2129',
  textSec: '#4e5969',
  textTer: '#86909c',
  border: '#e8ebf0',
  divider: '#f0f0f0',
  green: '#52c41a',
  greenLight: '#f6ffed',
  orange: '#fa8c16',
  orangeLight: '#fff7e6',
  radius: 10,
  radiusSm: 8,
  radiusXs: 6,
  shadowHover: '0 4px 12px rgba(0,0,0,0.08)',
  mono: "'SF Mono', 'Menlo', 'Consolas', monospace",
};

const ellipsis = {
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

const clamp2 = {
  display: '-webkit-box' as const,
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden' as const,
};

// ════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════

/** 单个工具调用结果 */
interface ToolResult {
  name: string;
  request: string;
  response: string;
}

/** 工作流节点 */
interface WorkflowNode {
  name: string;
  duration: string;
  status: 'success' | 'running' | 'pending';
  /** 节点种类，用于匹配图标底色 */
  kind?: 'start' | 'llm' | 'reply' | 'tool' | 'code' | 'knowledge' | 'condition';
  icon?: React.ReactNode;
}

/** 助手回复由若干内容块交替组成：文本块 / 工具调用块 / 工作流追踪块 */
type Block =
  | { type: 'text'; text: string }
  | { type: 'tool'; label: string; tools: ToolResult[]; pending?: boolean }
  | { type: 'workflow'; nodes: WorkflowNode[] };

/** 对话附件（本地文件或文件链接） */
interface Attachment {
  uid: string;
  name: string;
  size?: number;
  /** 本地图片预览 dataURL，或文件链接 URL */
  url?: string;
  isImage: boolean;
  source: 'local' | 'url';
}

/** 助手回复引用的知识库文件（自主智能体：底部文件芯片列表） */
interface RefFile {
  name: string;
  /** 文件类型，决定图标；默认取文件名后缀 */
  ext?: string;
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  blocks?: Block[];
  thinking?: boolean;
  streaming?: boolean;
  time?: string;
  attachments?: Attachment[];
  refFiles?: RefFile[];
}

/** 对话页上传配置：仅支持图片格式 */
const UPLOAD_CONFIG = {
  acceptTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  maxSizeMB: 10,
  maxCount: 5,
};

const isImageExt = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/** 根据文件名后缀返回类型图标与主题色 */
const getRefFileIcon = (name: string) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return { Icon: FilePdfOutlined, color: '#f5222d' };
  if (ext === 'doc' || ext === 'docx') return { Icon: FileWordOutlined, color: '#1677ff' };
  return { Icon: FileOutlined, color: DS.textTer };
};

interface Conversation {
  id: string;
  title: string;
  time: string;
  messages: Msg[];
  pinned?: boolean;
}

interface AgentChatPanelProps {
  agent: {
    name: string;
    type: string;
    description?: string;
    modelName?: string;
    spaceName?: string;
  };
  onBack: () => void;
  chatEnabled?: boolean;
  remaining?: number;
  dailyLimit?: number;
  onSend?: () => void;
  /** 触发自动打开新对话设置的脉冲信号（递增触发） */
  openSettingsSignal?: number;
}

// ════════════════════════════════════════════════
// Mock 数据
// ════════════════════════════════════════════════

const WELCOME = '您好，我是「走失人员协查通报助手」。请提供走失人员的基本信息（姓名、性别、年龄、体貌特征、走失时间与地点），我将自主规划并生成标准格式的协查通报。';

const SUGGESTIONS = [
  '帮我生成一份走失人员协查通报',
  '分析这条走失警情的风险等级',
  '规划今日重点巡查区域',
];

const SUGGESTION_ICONS = [
  <FileTextOutlined key="file" />,
  <ThunderboltOutlined key="bolt" />,
  <EnvironmentOutlined key="env" />,
];

/** 最新回复下方的追问建议 */
const FOLLOWUP_SUGGESTIONS = [
  '通报里补充家属联系方式',
  '同步推送给周边巡查民警',
  '生成该人员的查找行动方案',
];

const FINAL_REPORT = '协查通报\n\n兹通报一起人员走失警情，请各单位协助查找：\n\n走失人员：王某，男，68岁\n体貌特征：身高约170cm，体型偏瘦，头发花白，患有轻度阿尔茨海默症，可能无法准确表述个人信息\n衣着特征：蓝色外套、黑色长裤、黑色布鞋\n走失时间：2026年6月24日 上午9时许\n走失地点：XX小区东门附近\n\n如有发现，请及时联系家属（张女士 138****2046）或拨打110。';

/** 助手回复引用的知识库文件（底部文件芯片列表） */
const DEMO_REF_FILES: RefFile[] = [
  { name: '公安机关协查通报文书制作规范.pdf' },
  { name: '走失人员查找与通报工作规程.docx' },
  { name: '协查通报信息发布管理办法.pdf' },
];

/** 最终回复的内容块（文本与工具调用交替） */
const DEMO_BLOCKS: Block[] = [
  { type: 'text', text: '收到，我先解析走失人员关键信息，并查询当前时间以确定通报时间基准。' },
  {
    type: 'tool',
    label: 'current_time',
    tools: [
      {
                        name: 'current_time',
                        request: '{"current_time": {}}',
                        response: '{"current_time": "2026-08-25 09:02:15"}',
      },
    ],
  },
  { type: 'text', text: '已确认当前时间。接下来检索走失地点周边的监控点位，辅助划定查找范围。' },
  {
    type: 'tool',
    label: 'monitor_query',
    tools: [
      {
        name: 'monitor_query',
        request: '{"location": "XX小区东门", "radius": 500}',
        response: '{"cameras": [{"id": "CAM-017", "address": "小区东门出入口"}, {"id": "CAM-022", "address": "东侧公交站"}]}',
      },
    ],
  },
  { type: 'text', text: '已获取周边监控点位。再核对走失人员的基础信息与家属联系方式。' },
  {
    type: 'tool',
    label: 'population_query',
    tools: [
      {
        name: 'population_query',
        request: '{"name": "王某", "age": 68}',
        response: '{"person": {"name": "王某", "gender": "男", "age": 68, "medical": "轻度阿尔茨海默症", "contact": "张女士 138****2046"}}',
      },
    ],
  },
  { type: 'text', text: '关键信息已核实。我先检索协查通报的制式规范，再按标准格式生成通报。' },
  {
    type: 'tool',
    label: 'knowledge_retrieve',
    tools: [
      {
        name: 'knowledge_retrieve',
        request: '{"query": "走失人员协查通报 制式规范 发布流程", "knowledge_bases": ["基层警务文书规范库", "人员协查工作规程库"], "top_k": 3}',
        response: '{"results": [{"doc": "公安机关协查通报文书制作规范.pdf#page=18", "score": 0.93}, {"doc": "走失人员查找与通报工作规程.docx#page=7", "score": 0.89}, {"doc": "协查通报信息发布管理办法.pdf#page=3", "score": 0.85}]}',
      },
    ],
  },
  { type: 'text', text: '已检索到协查通报制式规范相关材料，正在据此生成标准格式通报。' },
  {
    type: 'tool',
    label: 'report_builder',
    tools: [
      {
        name: 'report_builder',
        request: '{"template": "missing_person_bulletin", "person": "王某", "location": "XX小区东门", "time": "2026-06-24 09:00"}',
        response: '{"report_id": "BUL-20260825-0091", "status": "generated"}',
      },
    ],
  },
  { type: 'text', text: FINAL_REPORT },
];

/** 流程智能体 / 对话流：工作流执行后的回复 */
const WORKFLOW_FINAL = '你好！👋 很高兴见到你。\n\n我是「残疾人就业指导」助手，有什么我可以帮你的吗？无论是政策咨询、岗位推荐、技能培训，还是需要协助办理相关手续，都可以告诉我。\n\n你今天想聊点什么呢？😊';

const WORKFLOW_BLOCKS: Block[] = [
  {
    type: 'workflow',
    nodes: [
      { name: '开始', duration: '14.812 ms', status: 'success', kind: 'start', icon: <ApartmentOutlined /> },
      { name: 'LLM', duration: '1.119 s', status: 'success', kind: 'llm', icon: <RobotOutlined /> },
      { name: '直接回复', duration: '26.592 ms', status: 'success', kind: 'reply', icon: <FormOutlined /> },
    ],
  },
  { type: 'text', text: WORKFLOW_FINAL },
];

const DEMO_ANSWER_MSG: Msg = {
  id: 'demo-answer',
  role: 'assistant',
  content: FINAL_REPORT,
  blocks: DEMO_BLOCKS,
};

const HISTORY_CONVERSATIONS: Conversation[] = [
  {
    id: 'h1',
    title: '王某走失协查通报',
    time: '今天 09:42',
    messages: [
      { id: 'h1-u', role: 'user', content: '请帮我生成一份走失人员协查通报。走失人员王某，男，68岁，患有轻度阿尔茨海默症，今日上午9点在XX小区附近走失，穿蓝色外套、黑色长裤。' },
      DEMO_ANSWER_MSG,
    ],
  },
  {
    id: 'h2',
    title: '李某走失风险研判',
    time: '今天 08:15',
    messages: [
      { id: 'h2-u', role: 'user', content: '李某，女，7岁，在商场走失半小时，请评估风险并给出处置建议。' },
      {
        id: 'h2-a', role: 'assistant',
        content: '经研判，该走失为「低龄儿童+人员密集场所」情形，风险等级为「高」，建议立即启动以下处置：\n\n1. 通知商场广播寻人并调取监控；\n2. 通报就近巡逻警力到场；\n3. 通过「儿童走失快速寻回」机制联动。',
        plan: [
          { text: '识别走失人员类型与场景', state: 'done' },
          { text: '匹配风险研判模型', state: 'done' },
          { text: '生成处置建议', state: 'done' },
        ],
        toolCalls: [
          { name: '警情统计分析', done: true, time: '08:15:32' },
          { name: 'risk_assessment:analyze', done: true, time: '08:15:35' },
        ],
      },
    ],
  },
  {
    id: 'h3',
    title: '张先生寻人启事',
    time: '昨天 17:30',
    messages: [
      { id: 'h3-u', role: 'user', content: '帮张先生写一份寻人启事，走失者为张先生父亲，75岁。' },
      {
        id: 'h3-a', role: 'assistant',
        content: '寻人启事已生成，请核对走失者衣着、病史等关键信息后发布。',
        plan: [{ text: '生成寻人启事', state: 'done' }],
        toolCalls: [],
      },
    ],
  },
  {
    id: 'h4',
    title: '陈某走失协查通报',
    time: '昨天 14:08',
    messages: [
      { id: 'h4-u', role: 'user', content: '陈某，男，45岁，在火车站附近走失，有智力障碍。' },
      { id: 'h4-a', role: 'assistant', content: '协查通报已生成，建议同步铁路公安与救助站。' },
    ],
  },
  {
    id: 'h5',
    title: '赵某老人走失查找',
    time: '昨天 10:22',
    messages: [
      { id: 'h5-u', role: 'user', content: '赵某，女，82岁，上午从养老院外出未归。' },
      { id: 'h5-a', role: 'assistant', content: '已规划查找方案，建议优先排查周边公交站与监控。' },
    ],
  },
  {
    id: 'h6',
    title: '周姓儿童公园走失',
    time: '08-23 16:40',
    messages: [
      { id: 'h6-u', role: 'user', content: '周某，男，5岁，在人民公园与家人走散。' },
      { id: 'h6-a', role: 'assistant', content: '已生成儿童走失处置方案，请立即联系公园管理处广播。' },
    ],
  },
  {
    id: 'h7',
    title: '黄某精神障碍人员走失',
    time: '08-22 09:15',
    messages: [
      { id: 'h7-u', role: 'user', content: '黄某，男，38岁，有精神病史，昨晚未归。' },
      { id: 'h7-a', role: 'assistant', content: '协查通报已生成，并标注需重点关注的病史信息。' },
    ],
  },
];

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ════════════════════════════════════════════════
// 辅助组件
// ════════════════════════════════════════════════

/** 工具调用块：简洁文字行，点击展开查看请求/响应（上下排列） */
const ToolBlock: React.FC<{ block: Extract<Block, { type: 'tool' }> }> = ({ block }) => {
  const [open, setOpen] = useState(false);
  const t = block.tools[0];
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 0', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <DownOutlined style={{
          fontSize: 9, color: DS.textTer,
          transition: 'transform .2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
        <span style={{ fontSize: 13, color: DS.textTer }}>
          已使用 <span style={{ fontFamily: DS.mono, color: DS.textSec }}>{t.name}</span>
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: DS.textTer, marginBottom: 3 }}>请求</div>
          <pre style={{
            margin: '0 0 10px', padding: '8px 10px', borderRadius: 6,
            background: DS.bg, fontSize: 12, lineHeight: '18px', fontFamily: DS.mono,
            color: DS.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>{t.request}</pre>
          <div style={{ fontSize: 11, color: DS.textTer, marginBottom: 3 }}>响应</div>
          <pre className="chat-scroll" style={{
            margin: 0, padding: '8px 10px', borderRadius: 6,
            background: DS.bg, fontSize: 12, lineHeight: '18px', fontFamily: DS.mono,
            color: DS.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            maxHeight: 240, overflow: 'auto',
          }}>{t.response}</pre>
        </div>
      )}
    </div>
  );
};

/** 工作流节点清单：默认收起，点击展开查看各节点耗时与状态（与工具调用块一致的简洁文字样式） */
const WorkflowTrace: React.FC<{ block: Extract<Block, { type: 'workflow' }> }> = ({ block }) => {
  const [open, setOpen] = useState(false);
  const total = block.nodes.length;
  const done = block.nodes.filter(n => n.status === 'success').length;
  const running = block.nodes.some(n => n.status === 'running');
  return (
    <div style={{ marginBottom: 12 }}>
      {/* 折叠态：纯文字行 */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 0', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <DownOutlined style={{
          fontSize: 9, color: DS.textTer,
          transition: 'transform .2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
        <span style={{ fontSize: 13, color: DS.textTer }}>
          {running ? '工作流执行中' : '工作流已完成'}（{done}/{total}）
        </span>
      </div>
      {/* 展开态：节点清单 */}
      {open && (
        <div style={{ marginTop: 8 }}>
          {block.nodes.map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6, background: DS.bg,
              marginBottom: i === block.nodes.length - 1 ? 0 : 6,
            }}>
              <span style={{ fontSize: 13, color: DS.textSec, flex: 1 }}>{n.name}</span>
              <span style={{ fontSize: 12, color: DS.textTer, fontFamily: DS.mono }}>{n.duration}</span>
              {n.status === 'success' && <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />}
              {n.status === 'running' && <LoadingOutlined style={{ color: DS.primary, fontSize: 12 }} />}
              {n.status === 'pending' && <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${DS.border}` }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** 思考中：三点跳动动画 */
const ThinkingBlock: React.FC<{ text?: string }> = ({ text = '正在思考…' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 14 }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="chat-typing-dot" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
    <span style={{ fontSize: 13, color: DS.textSec }}>{text}</span>
  </div>
);

/** 附件卡片：图片显示缩略图，文档显示图标；可选择带移除按钮 */
const FileChip: React.FC<{
  file: Attachment;
  onRemove?: () => void;
  inBubble?: boolean;
}> = ({ file, onRemove, inBubble }) => {
  if (file.isImage && file.url) {
    return (
      <div style={{
        position: 'relative', width: 64, height: 64, borderRadius: 8,
        overflow: 'hidden', flexShrink: 0,
        border: inBubble ? '1.5px solid rgba(255,255,255,0.6)' : `1px solid ${DS.border}`,
        background: DS.bg,
      }}>
        <img src={file.url} alt={file.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {onRemove && (
          <span onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute', top: 2, right: 2, width: 16, height: 16,
              borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, cursor: 'pointer', lineHeight: 1,
            }}><CloseOutlined /></span>
        )}
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: 220,
      padding: '6px 10px', borderRadius: 8,
      background: inBubble ? 'rgba(255,255,255,0.18)' : DS.primaryLight,
      border: inBubble ? '1px solid rgba(255,255,255,0.35)' : `1px solid ${DS.primaryBorder}`,
      color: inBubble ? '#fff' : DS.text, flexShrink: 0,
    }}>
      <FileOutlined style={{ fontSize: 15, color: inBubble ? '#fff' : DS.primary, flexShrink: 0 }} />
      <span style={{ fontSize: 12, lineHeight: '18px', ...ellipsis }}>{file.name}</span>
      {file.size ? (
        <span style={{ fontSize: 11, color: inBubble ? 'rgba(255,255,255,0.75)' : DS.textTer, flexShrink: 0 }}>
          {formatFileSize(file.size)}
        </span>
      ) : null}
      {onRemove && (
        <CloseOutlined onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ fontSize: 11, cursor: 'pointer', color: inBubble ? 'rgba(255,255,255,0.8)' : DS.textTer, flexShrink: 0 }} />
      )}
    </div>
  );
};

/** 用户消息：渐变气泡 + 头像 */
const UserMessage: React.FC<{ msg: Msg }> = ({ msg }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: '78%' }}>
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8,
          paddingRight: 44,
        }}>
          {msg.attachments.map(f => <FileChip key={f.uid} file={f} inBubble />)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {msg.content && (
          <div style={{
            padding: '11px 16px', borderRadius: '14px 14px 4px 14px', background: DS.primary,
            color: '#fff', fontSize: 14, lineHeight: '23px',
          }}>{msg.content}</div>
        )}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: DS.primary,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}><UserOutlined /></div>
      </div>
      {msg.time && <span style={{ fontSize: 11, color: DS.textTer, marginRight: 44 }}>{msg.time}</span>}
    </div>
  </div>
);

/** 助手消息底部：引用文件列表（自主智能体风格，区别于标准智能体的行内引号 + 引用材料抽屉） */
const ReferenceFiles: React.FC<{ files: RefFile[] }> = ({ files }) => {
  // 超过 2 个时默认收起，仅展示前 2 个；点击展开/收起
  const [expanded, setExpanded] = useState(false);
  if (!files || files.length === 0) return null;
  const collapsible = files.length > 2;
  const visible = expanded || !collapsible ? files : files.slice(0, 2);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: DS.textTer, flexShrink: 0 }}>引用</span>
        <span style={{ flex: 1, height: 1, background: DS.divider }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {visible.map((f, i) => {
          const { Icon, color } = getRefFileIcon(f.name);
          return (
            <span key={i}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                maxWidth: 260, padding: '5px 10px', borderRadius: 8,
                fontSize: 13, color: DS.textSec, background: DS.bg,
                border: `1px solid ${DS.border}`,
              }}>
              <Icon style={{ color, fontSize: 15, flexShrink: 0 }} />
              <span style={{ ...ellipsis }}>{f.name}</span>
            </span>
          );
        })}
        {collapsible && (
          <span onClick={() => setExpanded(e => !e)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 30, borderRadius: 8, cursor: 'pointer',
              color: DS.textTer, background: DS.bg, border: `1px solid ${DS.border}`,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = DS.text; e.currentTarget.style.borderColor = DS.primaryBorder; }}
            onMouseLeave={e => { e.currentTarget.style.color = DS.textTer; e.currentTarget.style.borderColor = DS.border; }}>
            <DownOutlined style={{ fontSize: 11, transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
          </span>
        )}
      </div>
    </div>
  );
};

/** 助手消息：无边框内容 + 悬浮操作栏（点赞/点踩/复制/重新生成）+ 最新回复追问 */
const AssistantMessage: React.FC<{
  msg: Msg;
  isLatest?: boolean;
  onFollowup?: (text: string) => void;
  onRegenerate?: () => void;
  agentType?: string;
}> = ({ msg, isLatest, onFollowup, onRegenerate, agentType }) => {
  const [hovered, setHovered] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const { message } = AntdApp.useApp();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动选择复制');
    }
  };

  const actionBtn = (icon: React.ReactNode, tip: string, onClick: () => void, active?: boolean) => (
    <Tooltip title={tip} mouseEnterDelay={0.2}>
      <span
        onClick={onClick}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
          color: active ? DS.primary : DS.textTer, fontSize: 14,
          transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = DS.bg; e.currentTarget.style.color = active ? DS.primary : DS.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? DS.primary : DS.textTer; }}
      >{icon}</span>
    </Tooltip>
  );

  if (msg.thinking) {
    return (
      <div style={{ display: 'flex', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '88%' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: DS.primaryLight,
            color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0, border: `1px solid ${DS.primaryBorder}`,
          }}><RobotOutlined /></div>
          <div style={{ paddingTop: 8 }}><ThinkingBlock text={agentType === '流程智能体' ? '工作流执行中…' : '正在自主规划任务，调用工具…'} /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', marginBottom: isLatest ? 16 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '88%' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: DS.primaryLight,
          color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, border: `1px solid ${DS.primaryBorder}`,
        }}><RobotOutlined /></div>
        <div
          style={{ flex: 1, minWidth: 0, paddingTop: 4 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {msg.blocks && msg.blocks.length > 0 ? (
            msg.blocks.map((b, i) => {
              if (b.type === 'text') {
                return <div key={i} style={{ fontSize: 14, color: DS.text, lineHeight: '24px', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{b.text}</div>;
              }
              if (b.type === 'workflow') return <WorkflowTrace key={i} block={b} />;
              return <ToolBlock key={i} block={b} />;
            })
          ) : (
            <div style={{ fontSize: 14, color: DS.text, lineHeight: '24px', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          )}

          {/* 悬浮操作栏（流式输出结束后才出现） */}
          {!msg.streaming && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2, marginTop: 6,
            opacity: hovered ? 1 : 0, transition: 'opacity .2s',
          }}>
            {actionBtn(<LikeOutlined />, '赞', () => setFeedback(feedback === 'like' ? null : 'like'), feedback === 'like')}
            {actionBtn(<DislikeOutlined />, '踩', () => setFeedback(feedback === 'dislike' ? null : 'dislike'), feedback === 'dislike')}
            <span style={{ width: 1, height: 14, background: DS.divider, margin: '0 4px' }} />
            {actionBtn(<CopyOutlined />, '复制', handleCopy)}
            {actionBtn(<ReloadOutlined />, '重新生成', () => onRegenerate?.())}
            {msg.time && (
              <span style={{ fontSize: 11, color: DS.textTer, marginLeft: 8 }}>{msg.time}</span>
            )}
          </div>
          )}

          {/* 引用文件列表（流式输出结束后才出现） */}
          {!msg.streaming && msg.refFiles && msg.refFiles.length > 0 && (
            <ReferenceFiles files={msg.refFiles} />
          )}

          {/* 最新回复：追问建议 */}
          {isLatest && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ flex: 1, height: 1, background: DS.divider }} />
                <span style={{ fontSize: 12, color: DS.textTer, flexShrink: 0 }}>试着问问</span>
                <span style={{ flex: 1, height: 1, background: DS.divider }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLLOWUP_SUGGESTIONS.map((s, i) => (
                  <span key={i}
                    onClick={() => onFollowup?.(s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 999, fontSize: 13, color: DS.primary,
                      background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#d6e4ff';
                      e.currentTarget.style.borderColor = DS.primary;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = DS.primaryLight;
                      e.currentTarget.style.borderColor = DS.primaryBorder;
                    }}
                  >{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// 主组件
// ════════════════════════════════════════════════

export default function AgentChatPanel({
  agent, onBack, chatEnabled, remaining, dailyLimit, onSend, openSettingsSignal,
}: AgentChatPanelProps) {
  const [activeId, setActiveId] = useState<string>('new');
  const [conversations, setConversations] = useState<Conversation[]>(HISTORY_CONVERSATIONS);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [allHistoryOpen, setAllHistoryOpen] = useState(false);
  const [allHistoryKeyword, setAllHistoryKeyword] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [vars, setVars] = useState({ type: '协查通报', scope: '全市', urgency: '普通', withPhoto: false });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const { message: antMessage } = AntdApp.useApp();

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 收到脉冲信号时打开新对话设置（用于进入对话后自动弹出）
  useEffect(() => {
    if (openSettingsSignal && openSettingsSignal > 0) {
      setNewChatOpen(true);
    }
  }, [openSettingsSignal]);

  // 侧栏历史：置顶优先，按日期分组，仅展示最近 5 条，更多在"全部"中查看
  const groupedConversations = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    const list = sorted.slice(0, 5);
    const pinned = list.filter(c => c.pinned);
    const today = list.filter(c => !c.pinned && c.time.startsWith('今天'));
    const yesterday = list.filter(c => !c.pinned && c.time.startsWith('昨天'));
    const earlier = list.filter(c => !c.pinned && !c.time.startsWith('今天') && !c.time.startsWith('昨天'));
    return [
      ...(pinned.length ? [{ label: '置顶', items: pinned }] : []),
      ...(today.length ? [{ label: '今天', items: today }] : []),
      ...(yesterday.length ? [{ label: '昨天', items: yesterday }] : []),
      ...(earlier.length ? [{ label: '更早', items: earlier }] : []),
    ];
  }, [conversations]);

  // 全部历史弹窗：置顶优先，按关键词过滤后分组
  const groupedAllConversations = useMemo(() => {
    const kw = allHistoryKeyword.trim().toLowerCase();
    const filtered = conversations.filter(c => !kw || c.title.toLowerCase().includes(kw));
    const sorted = [...filtered].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    const pinned = sorted.filter(c => c.pinned);
    const today = sorted.filter(c => !c.pinned && c.time.startsWith('今天'));
    const yesterday = sorted.filter(c => !c.pinned && c.time.startsWith('昨天'));
    const earlier = sorted.filter(c => !c.pinned && !c.time.startsWith('今天') && !c.time.startsWith('昨天'));
    return [
      ...(pinned.length ? [{ label: '置顶', items: pinned }] : []),
      ...(today.length ? [{ label: '今天', items: today }] : []),
      ...(yesterday.length ? [{ label: '昨天', items: yesterday }] : []),
      ...(earlier.length ? [{ label: '更早', items: earlier }] : []),
    ];
  }, [conversations, allHistoryKeyword]);

  const switchConversation = (c: Conversation | null) => {
    if (!c) {
      setActiveId('new');
      setMessages([]);
      return;
    }
    setActiveId(c.id);
    setMessages(c.messages);
  };

  // 对话操作：重命名、置顶、删除
  const startRename = (c: Conversation) => {
    setRenamingId(c.id);
    setRenameValue(c.title);
  };
  const commitRename = () => {
    const val = renameValue.trim();
    if (renamingId && val) {
      setConversations(prev => prev.map(c => c.id === renamingId ? { ...c, title: val } : c));
    }
    setRenamingId(null);
    setRenameValue('');
  };
  const togglePin = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };
  const deleteConversation = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = () => {
    if (!deleteId) return;
    const id = deleteId;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setActiveId('new');
      setMessages([]);
    }
    setDeleteId(null);
  };

  // 将一次助手回复以"文本/工具调用交替"的方式逐步追加到消息中，模拟真实 Agent 执行
  const streamAssistantAnswer = (assistantId: string, targetConvId: string) => {
    const isWorkflow = agent.type === '流程智能体';
    const blocks = isWorkflow ? WORKFLOW_BLOCKS : DEMO_BLOCKS;
    const finalContent = isWorkflow ? WORKFLOW_FINAL : FINAL_REPORT;
    let acc: Block[] = [];
    blocks.forEach((block, idx) => {
      const delay = 500 + idx * 700;
      setTimeout(() => {
        acc = [...acc, block];
        setMessages(prev => {
          const updated = prev.map(m => m.id === assistantId
            ? { ...m, thinking: false, streaming: true, blocks: acc, content: '', time: nowTime() }
            : m);
          if (targetConvId !== 'new') {
            setConversations(cprev => cprev.map(c => c.id === targetConvId ? { ...c, messages: updated } : c));
          }
          return updated;
        });
      }, delay);
    });
    // 收尾：标记完成并设置 content（用于复制与无 blocks 兜底）
    setTimeout(() => {
      // 若本次回复中包含知识库检索工具调用，则挂载引用文件列表
      const usedKb = acc.some(b => b.type === 'tool' && b.tools?.some(t => t.name === 'knowledge_retrieve'));
      setMessages(prev => {
        const updated = prev.map(m => m.id === assistantId
          ? { ...m, thinking: false, streaming: false, blocks: acc, content: finalContent, time: nowTime(), refFiles: usedKb ? DEMO_REF_FILES : undefined }
          : m);
        if (targetConvId !== 'new') {
          setConversations(cprev => cprev.map(c => c.id === targetConvId ? { ...c, messages: updated } : c));
        }
        return updated;
      });
    }, 500 + blocks.length * 700 + 200);
  };

  // ── 附件处理：本地文件校验 + 图片预览 / 文件链接 ──
  const addAttachment = (file: Attachment) => {
    setAttachments(prev => prev.some(f => f.uid === file.uid) ? prev : [...prev, file]);
  };
  const removeAttachment = (uid: string) => {
    setAttachments(prev => prev.filter(f => f.uid !== uid));
  };

  const beforeLocalUpload = (file: File) => {
    acceptLocalFile(file, attachments.length);
    return false; // 阻止自动上传
  };

  /** 校验并接收本地文件（上传 / 粘贴共用） */
  const acceptLocalFile = (file: File, currentCount: number): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeOk = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type);
    if (!UPLOAD_CONFIG.acceptTypes.includes(ext) && !mimeOk) {
      antMessage.error(`仅支持 ${UPLOAD_CONFIG.acceptTypes.join('、').toUpperCase()} 图片格式`);
      return false;
    }
    if (file.size > UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
      antMessage.error(`文件大小不能超过 ${UPLOAD_CONFIG.maxSizeMB}MB`);
      return false;
    }
    if (currentCount >= UPLOAD_CONFIG.maxCount) {
      antMessage.error(`最多上传 ${UPLOAD_CONFIG.maxCount} 个文件`);
      return false;
    }
    const att: Attachment = {
      uid: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: file.name, size: file.size, isImage: isImageExt(file.name) || file.type.startsWith('image/'),
      source: 'local',
    };
    if (att.isImage) {
      const reader = new FileReader();
      reader.onload = () => { att.url = reader.result as string; addAttachment({ ...att }); };
      reader.readAsDataURL(file);
    } else {
      addAttachment(att);
    }
    return true;
  };

  /** 输入框粘贴文件 */
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files || []);
    if (files.length === 0) return;
    e.preventDefault();
    let count = attachments.length;
    files.forEach(file => {
      if (acceptLocalFile(file, count)) count += 1;
    });
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) {
        antMessage.error('请输入有效的 http/https 文件链接');
        return;
      }
      const name = decodeURIComponent(u.pathname.split('/').pop() || u.hostname) || '链接文件';
      addAttachment({
        uid: 'url-' + Date.now(),
        name, url, isImage: isImageExt(name), source: 'url',
      });
      setLinkUrl('');
      setUploadOpen(false);
    } catch {
      antMessage.error('请输入有效的文件链接');
    }
  };

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content && attachments.length === 0) return;
    const userMsg: Msg = {
      id: Date.now().toString(), role: 'user', content, time: nowTime(),
      attachments: attachments.length ? attachments : undefined,
    };
    const assistantId = (Date.now() + 1).toString();
    const thinking: Msg = { id: assistantId, role: 'assistant', content: '', thinking: true, streaming: true };

    // 首次提问：以用户首条消息作为对话名称，创建新对话
    let targetId = activeId;
    if (activeId === 'new') {
      const newId = 'c-' + Date.now();
      const rawTitle = content || (attachments[0] ? `[附件] ${attachments[0].name}` : '新对话');
      const title = rawTitle.length > 18 ? rawTitle.slice(0, 18) + '…' : rawTitle;
      const newConv: Conversation = {
        id: newId,
        title,
        time: '今天 ' + nowTime(),
        messages: [userMsg, thinking],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveId(newId);
      setMessages([userMsg, thinking]);
      targetId = newId;
    } else {
      const nextMessages = [...messages, userMsg, thinking];
      setMessages(nextMessages);
      setConversations(prev => prev.map(c => c.id === targetId ? { ...c, messages: nextMessages } : c));
    }
    setInput('');
    setAttachments([]);
    onSend?.();

    streamAssistantAnswer(assistantId, targetId);
  };

  // 重新生成某条助手回复
  const regenerateAnswer = (assistantId: string) => {
    setMessages(prev => prev.map(m => m.id === assistantId
      ? { ...m, thinking: true, streaming: true, content: '', blocks: undefined, refFiles: undefined }
      : m));
    streamAssistantAnswer(assistantId, activeId);
  };

  const startNewChat = () => {
    setNewChatOpen(false);
    setActiveId('new');
    setMessages([]);
  };

  const disabled = chatEnabled && (remaining ?? 0) <= 0;
  const lowRemaining = chatEnabled && (remaining ?? 0) <= 2 && (remaining ?? 0) > 0;

  // 获取当前对话标题
  const currentTitle = activeId === 'new'
    ? '新对话'
    : conversations.find(c => c.id === activeId)?.title || '对话';

  return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 动画定义：思考中三点跳动 */}
        <style>{`
          .chat-typing-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: ${DS.primary};
            animation: chat-dot-bounce 1.2s infinite ease-in-out;
          }
          @keyframes chat-dot-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
            40% { transform: translateY(-4px); opacity: 1; }
          }
          .chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
          .chat-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.15); border-radius: 999px;
          }
          .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
          .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        `}</style>

        {/* ──── 顶部栏 ──── */}
        <div style={{
          flexShrink: 0, paddingBottom: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}
              style={{ color: DS.textSec, fontSize: 14, padding: '4px 8px' }} />
            <span style={{ fontSize: 16, fontWeight: 650, color: DS.text }}>智能体对话</span>
          </div>
          {chatEnabled && (
            <Tooltip
              placement="bottomRight"
              title={
                <div style={{ lineHeight: '20px' }}>
                  <div style={{ marginBottom: 4 }}>配额说明：</div>
                  <div>• 用于开发中心的测试调用，每日限额 {dailyLimit} 次</div>
                  <div>• 每发送一条消息消耗 1 次</div>
                  <div>• 次日 0 点自动重置</div>
                  <div>• 发布到门户后正常使用不受限</div>
                </div>
              }
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999,
                background: lowRemaining ? DS.orangeLight : DS.primaryBg,
                color: lowRemaining ? DS.orange : DS.primary,
                fontSize: 13, fontWeight: 500, cursor: 'help',
              }}>
                <ClockCircleOutlined style={{ fontSize: 13 }} />
                今日剩余 {remaining}/{dailyLimit} 次
              </div>
            </Tooltip>
          )}
        </div>

        {/* ──── 卡片容器：包裹嵌入的对话页面 ──── */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', background: DS.white,
          borderRadius: DS.radius, border: `1px solid ${DS.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>

          {/* ──── 左侧栏 ──── */}
          <aside style={{
            width: sidebarOpen ? 280 : 0, minWidth: 0, background: DS.white,
            borderRight: sidebarOpen ? `1px solid ${DS.divider}` : 'none',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transition: 'width .25s ease, border-color .25s',
          }}>
            {/* 智能体信息卡片 */}
        <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${DS.divider}`, width: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: DS.primaryLight,
              color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 600, flexShrink: 0,
            }}>{agent.name.charAt(0)}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 650, color: DS.text, ...ellipsis }}>{agent.name}</div>
              <Space size={4} style={{ marginTop: 4 }}>
                <Tag color="geekblue" style={{ margin: 0, borderRadius: 4, fontSize: 11, lineHeight: '18px' }}>{agent.type}</Tag>
              </Space>
            </div>
          </div>
          {agent.description && (
            <div style={{
              fontSize: 12, color: DS.textSec, lineHeight: '18px', marginTop: 10, ...clamp2,
            }}>{agent.description}</div>
          )}
        </div>

        {/* 新建对话 */}
        <div style={{ padding: '12px 16px' }}>
          <Button type="primary" block icon={<PlusOutlined />} onClick={() => setNewChatOpen(true)}
            style={{ borderRadius: DS.radiusXs, fontWeight: 600, height: 36 }}>新建对话</Button>
        </div>

        {/* 历史对话 */}
        <div style={{
          padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: DS.textTer, letterSpacing: 0.3 }}>
            历史对话
            <span style={{ marginLeft: 6 }}>{conversations.length}</span>
          </span>
          <Button type="text" size="small" onClick={() => setAllHistoryOpen(true)}
            style={{ fontSize: 12, color: DS.primary, padding: '0 4px', height: 20 }}>
            查看全部
          </Button>
        </div>
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
          {groupedConversations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: DS.textTer, fontSize: 12 }}>
              暂无历史对话
            </div>
          )}
          {groupedConversations.map(group => (
            <div key={group.label}>
              <div style={{ padding: '10px 8px 4px', fontSize: 11, color: DS.textTer }}>{group.label}</div>
              {group.items.map(c => {
                const active = activeId === c.id;
                return (
                  <div key={c.id}
                    onClick={() => switchConversation(c)}
                    className="hist-item"
                    style={{
                      position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                      background: active ? DS.primaryLight : 'transparent',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.bg; const op = e.currentTarget.querySelector<HTMLElement>('.hist-ops'); if (op) op.style.opacity = '1'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; const op = e.currentTarget.querySelector<HTMLElement>('.hist-ops'); if (op) op.style.opacity = '0'; }}
                  >
                    {c.pinned && (
                      <PushpinFilled style={{ color: DS.primary, fontSize: 11, flexShrink: 0, transform: 'rotate(-30deg)' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, color: active ? DS.primary : DS.text,
                        fontWeight: active ? 500 : 400, ...ellipsis,
                      }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: DS.textTer, marginTop: 1, display: 'flex', gap: 6 }}>
                        <span>{c.time}</span>
                        <span>· {c.messages.length} 次对话</span>
                      </div>
                    </div>
                    <Dropdown
                      trigger={['click']}
                      placement="bottomRight"
                      menu={{
                        items: [
                          { key: 'rename', icon: <EditOutlined />, label: '重命名' },
                          { key: 'pin', icon: <PushpinOutlined />, label: c.pinned ? '取消置顶' : '置顶' },
                          { type: 'divider' },
                          { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
                        ],
                        onClick: ({ key, domEvent }) => {
                          domEvent.stopPropagation();
                          if (key === 'rename') startRename(c);
                          if (key === 'pin') togglePin(c.id);
                          if (key === 'delete') deleteConversation(c.id);
                        },
                      }}
                    >
                      <span className="hist-ops" onClick={e => e.stopPropagation()}
                        style={{
                          opacity: active ? 1 : 0, transition: 'opacity .15s',
                          padding: 4, borderRadius: 6, color: DS.textTer, fontSize: 13, flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center',
                        }}>
                        <MoreOutlined />
                      </span>
                    </Dropdown>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ──── 主对话区 ──── */}
      <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DS.white }}>
        {/* 对话标题栏 */}
        <div style={{
          height: 56, flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'center',
          gap: 10, background: 'transparent',
        }}>
          <Tooltip title={sidebarOpen ? '收起侧栏' : '展开侧栏'} mouseEnterDelay={0.3}>
            <Button
              type="text" size="small"
              icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setSidebarOpen(o => !o)}
              style={{ color: DS.textTer, marginRight: 4 }}
            />
          </Tooltip>
          {renamingId === activeId ? (
            <span style={{ fontSize: 15, fontWeight: 650, color: DS.text }}>{currentTitle}</span>
          ) : (
            <Tooltip title={activeId === 'new' ? '' : '点击重命名'} mouseEnterDelay={0.5}>
              <span
                onClick={() => { if (activeId !== 'new') { const c = conversations.find(x => x.id === activeId); if (c) startRename(c); } }}
                style={{
                  fontSize: 15, fontWeight: 650, color: DS.text, cursor: activeId === 'new' ? 'default' : 'pointer',
                }}
              >{currentTitle}</span>
            </Tooltip>
          )}
        </div>

        {/* 对话记录区 */}
        <div ref={bodyRef} className="chat-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {messages.length === 0 ? (
              /* 空状态：欢迎页 */
              <div style={{ paddingTop: '7vh' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18, background: DS.primaryLight,
                    color: DS.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                  }}><RobotOutlined /></div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: DS.text, marginTop: 16 }}>{agent.name}</div>
                  <div style={{ fontSize: 13, color: DS.textSec, marginTop: 6 }}>
                    具备自主规划与工具调用能力，可分解复杂目标为子任务逐步执行
                  </div>
                </div>

                {/* 欢迎语 */}
                <div style={{
                  marginTop: 24, padding: '14px 18px', borderRadius: DS.radiusSm, background: DS.white,
                  border: `1px solid ${DS.divider}`, fontSize: 14, color: DS.text, lineHeight: '24px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}>{WELCOME}</div>

                {/* 建议问题 */}
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 13, color: DS.textTer, fontWeight: 600, marginBottom: 10 }}>你可以这样提问</div>
                  {SUGGESTIONS.map((s, i) => (
                    <div key={i} onClick={() => handleSend(s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        borderRadius: DS.radiusSm, background: DS.white,
                        border: `1px solid ${DS.divider}`, cursor: 'pointer', fontSize: 13, color: DS.text,
                        marginBottom: 8, transition: 'all .15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = DS.primaryBorder;
                        e.currentTarget.style.background = '#fafcff';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = DS.divider;
                        e.currentTarget.style.background = DS.white;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8, background: DS.primaryLight,
                        color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, flexShrink: 0,
                      }}>{SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]}</span>
                      <span style={{ flex: 1 }}>{s}</span>
                      <RightOutlined style={{ fontSize: 12, color: DS.textTer }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 消息列表 */
              messages.map((m, idx) => m.role === 'user'
                ? <UserMessage key={m.id} msg={m} />
                : (
                  <AssistantMessage
                    key={m.id}
                    msg={m}
                    isLatest={!m.thinking && !m.streaming && idx === messages.length - 1}
                    onFollowup={handleSend}
                    onRegenerate={() => regenerateAnswer(m.id)}
                    agentType={agent.type}
                  />
                ))
            )}
          </div>
        </div>

        {/* 输入区 */}
        <div style={{ flexShrink: 0, padding: '14px 24px 16px', background: DS.white }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{
              border: `1.5px solid ${inputFocused ? DS.primary : DS.border}`,
              borderRadius: 14, background: DS.white, padding: '10px 10px 8px 16px',
              boxShadow: inputFocused
                ? '0 0 0 3px rgba(22,119,255,0.08), 0 2px 8px rgba(0,0,0,0.04)'
                : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all .2s',
            }}>
              {attachments.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8,
                  padding: '4px 2px 0',
                }}>
                  {attachments.map(f => (
                    <FileChip key={f.uid} file={f} onRemove={() => removeAttachment(f.uid)} />
                  ))}
                </div>
              )}
              <Input.TextArea
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={disabled ? '今日使用次数已用完' : '输入消息，与智能体开始对话…'}
                autoSize={{ minRows: 1, maxRows: 5 }}
                disabled={disabled}
                variant="borderless"
                style={{ resize: 'none', fontSize: 14, lineHeight: '22px' }}
                onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onPaste={handlePaste}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div
                    onClick={() => setNewChatOpen(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: DS.textSec,
                      cursor: 'pointer', padding: '4px 10px', borderRadius: 999,
                      background: DS.bg, border: `1px solid ${DS.border}`,
                      transition: 'all .15s', maxWidth: 260, flexShrink: 1,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = DS.primary;
                      e.currentTarget.style.background = DS.primaryLight;
                      e.currentTarget.style.borderColor = DS.primaryBorder;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = DS.textSec;
                      e.currentTarget.style.background = DS.bg;
                      e.currentTarget.style.borderColor = DS.border;
                    }}
                  >
                    <SettingOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                    <span style={ellipsis}>
                      {vars.type} · {vars.scope} · {vars.urgency}{vars.withPhoto ? ' · 附照片' : ''}
                    </span>
                  </div>
                  {agent.modelName && agent.type !== '流程智能体' && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
                      color: DS.textTer, maxWidth: 200, flexShrink: 1,
                    }}>
                      <ThunderboltOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                      <span style={ellipsis}>{agent.modelName}</span>
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <Popover
                    trigger="click"
                    open={uploadOpen}
                    onOpenChange={setUploadOpen}
                    placement="top"
                    overlayStyle={{ width: 340 }}
                    content={(
                      <div style={{ margin: -4, width: 320 }}>
                        {/* 上传方式1：文件链接 */}
                        <div style={{ fontSize: 12, color: DS.textTer, marginBottom: 8, fontWeight: 500 }}>
                          上传方式1：输入文件链接并提取
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Input
                            size="small"
                            placeholder="链接输入框"
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            onPressEnter={handleAddLink}
                            prefix={<LinkOutlined style={{ color: DS.textTer }} />}
                            style={{ borderRadius: DS.radiusXs, flex: 1 }}
                          />
                          <Button
                            size="small"
                            type="primary"
                            onClick={handleAddLink}
                            style={{ borderRadius: DS.radiusXs }}
                          >提取</Button>
                        </div>

                        {/* 上传方式2：本地上传 */}
                        <div style={{ fontSize: 12, color: DS.textTer, margin: '16px 0 8px', fontWeight: 500 }}>
                          上传方式2：从本地上传
                        </div>
                        <Upload
                          beforeUpload={beforeLocalUpload}
                          showUploadList={false}
                          multiple
                          accept="image/*"
                          disabled={attachments.length >= UPLOAD_CONFIG.maxCount}
                        >
                          <div
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                              width: '100%', padding: '14px 16px', borderRadius: DS.radiusSm,
                              border: `1px solid ${DS.border}`, background: DS.white,
                              color: DS.primary, fontSize: 14, fontWeight: 500,
                              letterSpacing: 2,
                              cursor: attachments.length >= UPLOAD_CONFIG.maxCount ? 'not-allowed' : 'pointer',
                              transition: 'all .15s',
                            }}
                            onMouseEnter={e => {
                              if (attachments.length >= UPLOAD_CONFIG.maxCount) return;
                              e.currentTarget.style.borderColor = DS.primary;
                              e.currentTarget.style.background = DS.primaryLight;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = DS.border;
                              e.currentTarget.style.background = DS.white;
                            }}
                          >
                            <CloudUploadOutlined style={{ fontSize: 18, flexShrink: 0 }} />
                            <span>从本地上传</span>
                          </div>
                        </Upload>
                        <div style={{ marginTop: 8, fontSize: 11, color: DS.textTer, textAlign: 'center' }}>
                          支持 JPG、JPEG、PNG、GIF、WEBP、SVG 格式
                        </div>
                      </div>
                    )}
                  >
                    <Tooltip title="上传文件" mouseEnterDelay={0.2}>
                      <Button type="text" size="small" icon={<PaperClipOutlined />}
                        style={{
                          color: attachments.length ? DS.primary : DS.textSec,
                          background: attachments.length ? DS.primaryLight : 'transparent',
                          borderRadius: DS.radiusXs,
                        }} />
                    </Tooltip>
                  </Popover>
                  <Tooltip title="Enter 发送 · Shift+Enter 换行" mouseEnterDelay={0.3}>
                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()}
                      disabled={disabled || (!input.trim() && attachments.length === 0)}
                      style={{ borderRadius: DS.radiusXs, fontWeight: 500 }}>发送</Button>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: DS.textTer, marginTop: 10 }}>
              内容由 AI 生成，请仔细甄别
            </div>
          </div>
        </div>
      </section>

        </div>
      </div>

      {/* ──── 全部历史对话弹窗 ──── */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UnorderedListOutlined style={{ color: DS.primary }} />全部历史对话
            <span style={{ fontSize: 12, color: DS.textTer, fontWeight: 400 }}>· {conversations.length} 条</span>
          </span>
        }
        open={allHistoryOpen}
        onCancel={() => { setAllHistoryOpen(false); setAllHistoryKeyword(''); }}
        centered
        width={560}
        footer={null}
      >
        <div style={{ marginTop: 4 }}>
          <Input
            allowClear
            autoFocus
            prefix={<SearchOutlined style={{ color: DS.textTer }} />}
            placeholder="搜索历史对话标题"
            value={allHistoryKeyword}
            onChange={e => setAllHistoryKeyword(e.target.value)}
            style={{ borderRadius: DS.radiusXs, marginBottom: 12 }}
          />
          <div className="chat-scroll" style={{ maxHeight: '56vh', overflowY: 'auto', paddingRight: 4 }}>
            {groupedAllConversations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: DS.textTer, fontSize: 13 }}>
                未找到匹配的对话
              </div>
            )}
            {groupedAllConversations.map(group => (
              <div key={group.label}>
                <div style={{
                  padding: '8px 8px', fontSize: 12, color: DS.textTer, fontWeight: 600,
                }}>{group.label}</div>
                {group.items.map(c => {
                  const active = activeId === c.id;
                  return (
                    <div key={c.id}
                      onClick={() => { switchConversation(c); setAllHistoryOpen(false); setAllHistoryKeyword(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: DS.radiusXs, cursor: 'pointer', marginBottom: 2,
                        background: active ? DS.primaryLight : 'transparent',
                        transition: 'background .15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.bg; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: DS.primaryLight,
                        color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, flexShrink: 0,
                      }}><MessageOutlined /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, color: active ? DS.primary : DS.text,
                          fontWeight: active ? 600 : 400, ...ellipsis,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          {c.pinned && <PushpinFilled style={{ color: DS.primary, fontSize: 12, transform: 'rotate(-30deg)' }} />}
                          {c.title}
                        </div>
                        <div style={{ fontSize: 12, color: DS.textTer, marginTop: 2 }}>
                          {c.time} · {c.messages.length} 条消息
                        </div>
                      </div>
                      <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{
                          items: [
                            { key: 'rename', icon: <EditOutlined />, label: '重命名' },
                            { key: 'pin', icon: <PushpinOutlined />, label: c.pinned ? '取消置顶' : '置顶' },
                            { type: 'divider' },
                            { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
                          ],
                          onClick: ({ key, domEvent }) => {
                            domEvent.stopPropagation();
                            if (key === 'rename') startRename(c);
                            if (key === 'pin') togglePin(c.id);
                            if (key === 'delete') deleteConversation(c.id);
                          },
                        }}
                      >
                        <span onClick={e => e.stopPropagation()}
                          style={{
                            padding: 6, borderRadius: 6, color: DS.textTer, fontSize: 14, flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center',
                          }}>
                          <MoreOutlined />
                        </span>
                      </Dropdown>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ──── 重命名对话弹窗 ──── */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 650 }}>重命名对话</span>}
        open={renamingId !== null}
        onOk={commitRename}
        onCancel={() => { setRenamingId(null); setRenameValue(''); }}
        okButtonProps={{ disabled: !renameValue.trim() }}
        okText="确定"
        cancelText="取消"
        centered
        width={420}
        destroyOnClose
      >
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: DS.textSec, marginBottom: 8 }}>对话名称</div>
          <Input
            autoFocus
            value={renameValue}
            maxLength={50}
            placeholder="请输入对话名称"
            onChange={e => setRenameValue(e.target.value)}
            onPressEnter={commitRename}
            style={{ borderRadius: DS.radiusXs }}
          />
        </div>
      </Modal>

      {/* ──── 删除对话确认弹窗 ──── */}
      <Modal
        open={deleteId !== null}
        onOk={confirmDelete}
        onCancel={() => setDeleteId(null)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        centered
        width={420}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <CancelBtn />
            <OkBtn />
          </div>
        )}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '4px 0' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: DS.text, marginBottom: 8 }}>确认删除该对话？</div>
            <div style={{ fontSize: 13, color: DS.textSec, lineHeight: '20px' }}>
              删除后对话记录将无法恢复，请谨慎操作。
            </div>
          </div>
        </div>
      </Modal>

      {/* ──── 新对话设置弹窗 ──── */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 650 }}>新对话设置</span>}
        open={newChatOpen}
        onCancel={() => setNewChatOpen(false)}
        centered
        width={460}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
          <div style={{ fontSize: 12, color: DS.textTer, lineHeight: '20px', paddingBottom: 2, borderBottom: `1px dashed ${DS.border}` }}>
            配置本次对话的输入变量，开始对话后智能体将按此上下文自主规划执行。
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 8 }}>通报类型</div>
            <Select value={vars.type} onChange={v => setVars(prev => ({ ...prev, type: v }))}
              style={{ width: '100%' }} options={[
                { value: '协查通报', label: '协查通报' },
                { value: '寻人启事', label: '寻人启事' },
                { value: '寻物启事', label: '寻物启事' },
              ]} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 8 }}>发布范围</div>
            <Select value={vars.scope} onChange={v => setVars(prev => ({ ...prev, scope: v }))}
              style={{ width: '100%' }} options={[
                { value: '本市', label: '本市' },
                { value: '全市', label: '全市' },
                { value: '全省', label: '全省' },
                { value: '全国', label: '全国' },
              ]} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 8 }}>紧急程度</div>
            <Select value={vars.urgency} onChange={v => setVars(prev => ({ ...prev, urgency: v }))}
              style={{ width: '100%' }} options={[
                { value: '普通', label: '普通' },
                { value: '紧急', label: '紧急' },
                { value: '特急', label: '特急' },
              ]} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: DS.radiusSm, background: DS.bg,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DS.text }}>附走失人员照片</div>
              <div style={{ fontSize: 12, color: DS.textTer, marginTop: 2 }}>开启后将在通报中附加图像</div>
            </div>
            <Switch checked={vars.withPhoto} onChange={v => setVars(prev => ({ ...prev, withPhoto: v }))} />
          </div>
          <Button type="primary" block onClick={startNewChat}
            style={{ borderRadius: DS.radiusSm, fontWeight: 600, height: 40, marginTop: 4 }}>
            开始对话
          </Button>
        </div>
      </Modal>
    </div>
  );
}
