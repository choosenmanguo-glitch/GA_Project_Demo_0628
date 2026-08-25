import React, { useState } from 'react';
import {
  UndoOutlined,
  RedoOutlined,
  HistoryOutlined,
  RocketOutlined,
  DownOutlined,
  BranchesOutlined,
  MenuFoldOutlined,
  SearchOutlined,
  RobotOutlined,
  ApiOutlined,
  ReadOutlined,
  ExportOutlined,
  FilterOutlined,
  SplitCellsOutlined,
  UserSwitchOutlined,
  SyncOutlined,
  RetweetOutlined,
  CodeOutlined,
  LayoutOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  BarsOutlined,
  FunctionOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  UserOutlined,
  CheckCircleFilled,
  EllipsisOutlined,
  MessageOutlined,
  SelectOutlined,
  DragOutlined,
  AppstoreOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
  CloseOutlined,
  UpOutlined,
} from '@ant-design/icons';

// ════════════════════════════════════════════════
// 工作流编辑器（智能体配置 - 流程智能体）
// ════════════════════════════════════════════════

const softColors = {
  blue: { color: '#1a63dd', bg: '#e9f1ff' },
  indigo: { color: '#5c63df', bg: '#eeefff' },
  green: { color: '#0f996a', bg: '#e4f7f0' },
  cyan: { color: '#058ca9', bg: '#e3f6fa' },
  amber: { color: '#dc6b13', bg: '#fff1e2' },
  violet: { color: '#7451d5', bg: '#eee9ff' },
} as const;

type SoftColor = keyof typeof softColors;

const SoftIcon: React.FC<{ color: SoftColor; icon: React.ReactNode; size?: number }> = ({
  color, icon, size = 28,
}) => (
  <span
    style={{
      width: size, height: size, borderRadius: 6,
      display: 'grid', placeItems: 'center', flex: '0 0 auto',
      color: softColors[color].color, background: softColors[color].bg,
      fontSize: size === 28 ? 16 : 15,
    }}
  >
    {icon}
  </span>
);

// ──── 左侧节点库数据 ────
const baseNodes: { icon: React.ReactNode; color: SoftColor; label: string }[] = [
  { icon: <RobotOutlined />, color: 'indigo', label: 'Agent' },
  { icon: <ApiOutlined />, color: 'indigo', label: 'LLM' },
  { icon: <ReadOutlined />, color: 'green', label: '知识检索' },
  { icon: <ExportOutlined />, color: 'amber', label: '输出' },
];

const nodeGroups: { title: string; items: { icon: React.ReactNode; color: SoftColor; label: string }[] }[] = [
  {
    title: '问题理解',
    items: [{ icon: <FilterOutlined />, color: 'green', label: '问题分类器' }],
  },
  {
    title: '逻辑',
    items: [
      { icon: <SplitCellsOutlined />, color: 'cyan', label: '条件分支' },
      { icon: <UserSwitchOutlined />, color: 'cyan', label: '人工介入' },
      { icon: <SyncOutlined />, color: 'cyan', label: '迭代' },
      { icon: <RetweetOutlined />, color: 'cyan', label: '循环' },
    ],
  },
  {
    title: '转换与工具',
    items: [
      { icon: <CodeOutlined />, color: 'blue', label: '代码执行' },
      { icon: <LayoutOutlined />, color: 'blue', label: '模板转换' },
      { icon: <FileSearchOutlined />, color: 'green', label: '文档提取器' },
      { icon: <GlobalOutlined />, color: 'violet', label: 'HTTP 请求' },
      { icon: <BarsOutlined />, color: 'cyan', label: '列表操作' },
    ],
  },
];

// ──── 画布节点数据 ────
interface FlowNodeDef {
  id: string;
  name: string;
  typeLabel: string;
  icon: React.ReactNode;
  color: SoftColor;
  note: string;
  footLeft: string;
  footRight: string;
  footRightColor?: string;
  left: string;
  top: string;
  width?: number;
  portLeft?: boolean;
  portRight?: boolean;
  borderColor?: string;
  statusCheck?: boolean;
}

