import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Input, Button, Tag, Modal, Select, Dropdown, Space, Tooltip, App as AntdApp,
  Upload, Drawer,
} from 'antd';
import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  RightOutlined,
  DownOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileMarkdownOutlined,
  FileImageOutlined,
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
  CloseOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { mockModels } from '@/mock/data';

// ════════════════════════════════════════════════
// 设计令牌
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
  orange: '#fa8c16',
  orangeLight: '#fff7e6',
  green: '#52c41a',
  red: '#f53f3f',
  radius: 10,
  radiusSm: 8,
  radiusXs: 6,
  mono: "'SF Mono', 'Menlo', 'Consolas', monospace",
};

const ellipsis = {
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

/** 引号图标（内联 SVG，避免依赖 @ant-design/icons 中不存在的图标） */
const QuoteIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={style} aria-hidden>
    <path d="M7.5 6c-2.2 0-4 1.8-4 4v6h6v-6H6c0-1.1.9-2 2-2V6zm10 0c-2.2 0-4 1.8-4 4v6h6v-6h-3.5c0-1.1.9-2 2-2V6z" />
  </svg>
);

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

/** 助手回复内容块：文本 / 工具调用（知识库检索） */
type Block =
  | { type: 'text'; text: string }
  | { type: 'tool'; label: string; tools: ToolResult[]; pending?: boolean };

/** 对话附件 */
interface Attachment {
  uid: string;
  name: string;
  size?: number;
  url?: string;
  isImage: boolean;
  source: 'local' | 'url';
  parseStatus?: 'parsing' | 'success' | 'failed';
  wordCount?: number;
}

/** 引用材料 */
interface Citation {
  id: number;          // 序号
  source: string;      // 知识库名称
  doc: string;         // 文件名称
  snippet: string;     // 片段预览（折叠态）
  content: string;     // 文本块原始 md 全文（展开态）
  page?: string;       // 页码
  score?: number;      // 相关度
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
  references?: Citation[];
}

interface Conversation {
  id: string;
  title: string;
  time: string;
  messages: Msg[];
  pinned?: boolean;
}

interface StandardChatPanelProps {
  agent: {
    name: string;
    type: string;
    subType?: string;
    description?: string;
    modelName?: string;
    spaceName?: string;
    knowledgeBases?: string[];
  };
  onBack: () => void;
  chatEnabled?: boolean;
  remaining?: number;
  dailyLimit?: number;
  onSend?: () => void;
}

const UPLOAD_CONFIG = {
  acceptTypes: ['doc', 'docx', 'pdf', 'txt', 'csv', 'xls', 'xlsx', 'pptx', 'md', 'png', 'jpg', 'jpeg'],
  imageExts: ['png', 'jpg', 'jpeg'],
  maxSizeMB: 20,
  maxImageSizeMB: 10,
  maxCount: 10,
};

const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/** 根据扩展名返回文件类型标签 + 图标 + 主题色 */
const getFileMeta = (name: string) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'doc':
    case 'docx':
      return { type: 'DOCX', Icon: FileWordOutlined, color: '#1677ff' };
    case 'pdf':
      return { type: 'PDF', Icon: FilePdfOutlined, color: '#f5222d' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { type: ext.toUpperCase(), Icon: FileExcelOutlined, color: '#52c41a' };
    case 'ppt':
    case 'pptx':
      return { type: 'PPTX', Icon: FilePptOutlined, color: '#fa8c16' };
    case 'md':
      return { type: 'MD', Icon: FileMarkdownOutlined, color: '#4e5969' };
    case 'txt':
      return { type: 'TXT', Icon: FileTextOutlined, color: '#86909c' };
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { type: ext.toUpperCase(), Icon: FileImageOutlined, color: '#722ed1' };
    default:
      return { type: ext.toUpperCase() || 'FILE', Icon: FileOutlined, color: '#86909c' };
  }
};

/** 字数格式化：≥1000 显示 1.2k */
const formatWordCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k 字' : n + ' 字';

// ════════════════════════════════════════════════
// 下拉选项
// ════════════════════════════════════════════════

/** 模型下拉：启用状态的通用大模型 */
const MODEL_OPTIONS = mockModels
  .filter(m => m.modelType === '通用大模型' && m.status === '启用')
  .map(m => ({ value: m.displayName, label: m.displayName }));

/** 知识库下拉（含文档篇数） */
const KB_OPTIONS: { value: string; label: string }[] = [
  { value: '警情分类知识库', label: '警情分类知识库' },
  { value: '接处警规程库', label: '接处警规程库' },
  { value: '道路交通安全法规库', label: '道路交通安全法规库' },
  { value: '反诈案例专业知识库', label: '反诈案例专业知识库' },
  { value: '刑事案件证据标准库', label: '刑事案件证据标准库' },
  { value: '治安管理处罚法适用库', label: '治安管理处罚法适用库' },
];

// ════════════════════════════════════════════════
// Mock 数据（按子类型区分欢迎语 / 建议 / 追问）
// ════════════════════════════════════════════════

type SubKey = 'chat' | 'kbqa' | 'smart_query' | 'default';

const resolveSubKey = (subType?: string): SubKey => {
  if (subType === '知识库问答') return 'kbqa';
  if (subType === '智能分析问数' || subType === '智能问数') return 'smart_query';
  if (subType === '普通助手') return 'chat';
  return 'default';
};

