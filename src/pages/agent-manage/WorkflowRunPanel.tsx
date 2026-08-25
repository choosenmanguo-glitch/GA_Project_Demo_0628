import React, { useState, useRef } from 'react';
import { Input, Button, Tag, App as AntdApp, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  CaretRightOutlined,
  ClearOutlined,
  InboxOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DownOutlined,
  LoadingOutlined,
  ApartmentOutlined,
  ExportOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';

// ════════════════════════════════════════════════
// 设计令牌（与 AgentChatPanel 保持一致）
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
  orange: '#fa8c16',
  orangeLight: '#fff7e6',
  red: '#f53f3f',
  redLight: '#ffece8',
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

const clamp2 = {
  display: '-webkit-box' as const,
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden' as const,
};

// ════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════
interface WorkflowRunPanelProps {
  agent: {
    name: string;
    type: string;
    subType?: string;
    description?: string;
  };
  onBack: () => void;
  chatEnabled?: boolean;
  remaining?: number;
  dailyLimit?: number;
}

interface WfNode {
  name: string;
  duration: string;
  status: 'success' | 'running' | 'pending' | 'failed';
}

interface RunResult {
  id: number;
  label: string;
  /** 输入摘要（列表行展示） */
  summary: string;
  status: 'success' | 'failed';
  /** 总耗时 */
  duration: string;
  nodes: WfNode[];
  text: string;
  json: string;
}

interface InputField {
  key: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}

// ════════════════════════════════════════════════
// 输入字段 & 模拟结果
// ════════════════════════════════════════════════
const FIELD_MAP: Record<string, InputField[]> = {
  '警情周态势分析工作流': [
    { key: 'cycle', label: '统计周期', placeholder: '例如：2026-06-23 至 2026-06-29', defaultValue: '2026-06-23 至 2026-06-29' },
    { key: 'region', label: '管辖区域', placeholder: '请输入分局/派出所名称', defaultValue: '历下区分局' },
    { key: 'focus', label: '关注警种', placeholder: '可选，如反诈、治安、交警', defaultValue: '反诈、治安' },
  ],
};

const DEFAULT_FIELDS: InputField[] = [
  { key: 'city', label: '城市', placeholder: '请输入城市', defaultValue: '济南' },
  { key: 'style', label: '穿衣风格', placeholder: '请输入风格偏好', defaultValue: '休闲日常' },
];

function getFields(name: string): InputField[] {
  return FIELD_MAP[name] || DEFAULT_FIELDS;
}

const PRESET_RESULT: Record<string, { text: string; json: string }> = {
  '警情周态势分析工作流': {
    text: `本周（2026-06-23 至 2026-06-29）历下区分局共接报有效警情 1286 起，环比上周下降 4.2%。

警情类型分布：
- 电信网络诈骗 326 起（占比 25.3%，环比上升 8.1%，需重点关注）
- 治安纠纷 287 起（占比 22.3%）
- 盗窃侵财 198 起（占比 15.4%）
- 交通事故 176 起（占比 13.7%）
- 其他警情 299 起（占比 23.3%）

高发时段与区域：
- 诈骗警情高发时段为 19:00-22:00，集中在千佛山、泉城路商圈周边
- 盗窃警情周末夜间明显攀升，主要发生在开放式老旧小区
- 交通事故早晚高峰（7:30-9:00、17:30-19:00）经十路沿线多发

工作建议：
1. 反诈中心联合派出所针对千佛山、泉城路片区开展集中宣防，重点覆盖刷单返利、虚假投资类骗局。
2. 加强周末夜间开放式小区巡逻密度，推广安装智能门禁与监控。
3. 经十路高峰时段增派铁骑疏导，排查信号灯配时与事故多发点段。`,
    json: `{
  "cycle": "2026-06-23 至 2026-06-29",
  "region": "历下区分局",
  "total": 1286,
  "chainRatio": "-4.2%",
  "classification": [
    { "type": "电信网络诈骗", "count": 326, "ratio": "25.3%", "chainRatio": "+8.1%" },
    { "type": "治安纠纷", "count": 287, "ratio": "22.3%", "chainRatio": "-1.5%" },
    { "type": "盗窃侵财", "count": 198, "ratio": "15.4%", "chainRatio": "-6.0%" },
    { "type": "交通事故", "count": 176, "ratio": "13.7%", "chainRatio": "+2.3%" }
  ],
  "suggestions": [
    "千佛山、泉城路片区开展反诈集中宣防",
    "加强周末夜间开放式小区巡逻",
    "经十路高峰时段增派铁骑疏导"
  ]
}`,
  },
};

const NODE_NAMES = ['用户输入', 'HTTP 请求', '参数提取器', 'LLM', '输出'];
const NODE_DURATIONS = ['12.304 ms', '126.014 s', '18.220 ms', '0.793 s', '10.052 ms'];

function buildNodes(): WfNode[] {
  return NODE_NAMES.map((name, i) => ({ name, duration: NODE_DURATIONS[i], status: 'success' as const }));
}

// 失败结果的模拟数据：LLM 节点超时
const FAIL_PRESET = {
  text: '执行失败：LLM 节点输出超时（30s），本次运行已中止。\n\n请检查模型服务状态，或稍后重试该条数据。',
  json: `{
  "status": "failed",
  "error": "llm_timeout",
  "node": "LLM",
  "message": "LLM 节点输出超时（30s）"
}`,
};

function makeResult(
  id: number,
  label: string,
  agentName: string,
  opts?: { failed?: boolean; summary?: string },
): RunResult {
  const preset = PRESET_RESULT[agentName];
  if (opts?.failed) {
    // LLM（第 4 个节点）失败，其后节点未执行
    const nodes = NODE_NAMES.map((name, i) => ({
      name, duration: NODE_DURATIONS[i],
      status: i < 3 ? 'success' as const : i === 3 ? 'failed' as const : 'pending' as const,
    }));
    return {
      id, label, summary: opts.summary || '', status: 'failed', duration: '30.00 s',
      nodes, text: FAIL_PRESET.text, json: FAIL_PRESET.json,
    };
  }
  return {
    id, label, summary: opts?.summary || '', status: 'success', duration: '2.35 s',
    nodes: buildNodes(),
    text: preset ? preset.text : '工作流执行完成，结果已生成。',
    json: preset ? preset.json : '{ "text": "工作流执行完成，结果已生成。" }',
  };
}

// 批量运行模拟：8 条数据，第 4 条失败
const BATCH_COUNT = 8;
const BATCH_FAIL_AT = 4;
const BATCH_SUMMARIES = [
  '2026-06-23 至 06-29 · 历下区分局 · 反诈、治安',
  '2026-06-16 至 06-22 · 历下区分局 · 反诈、治安',
  '2026-06-09 至 06-15 · 历下区分局 · 治安、交警',
  '2026-06-02 至 06-08 · 历下区分局 · 反诈',
  '2026-05-26 至 06-01 · 历下区分局 · 治安',
  '2026-05-19 至 05-25 · 历下区分局 · 反诈、交警',
  '2026-05-12 至 05-18 · 历下区分局 · 治安、反诈',
  '2026-05-05 至 05-11 · 历下区分局 · 反诈、治安',
];

// ════════════════════════════════════════════════
// 工作流执行轨迹（对齐对话页 WorkflowTrace：简洁文字行 + 灰色节点行）
// ════════════════════════════════════════════════
const WorkflowTrace: React.FC<{ nodes: WfNode[] }> = ({ nodes }) => {
  const [open, setOpen] = useState(true);
  const total = nodes.length;
  const done = nodes.filter(n => n.status === 'success' || n.status === 'failed').length;
  const running = nodes.some(n => n.status === 'running');
  const failed = nodes.some(n => n.status === 'failed');

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
        <span style={{ fontSize: 13, color: failed ? DS.red : DS.textTer }}>
          {running ? '工作流执行中' : failed ? '工作流执行失败' : '工作流已完成'}（{done}/{total}）
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          {nodes.map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6, background: DS.bg,
              marginBottom: i === nodes.length - 1 ? 0 : 6,
            }}>
              <span style={{ fontSize: 13, color: DS.textSec, flex: 1 }}>{n.name}</span>
              <span style={{ fontSize: 12, color: DS.textTer, fontFamily: DS.mono }}>{n.duration}</span>
              {n.status === 'success' && <CheckCircleFilled style={{ color: DS.green, fontSize: 12 }} />}
              {n.status === 'failed' && <CloseCircleFilled style={{ color: DS.red, fontSize: 12 }} />}
              {n.status === 'running' && <LoadingOutlined style={{ color: DS.primary, fontSize: 12 }} />}
              {n.status === 'pending' && <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${DS.border}` }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════
// 结果展示（结果 / 详情）
// ════════════════════════════════════════════════
const ResultBlock: React.FC<{ result: RunResult }> = ({ result }) => {
  const { message } = AntdApp.useApp();
  const [tab, setTab] = useState<'result' | 'detail'>('result');

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => message.success('已复制到剪贴板'),
      () => message.error('复制失败'),
    );
  };

  return (
    <div>
      <WorkflowTrace nodes={result.nodes} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${DS.divider}`, marginBottom: 14 }}>
        {([
          { key: 'result', label: '结果' },
          { key: 'detail', label: '详情' },
        ] as const).map(t => (
          <span key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 2px', fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? DS.text : DS.textTer,
            borderBottom: tab === t.key ? `2px solid ${DS.primary}` : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>{t.label}</span>
        ))}
      </div>

      {tab === 'result' ? (
        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 14, color: DS.text, lineHeight: '26px', whiteSpace: 'pre-wrap',
            paddingRight: 36,
          }}>{result.text}</div>
          <Tooltip title="复制">
            <span onClick={() => copy(result.text)} style={{
              position: 'absolute', right: 0, bottom: 0,
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: DS.textTer, cursor: 'pointer', background: DS.white,
              border: `1px solid ${DS.border}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = DS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.color = DS.textTer; }}
            ><CopyOutlined /></span>
          </Tooltip>
        </div>
      ) : (
        <div style={{
          position: 'relative', background: '#fafbfc',
          border: `1px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: DS.textTer, fontFamily: DS.mono, marginBottom: 8 }}>
            JSON OUTPUT
          </div>
          <pre style={{
            margin: 0, fontSize: 13, lineHeight: '20px', fontFamily: DS.mono,
            color: DS.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 320, overflow: 'auto',
          }}>{result.json}</pre>
          <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: 6 }}>
            <Tooltip title="复制">
              <span onClick={() => copy(result.json)} style={{
                width: 26, height: 26, borderRadius: 6, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                color: DS.textTer, cursor: 'pointer', background: DS.white,
                border: `1px solid ${DS.border}`,
              }}><CopyOutlined style={{ fontSize: 12 }} /></span>
            </Tooltip>
            <Tooltip title="全屏">
              <span style={{
                width: 26, height: 26, borderRadius: 6, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                color: DS.textTer, background: DS.white, border: `1px solid ${DS.border}`,
              }}><ExportOutlined style={{ fontSize: 12 }} /></span>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════
