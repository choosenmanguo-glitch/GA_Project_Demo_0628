import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Tooltip, Upload, Popover, Select, Switch, Modal, App as AntdApp } from 'antd';
import {
  SettingOutlined,
  DownOutlined,
  SlidersOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  PlusOutlined,
  ExportOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ReloadOutlined,
  RobotOutlined,
  RightOutlined,
  SendOutlined,
  CodeSandboxOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  PaperClipOutlined,
  UserOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  CloseOutlined,
  FileOutlined,
} from '@ant-design/icons';

// ════════════════════════════════════════════════
// 自主智能体配置面板（Agent 配置 + 调试预览）
// ════════════════════════════════════════════════

const C = {
  primary: '#1677ff',
  primaryHover: '#4096ff',
  primaryActive: '#0958d9',
  primary1: '#e6f4ff',
  primaryBorder: '#91caff',
  text: 'rgba(0,0,0,0.88)',
  textSec: 'rgba(0,0,0,0.65)',
  textTer: 'rgba(0,0,0,0.45)',
  canvas: '#f5f7fa',
  surface: '#fff',
  surfaceMuted: '#fafafa',
  border: '#e8ebf0',
  borderLight: '#f0f0f0',
  divider: '#f0f0f0',
  success: '#52c41a',
  warning: '#faad14',
  radius: 10,
  radiusSm: 8,
  radiusXs: 6,
  mono: "'SF Mono', 'Menlo', 'Consolas', monospace",
};

const btnBase: React.CSSProperties = {
  height: 32, border: '1px solid #d9d9d9', borderRadius: 8,
  color: C.text, background: C.surface, display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', gap: 6,
  cursor: 'pointer', transition: 'all .15s ease', padding: '0 12px',
};

const iconBtn: React.CSSProperties = { ...btnBase, width: 32, padding: 0 };

const helpIcon = <QuestionCircleOutlined style={{ color: C.textTer, fontSize: 15 }} />;

