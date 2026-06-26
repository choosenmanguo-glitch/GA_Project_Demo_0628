import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Tag, Typography, Button, Divider, Spin, message } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ToolOutlined,
  SearchOutlined,
  BulbOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// ---- 类型定义 ----
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** 关联的快捷动作标签 */
  actionTag?: string;
}

interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
}

// ---- Mock 数据 ----

const quickActions: QuickAction[] = [
  {
    key: 'agent-create',
    label: '创建智能体',
    icon: <RobotOutlined />,
    color: '#1677ff',
    prompt: '我想创建一个用于交通事故责任认定的问答智能体，请告诉我需要哪些步骤？',
  },
  {
    key: 'knowledge-query',
    label: '查询知识库',
    icon: <SearchOutlined />,
    color: '#52c41a',
    prompt: '帮我查找知识库中关于"电信诈骗涉案资金穿透"的相关文档。',
  },
  {
    key: 'model-compare',
    label: '模型对比',
    icon: <BarChartOutlined />,
    color: '#fa8c16',
    prompt: '请对比 DeepSeek-Chat 和 GPT-4o 在警情分析场景下的表现差异。',
  },
  {
    key: 'tool-recommend',
    label: '推荐工具',
    icon: <ToolOutlined />,
    color: '#722ed1',
    prompt: '我需要处理一批监控视频进行人脸识别，推荐合适的工具组合。',
  },
  {
    key: 'prompt-optimize',
    label: '优化提示词',
    icon: <BulbOutlined />,
    color: '#eb2f96',
    prompt: '我有一段110接警分析的提示词，帮我优化它的结构和准确性。',
  },
  {
    key: 'mcp-check',
    label: '检测连接器',
    icon: <ApiOutlined />,
    color: '#13c2c2',
    prompt: '帮我检查当前所有MCP连接器的健康状态。',
  },
];

// 建议追问
const suggestedFollowups = [
  '能给我一个更具体的配置示例吗？',
  '这个功能是否支持批量操作？',
  '相关的API文档在哪里可以查看？',
  '有没有现成的模板可以直接使用？',
];