// 主组件
// ════════════════════════════════════════════════
const WorkflowRunPanel: React.FC<WorkflowRunPanelProps> = ({
  agent, onBack, chatEnabled, remaining = 0, dailyLimit = 0,
}) => {
  const { message } = AntdApp.useApp();
  const fields = getFields(agent.name);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    fields.forEach(f => { v[f.key] = f.defaultValue; });
    return v;
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [csvFile, setCsvFile] = useState<{ name: string } | null>(null);
  const [batchResults, setBatchResults] = useState<RunResult[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchTotal, setBatchTotal] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const runIdRef = useRef(0);

  const lowRemaining = remaining <= 2;

  const handleClear = () => {
    const v: Record<string, string> = {};
    fields.forEach(f => { v[f.key] = ''; });
    setValues(v);
    setResult(null);
  };

  // 运行一次：节点逐个点亮后展示结果
  const handleRun = () => {
    const missing = fields.find(f => !values[f.key]?.trim());
    if (missing) {
      message.warning('请填写' + missing.label);
      return;
    }
    if (chatEnabled && remaining <= 0) {
      message.warning('今日对话次数已用完');
      return;
    }
    setRunning(true);
    setResult(null);
    const totalNodes = NODE_NAMES.length;
    let idx = 0;
    const step = () => {
      const viewNodes: WfNode[] = NODE_NAMES.map((name, i) => {
        const duration = NODE_DURATIONS[i];
        if (i < idx) return { name, duration, status: 'success' };
        if (i === idx) return { name, duration, status: 'running' };
        return { name, duration, status: 'pending' };
      });
      setResult({ id: 0, label: '', summary: '', status: 'success', duration: '', nodes: viewNodes, text: '', json: '' });
      idx++;
      if (idx <= totalNodes) {
        setTimeout(step, 360);
      } else {
        setTimeout(() => {
          const id = ++runIdRef.current;
          setResult(makeResult(id, '', agent.name));
          setRunning(false);
        }, 280);
      }
    };
    step();
  };

  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleCsvPick = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      message.error('仅支持 CSV 文件');
      return;
    }
    setCsvFile({ name: file.name });
    setBatchResults([]);
  };

  const handleBatchRun = () => {
    if (!csvFile) return;
    if (chatEnabled && remaining <= 0) {
      message.warning('今日对话次数已用完');
      return;
    }
    setBatchRunning(true);
    setBatchResults([]);
    setExpandedIds(new Set());
    setBatchTotal(BATCH_COUNT);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      const id = ++runIdRef.current;
      setBatchResults(prev => [...prev, makeResult(id, `运行 · ${String(i).padStart(2, '0')}`, agent.name, {
        failed: i === BATCH_FAIL_AT,
        summary: BATCH_SUMMARIES[i - 1],
      })]);
      if (i >= BATCH_COUNT) {
        clearInterval(timer);
        setBatchRunning(false);
      }
    }, 550);
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allExpanded = batchResults.length > 0 && batchResults.every(r => expandedIds.has(r.id));
  const toggleExpandAll = () => {
    if (allExpanded) setExpandedIds(new Set());
    else setExpandedIds(new Set(batchResults.map(r => r.id)));
  };

  const handleDownloadTemplate = () => {
    const header = fields.map(f => f.label).join(',');
    const row = fields.map(f => f.defaultValue).join(',');
    const csv = '\uFEFF' + header + '\n' + row + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasResult = result || running;
  const hasBatchOutput = batchResults.length > 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ──── 顶部栏：返回 + 标题 + 剩余次数 ──── */}
      <div style={{
        flexShrink: 0, paddingBottom: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}
            style={{ color: DS.textSec, fontSize: 14, padding: '4px 8px' }} />
          <span style={{ fontSize: 16, fontWeight: 650, color: DS.text }}>工作流运行</span>
        </div>
        {chatEnabled && (
          <Tooltip
            placement="bottomRight"
            title={
              <div style={{ lineHeight: '20px' }}>
                <div style={{ marginBottom: 4 }}>配额说明：</div>
                <div>• 用于开发中心的测试调用，每日限额 {dailyLimit} 次</div>
                <div>• 每运行一次工作流消耗 1 次</div>
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

      {/* ──── 白色卡片容器 ──── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', background: DS.white,
          borderRadius: DS.radius, border: `1px solid ${DS.border}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>
          {/* ═══════ 左侧栏：智能体信息 + 运行输入 ═══════ */}
          <aside style={{
            width: 280, flexShrink: 0, background: DS.white,
            borderRight: `1px solid ${DS.divider}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* 智能体信息卡片 */}
            <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${DS.divider}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: DS.primaryLight,
                  color: DS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 600, flexShrink: 0,
                }}>{agent.name.charAt(0)}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 650, color: DS.text, ...ellipsis }}>{agent.name}</div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="geekblue" style={{ margin: 0, borderRadius: 4, fontSize: 11, lineHeight: '18px' }}>
                      {agent.subType || agent.type}
                    </Tag>
                  </div>
                </div>
              </div>
              {agent.description && (
                <div style={{ fontSize: 12, color: DS.textSec, lineHeight: '18px', marginTop: 10, ...clamp2 }}>
                  {agent.description}
                </div>
              )}
            </div>

            {/* 运行输入面板 */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 24, padding: '12px 20px 0' }}>
                {([
                  { key: 'single' as const, label: '运行一次' },
                  { key: 'batch' as const, label: '批量运行' },
                ]).map(t => (
                  <span key={t.key} onClick={() => setMode(t.key)} style={{
                    padding: '8px 2px', fontSize: 14, fontWeight: mode === t.key ? 600 : 400,
                    color: mode === t.key ? DS.text : DS.textTer,
                    borderBottom: mode === t.key ? `2px solid ${DS.primary}` : '2px solid transparent',
                    cursor: 'pointer', marginBottom: -1,
                  }}>{t.label}</span>
                ))}
              </div>
              <div style={{ borderBottom: `1px solid ${DS.divider}` }} />

              {/* 表单内容 */}
              <div style={{ flex: 1, padding: '16px 20px' }}>
                {mode === 'single' ? (
                  <>
                    {fields.map(f => (
                      <div key={f.key} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: DS.text, marginBottom: 6 }}>{f.label}</div>
                        <Input
                          value={values[f.key]}
                          placeholder={f.placeholder}
                          onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                          style={{ borderRadius: DS.radiusXs }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <Button icon={<ClearOutlined />} onClick={handleClear}
                        style={{ borderRadius: DS.radiusXs }}>清空</Button>
                      <Button type="primary" icon={<CaretRightOutlined />} loading={running}
                        onClick={handleRun}
                        style={{ borderRadius: DS.radiusXs, marginLeft: 'auto' }}>运行</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => csvInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); }}
                      onDrop={e => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleCsvPick(f);
                      }}
                      style={{
                        border: `1px dashed ${csvFile ? DS.primaryBorder : DS.border}`,
                        borderRadius: DS.radiusSm,
                        background: csvFile ? DS.primaryLight : DS.bg,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      {csvFile ? (
                        <>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 36, height: 26, padding: '0 6px', borderRadius: 4,
                            background: DS.green, color: '#fff', fontSize: 10, fontWeight: 700,
                          }}>CSV</span>
                          <span style={{ fontSize: 13, color: DS.text, ...ellipsis, flex: 1 }}>{csvFile.name}</span>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setCsvFile(null); setBatchResults([]); }}
                            style={{ fontSize: 12, color: DS.textTer, padding: '0 4px' }}
                          >移除</span>
                        </>
                      ) : (
                        <>
                          <InboxOutlined style={{ fontSize: 20, color: DS.textTer }} />
                          <span style={{ fontSize: 13, color: DS.textSec }}>
                            将 CSV 文件拖放至此处，或<span style={{ color: DS.primary }}>浏览</span>
                          </span>
                        </>
                      )}
                      <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleCsvPick(f);
                          e.target.value = '';
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 14, fontSize: 13, color: DS.text, marginBottom: 8 }}>
                      CSV 文件必须符合以下结构：
                    </div>
                    <div style={{ border: `1px solid ${DS.border}`, borderRadius: DS.radiusXs, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${fields.length}, 1fr)`, background: DS.bg }}>
                        {fields.map(f => (
                          <div key={f.key} style={{ padding: '7px 12px', fontSize: 12, color: DS.textSec, fontWeight: 500 }}>{f.label}</div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${fields.length}, 1fr)`, borderTop: `1px solid ${DS.border}` }}>
                        {fields.map(f => (
                          <div key={f.key} style={{ padding: '7px 12px', fontSize: 12, color: DS.textTer }}>{f.label}</div>
                        ))}
                      </div>
                    </div>

                    <div onClick={handleDownloadTemplate}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 12, color: DS.primary, cursor: 'pointer' }}>
                      <DownloadOutlined /> 下载模板
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <Button type="primary" icon={<CaretRightOutlined />} loading={batchRunning}
                        disabled={!csvFile} onClick={handleBatchRun}
                        style={{ borderRadius: DS.radiusXs }}>运行</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* ═══════ 右侧结果区（白色背景） ═══════ */}
          <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DS.white }}>
            {mode === 'single' ? (
              hasResult ? (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
                  {result && <ResultBlock result={result} />}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: DS.textTer }}>
                  <ApartmentOutlined style={{ fontSize: 36, color: DS.border }} />
                  <span style={{ fontSize: 13 }}>填写参数并点击运行，结果将在此展示</span>
                </div>
              )
            ) : hasBatchOutput ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
                {/* 汇总条：进度 / 成功失败统计 + 一键展开收起 + 下载 */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  maxWidth: 900, width: '100%', margin: '0 auto 14px',
                  position: 'sticky', top: -20, background: DS.white, padding: '6px 0 10px', zIndex: 1,
                }}>
                  {batchRunning ? (
                    <span style={{ fontSize: 14, fontWeight: 600, color: DS.text, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <LoadingOutlined style={{ color: DS.primary }} />
                      正在运行 · 已完成 {batchResults.length}/{batchTotal}
                    </span>
                  ) : (
                    (() => {
                      const okCount = batchResults.filter(r => r.status === 'success').length;
                      const failCount = batchResults.length - okCount;
                      return (
                        <span style={{ fontSize: 14, fontWeight: 600, color: DS.text, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          {batchResults.length} 次运行
                          <span style={{ fontSize: 12, fontWeight: 400, color: DS.textSec, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.green }} />
                              {okCount} 成功
                            </span>
                            {failCount > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: DS.red }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.red }} />
                                {failCount} 失败
                              </span>
                            )}
                          </span>
                        </span>
                      );
                    })()
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" onClick={toggleExpandAll}
                      icon={allExpanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                      disabled={batchRunning || batchResults.length === 0}
                      style={{ borderRadius: DS.radiusXs }}>
                      {allExpanded ? '一键收起' : '一键展开'}
                    </Button>
                    <Button icon={<DownloadOutlined />} size="small" style={{ borderRadius: DS.radiusXs }}>下载</Button>
                  </div>
                </div>

                {/* 结果列表：紧凑行，点击展开详情 */}
                <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {batchResults.map(r => {
                    const expanded = expandedIds.has(r.id);
                    return (
                      <div key={r.id} style={{
                        border: `1px solid ${DS.border}`,
                        borderRadius: DS.radiusSm, overflow: 'hidden',
                        background: r.status === 'failed' && !expanded ? DS.redLight : DS.white,
                        transition: 'border-color .2s',
                      }}>
                        <div
                          onClick={() => toggleExpanded(r.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 14px', cursor: 'pointer', userSelect: 'none',
                          }}
                        >
                          <DownOutlined style={{
                            fontSize: 10, color: DS.textTer,
                            transition: 'transform .2s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: DS.text, whiteSpace: 'nowrap' }}>{r.label}</span>
                          <span style={{ fontSize: 12, color: DS.textTer, flex: 1, minWidth: 0, ...ellipsis }}>{r.summary}</span>
                          {r.status === 'success' ? (
                            <span style={{ fontSize: 12, color: DS.green, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                              <CheckCircleFilled style={{ fontSize: 12 }} /> 成功
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: DS.red, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                              <CloseCircleFilled style={{ fontSize: 12 }} /> 失败
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: DS.textTer, fontFamily: DS.mono, whiteSpace: 'nowrap' }}>{r.duration}</span>
                        </div>
                        {expanded && (
                          <div style={{ padding: '6px 14px 14px', borderTop: `1px solid ${DS.divider}` }}>
                            <ResultBlock result={r} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: DS.textTer }}>
                <RobotOutlined style={{ fontSize: 36, color: DS.border }} />
                <span style={{ fontSize: 13 }}>上传 CSV 并点击运行，批量结果将在此展示。</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default WorkflowRunPanel;