const WELCOME_MAP: Record<SubKey, string> = {
  chat: '您好，我是通用问答助手。可以帮您撰写材料、润色文案、总结归纳或解答日常问题，直接输入您的需求即可。',
  kbqa: '您好，我已接入公安专业知识库。您可以就法律法规、办案规程、典型案例等向我提问，我会基于权威资料作答并标注引用来源。',
  smart_query: '您好，我是智能问数助手。请用自然语言描述您想查询的数据或统计口径，例如"近一月全区警情分类统计"，我将为您生成查询结果。',
  default: '您好，我是您的智能助手，有什么可以帮您？',
};

const SUGGESTION_MAP: Record<SubKey, string[]> = {
  chat: [
    '帮我写一份社区警务工作总结',
    '把下面这段通报润色得更规范',
    '总结这篇材料的核心要点',
  ],
  kbqa: [
    '转弯未让直行发生事故，责任如何认定？',
    '治安管理处罚的种类有哪些？',
    '电信网络诈骗立案标准是什么？',
  ],
  smart_query: [
    '近一月全区警情按类型统计',
    '本月各派出所刑事案件发案对比',
    '近一季度交通违法趋势分析',
  ],
  default: [
    '帮我完成一项写作任务',
    '总结一段文字的要点',
    '解答一个业务问题',
  ],
};

const FOLLOWUP_MAP: Record<SubKey, string[]> = {
  chat: ['换一种更正式的语气', '再精简一些', '补充一段结论'],
  kbqa: ['引用的法条原文是什么', '有没有类似案例', '如果对方也有过错呢'],
  smart_query: ['按辖区下钻分析', '导出为表格', '同比去年变化如何'],
  default: ['继续', '再详细一点', '换个角度'],
};

/** 引用材料示例 */
const DEMO_REFERENCES: Citation[] = [
  {
    id: 1,
    source: '道路交通安全法规库',
    doc: '道路交通事故处理程序规定.pdf',
    page: 'P12',
    score: 0.94,
    snippet: '公安机关交通管理部门应当根据当事人的行为对发生道路交通事故所起的作用以及过错的严重程度，确定当事人的责任。',
    content: `## 道路交通事故处理程序规定（节选）

### 第六十条

公安机关交通管理部门应当根据当事人的行为对发生道路交通事故所起的作用以及过错的严重程度，**确定当事人的责任**。道路交通事故责任分为：

1. 全部责任；
2. 主要责任；
3. 同等责任；
4. 次要责任；
5. 无责任。

> 因一方当事人的过错导致道路交通事故的，承担**全部责任**；当事人逃逸，造成现场变动、证据灭失，公安机关交通管理部门无法查证道路交通事故事实的，逃逸的当事人承担全部责任。

### 第六十一条

当事人有下列情形之一的，承担全部责任：

- 发生道路交通事故后逃逸的；
- 故意破坏、伪造现场、毁灭证据的。

为逃避法律责任追究，当事人弃车逃逸以及潜逃藏匿的，如有证据证明其他当事人也有过错，可以适当减轻责任。`,
  },
  {
    id: 2,
    source: '道路交通安全法规库',
    doc: '中华人民共和国道路交通安全法.pdf',
    page: 'P31',
    score: 0.91,
    snippet: '机动车之间发生交通事故的，由有过错的一方承担赔偿责任；双方都有过错的，按照各自过错的比例分担责任。',
    content: `## 中华人民共和国道路交通安全法（节选）

### 第七十六条

机动车发生交通事故造成人身伤亡、财产损失的，由保险公司在机动车第三者责任强制保险责任限额范围内予以赔偿；不足的部分，按照下列规定承担赔偿责任：

1. **机动车之间发生交通事故的**，由有过错的一方承担赔偿责任；双方都有过错的，按照各自过错的比例分担责任。
2. 机动车与非机动车驾驶人、行人之间发生交通事故，非机动车驾驶人、行人没有过错的，由机动车一方承担赔偿责任。

> 交通事故的损失是由非机动车驾驶人、行人**故意碰撞机动车**造成的，机动车一方不承担赔偿责任。

### 第七十七条

车辆在道路以外通行时发生的事故，公安机关交通管理部门接到报案的，参照本法有关规定办理。`,
  },
  {
    id: 3,
    source: '反诈案例专业知识库',
    doc: '转弯未让直行典型案例汇编.docx',
    page: 'P45',
    score: 0.88,
    snippet: '甲车通过无信号灯控制的交叉路口转弯时未让直行的乙车先行，交警认定甲车承担事故全部责任。',
    content: `## 案例 2025-118：转弯未让直行事故责任认定

### 基本案情

- **时间**：2025 年 3 月 14 日 17:42
- **地点**：某市江洲路与春晖路交叉路口（无信号灯控制）
- **当事人**：甲车（小型轿车，左转）、乙车（小型轿车，直行）

### 事故经过

甲车沿江洲路由西向东行驶至春晖路路口左转弯时，与由东向西**直行**通过路口的乙车发生碰撞，造成两车前部受损，无人员伤亡。

### 责任认定

交警调取路口监控后认定：

> 甲车通过无信号灯控制的交叉路口转弯时**未让直行的乙车先行**，其行为违反了《道路交通安全法实施条例》第五十二条第三项的规定，是导致事故的直接原因，承担事故**全部责任**。

### 案例启示

- 转弯车让直行车是通行基本原则；
- 通过无信号灯路口应减速观察；
- 事故责任认定以"路权"优先为核心依据。`,
  },
];