// 模拟AI回答生成
const getMockReply = (userInput: string): string => {
  const lower = userInput.toLowerCase();

  if (lower.includes('创建智能体') || lower.includes('交通事故')) {
    return `好的，创建交通事故责任认定智能体需要以下步骤：

**1. 确定智能体类型**
建议选择**标准智能体**类型，适合结构化问答场景。

**2. 基础配置**
• 名称：交通事故责任认定助手
• 描述：基于事故描述判定责任归属，引用相关交通法规条款

**3. 模型选择**
推荐使用 **GPT-4o** 或 **DeepSeek-Reasoner**，两者在逻辑推理和法律条文引用方面表现出色。

**4. 知识库关联**
建议挂载以下知识库：
• 《道路交通安全法》全文库
• 交通事故责任认定标准库
• 典型事故案例裁判文书库

**5. 提示词建议**
系统提示词可以设定为："你是一名资深的交通事故处理专家，精通道路交通安全法及其实施条例……"

**6. 工具挂载**
• 文书解析工具（解析事故现场照片/笔录）
• 车辆信息查询API

是否需要我帮你直接生成完整的配置方案？`;
  }

  if (lower.includes('知识库') || lower.includes('电信诈骗')) {
    return `我在当前空间的3个知识库中找到了以下相关文档：

| 知识库 | 文档数 | 最新文档 |
|--------|--------|----------|
| 反诈案例知识库 | 128篇 | 《2026年Q2电信诈骗新趋势分析》 |
| 法律法规库 | 45篇 | 《反电信网络诈骗法实施细则》 |
| 研判报告库 | 67篇 | 《涉案资金穿透研判报告模板》 |

**推荐优先查阅：**
1. 《电信诈骗涉案资金穿透研判SOP v3.2》 - 包含完整的资金链路追踪方法论
2. 《常见诈骗话术特征库》 - 可用于智能体提示词的负面约束条件

需要我为你打开具体某篇文档，或者基于这些知识库创建一个反诈研判智能体吗？`;
  }

  if (lower.includes('模型对比') || lower.includes('deepseek') && lower.includes('gpt')) {
    return `以下是 **DeepSeek-Chat** 与 **GPT-4o** 在警情分析场景下的对比：

| 维度 | DeepSeek-Chat | GPT-4o |
|------|--------------|--------|
| 中文理解 | ★★★★★ | ★★★★☆ |
| 法律条文引用 | ★★★★☆ | ★★★★★ |
| 推理速度 | 快（~2s） | 中等（~4s） |
| 上下文窗口 | 128K | 128K |
| 部署方式 | 公网 | 公网 |
| 安全合规 | 数据不出境 | 需过境外审查 |

**推荐方案：**
• 日常警情分类/要素提取 → **DeepSeek-Chat**（速度快、中文优化好）
• 复杂案件分析/判决预测 → **GPT-4o**（推理更全面）
• 涉密场景 → **通义千问-72B 本地部署版**

目前项目中 DeepSeek-Chat 的调用成功率为 **99.2%**（本月），建议优先使用。`;
  }

  if (lower.includes('工具') || lower.includes('人脸识别') || lower.includes('监控')) {
    return `针对监控视频人脸识别场景，推荐以下工具组合：

**方案一：快速识别（推荐）**

| 工具 | 用途 | 说明 |
|------|------|------|
| 人像比对引擎 | 人脸检测+特征提取 | 支持视频流实时抓拍，相似度≥85%自动告警 |
| 视频关键帧提取（内置） | 抽帧处理 | 每2秒抽取一帧，减少计算量 |
| 人口信息查询API | 身份核验 | 比中后自动查询人员基本信息 |

**方案二：深度分析**

在方案一基础上增加：
• 车辆轨迹查询 - 关联目标人员车辆出行记录
• 关系图谱生成 - 构建涉案人员社交网络

**准备调用次数**：预估单次任务消耗约200-500次工具调用。

需要我帮你创建工作流串联这些工具吗？`;
  }

  if (lower.includes('提示词') && (lower.includes('优化') || lower.includes('110'))) {
    return `我已分析你的110接警分析提示词，优化建议如下：

**原始片段：**
> 你是一位接警中心指挥长。从文本中提取警情要素。

**优化后：**
> 你是一位拥有15年经验的110接警中心指挥长与警情研判专家。请严格按照以下流程从报案人通话转录文本中提取标准化警情要素：
>
> 1. **时间识别**：推断精确时间范围，无法确定时标注"未知"
> 2. **定位分析**：识别具体地址、地标、交叉路口
> 3. **人员提取**：区分报案人/受害人/嫌疑人，标注人数及特征
> 4. **案情分类**：参照《公安机关接处警警情分类标准》
> 5. **紧急程度**：P1(立即)/P2(30分钟内)/P3(2小时内)/P4(常规)
>
> 输出格式：严格JSON，键名使用英文驼峰命名。

**改进点：**
• ✅ 增加了具体的资历描述，提升角色一致性
• ✅ 结构化步骤，降低跳过关键信息的概率
• ✅ 明确了输出格式约束
• ✅ 添加了紧急程度分级（原版缺失）

是否要我直接保存优化后的版本？`;
  }

  if (lower.includes('连接器') || lower.includes('mcp') || lower.includes('健康')) {
    return `当前平台共有 **5个MCP连接器**，健康检查结果如下：

| 连接器 | 状态 | 延迟 | 可用工具 | 最近异常 |
|--------|------|------|----------|----------|
| 公安数据研判MCP | 🟢 正常 | 320ms | 8个 | 无 |
| 市局人口库MCP | 🟢 正常 | 180ms | 4个 | 无 |
| 天网视频分析MCP | 🟠 异常 | 850ms | 5个 | 6月25日 14:32 |
| 公文处理引擎 | 🟢 正常 | 120ms | 3个 | 无 |
| 短信通知网关 | 🔴 离线 | - | 2个 | 6月24日 09:15 |

**⚠️ 需要关注：**
1. **天网视频分析MCP** - 响应延迟超过800ms，建议检查视频流通道
2. **短信通知网关** - 已离线超过24小时，需联系运维团队重启

需要我帮你查看具体连接器的错误日志吗？`;
  }

  // 默认回答
  return `好的，我来帮你分析这个问题。

根据当前平台的能力和资源，我建议从以下几个方面入手：

1. **先确认当前空间的资源配额** - 包括模型调用额度、已创建智能体数量等
2. **检查相关的组件配置** - 确保所需的模型、工具和知识库已正确接入
3. **参考已有的成功案例** - 我可以从现有模板中匹配最接近的方案

你可以进一步描述具体的使用场景，我会给出更精确的建议。比如：
• 你想解决什么业务问题？
• 目标用户是谁？
• 期望的输出形式是什么？

我也可以直接推荐合适的模板来快速启动你的需求。`;
};