const ellipsis = {
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

// ──── 变量 / 知识库 / 工具 mock ────
const variables = [
  { symbol: '{x}', name: 'summary_length', desc: '摘要长度', required: true, type: 'select' },
  { symbol: '{x}', name: 'target_language', desc: '目标语言', required: true, type: 'string' },
];

const PROMPT = `你是一名专业的文章摘要助手。请根据用户输入的文章内容生成准确、简洁、客观的摘要。

要求：
1. 准确提炼文章核心主题与关键信息。
2. 避免加入原文中不存在的观点。
3. 根据 summary_length 控制摘要长度。
4. 使用 target_language 指定的语言输出。
5. 保持表达流畅，适合直接阅读。
6. 输出内容不要包含任何 XML 标签。

<input>
summary_length: {{summary_length}}
target_language: {{target_language}}
</input>

<output>
{{summary}}
</output>`;

// ════════════════════════════════════════════════
// 调试预览：类型定义
// ════════════════════════════════════════════════

interface ToolResult { name: string; request: string; response: string }

type Block =
  | { type: 'text'; text: string }
  | { type: 'tool'; label: string; tools: ToolResult[] };

interface Attachment {
  uid: string;
  name: string;
  size?: number;
  url?: string;
  isImage: boolean;
  source: 'local' | 'url';
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  blocks?: Block[];
  thinking?: boolean;
  time?: string;
  attachments?: Attachment[];
}

const UPLOAD_CONFIG = { acceptTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'], maxSizeMB: 10, maxCount: 5 };
const isImageExt = (name: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ── 调试预览 mock 数据（文章摘要场景） ──
const AGENT_NAME = '文章摘要助手';
const WELCOME = '您好，我是文章摘要助手。发送一篇文章或一个网页链接，我将提炼核心观点并生成简洁、客观的摘要。';
const SUGGESTIONS = [
  '总结这篇文章的核心观点',
  '把下面这段长文压缩成 3 句话摘要',
  '对比这两篇文章的主要结论',
];
const SUGGESTION_ICONS = [<FileTextOutlined key="f" />, <ThunderboltOutlined key="b" />, <RightOutlined key="r" />];
const FOLLOWUP_SUGGESTIONS = [
  '再详细一点',
  '翻译成英文',
  '列出文章关键数据',
];

const FINAL_SUMMARY = '本文围绕 AI Agent 平台的最新能力展开：Claude Platform 正式推出 Computer Use、Skills API 与 Files API，并新增浏览器操作工具，使智能体能够操作软件、调用专业知识并处理成品文件。关键改进包括：Computer Use 支持多轮操作，浏览器工具通过页面结构实现精准定位，Skills API 简化专业知识管理，Files API 提供文件存储与引用。实际案例中，理赔流程时间从 32 分钟缩短至 13 分钟，成本降低约 30%，完成率达到 100%。';

const DEMO_BLOCKS: Block[] = [
  { type: 'text', text: '收到，我先抓取网页内容，再进行摘要。' },
  {
    type: 'tool', label: 'webscraper',
    tools: [{
      name: 'webscraper',
      request: '{"url": "https://aihot.virxact.com/items/..."}',
      response: '{"title": "Claude Platform 推出 Computer Use 与 Skills API", "content": "Claude Platform 正式推出 Computer Use、Skills API 与 Files API，并新增浏览器操作工具。这些功能使 AI 智能体能操作软件、调用专业知识并处理成品文件。理赔流程时间从 32 分钟缩短至 13 分钟，成本降低约 30%，完成率达到 100%。"}',
    }],
  },
  { type: 'text', text: '网页内容已抓取，正在提炼核心观点。' },
  { type: 'text', text: FINAL_SUMMARY },
];

export default function AgentConfigPanel() {
  const [toolOn, setToolOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webDrawerOpen, setWebDrawerOpen] = useState(false);

  // ── 调试预览 state ──
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [summaryLength, setSummaryLength] = useState('简短');
  const [targetLang, setTargetLang] = useState('中文');
  const [listKeyPoints, setListKeyPoints] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { message: antMessage, modal } = AntdApp.useApp();

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // ── 流式回复模拟 ──
  const streamAnswer = (assistantId: string) => {
    let acc: Block[] = [];
    DEMO_BLOCKS.forEach((block, idx) => {
      const delay = 450 + idx * 650;
      setTimeout(() => {
        acc = [...acc, block];
        setMessages(prev => prev.map(m => m.id === assistantId
          ? { ...m, thinking: false, blocks: acc, content: '', time: nowTime() } : m));
      }, delay);
    });
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === assistantId
        ? { ...m, thinking: false, blocks: acc, content: FINAL_SUMMARY, time: nowTime() } : m));
    }, 450 + DEMO_BLOCKS.length * 650 + 200);
  };

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content && attachments.length === 0) return;
    const userMsg: Msg = {
      id: Date.now().toString(), role: 'user', content, time: nowTime(),
      attachments: attachments.length ? attachments : undefined,
    };
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '', thinking: true }]);
    setInput('');
    setAttachments([]);
    streamAnswer(assistantId);
  };

  const regenerate = (assistantId: string) => {
    setMessages(prev => prev.map(m => m.id === assistantId
      ? { ...m, thinking: true, content: '', blocks: undefined } : m));
    streamAnswer(assistantId);
  };

  const confirmReset = () => {
    modal.confirm({
      title: '开启新对话',
      icon: null,
      content: '将清空当前调试对话记录，且无法恢复。是否继续？',
      okText: '新对话',
      cancelText: '取消',
      okButtonProps: { danger: false },
      onOk: () => {
        setMessages([]);
        setAttachments([]);
        setInput('');
      },
    });
  };

  // ── 附件处理 ──
  const addAttachment = (file: Attachment) =>
    setAttachments(prev => prev.some(f => f.uid === file.uid) ? prev : [...prev, file]);
  const removeAttachment = (uid: string) =>
    setAttachments(prev => prev.filter(f => f.uid !== uid));

  const beforeLocalUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!UPLOAD_CONFIG.acceptTypes.includes(ext)) {
      antMessage.error(`仅支持 ${UPLOAD_CONFIG.acceptTypes.join('、').toUpperCase()} 图片格式`);
      return Upload.LIST_IGNORE;
    }
    if (file.size > UPLOAD_CONFIG.maxSizeMB * 1024 * 1024) {
      antMessage.error(`文件大小不能超过 ${UPLOAD_CONFIG.maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    if (attachments.length >= UPLOAD_CONFIG.maxCount) {
      antMessage.error(`最多上传 ${UPLOAD_CONFIG.maxCount} 个文件`);
      return Upload.LIST_IGNORE;
    }
    const att: Attachment = {
      uid: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: file.name, size: file.size,
      isImage: isImageExt(file.name) || file.type.startsWith('image/'),
      source: 'local',
    };
    if (att.isImage) {
      const reader = new FileReader();
      reader.onload = () => { att.url = reader.result as string; addAttachment({ ...att }); };
      reader.readAsDataURL(file);
    } else {
      addAttachment(att);
    }
    return false;
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) { antMessage.error('请输入有效的 http/https 文件链接'); return; }
      const name = decodeURIComponent(u.pathname.split('/').pop() || u.hostname) || '链接文件';
      addAttachment({ uid: 'url-' + Date.now(), name, url, isImage: isImageExt(name), source: 'url' });
      setLinkUrl('');
      setUploadOpen(false);
    } catch {
      antMessage.error('请输入有效的文件链接');
    }
  };

  return (
    <>
      <style>{`
        @keyframes cfg-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .cfg-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
        .cfg-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .cfg-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 999px; }
        .cfg-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
        .cfg-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.canvas }}>
      {/* ──── 主工作区 ──── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧：配置面板 */}
        <section style={{
          flex: 1, minWidth: 360, padding: 16, overflowY: 'auto', background: C.canvas,
        }}>
          {/* 模型配置 */}
          <ConfigSection title="模型配置" help>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <button style={{ ...btnBase, flex: 1, minWidth: 0, justifyContent: 'space-between', padding: '0 8px 0 10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <CodeSandboxOutlined />
                    <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Qwen-72B-Chat-Int4-z-RAOlwSdYG
                    </span>
                    <span style={{
                      height: 20, padding: '0 5px', borderRadius: 2, color: C.textSec,
                      background: '#f5f5f5', display: 'inline-flex', alignItems: 'center', fontSize: 11, flexShrink: 0,
                    }}>CHAT</span>
                  </span>
                  <DownOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                </button>
                <button style={iconBtn} title="模型参数"><SlidersOutlined /></button>
              </div>
              <button style={{ ...btnBase, marginLeft: 24, flexShrink: 0 }}>
                <SettingOutlined /><span>Agent 模式设置</span>
              </button>
            </div>
          </ConfigSection>

          {/* 提示词 */}
          <div style={{ marginTop: 12, border: `1px solid ${C.borderLight}`, borderRadius: 8, background: C.surface, overflow: 'hidden' }}>
            <div style={{
              height: 44, padding: '0 12px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <span>提示词</span>{helpIcon}
              </div>
              <button style={{
                height: 28, padding: '0 9px', border: `1px solid #d9d9d9`, borderRadius: 8,
                color: C.primary, background: C.surface, display: 'inline-flex',
                alignItems: 'center', gap: 5, cursor: 'pointer',
              }}>
                <BulbOutlined /><span>生成</span>
              </button>
            </div>
            <textarea readOnly spellCheck={false} value={PROMPT} style={{
              width: '100%', height: 242, padding: 12, border: 0, outline: 0, resize: 'vertical',
              color: C.text, background: C.surface,
              font: '13px/1.75 "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
            }} />
            <div style={{
              height: 32, padding: '0 12px', borderTop: `1px solid ${C.borderLight}`,
              color: C.textTer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
            }}>
              <span>716 字符</span>
              <span style={{ width: 28, height: 3, borderRadius: 2, background: '#d9d9d9' }} />
            </div>
          </div>

          {/* 变量 */}
          <ConfigSection title="变量" help action={<TextAction icon={<PlusOutlined />} label="添加" />}>
            {variables.map(v => (
              <div key={v.name} style={{
                minHeight: 38, padding: '0 8px', borderRadius: 4, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', gap: 12,
                background: C.surfaceMuted,
              }}>
                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.primary, font: '13px Consolas, monospace' }}>{v.symbol}</span>
                  <span style={{ color: C.text, whiteSpace: 'nowrap' }}>{v.name}</span>
                  <span style={{ color: C.textSec, whiteSpace: 'nowrap' }}>· {v.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {v.required && (
                    <span style={{
                      height: 20, padding: '0 5px', borderRadius: 2, color: C.primary,
                      background: C.primary1, display: 'inline-flex', alignItems: 'center', fontSize: 11,
                    }}>必填</span>
                  )}
                  <span style={{ color: C.textSec, fontSize: 12 }}>{v.type}</span>
                  <ExportOutlined style={{ color: C.textSec, fontSize: 14 }} />
                </div>
              </div>
            ))}
          </ConfigSection>

          {/* 知识库 */}
          <ConfigSection title="知识库" action={<TextAction icon={<PlusOutlined />} label="添加" />}>
            <div style={{
              minHeight: 38, padding: '0 8px', borderRadius: 4, display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', background: C.surfaceMuted,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 10, color: C.primary, background: C.primary1,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}><DatabaseOutlined /></span>
                <span style={{ color: C.text }}>经侦案件知识库</span>
              </div>
              <span style={{
                height: 20, padding: '0 5px', borderRadius: 2, color: C.textSec,
                background: '#f5f5f5', display: 'inline-flex', alignItems: 'center', fontSize: 11,
              }}>外部</span>
            </div>
          </ConfigSection>

          {/* 工具 */}
          <ConfigSection title="工具" help action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textTer, fontSize: 12 }}>
              <span>1/1 启用</span><span>·</span><TextAction icon={<PlusOutlined />} label="添加" />
            </div>
          }>
            <div style={{
              minHeight: 38, padding: '0 8px', borderRadius: 4, display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', background: C.surfaceMuted,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 10, color: '#eb2f96', background: '#fff0f6',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}><ApiOutlined /></span>
                <span style={{ color: C.text }}>webscraper</span>
                <span style={{ color: C.textSec }}>网页爬虫</span>
              </div>
              <span onClick={() => setToolOn(!toolOn)} aria-pressed={toolOn}
                style={{
                  width: 36, height: 20, borderRadius: 10, background: toolOn ? C.primary : '#bfbfbf',
                  position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'all .2s ease',
                }}>
                <span style={{
                  position: 'absolute', top: 2, left: toolOn ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)', transition: 'all .2s ease',
                }} />
              </span>
            </div>
          </ConfigSection>

          {/* Web应用配置 */}
          <ConfigSection title="Web应用配置" action={<TextAction icon={<SettingOutlined />} label="配置" onClick={() => setWebDrawerOpen(true)} />}>
            <div style={{ padding: '6px 8px 10px' }}>
              <div style={{ color: C.textSec, fontSize: 13, lineHeight: '20px' }}>
                管理对话开场白、语音交互、内容审查等 Web 应用体验功能。
              </div>
            </div>
          </ConfigSection>
        </section>

        {/* 右侧：调试与预览（对齐对话页右侧对话区） */}
        <section style={{
          flex: 1, minWidth: 0, borderLeft: `1px solid ${C.border}`, background: C.surface,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* header */}
          <div style={{
            height: 48, padding: '0 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: C.surface, flexShrink: 0,
          }}>
            <span style={{ fontSize: 15, fontWeight: 650 }}>调试与预览</span>
            <Tooltip title="新对话" mouseEnterDelay={0.3}>
              <Button type="text" size="small" icon={<ReloadOutlined />} onClick={confirmReset}
                style={{ color: C.textTer, borderRadius: C.radiusXs }} />
            </Tooltip>
          </div>

          {/* 对话记录区 */}
          <div ref={bodyRef} className="cfg-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 16px' }}>
            <div style={{ maxWidth: '100%', margin: '0 auto' }}>
              {messages.length === 0 ? (
                /* 空状态：欢迎页 */
                <div style={{ paddingTop: '4vh' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16, background: C.primary1,
                      color: C.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24,
                    }}><RobotOutlined /></div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginTop: 14 }}>{AGENT_NAME}</div>
                    <div style={{ fontSize: 12, color: C.textSec, marginTop: 6 }}>
                      具备网页抓取与文本摘要能力，可快速提炼文章核心观点
                    </div>
                  </div>

                  <div style={{
                    marginTop: 20, padding: '12px 16px', borderRadius: C.radiusSm, background: C.surface,
                    border: `1px solid ${C.divider}`, fontSize: 13, color: C.text, lineHeight: '22px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}>{WELCOME}</div>

                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 12, color: C.textTer, fontWeight: 600, marginBottom: 8 }}>你可以这样提问</div>
                    {SUGGESTIONS.map((s, i) => (
                      <div key={i} onClick={() => handleSend(s)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          borderRadius: C.radiusSm, background: C.surface,
                          border: `1px solid ${C.divider}`, cursor: 'pointer', fontSize: 13, color: C.text,
                          marginBottom: 8, transition: 'all .15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = C.primaryBorder;
                          e.currentTarget.style.background = '#fafcff';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = C.divider;
                          e.currentTarget.style.background = C.surface;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{
                          width: 26, height: 26, borderRadius: 7, background: C.primary1,
                          color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, flexShrink: 0,
                        }}>{SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]}</span>
                        <span style={{ flex: 1 }}>{s}</span>
                        <RightOutlined style={{ fontSize: 11, color: C.textTer }} />
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
                      isLatest={!m.thinking && idx === messages.length - 1}
                      onFollowup={handleSend}
                      onRegenerate={() => regenerate(m.id)}
                    />
                  ))
              )}
            </div>
          </div>

          {/* 输入区 */}
          <div style={{ flexShrink: 0, padding: '12px 16px 14px', background: C.surface }}>
            <div style={{ maxWidth: '100%', margin: '0 auto' }}>
              <div style={{
                border: `1.5px solid ${inputFocused ? C.primary : C.border}`,
                borderRadius: 12, background: C.surface, padding: '8px 8px 6px 14px',
                boxShadow: inputFocused
                  ? '0 0 0 3px rgba(22,119,255,0.08), 0 2px 8px rgba(0,0,0,0.04)'
                  : '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all .2s',
              }}>
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6, padding: '2px 2px 0' }}>
                    {attachments.map(f => <FileChip key={f.uid} file={f} onRemove={() => removeAttachment(f.uid)} />)}
                  </div>
                )}
                <Input.TextArea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="输入消息，开始调试预览…"
                  autoSize={{ minRows: 1, maxRows: 5 }}
                  variant="borderless"
                  style={{ resize: 'none', fontSize: 13, lineHeight: '22px' }}
                  onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    {/* 调试参数入口胶囊 */}
                    <div
                      onClick={() => setSettingsOpen(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSec,
                        cursor: 'pointer', padding: '3px 10px', borderRadius: 999,
                        background: C.canvas, border: `1px solid ${C.border}`,
                        transition: 'all .15s', maxWidth: 220, flexShrink: 1,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = C.primary;
                        e.currentTarget.style.background = C.primary1;
                        e.currentTarget.style.borderColor = C.primaryBorder;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = C.textSec;
                        e.currentTarget.style.background = C.canvas;
                        e.currentTarget.style.borderColor = C.border;
                      }}
                    >
                      <SettingOutlined style={{ fontSize: 11, flexShrink: 0 }} />
                      <span style={ellipsis}>{summaryLength} · {targetLang}{listKeyPoints ? ' · 关键点' : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Popover
                      trigger="click"
                      open={uploadOpen}
                      onOpenChange={setUploadOpen}
                      placement="topRight"
                      overlayStyle={{ width: 320 }}
                      content={(
                        <div style={{ margin: -4, width: 300 }}>
                          <div style={{ fontSize: 12, color: C.textTer, marginBottom: 8, fontWeight: 500 }}>
                            上传方式1：输入文件链接并提取
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Input
                              size="small"
                              placeholder="链接输入框"
                              value={linkUrl}
                              onChange={e => setLinkUrl(e.target.value)}
                              onPressEnter={handleAddLink}
                              prefix={<LinkOutlined style={{ color: C.textTer }} />}
                              style={{ borderRadius: C.radiusXs, flex: 1 }}
                            />
                            <Button size="small" type="primary" onClick={handleAddLink}
                              style={{ borderRadius: C.radiusXs }}>提取</Button>
                          </div>

                          <div style={{ fontSize: 12, color: C.textTer, margin: '14px 0 8px', fontWeight: 500 }}>
                            上传方式2：从本地上传
                          </div>
                          <Upload
                            beforeUpload={beforeLocalUpload}
                            showUploadList={false}
                            multiple
                            accept="image/*"
                            disabled={attachments.length >= UPLOAD_CONFIG.maxCount}
                          >
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                              width: '100%', padding: '12px 16px', borderRadius: C.radiusSm,
                              border: `1px solid ${C.border}`, background: C.surface,
                              color: C.primary, fontSize: 14, fontWeight: 500, letterSpacing: 2,
                              cursor: attachments.length >= UPLOAD_CONFIG.maxCount ? 'not-allowed' : 'pointer',
                              transition: 'all .15s',
                            }}
                              onMouseEnter={e => {
                                if (attachments.length >= UPLOAD_CONFIG.maxCount) return;
                                e.currentTarget.style.borderColor = C.primary;
                                e.currentTarget.style.background = C.primary1;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = C.border;
                                e.currentTarget.style.background = C.surface;
                              }}
                            >
                              <CloudUploadOutlined style={{ fontSize: 17, flexShrink: 0 }} />
                              <span>从本地上传</span>
                            </div>
                          </Upload>
                          <div style={{ marginTop: 8, fontSize: 11, color: C.textTer, textAlign: 'center' }}>
                            支持 JPG、JPEG、PNG、GIF、WEBP、SVG 格式
                          </div>
                        </div>
                      )}
                    >
                      <Tooltip title="上传文件" mouseEnterDelay={0.2}>
                        <Button type="text" size="small" icon={<PaperClipOutlined />}
                          style={{
                            color: attachments.length ? C.primary : C.textSec,
                            background: attachments.length ? C.primary1 : 'transparent',
                            borderRadius: C.radiusXs,
                          }} />
                      </Tooltip>
                    </Popover>
                    <Tooltip title="Enter 发送 · Shift+Enter 换行" mouseEnterDelay={0.3}>
                      <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()}
                        disabled={!input.trim() && attachments.length === 0}
                        style={{ borderRadius: C.radiusXs, fontWeight: 500, height: 30 }}>发送</Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: C.textTer, marginTop: 8 }}>
                调试预览环境，内容由 AI 生成，请仔细甄别
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>

      {/* ──── 对话设置弹窗（沿用自主智能体对话页） ──── */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 650 }}>对话设置</span>}
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        centered
        width={460}
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
          <div style={{ fontSize: 12, color: C.textTer, lineHeight: '20px', paddingBottom: 2, borderBottom: `1px dashed ${C.border}` }}>
            配置本次调试对话的参数，发送后智能体将按此设置生成摘要。
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>摘要长度</div>
            <Select value={summaryLength} onChange={v => setSummaryLength(v)}
              style={{ width: '100%' }} options={[
                { value: '简短', label: '简短' },
                { value: '适中', label: '适中' },
                { value: '详细', label: '详细' },
              ]} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>目标语言</div>
            <Select value={targetLang} onChange={v => setTargetLang(v)}
              style={{ width: '100%' }} options={[
                { value: '中文', label: '中文' },
                { value: '英文', label: '英文' },
                { value: '日文', label: '日文' },
                { value: '跟随原文', label: '跟随原文' },
              ]} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: C.radiusSm, background: C.canvas,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>列出文章关键点</div>
              <div style={{ fontSize: 12, color: C.textTer, marginTop: 2 }}>开启后将在摘要末尾以要点形式列出核心观点</div>
            </div>
            <Switch checked={listKeyPoints} onChange={setListKeyPoints} />
          </div>
          <Button type="primary" block onClick={() => setSettingsOpen(false)}
            style={{ borderRadius: C.radiusSm, fontWeight: 600, height: 40, marginTop: 4 }}>
            完成
          </Button>
        </div>
      </Modal>

      {/* Web应用配置抽屉 */}
      <WebAppDrawer open={webDrawerOpen} onClose={() => setWebDrawerOpen(false)} />
    </>
  );
}