const flowNodes: FlowNodeDef[] = [
  {
    id: 'start', name: '用户输入', typeLabel: '开始节点',
    icon: <UserOutlined />, color: 'blue',
    note: '接收问题、交易所和查询代码',
    footLeft: '开始节点', footRight: '3 个字段',
    left: '11%', top: '38%', portRight: true, statusCheck: true,
  },
  {
    id: 'agent', name: 'CALLFUND-FLOW-QUERY', typeLabel: 'Agent 节点',
    icon: <FileSearchOutlined />, color: 'green',
    note: '查询涉案账户资金流水与交易关系',
    footLeft: 'Agent 节点', footRight: '配置完成', footRightColor: '#0d9666',
    left: '41%', top: '25%', width: 276, portLeft: true, portRight: true,
  },
  {
    id: 'output', name: '输出', typeLabel: '输出节点',
    icon: <ExportOutlined />, color: 'amber',
    note: 'sys.app_id · String',
    footLeft: '输出节点', footRight: '1 个变量',
    left: '70%', top: '51%', portLeft: true, statusCheck: true,
  },
  {
    id: 'spare', name: 'CALLSTOCKKKK', typeLabel: 'Agent 节点',
    icon: <RobotOutlined />, color: 'amber',
    note: '待接入当前工作流',
    footLeft: 'Agent 节点', footRight: '未连接',
    left: '41%', top: '64%', width: 276, borderColor: '#e7dfb7',
  },
];

