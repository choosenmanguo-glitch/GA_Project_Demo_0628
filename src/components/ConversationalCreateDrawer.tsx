import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Drawer, Input, Typography, Button, Tag, message, Tooltip, Badge } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CheckCircleFilled,
  CloseOutlined,
  ReloadOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  ToolOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  FileTextOutlined,
  AudioOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// ── 设计 Token ──
const T = {
  primary: '#1677ff',
  purple: '#722ed1',
  primaryBg: '#f0f5ff',
  purpleBg: '#f9f0ff',
  textPrimary: 'rgba(0,0,0,0.88)',
  textSecondary: 'rgba(0,0,0,0.45)',
  textBody: 'rgba(0,0,0,0.65)',
  textTertiary: 'rgba(0,0,0,0.25)',
  border: '#f0f0f0',
  bgLight: '#fafafa',
  bgPage: '#f5f7fa',
  white: '#fff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
};

// ── 类型定义 ──
type ConversationStage = 'greeting' | 'requirement' | 'output_format' | 'tool_recommend' | 'safety_check' | 'review';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  stage?: ConversationStage;
  /** 交互卡片 */
  cards?: UICard[];
}

interface UICard {
  type: 'tool' | 'knowledge_base' | 'constraint' | 'test';
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  linked?: boolean;
  tags?: string[];
  detail?: string;
}

interface ReasoningStep {
  label: string;
  detail: string;
  result: string;
}

interface GeneratedConfig {
  type: { key: string; label: string; reason: string } | null;
  name: string | null;
  description: string | null;
  systemPrompt: string | null;
  /** 打字机效果展示的提示词 */
  displayPrompt: string;
  knowledgeBases: { name: string; matchScore: number; reason: string; linked: boolean }[];
  tools: { name: string; icon: string; useCase: string; matchReason: string; linked: boolean }[];
  model: { name: string; params: string; reason: string } | null;
  extraCapabilities: string[];
  reasoningTrace: ReasoningStep[];
  /** 输出格式 */
  outputFormat: string;
  /** 约束 */
  constraints: string[];
}

const emptyConfig: GeneratedConfig = {
  type: null,
  name: null,
  description: null,
  systemPrompt: null,
  displayPrompt: '',
  knowledgeBases: [],
  tools: [],
  model: null,
  extraCapabilities: [],
  reasoningTrace: [],
  outputFormat: '',
  constraints: [],
};

const AUTONOMOUS_TYPE = { key: 'autonomous', label: '自主智能体', reason: '对话式创建默认采用自主智能体模式，具备自主规划与工具调用能力，可分解复杂目标为子任务逐步执行。' };

const stages: { key: ConversationStage; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'requirement', label: '需求收集', icon: <BulbOutlined />, description: '描述智能体的用途' },
  { key: 'output_format', label: '输出格式', icon: <FileTextOutlined />, description: '确认输出格式' },
  { key: 'tool_recommend', label: '资源推荐', icon: <ToolOutlined />, description: '智能匹配工具与知识库' },
  { key: 'safety_check', label: '安全规范', icon: <SafetyCertificateOutlined />, description: '隐私与安全约束' },
  { key: 'review', label: '审阅确认', icon: <EyeOutlined />, description: '最终审阅与测试' },
];

// ═══════════════════════════════════════════
// Demo 背景：济南市某分局反诈中心刑警老李
// ═══════════════════════════════════════════

const DEMO_AGENT_NAME = '电诈线索分析专家';
const DEMO_AGENT_DESC = '自动提取受害人笔录中的手机号、银行卡号等关键线索，分析作案手法，生成标准化涉诈线索分析报告。';

// 完整系统提示词（打字机逐步展示）
const FULL_SYSTEM_PROMPT = `你是一名资深反诈研判专家，拥有10年以上电信诈骗案件侦办经验，精通《刑法》第266条、《反电信网络诈骗法》及两高一部相关司法解释。

## 角色定位
作为反诈智能助手，你的核心使命是辅助一线民警高效处理电诈案件线索，缩短从接案到研判的时间窗口。

## 核心能力
1. **线索提取**：从受害人询问笔录中自动识别并提取：
   - 涉案手机号码（支持多号码并行提取）
   - 银行卡号及开户行信息
   - 社交账号（微信/QQ/Telegram等）
   - 转账时间、金额、渠道
   - 嫌疑人自称身份（如"公检法""客服""理财导师"等）
2. **手法分析**：基于提取要素归纳作案手法类型
   - 冒充公检法 / 刷单返利 / 杀猪盘 / 虚假贷款 / 冒充客服 / 虚假投资理财
3. **法律关联**：自动关联《刑法》《反电信网络诈骗法》相关条款
4. **报告生成**：按《涉诈线索登记表》标准格式输出结构化分析报告

## 输出格式
严格按以下标准表格输出：
| 字段 | 内容 |
|------|------|
| 线索编号 | 自动生成 |
| 涉案号码 | 手机号/银行卡号/社交账号（标注类型） |
| 号码标记状态 | 已标记/未标记（需查询公安部反诈大数据库） |
| 作案手法 | 具体类型 + 行为特征描述 |
| 关联法条 | 具体法律条款 |
| 资金流向 | 转账链路摘要 |
| 紧急程度 | P1(紧急)/P2(高)/P3(中)/P4(常规) |

## 安全约束
- 严格执行隐私脱敏：除涉案线索外，不保留笔录中非本案相关的个人隐私（如病历、家庭住址、家庭成员等）
- 数据仅用于案件侦办，不得以任何形式外泄
- 线索分析结果仅供办案参考，最终认定以侦查部门结论为准`;