// ════════════════════════════════════════════════
// 调试预览：展示组件
// ════════════════════════════════════════════════

/** 思考中：三点跳动 */
const ThinkingBlock: React.FC<{ text?: string }> = ({ text = '正在思考…' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 14 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: C.primary,
          animation: `cfg-dot-bounce 1.2s infinite ease-in-out`, animationDelay: `${i * 0.16}s`,
        }} />
      ))}
    </div>
    <span style={{ fontSize: 13, color: C.textSec }}>{text}</span>
  </div>
);

/** 工具调用块 */
const ToolBlock: React.FC<{ block: Extract<Block, { type: 'tool' }> }> = ({ block }) => {
  const [open, setOpen] = useState(false);
  const t = block.tools[0];
  return (
    <div style={{ marginBottom: 12 }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 0', cursor: 'pointer', userSelect: 'none' }}>
        <DownOutlined style={{
          fontSize: 9, color: C.textTer,
          transition: 'transform .2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
        <span style={{ fontSize: 13, color: C.textTer }}>
          已使用 <span style={{ fontFamily: C.mono, color: C.textSec }}>{t.name}</span>
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.textTer, marginBottom: 3 }}>请求</div>
          <pre style={{
            margin: '0 0 10px', padding: '8px 10px', borderRadius: 6,
            background: C.canvas, fontSize: 12, lineHeight: '18px', fontFamily: C.mono,
            color: C.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>{t.request}</pre>
          <div style={{ fontSize: 11, color: C.textTer, marginBottom: 3 }}>响应</div>
          <pre className="cfg-scroll" style={{
            margin: 0, padding: '8px 10px', borderRadius: 6,
            background: C.canvas, fontSize: 12, lineHeight: '18px', fontFamily: C.mono,
            color: C.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            maxHeight: 240, overflow: 'auto',
          }}>{t.response}</pre>
        </div>
      )}
    </div>
  );
};

/** 附件卡片 */
const FileChip: React.FC<{ file: Attachment; onRemove?: () => void; inBubble?: boolean }> = ({ file, onRemove, inBubble }) => {
  if (file.isImage && file.url) {
    return (
      <div style={{
        position: 'relative', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
        border: inBubble ? '1.5px solid rgba(255,255,255,0.6)' : `1px solid ${C.border}`, background: C.canvas,
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
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: 200,
      padding: '5px 9px', borderRadius: 8,
      background: inBubble ? 'rgba(255,255,255,0.18)' : C.primary1,
      border: inBubble ? '1px solid rgba(255,255,255,0.35)' : `1px solid ${C.primaryBorder}`,
      color: inBubble ? '#fff' : C.text, flexShrink: 0,
    }}>
      <FileOutlined style={{ fontSize: 14, color: inBubble ? '#fff' : C.primary, flexShrink: 0 }} />
      <span style={{ fontSize: 12, lineHeight: '18px', ...ellipsis }}>{file.name}</span>
      {file.size ? (
        <span style={{ fontSize: 11, color: inBubble ? 'rgba(255,255,255,0.75)' : C.textTer, flexShrink: 0 }}>
          {formatFileSize(file.size)}
        </span>
      ) : null}
      {onRemove && (
        <CloseOutlined onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ fontSize: 11, cursor: 'pointer', color: inBubble ? 'rgba(255,255,255,0.8)' : C.textTer, flexShrink: 0 }} />
      )}
    </div>
  );
};