export default function WorkflowEditor() {
  const [libraryTab, setLibraryTab] = useState<'nodes' | 'tools' | 'start'>('nodes');
  const [selectedId, setSelectedId] = useState<string>('agent');
  const [inspectorTab, setInspectorTab] = useState<'config' | 'run'>('config');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    input: true, strategy: true, output: true,
  });

  const selected = flowNodes.find(n => n.id === selectedId) || flowNodes[1];

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f5f8fc' }}>
      {/* ──── 命令栏 ──── */}
      <div style={{
        height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #e0e6ee',
        padding: '0 16px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            height: 38, display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {[
              { icon: <UndoOutlined />, label: '上一步' },
              { icon: <RedoOutlined />, label: '下一步' },
              { icon: <HistoryOutlined />, label: '变更历史' },
            ].map(b => (
              <button key={b.label} title={b.label} aria-label={b.label}
                style={{
                  width: 32, height: 32, border: 0, borderRadius: 5, background: 'transparent',
                  color: '#647187', display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}>{b.icon}</button>
            ))}
          </div>
          <span style={{ width: 1, height: 24, background: '#e4e8ee' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6f7c90', whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#12a36e' }} />
            <span>自动保存 13:38:36</span>
            <span style={{
              height: 24, padding: '0 8px', borderRadius: 4, color: '#d46b08', background: '#fff7e6',
              display: 'inline-flex', alignItems: 'center', fontSize: 12,
            }}>未发布</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            height: 32, padding: '0 14px', border: 0, borderRadius: 5, color: '#fff', background: '#1764f2',
            boxShadow: '0 4px 10px rgba(23,100,242,.18)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <RocketOutlined />发布<DownOutlined style={{ fontSize: 12 }} />
          </button>
          <button style={{
            height: 32, padding: '0 10px', border: 0, borderRadius: 5, color: '#536176', background: 'transparent',
            display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <BranchesOutlined />版本记录
          </button>
        </div>
      </div>

      {/* ──── 工作区 ──── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧节点库 */}
        <aside style={{
          width: 304, minWidth: 304, background: '#fff', borderRight: '1px solid #e0e5ec',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{
            height: 48, padding: '0 14px', display: 'flex', alignItems: 'stretch', gap: 22,
            borderBottom: '1px solid #edf0f4', flexShrink: 0,
          }}>
            {(['nodes', 'tools', 'start'] as const).map(tab => {
              const label = { nodes: '节点', tools: '工具', start: '开始' }[tab];
              const active = libraryTab === tab;
              return (
                <button key={tab} onClick={() => setLibraryTab(tab)}
                  style={{
                    border: 0, padding: '0 2px', background: 'transparent', position: 'relative', cursor: 'pointer',
                    color: active ? '#155fe7' : '#6c788c', fontWeight: active ? 500 : 400,
                    borderBottom: active ? '2px solid #155fe7' : '2px solid transparent',
                  }}>
                  {label}
                </button>
              );
            })}
            <button style={{
              marginLeft: 'auto', alignSelf: 'center', width: 32, height: 32, border: 0, borderRadius: 5,
              background: 'transparent', color: '#7d899b', display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}>
              <MenuFoldOutlined />
            </button>
          </div>

          <div style={{ padding: '10px 12px', flexShrink: 0 }}>
            <div style={{
              height: 38, borderRadius: 6, background: '#f3f6f9', color: '#929daf',
              padding: '0 11px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <SearchOutlined />搜索节点、Agent、知识库
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '2px 10px 10px' }}>
            <div style={{ marginTop: 8 }}>
              {baseNodes.map(n => (
                <div key={n.label} style={{
                  height: 38, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 6, color: '#344054', cursor: 'pointer',
                }}>
                  <SoftIcon color={n.color} icon={n.icon} />{n.label}
                </div>
              ))}
            </div>
            {nodeGroups.map(g => (
              <div key={g.title} style={{ marginTop: 8 }}>
                <div style={{
                  height: 26, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 7,
                  color: '#667388', fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ width: 3, height: 13, borderRadius: 2, background: '#5b73f2', display: 'inline-block' }} />
                  {g.title}
                </div>
                {g.items.map(n => (
                  <div key={n.label} style={{
                    height: 38, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 10,
                    borderRadius: 6, color: '#344054', cursor: 'pointer',
                  }}>
                    <SoftIcon color={n.color} icon={n.icon} />{n.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 变量 dock */}
          <div style={{
            height: 52, borderTop: '1px solid #e4e8ee', padding: '0 12px 0 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0,
          }}>
            <span style={{ color: '#4e5b70', fontSize: 12, fontWeight: 600 }}>变量</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {[
                { icon: <FunctionOutlined />, label: '全局变量' },
                { icon: <CodeOutlined />, label: '环境变量' },
                { icon: <DatabaseOutlined />, label: '系统变量' },
              ].map(b => (
                <button key={b.label} title={b.label} style={{
                  width: 32, height: 32, border: 0, borderRadius: 5, background: 'transparent',
                  color: '#667388', display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}>{b.icon}</button>
              ))}
            </div>
          </div>

          {/* 测试 dock */}
          <div style={{
            height: 52, borderTop: '1px solid #e4e8ee', padding: '0 12px 0 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0,
          }}>
            <span style={{ color: '#4e5b70', fontSize: 12, fontWeight: 600 }}>测试与检查</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {[
                { icon: <PlayCircleOutlined />, label: '测试', primary: true },
                { icon: <FileTextOutlined />, label: '运行历史', primary: false },
              ].map(b => (
                <button key={b.label} title={b.label} style={{
                  width: 32, height: 32, border: 0, borderRadius: 5,
                  color: b.primary ? '#155fe7' : '#667388', background: b.primary ? '#eef4ff' : 'transparent',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}>{b.icon}</button>
              ))}
              <button title="检查清单" style={{
                position: 'relative', width: 32, height: 32, border: 0, borderRadius: 5,
                background: 'transparent', color: '#667388', display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}>
                <CheckSquareOutlined />
                <span style={{
                  position: 'absolute', right: 0, top: -1, minWidth: 16, height: 16, borderRadius: 8,
                  padding: '0 4px', background: '#f79009', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 9,
                }}>2</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 画布 */}
        <section style={{
          position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden',
          backgroundColor: '#f5f8fc', backgroundImage: 'radial-gradient(#d5dce6 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}>
          {/* 连线 */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            viewBox="0 0 1226 954" preserveAspectRatio="none">
            <path d="M373 425 C438 425 438 303 503 303" stroke="#839dc1" strokeWidth="2" fill="none" />
            <path d="M779 303 C835 303 812 551 858 551" stroke="#839dc1" strokeWidth="2" fill="none" />
          </svg>

          {flowNodes.map(n => {
            const isSelected = n.id === selectedId;
            return (
              <article key={n.id}
                onClick={() => setSelectedId(n.id)}
                style={{
                  position: 'absolute', zIndex: 4, left: n.left, top: n.top,
                  width: n.width || 238, background: '#fff',
                  border: `1px solid ${isSelected ? '#2a6fe8' : n.borderColor || '#d4dce7'}`,
                  borderRadius: 8, overflow: 'visible', cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(42,111,232,.11), 0 12px 28px rgba(31,48,74,.11)'
                    : '0 9px 24px rgba(31,48,74,.09)',
                }}>
                {n.portLeft && (
                  <span style={{
                    position: 'absolute', top: '50%', left: -7, width: 12, height: 12, marginTop: -6,
                    borderRadius: '50%', background: '#fff', border: '3px solid #2a6fe8',
                  }} />
                )}
                {n.portRight && (
                  <span style={{
                    position: 'absolute', top: '50%', right: -7, width: 12, height: 12, marginTop: -6,
                    borderRadius: '50%', background: '#fff', border: '3px solid #2a6fe8',
                  }} />
                )}
                <div style={{ padding: '13px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, minWidth: 0 }}>
                      <SoftIcon color={n.color} icon={n.icon} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.name}</span>
                    </div>
                    {n.statusCheck
                      ? <CheckCircleFilled style={{ color: '#0d9666', fontSize: 18 }} />
                      : <EllipsisOutlined style={{ color: '#8c97a8', fontSize: 18 }} />}
                  </div>
                  <div style={{
                    marginTop: 10, padding: '8px 9px', borderRadius: 5,
                    background: '#f5f7fa', color: '#748195', fontSize: 12,
                  }}>{n.note}</div>
                </div>
                <div style={{
                  height: 32, padding: '0 14px', borderTop: '1px solid #edf0f4',
                  background: '#f9fafc', color: '#8c97a8', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', fontSize: 11, borderRadius: '0 0 8px 8px',
                }}>
                  <span>{n.footLeft}</span>
                  <span style={{ color: n.footRightColor }}>{n.footRight}</span>
                </div>
              </article>
            );
          })}

          {/* 画布工具 */}
          <div style={{
            position: 'absolute', zIndex: 7, right: 16, bottom: 18, height: 44, padding: 4,
            border: '1px solid #dfe5ed', borderRadius: 8, background: 'rgba(255,255,255,.97)',
            boxShadow: '0 10px 24px rgba(31,48,74,.11)', display: 'flex', alignItems: 'center',
          }}>
            {[
              { icon: <MessageOutlined />, label: '添加注释', active: false },
              { icon: <SelectOutlined />, label: '选择', active: false },
              { icon: <DragOutlined />, label: '移动画布', active: true },
            ].map(b => (
              <button key={b.label} title={b.label} style={{
                width: 36, height: 34, border: 0, borderRadius: 6,
                color: b.active ? '#155fe7' : '#667388', background: b.active ? '#eaf2ff' : 'transparent',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}>{b.icon}</button>
            ))}
            <span style={{ width: 1, height: 22, margin: '0 3px', background: '#e3e8ef' }} />
            {[
              { icon: <AppstoreOutlined />, label: '自动布局' },
              { icon: <EllipsisOutlined />, label: '更多' },
            ].map(b => (
              <button key={b.label} title={b.label} style={{
                width: 36, height: 34, border: 0, borderRadius: 6,
                color: '#667388', background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}>{b.icon}</button>
            ))}
            <span style={{ width: 1, height: 22, margin: '0 3px', background: '#e3e8ef' }} />
            <button title="缩小" style={{
              width: 31, height: 34, border: 0, borderRadius: 6, color: '#667388',
              background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}><ZoomOutOutlined /></button>
            <span style={{ minWidth: 42, textAlign: 'center', color: '#68758a', fontSize: 12 }}>70%</span>
            <button title="放大" style={{
              width: 31, height: 34, border: 0, borderRadius: 6, color: '#667388',
              background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}><ZoomInOutlined /></button>
          </div>

          {/* 缩略图 */}
          <div style={{
            position: 'absolute', zIndex: 7, right: 16, bottom: 68, width: 138, height: 84,
            border: '1px solid #dfe5ed', borderRadius: 7, background: 'rgba(255,255,255,.96)',
            boxShadow: '0 8px 20px rgba(31,48,74,.08)', padding: 9,
          }}>
            <div style={{ height: '100%', borderRadius: 4, background: '#f2f5f8', position: 'relative' }}>
              <span style={{ position: 'absolute', width: 28, height: 5, borderRadius: 2, background: '#cad3df', left: 25, top: 24 }} />
              <span style={{ position: 'absolute', width: 35, height: 5, borderRadius: 2, background: '#cad3df', right: 17, top: 38 }} />
            </div>
          </div>
        </section>

        {/* 右侧检查器 */}
        <aside style={{ width: 390, minWidth: 390, background: '#fff', borderLeft: '1px solid #e0e5ec', minHeight: 0, overflow: 'hidden' }}>
          <div style={{
            height: 62, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #edf0f4',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SoftIcon color={selected.color} icon={selected.icon} />
              <div>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div style={{ color: '#8d98a9', fontSize: 11, marginTop: 3 }}>{selected.typeLabel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6b788c' }}>
              <PlayCircleOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              <EllipsisOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              <CloseOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{
            height: 43, padding: '0 16px', display: 'flex', alignItems: 'stretch', gap: 22, borderBottom: '1px solid #edf0f4',
          }}>
            {(['config', 'run'] as const).map(tab => {
              const label = { config: '节点配置', run: '运行结果' }[tab];
              const active = inspectorTab === tab;
              return (
                <button key={tab} onClick={() => setInspectorTab(tab)}
                  style={{
                    border: 0, padding: 0, background: 'transparent', position: 'relative', cursor: 'pointer',
                    color: active ? '#155fe7' : '#8290a3', fontWeight: active ? 500 : 400,
                    borderBottom: active ? '2px solid #155fe7' : '2px solid transparent',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: '16px 16px 28px', color: '#262626', overflowY: 'auto', height: 'calc(100% - 105px)' }}>
            {inspectorTab === 'config' ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>
                    <span style={{ color: '#ff4d4f' }}>*</span><span>节点名称</span>
                  </div>
                  <div style={{
                    height: 36, padding: '0 11px', border: '1px solid #d9d9d9', borderRadius: 6,
                    display: 'flex', alignItems: 'center',
                  }}>{selected.name}</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>节点描述</div>
                  <div style={{
                    minHeight: 68, padding: '8px 11px', lineHeight: 1.55, border: '1px solid #d9d9d9', borderRadius: 6,
                  }}>{selected.note}</div>
                  <div style={{ marginTop: 5, color: '#8c8c8c', fontSize: 12 }}>用于说明节点用途，便于流程维护与协作。</div>
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px -16px 0' }}>
                  {/* 输入参数 */}
                  <CollapseSection title="输入参数" count={selected.id === 'agent' ? '2' : undefined}
                    open={openSections.input} onToggle={() => toggleSection('input')}>
                    {selected.id === 'agent' ? (
                      <>
                        <VariableParam name="交易所" value="用户输入.exchange" type="String" />
                        <VariableParam name="查询代码" value="用户输入.code" type="String" />
                      </>
                    ) : (
                      <TextNote text="无输入参数" />
                    )}
                  </CollapseSection>

                  {/* 运行策略 */}
                  <CollapseSection title="运行策略" open={openSections.strategy} onToggle={() => toggleSection('strategy')}>
                    <StrategyRow label="失败自动重试" note="失败后自动重试 2 次" on />
                    <StrategyRow label="输出异常分支" note="为异常状态创建独立出口" />
                  </CollapseSection>

                  {/* 输出变量 */}
                  <CollapseSection title="输出变量" open={openSections.output} onToggle={() => toggleSection('output')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>result</span>
                      <span style={{
                        height: 22, padding: '0 7px', border: '1px solid #d9d9d9', borderRadius: 4,
                        background: '#fafafa', color: '#595959', display: 'inline-flex', alignItems: 'center', fontSize: 12,
                      }}>String</span>
                    </div>
                  </CollapseSection>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#8c8c8c' }}>
                暂无运行结果
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ──── 检查器折叠区块 ────
const CollapseSection: React.FC<{
  title: string; count?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}> = ({ title, count, open, onToggle, children }) => (
  <div style={{ borderBottom: '1px solid #f0f0f0' }}>
    <div style={{
      height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontWeight: 600, cursor: 'pointer',
    }} onClick={onToggle}>
      <div>
        {title}
        {count && <span style={{ marginLeft: 7, color: '#8c8c8c', fontSize: 12, fontWeight: 400 }}>{count}</span>}
      </div>
      <UpOutlined style={{ fontSize: 12, color: '#8c8c8c', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
    </div>
    {open && <div style={{ padding: '4px 16px 14px' }}>{children}</div>}
  </div>
);

const VariableParam: React.FC<{ name: string; value: string; type: string }> = ({ name, value, type }) => (
  <div style={{ marginBottom: 13 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
      <span>{name}</span>
      <span style={{
        height: 22, padding: '0 7px', border: '1px solid #d9d9d9', borderRadius: 4,
        background: '#fafafa', color: '#595959', display: 'inline-flex', alignItems: 'center', fontSize: 12,
      }}>{type}</span>
    </div>
    <div style={{
      height: 36, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff',
      display: 'grid', gridTemplateColumns: '34px 1fr 30px', alignItems: 'center', overflow: 'hidden',
    }}>
      <span style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#1677ff', background: '#fafafa', borderRight: '1px solid #f0f0f0' }}>
        <CodeOutlined />
      </span>
      <span style={{ padding: '0 9px', color: '#1677ff' }}>{value}</span>
      <span style={{ color: '#8c8c8c', display: 'grid', placeItems: 'center' }}>
        <DownOutlined style={{ fontSize: 12 }} />
      </span>
    </div>
  </div>
);

const StrategyRow: React.FC<{ label: string; note: string; on?: boolean }> = ({ label, note, on }) => (
  <div style={{
    minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    borderBottom: '1px solid #f0f0f0',
  }}>
    <div>
      <div>{label}</div>
      <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>{note}</div>
    </div>
    <span style={{
      width: 36, height: 20, borderRadius: 10, background: on ? '#1677ff' : '#bfbfbf',
      position: 'relative', flex: '0 0 auto', cursor: 'pointer',
    }}>
      <span style={{
        position: 'absolute', width: 16, height: 16, left: on ? 18 : 2, top: 2, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />
    </span>
  </div>
);

const TextNote: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ color: '#8c8c8c', fontSize: 12 }}>{text}</div>
);