/** 带引用标记的最终回答（[[n]] 或 [[1,2]] 会被解析为可点击的引号图标） */
const FINAL_ANSWER = `根据现场情况，A 车转弯未让直行，是导致本次事故的直接原因，通常应承担主要或全部责任 [[1,2,3]]。

具体认定依据如下：
1. 《道路交通事故处理程序规定》明确，应当根据当事人行为对事故所起作用及过错严重程度确定责任 [[1]]；
2. 《道路交通安全法》第七十六条规定，机动车之间发生事故，由有过错一方承担赔偿责任；双方均有过错的按比例分担 [[2]]；
3. 参考同类案例，转弯车未让直行车的情形下，一般认定转弯车全责 [[3]]。

若 B 车存在超速、未注意观察等过错，可能相应减轻 A 车责任，最终以现场勘查和监控证据为准。`;

const KB_TOOL_BLOCK: Block = {
  type: 'tool',
  label: 'knowledge_retrieve',
  tools: [
    {
      name: 'knowledge_retrieve',
      request: '{"query": "转弯未让直行 事故责任认定", "knowledge_bases": ["道路交通安全法规库", "反诈案例专业知识库"], "top_k": 3}',
      response: '{"results": [{"doc": "道路交通事故处理程序规定.pdf#page=12", "score": 0.94}, {"doc": "道路交通安全法.pdf#page=31", "score": 0.91}, {"doc": "转弯未让直行典型案例汇编.docx", "score": 0.88}]}',
    },
  ],
};

const DEMO_BLOCKS: Block[] = [
  { type: 'text', text: '收到，我先在已接入的知识库中检索与"转弯未让直行责任认定"相关的法规与案例。' },
  KB_TOOL_BLOCK,
  { type: 'text', text: '已检索到 3 条高相关度材料，正在据此综合作答。' },
  { type: 'text', text: FINAL_ANSWER },
];