/** 用户消息 */
const UserMessage: React.FC<{ msg: Msg }> = ({ msg }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: '82%' }}>
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, paddingRight: 44 }}>
          {msg.attachments.map(f => <FileChip key={f.uid} file={f} inBubble />)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {msg.content && (
          <div style={{
            padding: '10px 14px', borderRadius: '14px 14px 4px 14px', background: C.primary,
            color: '#fff', fontSize: 13, lineHeight: '22px',
          }}>{msg.content}</div>
        )}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: C.primary, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
        }}><UserOutlined /></div>
      </div>
      {msg.time && <span style={{ fontSize: 11, color: C.textTer, marginRight: 42 }}>{msg.time}</span>}
    </div>
  </div>
);

/** 助手消息 */
const AssistantMessage: React.FC<{
  msg: Msg; isLatest?: boolean; onFollowup?: (t: string) => void; onRegenerate?: () => void;
}> = ({ msg, isLatest, onFollowup, onRegenerate }) => {
  const [hovered, setHovered] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const { message } = AntdApp.useApp();

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(msg.content); message.success('已复制到剪贴板'); }
    catch { message.error('复制失败，请手动选择复制'); }
  };

  const actionBtn = (icon: React.ReactNode, tip: string, onClick: () => void, active?: boolean) => (
    <Tooltip title={tip} mouseEnterDelay={0.2}>
      <span onClick={onClick}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 7, cursor: 'pointer',
          color: active ? C.primary : C.textTer, fontSize: 13, transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.canvas; e.currentTarget.style.color = active ? C.primary : C.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? C.primary : C.textTer; }}
      >{icon}</span>
    </Tooltip>
  );

  if (msg.thinking) {
    return (
      <div style={{ display: 'flex', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '90%' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: C.primary1, color: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
            border: `1px solid ${C.primaryBorder}`,
          }}><RobotOutlined /></div>
          <div style={{ paddingTop: 8 }}><ThinkingBlock text="正在抓取网页并生成摘要…" /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', marginBottom: isLatest ? 14 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '90%' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: C.primary1, color: C.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
          border: `1px solid ${C.primaryBorder}`,
        }}><RobotOutlined /></div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {msg.blocks && msg.blocks.length > 0 ? (
            msg.blocks.map((b, i) => b.type === 'text'
              ? <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: '23px', whiteSpace: 'pre-wrap', marginBottom: 10 }}>{b.text}</div>
              : <ToolBlock key={i} block={b} />)
          ) : (
            <div style={{ fontSize: 13, color: C.text, lineHeight: '23px', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4, opacity: hovered ? 1 : 0, transition: 'opacity .2s' }}>
            {actionBtn(<LikeOutlined />, '赞', () => setFeedback(feedback === 'like' ? null : 'like'), feedback === 'like')}
            {actionBtn(<DislikeOutlined />, '踩', () => setFeedback(feedback === 'dislike' ? null : 'dislike'), feedback === 'dislike')}
            <span style={{ width: 1, height: 13, background: C.divider, margin: '0 4px' }} />
            {actionBtn(<CopyOutlined />, '复制', handleCopy)}
            {actionBtn(<ReloadOutlined />, '重新生成', () => onRegenerate?.())}
            {msg.time && <span style={{ fontSize: 11, color: C.textTer, marginLeft: 8 }}>{msg.time}</span>}
          </div>

          {isLatest && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, height: 1, background: C.divider }} />
                <span style={{ fontSize: 12, color: C.textTer, flexShrink: 0 }}>试着问问</span>
                <span style={{ flex: 1, height: 1, background: C.divider }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLLOWUP_SUGGESTIONS.map((s, i) => (
                  <span key={i} onClick={() => onFollowup?.(s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px', borderRadius: 999, fontSize: 12, color: C.primary,
                      background: C.primary1, border: `1px solid ${C.primaryBorder}`,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#d6e4ff'; e.currentTarget.style.borderColor = C.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.primary1; e.currentTarget.style.borderColor = C.primaryBorder; }}
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
// 辅助组件
// ════════════════════════════════════════════════
const ConfigSection: React.FC<{
  title: string; help?: boolean; action?: React.ReactNode; children: React.ReactNode;
}> = ({ title, help, action, children }) => (
  <section style={{
    marginTop: 12, border: `1px solid ${C.borderLight}`, borderRadius: 8,
    background: C.surface, overflow: 'hidden',
  }}>
    <div style={{
      height: 44, padding: '0 12px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: `1px solid ${C.borderLight}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
        <span>{title}</span>{help && helpIcon}
      </div>
      {action}
    </div>
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
  </section>
);

const TextAction: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{
    height: 28, padding: '0 6px', border: 0, borderRadius: 8, color: C.primary,
    background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
  }}>
    {icon}<span>{label}</span>
  </button>
);

// ──── 小型开关 ────
const MiniSwitch: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <span onClick={onChange} aria-pressed={on}
    style={{
      width: 36, height: 20, borderRadius: 10, background: on ? C.primary : '#bfbfbf',
      position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'inline-block', transition: 'all .2s ease',
    }}>
    <span style={{
      position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
      background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)', transition: 'all .2s ease',
    }} />
  </span>
);

// ──── Web应用配置抽屉 ────
const selectStyle: React.CSSProperties = {
  height: 32, padding: '0 10px', border: `1px solid #d9d9d9`, borderRadius: 6,
  color: C.text, background: C.surface, outline: 0, fontSize: 13,
};

const WebFeature: React.FC<{
  label: string; note?: string; on: boolean; onChange: () => void; children?: React.ReactNode;
}> = ({ label, note, on, onChange, children }) => (
  <div style={{ padding: '14px 0', borderBottom: `1px solid ${C.borderLight}` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {note && <div style={{ color: C.textSec, fontSize: 12, marginTop: 4, lineHeight: '18px' }}>{note}</div>}
      </div>
      <MiniSwitch on={on} onChange={onChange} />
    </div>
    {children && (
      <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: C.surfaceMuted, display: 'grid', gap: 12 }}>
        {children}
      </div>
    )}
  </div>
);

const WebAppDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [switches, setSwitches] = useState<Record<string, boolean>>({
    enhance: true, opener: true, suggest: true, tts: true, autoPlay: true,
    stt: false, citation: true, review: true,
  });
  const toggle = (key: string) => setSwitches(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Drawer title="Web应用配置" open={open} onClose={onClose} styles={{ wrapper: { width: 440 } }}>
      <div style={{ color: C.text }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>功能</div>

        <WebFeature label="增强 web app 用户体验" on={switches.enhance} onChange={() => toggle('enhance')} />

        <WebFeature label="对话开场白"
          note="在对话型应用中，让 AI 主动说第一段话可以拉近与用户间的距离。"
          on={switches.opener} onChange={() => toggle('opener')} />

        <WebFeature label="下一步问题建议"
          note="设置下一步问题建议可以让用户更好的对话。"
          on={switches.suggest} onChange={() => toggle('suggest')} />

        <WebFeature label="文字转语音" on={switches.tts} onChange={() => toggle('tts')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: C.textSec, fontSize: 13 }}>语言</span>
            <select style={selectStyle} defaultValue="简体中文">
              <option>简体中文</option><option>繁体中文</option><option>English</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: C.textSec, fontSize: 13 }}>音色</span>
            <select style={selectStyle} defaultValue="缺省音色">
              <option>缺省音色</option><option>男声</option><option>女声</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: C.textSec, fontSize: 13 }}>自动播放</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.text, fontSize: 13 }}>{switches.autoPlay ? '开启' : '关闭'}</span>
              <MiniSwitch on={switches.autoPlay} onChange={() => toggle('autoPlay')} />
            </div>
          </div>
        </WebFeature>

        <WebFeature label="语音转文字"
          note="您可以使用语音输入。"
          on={switches.stt} onChange={() => toggle('stt')} />

        <WebFeature label="引用和归属"
          note="显示源文档和生成内容的归属部分。"
          on={switches.citation} onChange={() => toggle('citation')} />

        <WebFeature label="内容审查" on={switches.review} onChange={() => toggle('review')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: C.textSec, fontSize: 13 }}>类别</span>
            <select style={selectStyle} defaultValue="关键词">
              <option>关键词</option><option>大模型审核</option><option>自定义规则</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, display: 'inline-block' }} />
            <span style={{ color: C.textSec, fontSize: 13 }}>内容审查已启用</span>
          </div>
          <div style={{ color: C.textSec, fontSize: 13 }}>输入内容和输出内容</div>
        </WebFeature>
      </div>
    </Drawer>
  );
};