/** 初始欢迎消息 */
const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `你好！我是**鲁警智算 AI 助手**，很高兴为你服务。

我可以帮你：
• 🚀 快速创建和配置智能体
• 📚 检索知识库和文档
• 📊 分析模型性能和对比
• 🔧 推荐工具组合和连接器
• ✨ 优化提示词和配置方案

你可以直接输入问题，或点击下方的快捷入口试试~`,
  timestamp: '',
};

// ---- 组件 ----
interface GlobalAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
}

const GlobalAssistantDrawer: React.FC<GlobalAssistantDrawerProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = async (text?: string) => {
    const content = (text || inputValue).trim();
    if (!content || isLoading) return;

    setShowActions(false);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI回复延迟
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const reply = getMockReply(content);
    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
    message.info(`已执行：${action.label}`);
  };

  const handleClear = () => {
    setMessages([welcomeMessage]);
    setShowActions(true);
    setInputValue('');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  return (
    <Drawer
      title={null}
      open={open}
      onClose={onClose}
      width={480}
      placement="right"
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
        header: { display: 'none' },
      }}
      closable={false}
      mask
    >
      {/* ===== 顶部标题栏 ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5H22L15.5 14L17 21L12 17L7 21L8.5 14L2 9.5H9.5L12 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.88)' }}>
              AI 智能助手
            </div>
            <div style={{ fontSize: 11, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: '#52c41a',
                display: 'inline-block', boxShadow: '0 0 0 2px rgba(82,196,26,0.2)',
              }} />
              在线 · 随时为您服务
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleClear}
            style={{ color: 'rgba(0,0,0,0.35)' }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={onClose}
            style={{ color: 'rgba(0,0,0,0.35)', fontSize: 16 }}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* ===== 消息列表区 ===== */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: '#fafbfc',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            {/* 头像 */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                  : '#1677ff',
                boxShadow: msg.role === 'assistant'
                  ? '0 2px 6px rgba(124,58,237,0.25)'
                  : '0 2px 6px rgba(22,119,255,0.25)',
              }}
            >
              {msg.role === 'assistant' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5H22L15.5 14L17 21L12 17L7 21L8.5 14L2 9.5H9.5L12 2Z" fill="white" />
                </svg>
              ) : (
                <UserOutlined style={{ color: '#fff', fontSize: 14 }} />
              )}
            </div>

            {/* 消息内容 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 角色 + 时间 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text strong style={{ fontSize: 12 }}>
                  {msg.role === 'assistant' ? 'AI 助手' : '你'}
                </Text>
                {msg.timestamp && (
                  <Text type="secondary" style={{ fontSize: 10 }}>{msg.timestamp}</Text>
                )}
              </div>

              {/* 气泡 */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'assistant' ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
                  background: msg.role === 'assistant' ? '#fff' : '#e6f4ff',
                  border: msg.role === 'assistant' ? '1px solid #f0f0f0' : '1px solid #bae0ff',
                  fontSize: 13,
                  lineHeight: '1.7',
                  color: 'rgba(0,0,0,0.85)',
                  wordBreak: 'break-word',
                }}
              >
                {/* 简单渲染 Markdown 粗体和表格 */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(0,0,0,0.88)">$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .replace(/\|(.+)\|/g, (match) => {
                        if (!match.includes('---')) {
                          const cells = match.split('|').filter(Boolean).map(c => `<td style="padding:2px 8px;border-bottom:1px solid #f0f0f0">${c.trim()}</td>`).join('');
                          return `<tr>${cells}</tr>`;
                        }
                        return '';
                      })
                      .replace(/(<tr>.*?<\/tr>)/g, (match) => `<table style="width:100%;border-collapse:collapse;font-size:12px;margin:6px 0">${match}</table>`)
                      .replace(/• (.+)/g, '<div style="display:flex;gap:6px;align-items:flex-start;margin:3px 0"><span style="color:#1677ff;flex-shrink:0">●</span><span>$1</span></div>')
                      .replace(/✅/g, '<span style="color:#52c41a">✅</span>')
                      .replace(/⚠️/g, '<span style="color:#faad14">⚠️</span>')
                      .replace(/🔴/g, '<span style="color:#ff4d4f">🔴</span>')
                      .replace(/🟢/g, '<span style="color:#52c41a">🟢</span>')
                      .replace(/🟠/g, '<span style="color:#faad14">🟠</span>'),
                  }}
                />
              </div>

              {/* 操作按钮（仅AI消息） */}
              {msg.role === 'assistant' && msg.id !== 'welcome' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingLeft: 2 }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(msg.content)}
                    style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', height: 24, padding: '0 8px' }}
                  >
                    复制
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<LikeOutlined />}
                    style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', height: 24, padding: '0 8px' }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DislikeOutlined />}
                    style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', height: 24, padding: '0 8px' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading 状态 */}
        {isLoading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5H22L15.5 14L17 21L12 17L7 21L8.5 14L2 9.5H9.5L12 2Z" fill="white" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 4, padding: '10px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite 0.2s' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite 0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== 快捷入口区 ===== */}
      {showActions && messages.length === 1 && (
        <div style={{ flexShrink: 0, padding: '0 20px 12px', background: '#fafbfc' }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, display: 'block' }}>
            快捷入口
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickActions.map((action) => (
              <div
                key={action.key}
                onClick={() => handleQuickAction(action)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 18,
                  border: '1px solid #f0f0f0',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(0,0,0,0.65)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLElement).style.color = action.color;
                  (e.currentTarget as HTMLElement).style.background = `rgba(${parseInt(action.color.slice(1, 3), 16)},${parseInt(action.color.slice(3, 5), 16)},${parseInt(action.color.slice(5, 7), 16)},0.04)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.65)';
                  (e.currentTarget as HTMLElement).style.background = '#fff';
                }}
              >
                <span style={{ color: action.color, fontSize: 13, display: 'flex' }}>
                  {action.icon}
                </span>
                {action.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 追问建议 */}
      {!isLoading && messages.length > 1 && messages[messages.length - 1].role === 'assistant' && (
        <div style={{ flexShrink: 0, padding: '8px 20px 12px', background: '#fafbfc' }}>
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 6, display: 'block' }}>
            你可能还想问
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestedFollowups.map((q) => (
              <div
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 14,
                  border: '1px solid #f0f0f0',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'rgba(0,0,0,0.55)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                  (e.currentTarget as HTMLElement).style.color = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.55)';
                }}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 底部输入区 ===== */}
      <div
        style={{
          flexShrink: 0,
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Input.TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你的问题，按 Enter 发送..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              borderRadius: 10,
              fontSize: 13,
              resize: 'none',
              border: '1px solid #e8e8e8',
            }}
            disabled={isLoading}
          />
          <Button
            type="primary"
            icon={<ArrowUpOutlined />}
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            style={{
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: inputValue.trim()
                ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
                : '#d9d9d9',
              border: 'none',
              boxShadow: inputValue.trim() ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
            }}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 10, marginTop: 6, display: 'block', textAlign: 'center' }}>
          AI 助手可能产生不准确的回答，请以官方文档为准
        </Text>
      </div>

      {/* 脉冲动画 */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Drawer>
  );
};

export default GlobalAssistantDrawer;