// Demo 专用资源
const demoKnowledgeBases = [
  { name: '2025年最新涉网犯罪典型案例库', domain: '反诈', keywords: ['诈骗', '电信', '网络', '案例', '手法'], docCount: 328, reason: '含近两年已判决电信诈骗典型案例，可辅助作案手法比对分析' },
  { name: '反电信网络诈骗法律法规汇编', domain: '反诈', keywords: ['反诈', '法规', '刑法', '司法解释', '电信'], docCount: 87, reason: '《反电信网络诈骗法》全文及配套司法解释，用于法律条款自动关联' },
  { name: '济南市反诈中心历史案件库', domain: '反诈', keywords: ['济南', '案件', '反诈', '历史', '笔录'], docCount: 1240, reason: '本地区历史电诈案件数据，可辅助地域性作案特征分析' },
];

const demoTools = [
  { name: '公安部反诈大数据库查询API', icon: '🛡️', capability: '查询手机号/银行卡号的涉案标记状态、历史风险标签、关联案件数', category: 'MCP' },
  { name: '笔录智能解析引擎', icon: '📝', capability: '自然语言处理引擎，自动从非结构化笔录文本中提取结构化涉案要素', category: '内置' },
  { name: '资金链路追踪工具', icon: '💰', capability: '根据银行卡号追溯资金流转路径，识别多级账户洗钱特征', category: 'MCP' },
  { name: '司法文书生成引擎', icon: '📋', capability: '依照《涉诈线索登记表》公安部标准模板自动生成结构化报告', category: '内置' },
];

// ═══════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════

interface ConversationalCreateDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ConversationalCreateDrawer: React.FC<ConversationalCreateDrawerProps> = ({ open, onClose }) => {
  const nav = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [config, setConfig] = useState<GeneratedConfig>({ ...emptyConfig });
  const [dialogueRound, setDialogueRound] = useState(0);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const typewriterTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stageIndex = stage === 'greeting' ? -1 : stages.findIndex(s => s.key === stage);

  // 打字机效果
  const startTypewriter = useCallback((fullText: string, onProgress: (partial: string) => void, onDone: () => void) => {
    let i = 0;
    const chunk = 3;
    if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    typewriterTimer.current = setInterval(() => {
      i += chunk;
      if (i >= fullText.length) {
        onProgress(fullText);
        if (typewriterTimer.current) clearInterval(typewriterTimer.current);
        typewriterTimer.current = null;
        onDone();
      } else {
        onProgress(fullText.slice(0, i));
      }
    }, 15);
  }, []);

  useEffect(() => { return () => { if (typewriterTimer.current) clearInterval(typewriterTimer.current); }; }, []);