const HISTORY_CONVERSATIONS: Conversation[] = [
  {
    id: 'h1',
    title: '转弯未让直行事故责任认定',
    time: '今天 10:22',
    messages: [
      { id: 'h1-u', role: 'user', content: '转弯没让直行撞了，谁的责任？' },
      { id: 'h1-a', role: 'assistant', content: FINAL_ANSWER, blocks: DEMO_BLOCKS, references: DEMO_REFERENCES },
    ],
  },
  {
    id: 'h2',
    title: '追尾事故责任划分',
    time: '今天 09:05',
    messages: [
      { id: 'h2-u', role: 'user', content: '前车急刹车导致追尾，后车一定全责吗？' },
      { id: 'h2-a', role: 'assistant', content: '一般情况下后车未保持安全距离应承担责任；若前车故意急刹或存在其他过错，需结合证据综合认定。' },
    ],
  },
  {
    id: 'h3',
    title: '酒驾处罚标准咨询',
    time: '昨天 16:40',
    messages: [
      { id: 'h3-u', role: 'user', content: '饮酒后驾驶机动车怎么处罚？' },
      { id: 'h3-a', role: 'assistant', content: '饮酒后驾驶机动车的，处暂扣六个月机动车驾驶证，并处一千元以上二千元以下罚款。' },
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

/** 工具调用块：简洁文字行，点击展开查看请求/响应 */
const ToolBlock: React.FC<{ block: Extract<Block, { type: 'tool' }> }> = ({ block }) => {
  const [open, setOpen] = useState(false);
  const t = block.tools[0];
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 0', cursor: 'pointer', userSelect: 'none' }}
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
          <pre className="std-scroll" style={{
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

/** 思考中：三点跳动 */
const ThinkingBlock: React.FC<{ text?: string }> = ({ text = '正在思考…' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 14 }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="std-typing-dot" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
    <span style={{ fontSize: 13, color: DS.textSec }}>{text}</span>
  </div>
);

/** 附件卡片：图片显示缩略图，文档分两行展示 */
const FileChip: React.FC<{ file: Attachment; onRemove?: () => void; inBubble?: boolean }> = ({ file, onRemove }) => {
  if (file.isImage && file.url) {
    return (
      <div style={{
        position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
        border: `1px solid ${cardBorder}`, background: DS.bg,
      }}>
        <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {onRemove && (
          <span onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, cursor: 'pointer', lineHeight: 1,
            }}><CloseOutlined /></span>
        )}
      </div>
    );
  }

  const { type, Icon, color } = getFileMeta(file.name);
  const failed = file.parseStatus === 'failed';
  const parsing = file.parseStatus === 'parsing';

  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
      width: 240, padding: '8px 12px', borderRadius: 8, flexShrink: 0,
      background: DS.white, border: `1px solid ${DS.border}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '14',
      }}>
        <Icon style={{ fontSize: 18, color }} />
      </div>
      <div style={{ minWidth: 0, flex: 1, paddingRight: onRemove ? 18 : 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: DS.text, lineHeight: '18px', ...ellipsis }}>{file.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: DS.textTer, lineHeight: '16px' }}>
          <span>{type}</span>
          {failed ? (
            <span style={{ color: DS.red }}>文件解析失败</span>
          ) : parsing ? (
            <span style={{ color: DS.textTer }}>解析中…</span>
          ) : typeof file.wordCount === 'number' ? (
            <>
              <span style={{ color: DS.border }}>|</span>
              <span>{formatWordCount(file.wordCount)}</span>
            </>
          ) : null}
          {file.size ? (
            <>
              <span style={{ color: DS.border }}>|</span>
              <span>{formatFileSize(file.size)}</span>
            </>
          ) : null}
        </div>
      </div>
      {onRemove && (
        <CloseOutlined onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ position: 'absolute', top: 6, right: 8, fontSize: 11, cursor: 'pointer', color: DS.textTer }} />
      )}
    </div>
  );
};

/** 用户消息 */
const UserMessage: React.FC<{ msg: Msg }> = ({ msg }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: '78%' }}>
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, paddingRight: 44 }}>
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
          width: 34, height: 34, borderRadius: '50%', background: DS.primary, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
        }}><UserOutlined /></div>
      </div>
      {msg.time && <span style={{ fontSize: 11, color: DS.textTer, marginRight: 44 }}>{msg.time}</span>}
    </div>
  </div>
);

/** 富文本：将 [[1]] 或 [[1,2]] 解析为可点击的引用图标（支持一段文字引用多份材料） */
const CITATION_RE = /\[\[([\d,\s]+)\]\]/g;

const RichText: React.FC<{
  text: string;
  references?: Citation[];
  onCitation: (refs: Citation[]) => void;
}> = ({ text, references, onCitation }) => {
  const parts = text.split(CITATION_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const ids = part.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          const citedRefs = references
            ? ids.map(id => references.find(r => r.id === id)).filter(Boolean) as Citation[]
            : [];
          if (citedRefs.length === 0) return null;
          return (
            <Tooltip key={i} title={
              <div style={{ lineHeight: '18px', maxWidth: 260 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>引用材料（{citedRefs.length}）</div>
                {citedRefs.map(r => (
                  <div key={r.id} style={{ fontSize: 12, opacity: 0.92, marginBottom: 2 }}>
                    · {r.doc}
                  </div>
                ))}
                <div style={{ opacity: 0.7, marginTop: 4, fontSize: 11 }}>点击查看引用材料</div>
              </div>
            }>
              <span
                onClick={e => { e.stopPropagation(); onCitation(citedRefs); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18, margin: '0 2px',
                  borderRadius: 5, fontSize: 12, cursor: 'pointer',
                  background: DS.primaryLight, color: DS.primary,
                  border: `1px solid ${DS.primaryBorder}`,
                  verticalAlign: 'middle', lineHeight: 1, userSelect: 'none',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = DS.primary;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = DS.primaryLight;
                  e.currentTarget.style.color = DS.primary;
                }}
              >
                <QuoteIcon style={{ fontSize: 11 }} />
              </span>
            </Tooltip>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

/** 助手消息 */
const AssistantMessage: React.FC<{
  msg: Msg;
  isLatest?: boolean;
  followups: string[];
  onFollowup?: (text: string) => void;
  onRegenerate?: () => void;
  onOpenReferences: (refs: Citation[]) => void;
}> = ({ msg, isLatest, followups, onFollowup, onRegenerate, onOpenReferences }) => {
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
          color: active ? DS.primary : DS.textTer, fontSize: 14, transition: 'all .15s',
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
            width: 34, height: 34, borderRadius: 10, background: DS.primaryLight, color: DS.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0, border: `1px solid ${DS.primaryBorder}`,
          }}><RobotOutlined /></div>
          <div style={{ paddingTop: 8 }}><ThinkingBlock text="正在检索并生成回答…" /></div>
        </div>
      </div>
    );
  }

  const refs = msg.references;

  return (
    <div style={{ display: 'flex', marginBottom: isLatest ? 16 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '88%' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: DS.primaryLight, color: DS.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                return (
                  <div key={i} style={{ fontSize: 14, color: DS.text, lineHeight: '24px', whiteSpace: 'pre-wrap', marginBottom: 12 }}>
                    <RichText text={b.text} references={refs} onCitation={onOpenReferences} />
                  </div>
                );
              }
              return <ToolBlock key={i} block={b} />;
            })
          ) : (
            <div style={{ fontSize: 14, color: DS.text, lineHeight: '24px', whiteSpace: 'pre-wrap' }}>
              <RichText text={msg.content} references={refs} onCitation={onOpenReferences} />
            </div>
          )}

          {/* 引用材料入口 + 悬浮操作栏（流式输出结束后才出现） */}
          {!msg.streaming && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2, marginTop: 6,
            opacity: hovered || refs ? 1 : 0, transition: 'opacity .2s',
          }}>
            {refs && refs.length > 0 && (
              <span
                onClick={() => onOpenReferences(refs)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 999, marginRight: 6,
                  fontSize: 12, color: DS.primary, background: DS.primaryLight,
                  border: `1px solid ${DS.primaryBorder}`, cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d6e4ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = DS.primaryLight; }}
              >
                <QuoteIcon style={{ fontSize: 12 }} />
                {refs.length} 份引用材料
              </span>
            )}
            {actionBtn(<LikeOutlined />, '赞', () => setFeedback(feedback === 'like' ? null : 'like'), feedback === 'like')}
            {actionBtn(<DislikeOutlined />, '踩', () => setFeedback(feedback === 'dislike' ? null : 'dislike'), feedback === 'dislike')}
            <span style={{ width: 1, height: 14, background: DS.divider, margin: '0 4px' }} />
            {actionBtn(<CopyOutlined />, '复制', handleCopy)}
            {actionBtn(<ReloadOutlined />, '重新生成', () => onRegenerate?.())}
            {msg.time && <span style={{ fontSize: 11, color: DS.textTer, marginLeft: 8 }}>{msg.time}</span>}
          </div>
          )}

          {/* 最新回复：追问建议 */}
          {isLatest && followups.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ flex: 1, height: 1, background: DS.divider }} />
                <span style={{ fontSize: 12, color: DS.textTer, flexShrink: 0 }}>试着问问</span>
                <span style={{ flex: 1, height: 1, background: DS.divider }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {followups.map((s, i) => (
                  <span key={i}
                    onClick={() => onFollowup?.(s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 999, fontSize: 13, color: DS.primary,
                      background: DS.primaryLight, border: `1px solid ${DS.primaryBorder}`,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#d6e4ff'; e.currentTarget.style.borderColor = DS.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.background = DS.primaryLight; e.currentTarget.style.borderColor = DS.primaryBorder; }}
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

export default function StandardChatPanel({
  agent, onBack, chatEnabled, remaining, dailyLimit, onSend,
}: StandardChatPanelProps) {
  const subKey = resolveSubKey(agent.subType);
  const isKbqa = subKey === 'kbqa';

  const [activeId, setActiveId] = useState<string>('new');
  const [conversations, setConversations] = useState<Conversation[]>(HISTORY_CONVERSATIONS);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [allHistoryOpen, setAllHistoryOpen] = useState(false);
  const [allHistoryKeyword, setAllHistoryKeyword] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // 模型 / 知识库选择
  const initialModel = MODEL_OPTIONS.find(o => o.value === agent.modelName)?.value
    ?? MODEL_OPTIONS[0]?.value
    ?? '';
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const initialKbs = (agent.knowledgeBases ?? []).filter(k => KB_OPTIONS.some(o => o.value === k));
  const [selectedKbs, setSelectedKbs] = useState<string[]>(
    initialKbs.length ? initialKbs : (isKbqa ? [KB_OPTIONS[0].value] : [])
  );

  // 引用抽屉
  const [citationOpen, setCitationOpen] = useState(false);
  const [activeRefs, setActiveRefs] = useState<Citation[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  // 源文件预览抽屉
  const [previewRef, setPreviewRef] = useState<Citation | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const { message: antMessage } = AntdApp.useApp();

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
    if (!c) { setActiveId('new'); setMessages([]); return; }
    setActiveId(c.id);
    setMessages(c.messages);
  };

  const startRename = (c: Conversation) => { setRenamingId(c.id); setRenameValue(c.title); };
  const commitRename = () => {
    const val = renameValue.trim();
    if (renamingId && val) {
      setConversations(prev => prev.map(c => c.id === renamingId ? { ...c, title: val } : c));
    }
    setRenamingId(null); setRenameValue('');
  };
  const togglePin = (id: string) => setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  const deleteConversation = (id: string) => setDeleteId(id);
  const confirmDelete = () => {
    if (!deleteId) return;
    const id = deleteId;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) { setActiveId('new'); setMessages([]); }
    setDeleteId(null);
  };

  // 模拟流式回复：知识库问答带检索工具块与引用，其余仅文本
  const streamAssistantAnswer = (assistantId: string, targetConvId: string) => {
    const blocks = isKbqa ? DEMO_BLOCKS : DEMO_BLOCKS.filter(b => b.type !== 'tool');
    const references = isKbqa ? DEMO_REFERENCES : undefined;
    let acc: Block[] = [];
    blocks.forEach((block, idx) => {
      const delay = 500 + idx * 700;
      setTimeout(() => {
        acc = [...acc, block];
        setMessages(prev => {
          const updated = prev.map(m => m.id === assistantId
            ? { ...m, thinking: false, streaming: true, blocks: acc, content: '', references, time: nowTime() }
            : m);
          if (targetConvId !== 'new') {
            setConversations(cprev => cprev.map(c => c.id === targetConvId ? { ...c, messages: updated } : c));
          }
          return updated;
        });
      }, delay);
    });
    setTimeout(() => {
      setMessages(prev => {
        const finalContent = isKbqa ? FINAL_ANSWER : '已为您处理完成。如果还有其他问题，欢迎继续提问。';
        const updated = prev.map(m => m.id === assistantId
          ? { ...m, thinking: false, streaming: false, blocks: acc, content: finalContent, references, time: nowTime() }
          : m);
        if (targetConvId !== 'new') {
          setConversations(cprev => cprev.map(c => c.id === targetConvId ? { ...c, messages: updated } : c));
        }
        return updated;
      });
    }, 500 + blocks.length * 700 + 200);
  };

  // 附件处理
  const addAttachment = (file: Attachment) => {
    setAttachments(prev => prev.some(f => f.uid === file.uid) ? prev : [...prev, file]);
  };
  const updateAttachment = (uid: string, patch: Partial<Attachment>) => {
    setAttachments(prev => prev.map(f => f.uid === uid ? { ...f, ...patch } : f));
  };
  const removeAttachment = (uid: string) => setAttachments(prev => prev.filter(f => f.uid !== uid));

  const beforeLocalUpload = (file: File) => {
    acceptLocalFile(file, attachments.length);
    return false;
  };

  /** 校验并接收本地文件（上传 / 粘贴共用） */
  const acceptLocalFile = (file: File, currentCount: number): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = UPLOAD_CONFIG.imageExts.includes(ext) || file.type.startsWith('image/');
    if (!UPLOAD_CONFIG.acceptTypes.includes(ext)) {
      antMessage.error(`仅支持 ${UPLOAD_CONFIG.acceptTypes.join('、')} 格式`);
      return false;
    }
    if (currentCount >= UPLOAD_CONFIG.maxCount) {
      antMessage.error(`最多上传 ${UPLOAD_CONFIG.maxCount} 个文件`);
      return false;
    }
    const maxBytes = (isImage ? UPLOAD_CONFIG.maxImageSizeMB : UPLOAD_CONFIG.maxSizeMB) * 1024 * 1024;
    if (file.size > maxBytes) {
      antMessage.error(isImage
        ? `单个图片不能超过 ${UPLOAD_CONFIG.maxImageSizeMB}MB`
        : `单个文件不能超过 ${UPLOAD_CONFIG.maxSizeMB}MB`);
      return false;
    }
    const att: Attachment = {
      uid: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: file.name, size: file.size, isImage,
      source: 'local',
    };
    // 图片直接展示缩略图，无需解析文本；文档类文件模拟解析过程（字数 / 失败状态）
    if (att.isImage) {
      const reader = new FileReader();
      reader.onload = () => { att.url = reader.result as string; addAttachment({ ...att }); };
      reader.readAsDataURL(file);
    } else {
      addAttachment({ ...att, parseStatus: 'parsing' });
      const textExts = ['doc', 'docx', 'pdf', 'txt', 'md', 'pptx'];
      const delay = 800 + Math.random() * 700;
      window.setTimeout(() => {
        // 15% 概率模拟解析失败
        if (Math.random() < 0.15) {
          updateAttachment(att.uid, { parseStatus: 'failed' });
        } else {
          const wordCount = textExts.includes(ext) ? Math.round(800 + Math.random() * 6000) : undefined;
          updateAttachment(att.uid, { parseStatus: 'success', wordCount });
        }
      }, delay);
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

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content && attachments.length === 0) return;
    if (isKbqa && selectedKbs.length === 0) {
      antMessage.warning('请先选择至少一个知识库');
      return;
    }
    const userMsg: Msg = {
      id: Date.now().toString(), role: 'user', content, time: nowTime(),
      attachments: attachments.length ? attachments : undefined,
    };
    const assistantId = (Date.now() + 1).toString();
    const thinking: Msg = { id: assistantId, role: 'assistant', content: '', thinking: true, streaming: true };

    let targetId = activeId;
    if (activeId === 'new') {
      const newId = 'c-' + Date.now();
      const rawTitle = content || (attachments[0] ? `[附件] ${attachments[0].name}` : '新对话');
      const title = rawTitle.length > 18 ? rawTitle.slice(0, 18) + '…' : rawTitle;
      const newConv: Conversation = {
        id: newId, title, time: '今天 ' + nowTime(), messages: [userMsg, thinking],
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

  const regenerateAnswer = (assistantId: string) => {
    setMessages(prev => prev.map(m => m.id === assistantId
      ? { ...m, thinking: true, streaming: true, content: '', blocks: undefined, references: undefined }
      : m));
    streamAssistantAnswer(assistantId, activeId);
  };

  // 新建对话：直接清空，不再弹窗
  const startNewChat = () => { setActiveId('new'); setMessages([]); };

  const openCitation = (refs: Citation[]) => {
    setActiveRefs(refs);
    setExpandedIds(new Set());
    setCitationOpen(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const disabled = chatEnabled && (remaining ?? 0) <= 0;
  const lowRemaining = chatEnabled && (remaining ?? 0) <= 2 && (remaining ?? 0) > 0;
  const currentTitle = activeId === 'new' ? '新对话' : conversations.find(c => c.id === activeId)?.title || '对话';
  const welcome = WELCOME_MAP[subKey];
  const suggestions = SUGGESTION_MAP[subKey];
  const followups = FOLLOWUP_MAP[subKey];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        .std-typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${DS.primary};
          animation: std-dot-bounce 1.2s infinite ease-in-out;
        }
        @keyframes std-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .std-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
        .std-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .std-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 999px; }
        .std-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
        .std-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* 顶部栏 */}
      <div style={{ flexShrink: 0, paddingBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <div>• 开发中心测试调用，每日限额 {dailyLimit} 次</div>
                <div>• 每发送一条消息消耗 1 次</div>
                <div>• 次日 0 点自动重置</div>
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

      {/* 卡片容器 */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', background: DS.white,
          borderRadius: DS.radius, border: `1px solid ${DS.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>
          {/* 左侧栏 */}
          <aside style={{
            width: sidebarOpen ? 280 : 0, minWidth: 0, background: DS.white,
            borderRight: sidebarOpen ? `1px solid ${DS.divider}` : 'none',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transition: 'width .25s ease, border-color .25s',
          }}>
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
                    <Tag color="blue" style={{ margin: 0, borderRadius: 4, fontSize: 11, lineHeight: '18px' }}>{agent.type}</Tag>
                    {agent.subType && agent.subType !== agent.type && (
                      <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11, lineHeight: '18px' }}>{agent.subType}</Tag>
                    )}
                  </Space>
                </div>
              </div>
              {agent.description && (
                <div style={{ fontSize: 12, color: DS.textSec, lineHeight: '18px', marginTop: 10, ...clamp2 }}>
                  {agent.description}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 16px' }}>
              <Button type="primary" block icon={<PlusOutlined />} onClick={startNewChat}
                style={{ borderRadius: DS.radiusXs, fontWeight: 600, height: 36 }}>新建对话</Button>
            </div>

            <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: DS.textTer, letterSpacing: 0.3 }}>
                历史对话<span style={{ marginLeft: 6 }}>{conversations.length}</span>
              </span>
              <Button type="text" size="small" onClick={() => setAllHistoryOpen(true)}
                style={{ fontSize: 12, color: DS.primary, padding: '0 4px', height: 20 }}>查看全部</Button>
            </div>
            <div className="std-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
              {groupedConversations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: DS.textTer, fontSize: 12 }}>暂无历史对话</div>
              )}
              {groupedConversations.map(group => (
                <div key={group.label}>
                  <div style={{ padding: '10px 8px 4px', fontSize: 11, color: DS.textTer }}>{group.label}</div>
                  {group.items.map(c => {
                    const active = activeId === c.id;
                    return (
                      <div key={c.id}
                        onClick={() => switchConversation(c)}
                        style={{
                          position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                          background: active ? DS.primaryLight : 'transparent',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.bg; const op = e.currentTarget.querySelector<HTMLElement>('.std-hist-ops'); if (op) op.style.opacity = '1'; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; const op = e.currentTarget.querySelector<HTMLElement>('.std-hist-ops'); if (op) op.style.opacity = '0'; }}
                      >
                        {c.pinned && <PushpinFilled style={{ color: DS.primary, fontSize: 11, flexShrink: 0, transform: 'rotate(-30deg)' }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: active ? DS.primary : DS.text, fontWeight: active ? 500 : 400, ...ellipsis }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: DS.textTer, marginTop: 1, display: 'flex', gap: 6 }}>
                            <span>{c.time}</span><span>· {c.messages.length} 次对话</span>
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
                          <span className="std-hist-ops" onClick={e => e.stopPropagation()}
                            style={{ opacity: active ? 1 : 0, transition: 'opacity .15s', padding: 4, borderRadius: 6, color: DS.textTer, fontSize: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
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

          {/* 主对话区 */}
          <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DS.white }}>
            <div style={{ height: 56, flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tooltip title={sidebarOpen ? '收起侧栏' : '展开侧栏'} mouseEnterDelay={0.3}>
                <Button type="text" size="small"
                  icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                  onClick={() => setSidebarOpen(o => !o)}
                  style={{ color: DS.textTer, marginRight: 4 }} />
              </Tooltip>
              {renamingId === activeId ? (
                <span style={{ fontSize: 15, fontWeight: 650, color: DS.text }}>{currentTitle}</span>
              ) : (
                <Tooltip title={activeId === 'new' ? '' : '点击重命名'} mouseEnterDelay={0.5}>
                  <span
                    onClick={() => { if (activeId !== 'new') { const c = conversations.find(x => x.id === activeId); if (c) startRename(c); } }}
                    style={{ fontSize: 15, fontWeight: 650, color: DS.text, cursor: activeId === 'new' ? 'default' : 'pointer' }}
                  >{currentTitle}</span>
                </Tooltip>
              )}
            </div>

            <div ref={bodyRef} className="std-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {messages.length === 0 ? (
                  <div style={{ paddingTop: '7vh' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 18, background: DS.primaryLight,
                        color: DS.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                      }}><RobotOutlined /></div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: DS.text, marginTop: 16 }}>{agent.name}</div>
                      <div style={{ fontSize: 13, color: DS.textSec, marginTop: 6 }}>
                        {agent.description || '基于大语言模型的标准智能体，支持知识库问答与数据分析'}
                      </div>
                    </div>
                    <div style={{
                      marginTop: 24, padding: '14px 18px', borderRadius: DS.radiusSm, background: DS.white,
                      border: `1px solid ${DS.divider}`, fontSize: 14, color: DS.text, lineHeight: '24px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    }}>{welcome}</div>
                    <div style={{ marginTop: 22 }}>
                      <div style={{ fontSize: 13, color: DS.textTer, fontWeight: 600, marginBottom: 10 }}>你可以这样提问</div>
                      {suggestions.map((s, i) => (
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
                          }}>
                            {i === 0 ? <FileTextOutlined /> : i === 1 ? <ThunderboltOutlined /> : <SearchOutlined />}
                          </span>
                          <span style={{ flex: 1 }}>{s}</span>
                          <RightOutlined style={{ fontSize: 12, color: DS.textTer }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => m.role === 'user'
                    ? <UserMessage key={m.id} msg={m} />
                    : (
                      <AssistantMessage
                        key={m.id}
                        msg={m}
                        isLatest={!m.thinking && !m.streaming && idx === messages.length - 1}
                        followups={followups}
                        onFollowup={handleSend}
                        onRegenerate={() => regenerateAnswer(m.id)}
                        onOpenReferences={openCitation}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, padding: '4px 2px 0' }}>
                      {attachments.map(f => <FileChip key={f.uid} file={f} onRemove={() => removeAttachment(f.uid)} />)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
                      {/* 模型下拉 */}
                      <Select
                        value={selectedModel}
                        onChange={setSelectedModel}
                        variant="borderless"
                        options={MODEL_OPTIONS}
                        suffixIcon={<DownOutlined style={{ fontSize: 10, color: DS.textTer }} />}
                        style={{
                          minWidth: 150, maxWidth: 200, fontSize: 12,
                          background: DS.bg, borderRadius: 999, padding: '0 8px', height: 28,
                        }}
                        popupMatchSelectWidth={220}
                      />
                      {/* 知识库多选 */}
                      <Select
                        mode="multiple"
                        value={selectedKbs}
                        onChange={setSelectedKbs}
                        variant="borderless"
                        maxTagCount={1}
                        placeholder="选择知识库"
                        suffixIcon={<DownOutlined style={{ fontSize: 10, color: DS.textTer }} />}
                        options={KB_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                        optionFilterProp="value"
                        tagRender={props => (
                          <span style={{ fontSize: 12, color: DS.textSec }}>
                            {props.label as React.ReactNode}
                          </span>
                        )}
                        maxTagPlaceholder={omittedValues => {
                          const total = (omittedValues?.length ?? 0) + 1;
                          return (
                            <Tooltip title={selectedKbs?.join('、')}>
                              <span style={{ fontSize: 12, color: DS.textSec }}>
                                等{total}个
                              </span>
                            </Tooltip>
                          );
                        }}
                        style={{
                          minWidth: 180, maxWidth: 360, flex: '0 1 auto', fontSize: 12,
                          background: DS.bg, borderRadius: 999, padding: '0 8px', height: 28,
                        }}
                        popupMatchSelectWidth={280}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Upload
                        beforeUpload={beforeLocalUpload}
                        showUploadList={false}
                        multiple
                        accept={UPLOAD_CONFIG.acceptTypes.map(t => '.' + t).join(',')}
                        disabled={attachments.length >= UPLOAD_CONFIG.maxCount}
                      >
                        <Tooltip
                          title={
                            <div style={{ lineHeight: '20px' }}>
                              <div>支持 {UPLOAD_CONFIG.acceptTypes.join('、')} 文件</div>
                              <div>文件数量最多 {UPLOAD_CONFIG.maxCount} 个，单个文件不超过 {UPLOAD_CONFIG.maxSizeMB}MB，单个图片不超过 {UPLOAD_CONFIG.maxImageSizeMB}MB</div>
                            </div>
                          }
                          mouseEnterDelay={0.2}
                        >
                          <Button type="text" size="small" icon={<PaperClipOutlined />}
                            disabled={attachments.length >= UPLOAD_CONFIG.maxCount}
                            style={{
                              color: attachments.length ? DS.primary : DS.textSec,
                              background: attachments.length ? DS.primaryLight : 'transparent',
                              borderRadius: DS.radiusXs,
                            }} />
                        </Tooltip>
                      </Upload>
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

      {/* 引用材料抽屉 */}
      <Drawer
        title={
          <span style={{ fontSize: 16, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8 }}>
            引用材料
            <span style={{ fontSize: 12, color: DS.textTer, fontWeight: 400 }}>· {activeRefs.length} 条</span>
          </span>
        }
        placement="right"
        width="30%"
        open={citationOpen}
        onClose={() => setCitationOpen(false)}
        styles={{ body: { paddingTop: 8 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeRefs.map(ref => {
            const expanded = expandedIds.has(ref.id);
            return (
              <div key={ref.id}
                onClick={() => setPreviewRef(ref)}
                style={{
                  padding: '14px 4px',
                  borderBottom: `1px solid ${DS.border}`,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = DS.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* 顶部：序号 + 知识库 + 右上角展开/收起 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    background: DS.bg, color: DS.textSec, border: `1px solid ${DS.border}`,
                  }}>{ref.id}</span>
                  <Tag color="blue" style={{ margin: 0, borderRadius: 4, fontSize: 11, lineHeight: '18px' }}>{ref.source}</Tag>
                  <Button type="link" size="small"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(ref.id); }}
                    style={{ padding: 0, height: 'auto', fontSize: 12, marginLeft: 'auto' }}
                  >
                    {expanded ? '收起' : '展开全文'}
                  </Button>
                </div>

                {/* 文件名 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: DS.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileTextOutlined style={{ color: DS.textTer, fontSize: 13, flexShrink: 0 }} />
                  <span style={ellipsis}>{ref.doc}</span>
                </div>

                {/* 元信息：文本块序号 · 页码 · 相关度 */}
                <div style={{ fontSize: 11, color: DS.textTer, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>#{ref.id}</span>
                  {ref.page && <span>· {ref.page}</span>}
                  {typeof ref.score === 'number' && <span>· 相关度 {(ref.score * 100).toFixed(0)}%</span>}
                </div>

                {/* 文本块内容：折叠显示 snippet，展开显示纯文本全文 */}
                {expanded ? (
                  <div style={{
                    fontSize: 12, color: DS.textSec, lineHeight: '20px',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>{ref.content}</div>
                ) : (
                  <div style={{
                    fontSize: 12, color: DS.textSec, lineHeight: '20px',
                    ...clamp2,
                  }}>{ref.snippet}</div>
                )}
              </div>
            );
          })}
        </div>
      </Drawer>

      {/* 源文件预览抽屉 */}
      <Drawer
        title={
          <span style={{ fontSize: 16, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: DS.primary }} />
            {previewRef?.doc}
          </span>
        }
        placement="right"
        width={720}
        open={!!previewRef}
        onClose={() => setPreviewRef(null)}
        styles={{ body: { padding: 0, background: DS.bg } }}
      >
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, color: DS.textTer,
        }}>
          <FileTextOutlined style={{ fontSize: 40, color: DS.primaryBorder }} />
          <div style={{ fontSize: 14 }}>嵌入 kkfile 预览对应文件</div>
          {previewRef && (
            <div style={{ fontSize: 12 }}>{previewRef.doc}{previewRef.page ? ` · ${previewRef.page}` : ''}</div>
          )}
        </div>
      </Drawer>

      {/* 全部历史对话弹窗 */}
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
          <div className="std-scroll" style={{ maxHeight: '56vh', overflowY: 'auto', paddingRight: 4 }}>
            {groupedAllConversations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: DS.textTer, fontSize: 13 }}>未找到匹配的对话</div>
            )}
            {groupedAllConversations.map(group => (
              <div key={group.label}>
                <div style={{ padding: '8px 8px', fontSize: 12, color: DS.textTer, fontWeight: 600 }}>{group.label}</div>
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
                        <div style={{ fontSize: 14, color: active ? DS.primary : DS.text, fontWeight: active ? 600 : 400, ...ellipsis, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.pinned && <PushpinFilled style={{ color: DS.primary, fontSize: 12, transform: 'rotate(-30deg)' }} />}
                          {c.title}
                        </div>
                        <div style={{ fontSize: 12, color: DS.textTer, marginTop: 2 }}>{c.time} · {c.messages.length} 条消息</div>
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
                          style={{ padding: 6, borderRadius: 6, color: DS.textTer, fontSize: 14, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
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

      {/* 重命名对话弹窗 */}
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

      {/* 删除对话确认弹窗 */}
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
            <div style={{ fontSize: 13, color: DS.textSec, lineHeight: '20px' }}>删除后对话记录将无法恢复，请谨慎操作。</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}