  // 初始化
  useEffect(() => {
    if (open) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '你好，我是**智能构建助手**。\n\n请告诉我你想创建的智能体——描述它的**用途、要解决什么问题、用于什么场景**。\n\n描述越具体，方案越精准。',
        timestamp: '',
        stage: 'greeting',
      }]);
      setStage('greeting');
      setConfig({ ...emptyConfig });
      setDialogueRound(0);
      setShowTestPanel(false);
      setTestInput('');
      setTestResult('');
      setInputValue('');
    }
  }, [open]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (open && stage !== 'greeting') setTimeout(() => inputRef.current?.focus(), 400);
  }, [open, stage]);

  // ── 生成带时间戳的消息 ──
  const ts = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // ── 对话引擎（4轮Demo流程） ──
  const processRound = useCallback(async (round: number, userInput: string): Promise<{
    reply: string;
    nextRound: number;
    partialConfig?: Partial<GeneratedConfig>;
    cards?: UICard[];
  }> => {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    switch (round) {
      // ═══ 回合1：模糊意图识别与基础框架搭建 ═══
      case 1: {
        const t = userInput.toLowerCase();
        const hasPhoneCard = t.includes('手机号') || t.includes('银行卡') || t.includes('账号');
        const hasMethod = t.includes('手法') || t.includes('作案');

        setConfig(prev => ({
          ...prev,
          type: AUTONOMOUS_TYPE,
          name: DEMO_AGENT_NAME,
          description: DEMO_AGENT_DESC,
        }));

        // 启动打字机效果
        startTypewriter(
          FULL_SYSTEM_PROMPT,
          (partial) => setConfig(prev => ({ ...prev, displayPrompt: partial })),
          () => setConfig(prev => ({ ...prev, systemPrompt: FULL_SYSTEM_PROMPT })),
        );

        const reply = `收到。正在为您构建**「${DEMO_AGENT_NAME}」**。

我已经为您在右侧生成了初始的系统提示词。为了让它更符合您的办案习惯，提取出的手机号和银行卡号，您希望它直接输出列表，还是需要按照公安部统一的《涉诈线索登记表》格式生成表格？`;

        setStage('output_format');

        return {
          reply,
          partialConfig: {
            name: DEMO_AGENT_NAME,
            description: DEMO_AGENT_DESC,
            type: AUTONOMOUS_TYPE,
            outputFormat: '',
            reasoningTrace: [
              { label: '意图识别', detail: '语义分析', result: '电诈线索提取 + 作案手法分析' },
              { label: '领域定位', detail: '关键词匹配', result: '反诈/经侦' },
              { label: '角色命名', detail: '业务术语库匹配', result: DEMO_AGENT_NAME },
              { label: '提示词生成', detail: '结构化模板填充', result: `角色设定 + 5项核心能力 + 安全约束` },
            ],
          } as Partial<GeneratedConfig>,
          nextRound: 2,
        };
      }

      // ═══ 回合2：推荐G端专属工具与知识库 ═══
      case 2: {
        setConfig(prev => ({ ...prev, outputFormat: '《涉诈线索登记表》标准表格' }));

        return {
          reply: `没问题，已在右侧将输出格式更新为标准表格。

检测到您需要查询号码标记情况，我为您找到了系统内的 MCP 工具：**【公安部反诈大数据库查询 API】**。需要我帮您授权并挂载到这个助手上吗？

另外，为了分析作案手法，建议您关联我们平台内部的**【2025年最新涉网犯罪典型案例库】**，是否一起添加？`,
          nextRound: 3,
          cards: [
            {
              type: 'tool',
              id: 'antifraud_db',
              title: '公安部反诈大数据库查询API',
              subtitle: 'MCP 工具 · 查询号码涉案标记状态',
              icon: '🛡️',
              linked: false,
              tags: ['MCP', '已授权', '即开即用'],
            },
            {
              type: 'knowledge_base',
              id: 'case_lib',
              title: '2025年最新涉网犯罪典型案例库',
              subtitle: '328篇案例 · 反诈中心编制',
              icon: '📚',
              linked: false,
              tags: ['知识库', '官方', '持续更新'],
            },
          ],
          partialConfig: {
            outputFormat: '《涉诈线索登记表》标准表格',
          } as Partial<GeneratedConfig>,
        };
      }

      // ═══ 回合3：确立边界与安全规范 ═══
      case 3: {
        const t = userInput.toLowerCase();
        if (t.includes('加上') || t.includes('都加') || t.includes('可以') || t.includes('好') || t.includes('挂载')) {
          const linkedKBs = demoKnowledgeBases.map(kb => ({ ...kb, matchScore: 95, reason: kb.reason, linked: true }));
          const linkedTools = demoTools.map(t => ({ name: t.name, icon: t.icon, useCase: t.capability, matchReason: '用户确认挂载', linked: true }));

          setConfig(prev => ({
            ...prev,
            knowledgeBases: linkedKBs,
            tools: linkedTools,
            reasoningTrace: [
              ...(prev.reasoningTrace || []),
              { label: '工具挂载', detail: '用户一键确认', result: '公安部反诈大数据库查询API + 3个工具' },
              { label: '知识库关联', detail: '用户一键确认', result: '3个反诈领域知识库' },
            ],
          }));

          return {
            reply: `已为您挂载相应工具和知识库。

最后确认一项**安全纪律**：由于涉及涉密侦查数据，如果遇到受害人笔录中含有非本案相关的敏感个人隐私（如病历、家庭住址等），助手是应该予以脱敏屏蔽，还是原样保留在报告中备查？`,
            nextRound: 4,
            cards: [
              {
                type: 'constraint',
                id: 'privacy_consent',
                title: '隐私数据处理策略',
                subtitle: '请选择笔录中无关隐私的处理方式',
                icon: '🔒',
                detail: '病历、家庭住址、家庭成员等非涉案个人隐私',
              },
            ],
            partialConfig: {
              knowledgeBases: linkedKBs,
              tools: linkedTools,
            } as Partial<GeneratedConfig>,
          };
        }

        // 用户如果直接要报告
        const linkedKBs = demoKnowledgeBases.map(kb => ({ ...kb, matchScore: 95, reason: kb.reason, linked: true }));
        const linkedTools = demoTools.map(t => ({ name: t.name, icon: t.icon, useCase: t.capability, matchReason: '用户确认挂载', linked: true }));

        return {
          reply: `已为您挂载相应工具和知识库。提取完直接生成分析报告的需求已记录。

最后确认一项**安全纪律**：由于涉及涉密侦查数据，如果遇到受害人笔录中含有非本案相关的敏感个人隐私（如病历、家庭住址等），助手是应该予以脱敏屏蔽，还是原样保留在报告中备查？`,
          nextRound: 4,
          cards: [{
            type: 'constraint',
            id: 'privacy_consent',
            title: '隐私数据处理策略',
            subtitle: '请选择笔录中无关隐私的处理方式',
            icon: '🔒',
            detail: '病历、家庭住址、家庭成员等非涉案个人隐私',
          }],
          partialConfig: {
            knowledgeBases: linkedKBs,
            tools: linkedTools,
            outputFormat: '《涉诈线索登记表》标准表格 + 综合分析报告',
          } as Partial<GeneratedConfig>,
        };
      }

      // ═══ 回合4：配置收敛与沙盒测试 ═══
      case 4: {
        const t = userInput.toLowerCase();
        const desensitize = t.includes('脱敏') || t.includes('屏蔽') || t.includes('不保留') || t.includes('除涉案');

        if (desensitize) {
          setConfig(prev => ({
            ...prev,
            constraints: ['严格执行隐私脱敏：除涉案线索外，不保留笔录中非本案相关的个人隐私（病历、家庭住址等）'],
            model: { name: 'DeepSeek-Reasoner', params: 'Temperature: 0.3, Top-P: 0.9', reason: '自主智能体需要复杂的多步推理和工具编排能力，DeepSeek-Reasoner在逻辑推理和函数调用方面表现最优。' },
          }));

          setStage('review');
          setTimeout(() => setShowTestPanel(true), 600);

          return {
            reply: `明白，已将**「严格执行隐私脱敏」**写入强制约束（Constraints）中。

配置已全部完成！您可以查看右侧的完整表单。我们在下方准备了**测试窗口**，您现在就可以发一段测试笔录给它试试效果了。`,
            nextRound: 5,
            partialConfig: {
              constraints: ['严格执行隐私脱敏：除涉案线索外，不保留笔录中非本案相关的个人隐私（病历、家庭住址等）'],
              model: { name: 'DeepSeek-Reasoner', params: 'Temperature: 0.3, Top-P: 0.9', reason: '自主智能体需要复杂的多步推理和工具编排能力。' },
            } as Partial<GeneratedConfig>,
          };
        }

        setStage('review');
        setShowTestPanel(true);
        return {
          reply: `已记录您的偏好。配置已全部完成！\n\n您可以查看右侧的完整表单。我们在下方准备了**测试窗口**，您现在就可以发一段测试笔录给它试试效果了。`,
          nextRound: 5,
        };
      }

      default:
        return { reply: '配置已完成。您可以在下方测试窗口试用，或关闭抽屉。', nextRound: 5 };
    }
  }, [startTypewriter]);

  // ── 发送消息 ──
  const handleSend = useCallback(async (text?: string) => {
    const content = (text || inputValue).trim();
    if (!content || isLoading) return;

    // 审阅阶段用户说确认创建，直接跳转
    if (stage === 'review' && (content.includes('确认创建') || content.includes('进入配置') || content.includes('提交配置'))) {
      setInputValue('');
      message.success(`智能体「${config.name || DEMO_AGENT_NAME}」创建成功，即将跳转至配置页面。`);
      onClose();
      setTimeout(() => nav('/dev/agent-config'), 400);
      return;
    }

    const nextRound = dialogueRound + 1;
    setDialogueRound(nextRound);

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`, role: 'user', content, timestamp: ts(),
      stage: stage === 'greeting' ? 'requirement' : stage,
    }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { reply, nextRound: _, partialConfig, cards } = await processRound(nextRound, content);
      if (partialConfig) setConfig(prev => ({ ...prev, ...partialConfig }));

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`, role: 'assistant', content: reply, timestamp: ts(),
        stage: stage, cards,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, dialogueRound, stage, processRound]);

  // ── 卡片点击（一键关联） ──
  const handleCardAction = useCallback((card: UICard) => {
    if (card.type === 'tool' || card.type === 'knowledge_base') {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        cards: msg.cards?.map(c => c.id === card.id ? { ...c, linked: true } : c),
      })));

      if (card.type === 'tool') {
        setConfig(prev => ({
          ...prev,
          tools: demoTools.map(t => ({ name: t.name, icon: t.icon, useCase: t.capability, matchReason: '用户一键挂载', linked: true })),
        }));
        message.success(`已挂载：${card.title}`);
      } else {
        setConfig(prev => ({
          ...prev,
          knowledgeBases: demoKnowledgeBases.map(kb => ({ ...kb, matchScore: 95, reason: kb.reason, linked: true })),
        }));
        message.success(`已关联：${card.title}`);
      }
    }

    if (card.type === 'constraint') {
      message.info('请在下方输入框中回复您的选择，例如「脱敏处理」');
      setInputValue('脱敏处理，除涉案线索外不保留无关隐私。');
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, []);

  // ── 语音录制模拟 ──
  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      message.success('语音录制完成，已转为文字');
      setInputValue('最近电诈案子多，受害人笔录太长了，我想弄个助手帮我自动提炼笔录里的嫌疑人手机号、银行卡号，顺便分析一下作案手法。');
      setTimeout(() => handleSend('最近电诈案子多，受害人笔录太长了，我想弄个助手帮我自动提炼笔录里的嫌疑人手机号、银行卡号，顺便分析一下作案手法。'), 600);
    } else {
      setIsRecording(true);
      message.info('正在录制语音...（Demo 模拟）');
      setTimeout(() => {
        if (isRecording) {
          setIsRecording(false);
          message.success('语音录制完成，已转为文字');
          setInputValue('最近电诈案子多，受害人笔录太长了，我想弄个助手帮我自动提炼笔录里的嫌疑人手机号、银行卡号，顺便分析一下作案手法。');
        }
      }, 2500);
    }
  };

  // ── 测试面板 ──
  const handleTestSubmit = () => {
    if (!testInput.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setTestResult(
        `**涉诈线索分析报告**
━━━━━━━━━━━━━━━━━━

| 字段 | 内容 |
|------|------|
| 线索编号 | JN-FZ-2026-00001 |
| 涉案号码 | 📱 138****5678（嫌疑人联系号码）\\n💳 6222****1234（涉案收款卡）\\n💚 WeChat: fraud_account_01 |
| 号码标记状态 | ⚠️ 已标记（公安部反诈数据库查询结果：关联案件3起） |
| 作案手法 | **冒充公检法** - 嫌疑人冒充"济南市公安局刑侦支队"工作人员，以受害人涉嫌洗钱为由，诱导转账至"安全账户"，涉案金额5.8万元 |
| 关联法条 | 《刑法》第266条（诈骗罪）\\n《反电信网络诈骗法》第22条 |
| 资金流向 | 受害人账户 → 一级卡 6222****1234 → 二级卡 6217****9876（境外） |
| 紧急程度 | 🔴 **P1(紧急)** - 资金尚未完全出境，建议立即启动紧急止付 |
| 备注 | 已脱敏处理：笔录中受害人家庭住址、身份证号已自动屏蔽 |

> 📌 以上分析结果仅供办案参考，最终认定以侦查部门结论为准。`,
      );
      setIsLoading(false);
    }, 2000);
  };

  // ── 重置 ──
  const handleReset = () => {
    if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    setMessages([{ id: 'welcome', role: 'assistant', content: '你好，我是**智能构建助手**。\n\n请告诉我你想创建的智能体——描述它的**用途、要解决什么问题、用于什么场景**。\n\n描述越具体，方案越精准。', timestamp: '', stage: 'greeting' }]);
    setStage('greeting');
    setConfig({ ...emptyConfig });
    setDialogueRound(0);
    setShowTestPanel(false);
    setTestInput('');
    setTestResult('');
    setInputValue('');
  };

  const handleCreateAndGo = () => {
    message.success(`智能体「${config.name || DEMO_AGENT_NAME}」创建成功，即将跳转至配置页面。`);
    onClose();
    setTimeout(() => nav('/dev/agent-config'), 400);
  };

  // ── 消息内容渲染 ──
  const renderContent = (content: string) => (
    <div dangerouslySetInnerHTML={{
      __html: content
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(0,0,0,0.88);font-weight:650">$1</strong>')
        .replace(/\n/g, '<br/>')
        .replace(/^> (.+)$/gm, '<span style="color:rgba(0,0,0,0.45);border-left:3px solid #1677ff;padding-left:10px;display:inline-block;margin:4px 0">$1</span>')
        .replace(/• (.+)/g, '<div style="display:flex;gap:6px;align-items:flex-start;margin:2px 0"><span style="color:#1677ff;flex-shrink:0">•</span><span>$1</span></div>'),
    }} />
  );

  // ── 交互卡片渲染 ──
  const renderCards = (cards: UICard[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      {cards.map(card => {
        const isLinked = card.linked;
        return (
          <div key={card.id}
            style={{
              background: isLinked ? '#f6ffed' : '#fff',
              border: isLinked ? '1px solid #b7eb8f' : `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              transition: 'all 0.25s',
              cursor: isLinked ? 'default' : 'pointer',
            }}
            onClick={() => !isLinked && handleCardAction(card)}
            onMouseEnter={(e) => {
              if (!isLinked) { e.currentTarget.style.borderColor = T.purple; e.currentTarget.style.boxShadow = '0 2px 12px rgba(114,46,209,0.1)'; }
            }}
            onMouseLeave={(e) => {
              if (!isLinked) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              background: isLinked ? '#f6ffed' : card.type === 'tool' ? '#fff7e6' : card.type === 'constraint' ? '#fff0f6' : '#f0f5ff',
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13 }}>{card.title}</Text>
                {isLinked && <Tag color="success" style={{ margin: 0, borderRadius: 4, fontSize: 10 }}>已关联</Tag>}
                {card.type === 'constraint' && <Tag color="volcano" style={{ margin: 0, borderRadius: 4, fontSize: 10 }}>待确认</Tag>}
              </div>
              {card.subtitle && <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{card.subtitle}</Text>}
              {card.detail && <Text type="secondary" style={{ fontSize: 11, display: 'block', color: T.error }}>{card.detail}</Text>}
              {card.tags && card.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {card.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#f5f5f5', color: T.textSecondary }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
            {!isLinked && (
              <Button type="primary" size="small" icon={<LinkOutlined />}
                style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); handleCardAction(card); }}>
                一键关联
              </Button>
            )}
            {isLinked && <CheckCircleFilled style={{ color: T.success, fontSize: 18, flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );

  // ═══ 预览区 ═══
  const renderPreview = () => {
    const hasContent = !!(config.type || config.name || config.displayPrompt);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flexShrink: 0, padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${T.purple}, #9c6ade)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(114,46,209,0.2)' }}>
              <EyeOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ fontSize: 14 }}>配置预览</Text>
          </div>
          {hasContent && <Tag color="processing" style={{ borderRadius: 4, margin: 0 }}>实时更新</Tag>}
        </div>

        <div className="conv-create-drawer-right" style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {!hasContent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.textTertiary, gap: 12 }}>
              <RobotOutlined style={{ fontSize: 40, opacity: 0.3 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>在左侧对话中描述你的需求</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>配置方案将在此实时展现</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 类型 */}
              {config.type && (
                <ConfigSection icon={<SafetyCertificateOutlined />} title="智能体类型" accentColor={T.purple} status="confirmed">
                  <Tag color="purple" style={{ borderRadius: 4, margin: 0 }}>{config.type.label}</Tag>
                </ConfigSection>
              )}

              {/* 名称 + 描述 */}
              {config.name && (
                <ConfigSection icon={<EditOutlined />} title="基础信息" accentColor="#13c2c2" status="confirmed">
                  <div style={{ marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 14 }}>{config.name}</Text>
                  </div>
                  {config.description && <Text type="secondary" style={{ fontSize: 12 }}>{config.description}</Text>}
                </ConfigSection>
              )}

              {/* 系统提示词 - 打字机效果 */}
              {config.displayPrompt && (
                <ConfigSection icon={<FileTextOutlined />} title="系统提示词" accentColor={T.primary}
                  status={config.systemPrompt ? 'generated' : 'generated'}>
                  <div style={{ background: T.bgLight, borderRadius: 6, padding: '10px 12px', border: `1px solid ${T.border}`, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: 11, lineHeight: '18px', color: T.textBody, fontFamily: "'SF Mono','Fira Code','Consolas',monospace", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {config.displayPrompt}
                      {!config.systemPrompt && <span style={{ display: 'inline-block', width: 8, height: 14, background: T.purple, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 0.8s infinite' }} />}
                    </pre>
                  </div>
                </ConfigSection>
              )}

              {/* 输出格式 */}
              {config.outputFormat && (
                <ConfigSection icon={<FileTextOutlined />} title="输出格式" accentColor="#fa8c16" status="confirmed">
                  <Tag color="orange" style={{ borderRadius: 4, margin: 0 }}>{config.outputFormat}</Tag>
                </ConfigSection>
              )}

              {/* 知识库 */}
              {config.knowledgeBases.length > 0 && (
                <ConfigSection icon={<BookOutlined />} title="关联知识库" accentColor="#52c41a" status="generated">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {config.knowledgeBases.map((kb, i) => (
                      <div key={kb.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: kb.linked ? '#f6ffed' : '#fffbe6', borderRadius: 6, border: kb.linked ? '1px solid #b7eb8f' : '1px solid #ffe58f' }}>
                        {kb.linked && <CheckCircleFilled style={{ color: T.success, fontSize: 14, marginTop: 2 }} />}
                        <div style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{kb.name}</Text>
                          <Text type="secondary" style={{ fontSize: 10 }}>{kb.reason}</Text>
                        </div>
                        <Tag color={kb.linked ? 'success' : 'default'} style={{ borderRadius: 4, margin: 0, fontSize: 10, flexShrink: 0 }}>{kb.linked ? '已关联' : '推荐'}</Tag>
                      </div>
                    ))}
                  </div>
                </ConfigSection>
              )}

              {/* 工具 */}
              {config.tools.length > 0 && (
                <ConfigSection icon={<ToolOutlined />} title="挂载工具" accentColor="#fa8c16" status="generated">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {config.tools.map(tool => (
                      <div key={tool.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: tool.linked ? '#f6ffed' : '#fff7e6', borderRadius: 6, border: tool.linked ? '1px solid #b7eb8f' : '1px solid #ffe58f' }}>
                        <span style={{ fontSize: 13 }}>{tool.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>{tool.name}</span>
                        {tool.linked && <CheckCircleFilled style={{ color: T.success, fontSize: 11 }} />}
                      </div>
                    ))}
                  </div>
                </ConfigSection>
              )}

              {/* 约束 */}
              {config.constraints.length > 0 && (
                <ConfigSection icon={<SafetyCertificateOutlined />} title="安全约束 (Constraints)" accentColor={T.error} status="confirmed">
                  {config.constraints.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: T.error, display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <span>🚫</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </ConfigSection>
              )}

              {/* 模型 */}
              {config.model && (
                <ConfigSection icon={<SettingOutlined />} title="推荐模型与参数" accentColor="#eb2f96" status="generated">
                  <Tag color="magenta" style={{ borderRadius: 4, margin: 0, fontWeight: 600, marginBottom: 6 }}>{config.model.name}</Tag>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>{config.model.params}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{config.model.reason}</Text>
                </ConfigSection>
              )}
            </div>
          )}
        </div>

        {/* 底部创建按钮 */}
        {stage === 'review' && (
          <div style={{ flexShrink: 0, padding: '14px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button type="primary" block icon={<CheckCircleFilled />}
              style={{ height: 40, borderRadius: 8, fontWeight: 650, fontSize: 14, background: `linear-gradient(135deg, ${T.primary}, #4096ff)`, border: 'none', boxShadow: '0 4px 12px rgba(22,119,255,0.3)' }}
              onClick={handleCreateAndGo}>
              确认创建 · 进入配置
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ── ConfigSection ──
  const ConfigSection: React.FC<{
    icon: React.ReactNode; title: string; accentColor: string; status: 'pending' | 'confirmed' | 'generated'; children: React.ReactNode;
  }> = ({ icon, title, status, accentColor, children }) => (
    <div style={{ background: T.white, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', animation: 'fadeInUp 0.35s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: `1px solid ${T.border}`, background: T.bgLight }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: accentColor, fontSize: 13, display: 'flex' }}>{icon}</span>
          <Text style={{ fontSize: 11, fontWeight: 650, color: T.textPrimary }}>{title}</Text>
        </div>
        {status === 'confirmed' && <Badge status="success" text={<Text style={{ fontSize: 10, color: T.success }}>已确认</Text>} />}
        {status === 'generated' && <Badge status="processing" text={<Text style={{ fontSize: 10, color: T.primary }}>已生成</Text>} />}
      </div>
      <div style={{ padding: '10px 12px' }}>{children}</div>
    </div>
  );

  // ═══ 主渲染 ═══
  return (
    <Drawer title={null} open={open} onClose={onClose} size={1020} placement="right"
      styles={{ body: { padding: 0, display: 'flex', height: '100%', background: T.bgPage }, header: { display: 'none' } }}
      closable={false} destroyOnClose mask>

      <style>{`
        @keyframes pulse { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.1)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .conv-create-drawer-left::-webkit-scrollbar,.conv-create-drawer-right::-webkit-scrollbar { width:4px }
        .conv-create-drawer-left::-webkit-scrollbar-thumb,.conv-create-drawer-right::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.08);border-radius:2px }
        .voice-recording { animation: voicePulse 1.2s infinite; }
        @keyframes voicePulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,77,79,0.4)} 50%{box-shadow:0 0 0 8px rgba(255,77,79,0)} }
      `}</style>

      {/* ═══ 左侧对话区 ═══ */}
      <div style={{ width: '54%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}`, background: T.white }}>
        {/* 标题栏 */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.purple}, #9c6ade)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}>
              <RobotOutlined style={{ color: '#fff', fontSize: 17 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>智能构建</div>
              <div style={{ fontSize: 11, color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, display: 'inline-block', boxShadow: '0 0 0 2px rgba(82,196,26,0.2)' }} />对话式创建 · 济南市公安局反诈中心
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="重新开始"><Button type="text" size="small" icon={<ReloadOutlined />} onClick={handleReset} style={{ color: T.textTertiary }} /></Tooltip>
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} style={{ color: T.textTertiary, fontSize: 14 }} />
          </div>
        </div>

        {/* 阶段进度条 */}
        <div style={{ flexShrink: 0, padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.bgLight, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {stages.map((s, i) => {
              const isCompleted = stageIndex > i;
              const isCurrent = stageIndex === i;
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && <div style={{ flex: 1, height: 2, minWidth: 10, background: isCompleted ? T.purple : T.border, transition: 'background 0.4s' }} />}
                  <Tooltip title={s.description}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'default', flexShrink: 0 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, transition: 'all 0.3s',
                        background: isCompleted ? `linear-gradient(135deg, ${T.purple}, #9c6ade)` : isCurrent ? T.white : T.bgLight,
                        color: isCompleted ? T.white : isCurrent ? T.purple : T.textTertiary,
                        border: isCurrent ? `2px solid ${T.purple}` : isCompleted ? 'none' : `1px solid ${T.border}`,
                        boxShadow: isCurrent ? `0 0 0 2px ${T.purpleBg}` : 'none',
                      }}>
                        {isCompleted ? <CheckOutlined style={{ fontSize: 10 }} /> : i + 1}
                      </div>
                      <Text style={{ fontSize: 9, color: isCompleted ? T.purple : isCurrent ? T.purple : T.textTertiary, fontWeight: isCurrent ? 650 : 400, whiteSpace: 'nowrap' }}>{s.label}</Text>
                    </div>
                  </Tooltip>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 消息列表 */}
        <div className="conv-create-drawer-left" style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, background: '#fbfbfd' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: msg.role === 'assistant' ? 'fadeInUp 0.3s ease-out' : 'slideInRight 0.25s ease-out' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: msg.role === 'assistant' ? `linear-gradient(135deg, ${T.purple}, #9c6ade)` : T.primary,
                boxShadow: msg.role === 'assistant' ? '0 2px 6px rgba(114,46,209,0.2)' : '0 2px 6px rgba(22,119,255,0.2)',
              }}>
                {msg.role === 'assistant' ? <RobotOutlined style={{ color: '#fff', fontSize: 14 }} /> : <UserOutlined style={{ color: '#fff', fontSize: 13 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 12, color: T.textPrimary }}>
                    {msg.role === 'assistant' ? 'Builder Agent' : '老李 · 反诈中心'}
                  </Text>
                  {msg.timestamp && <Text type="secondary" style={{ fontSize: 10 }}>{msg.timestamp}</Text>}
                </div>
                <div style={{ padding: '10px 14px', borderRadius: msg.role === 'assistant' ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
                  background: msg.role === 'assistant' ? T.white : '#e6f4ff',
                  border: msg.role === 'assistant' ? `1px solid ${T.border}` : '1px solid #bae0ff',
                  fontSize: 13, lineHeight: '1.75', color: T.textBody, wordBreak: 'break-word',
                }}>
                  {renderContent(msg.content)}
                </div>
                {/* 交互卡片 */}
                {msg.cards && msg.cards.length > 0 && renderCards(msg.cards)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.purple}, #9c6ade)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite 0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9d9d9', animation: 'pulse 1.4s infinite 0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* 测试窗口 */}
          {showTestPanel && (
            <div style={{ marginTop: 8, background: '#f0f5ff', borderRadius: 12, padding: '14px 16px', border: '1px solid #d6e4ff', animation: 'fadeInUp 0.35s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <PlayCircleOutlined style={{ color: T.primary, fontSize: 16 }} />
                <Text strong style={{ fontSize: 13, color: T.primary }}>沙盒测试</Text>
                <Tag color="blue" style={{ borderRadius: 4, margin: 0, fontSize: 10 }}>试用中</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.TextArea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="粘贴一段测试笔录试试效果..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ borderRadius: 8, fontSize: 12, resize: 'none', flex: 1 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleTestSubmit}
                  disabled={!testInput.trim() || isLoading}
                  style={{ borderRadius: 8, flexShrink: 0, height: 'auto' }}>
                  测试
                </Button>
              </div>
              {testResult && (
                <div style={{
                  marginTop: 10, padding: '12px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e8ebf0',
                  fontSize: 11, lineHeight: '1.65', color: T.textBody, maxHeight: 260, overflow: 'auto', whiteSpace: 'pre-wrap',
                  fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
                }}
                  dangerouslySetInnerHTML={{
                    __html: testResult
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(0,0,0,0.88)">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* 底部输入区 */}
        <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.white }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {/* 语音按钮 */}
            <Tooltip title={isRecording ? '停止录制 (Demo模拟)' : '语音输入 (Demo模拟)'}>
              <Button
                icon={<AudioOutlined />}
                onClick={handleVoiceToggle}
                className={isRecording ? 'voice-recording' : ''}
                style={{
                  borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: isRecording ? '1.5px solid #ff4d4f' : `1px solid ${T.border}`,
                  background: isRecording ? '#fff1f0' : T.white,
                  color: isRecording ? '#ff4d4f' : T.textTertiary,
                }}
              />
            </Tooltip>
            <Input.TextArea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => { if (!e.shiftKey && !isLoading) { e.preventDefault(); handleSend(); } }}
              placeholder={isRecording ? '正在聆听...' : stage === 'greeting' ? '描述你想创建的智能体，或点击🎤语音输入...' : '输入你的回答，Enter 发送，Shift+Enter 换行...'}
              autoSize={{ minRows: 1, maxRows: 3 }} style={{ borderRadius: 10, fontSize: 13, resize: 'none', border: `1px solid ${T.border}` }}
              disabled={isLoading} />
            <Button type="primary" icon={<ArrowUpOutlined />} onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading}
              style={{ borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: inputValue.trim() && !isLoading ? `linear-gradient(135deg, ${T.purple}, #9c6ade)` : '#d9d9d9',
                border: 'none', boxShadow: inputValue.trim() && !isLoading ? '0 2px 8px rgba(114,46,209,0.35)' : 'none',
              }} />
          </div>
          <Text type="secondary" style={{ fontSize: 10, marginTop: 6, display: 'block', textAlign: 'center' }}>
            AI 辅助生成配置 · Demo 演示
          </Text>
        </div>
      </div>

      {/* ═══ 右侧预览区 ═══ */}
      <div style={{ width: '46%', display: 'flex', flexDirection: 'column', background: T.bgLight }}>
        {renderPreview()}
      </div>
    </Drawer>
  );
};

export default ConversationalCreateDrawer;
