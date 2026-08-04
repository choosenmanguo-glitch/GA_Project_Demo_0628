import React, { useState, useEffect, useMemo } from 'react';
import { Button, Tag, Typography, Form, Input, Select, message, Popconfirm, Modal, Tooltip } from 'antd';
import {
  PlusOutlined, UserOutlined,
  RobotOutlined, ToolOutlined, ApiOutlined, BookOutlined,
} from '@ant-design/icons';
import type { SpaceMember } from '@/mock/data';
import StepDrawer from '@/components/StepDrawer';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';
import MemberSelect from '@/components/MemberSelect';

const { Text, Title } = Typography;
const { TextArea } = Input;

const deptOptions = [
  '指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队',
  '法制大队', '派出所', '科信大队', '巡特警支队', '网安支队',
].map(d => ({ label: d, value: d }));

const memberOptions = [
  { name: '演示用户', dept: '科信大队', value: 'u0' },
  { name: '李警官', dept: '指挥中心', value: 'u1' },
  { name: '王大队', dept: '反诈中心', value: 'u2' },
  { name: '赵警官', dept: '交警支队', value: 'u3' },
  { name: '陈队长', dept: '刑警大队', value: 'u4' },
  { name: '张警官', dept: '治安支队', value: 'u5' },
  { name: '周科长', dept: '法制大队', value: 'u6' },
  { name: '孙法官', dept: '法制大队', value: 'u7' },
  { name: '刘队长', dept: '巡特警支队', value: 'u8' },
  { name: '赵副组长', dept: '刑侦大队', value: 'u9' },
  { name: '钱警官', dept: '派出所', value: 'u10' },
];

const resourceGroups = [
  {
    label: '模型', icon: <RobotOutlined />, placeholder: '搜索并选择模型',
    options: [
      { label: 'DeepSeek-Chat', value: 'deepseek-chat', desc: 'DeepSeek 对话模型，支持长上下文理解与多轮对话' },
      { label: 'DeepSeek-Reasoner', value: 'deepseek-reasoner', desc: 'DeepSeek 推理模型，擅长复杂逻辑推理与数学问题' },
      { label: 'Qwen-72B-Chat', value: 'qwen-72b', desc: '通义千问 72B 量化版，本地私有化部署，保障数据安全' },
      { label: 'GPT-4o', value: 'gpt-4o', desc: 'OpenAI 多模态旗舰模型，支持文本、图像、音频输入' },
      { label: 'Claude-3.5-Sonnet', value: 'claude-3.5', desc: 'Anthropic Claude 3.5 Sonnet，平衡性能与成本' },
      { label: 'Hunyuan-Pro', value: 'hunyuan-pro', desc: '腾讯混元大模型专业版，中文理解能力突出' },
    ],
  },
  {
    label: '工具', icon: <ToolOutlined />, placeholder: '搜索并选择工具',
    options: [
      { label: '文书智能解析', value: 'doc-parser', desc: '智能解析公安文书，自动提取关键信息字段' },
      { label: '人口信息查询', value: 'population-query', desc: '对接人口信息系统，快速查询人员基本信息' },
      { label: '车辆轨迹查询', value: 'vehicle-track', desc: '查询车辆行驶轨迹与历史记录' },
      { label: '图像识别', value: 'image-recognition', desc: '基于深度学习的图像内容识别与分析' },
    ],
  },
  {
    label: '连接器', icon: <ApiOutlined />, placeholder: '搜索并选择连接器',
    options: [
      { label: '公安数据库连接器', value: 'police-db-mcp', desc: '安全接入公安内部数据库，实现数据互通' },
      { label: '交管数据连接器', value: 'traffic-mcp', desc: '对接交管系统，获取交通违章与事故数据' },
      { label: '政务云连接器', value: 'gov-cloud-mcp', desc: '连接政务云平台，调用政府公共服务接口' },
    ],
  },
  {
    label: '知识库', icon: <BookOutlined />, placeholder: '搜索并选择知识库',
    options: [
      { label: '公安法规库', value: 'legal-db', desc: '涵盖现行公安法律法规与司法解释' },
      { label: '警情案例库', value: 'case-db', desc: '收录典型警情案例与处置经验' },
      { label: '标准文书库', value: 'template-db', desc: '提供各类公安标准化文书模板' },
    ],
  },
];

export interface SpaceCreateValues {
  spaceName: string;
  spaceDesc: string;
  spaceDept: string | undefined;
  spaceType: string;
  spaceOwner: string | undefined;
  members: SpaceMember[];
  presetSelections: Record<string, string[]>;
}

interface Props {
  mode: 'create' | 'apply';
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SpaceCreateValues) => void;
}

const SpaceCreateDrawer: React.FC<Props> = ({ mode, open, onClose, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [spaceName, setSpaceName] = useState('');
  const [spaceDesc, setSpaceDesc] = useState('');
  const [spaceDept, setSpaceDept] = useState<string | undefined>(undefined);
  const [spaceType, setSpaceType] = useState('工作空间');
  const [spaceOwner, setSpaceOwner] = useState<string | undefined>(mode === 'apply' ? 'u0' : undefined);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [presetSelections, setPresetSelections] = useState<Record<string, string[]>>({});
  const [spaceIcon, setSpaceIcon] = useState<IconPickerValue>({ mode: 'text' });
  const [memberAddOpen, setMemberAddOpen] = useState(false);
  const [memberAddRole, setMemberAddRole] = useState<'普通用户'>('普通用户');

  // ── resource desc map ──
  const resourceDescMap = useMemo(() => {
    const map: Record<string, string> = {};
    resourceGroups.forEach(g => g.options.forEach(o => { map[o.value] = o.desc; }));
    return map;
  }, []);

  // ── 同步负责人到成员管理 ──
  useEffect(() => {
    if (step === 2 && spaceOwner) {
      const ownerInfo = memberOptions.find(m => m.value === spaceOwner);
      if (ownerInfo) {
        setMembers(prev => {
          const existingOwner = prev.find(m => m.role === '所有者');
          if (existingOwner && existingOwner.name === ownerInfo.name) return prev;
          const withoutOwner = prev.filter(m => m.role !== '所有者');
          return [
            {
              id: `owner-${ownerInfo.value}`,
              name: ownerInfo.name,
              dept: ownerInfo.dept,
              role: '所有者' as const,
              joinTime: new Date().toISOString().slice(0, 10),
              lastActive: '',
            },
            ...withoutOwner,
          ];
        });
      }
    }
  }, [step, spaceOwner]);

  // ── 重置表单 ──
  const resetForm = () => {
    setSpaceName('');
    setSpaceDesc('');
    setSpaceDept(undefined);
    setSpaceType('工作空间');
    setSpaceOwner(mode === 'apply' ? 'u0' : undefined);
    setMembers([]);
    setPresetSelections({});
    setSpaceIcon({ mode: 'text' });
    setStep(0);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleFinish = () => {
    onSubmit({
      spaceName,
      spaceDesc,
      spaceDept,
      spaceType,
      spaceOwner,
      members,
      presetSelections,
    });
    resetForm();
  };

  const steps = [
    { title: '基本信息' },
    { title: '预置资源' },
    { title: '成员管理' },
    { title: mode === 'create' ? '确认创建' : '确认提交' },
  ];

  return (
    <StepDrawer
      title={mode === 'create' ? '创建空间' : '申请新的空间'}
      open={open}
      onClose={handleClose}
      steps={steps}
      current={step}
      totalSteps={steps.length}
      onCurrentChange={setStep}
      onFinish={handleFinish}
    >
      {/* ── 第一步：基本信息 ── */}
      {step === 0 && (
        <Form layout="vertical">
          <Form.Item label="空间名称" required rules={[{ required: true }]}>
            <Input
              placeholder="请输入空间名称"
              style={{ borderRadius: 6 }}
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="空间描述" required rules={[{ required: true, message: '请填写空间描述' }]}>
            <TextArea
              rows={3}
              placeholder="描述该空间的用途和适用范围"
              style={{ borderRadius: 6 }}
              value={spaceDesc}
              onChange={(e) => setSpaceDesc(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="空间图标">
            <IconPicker
              value={spaceIcon}
              onChange={setSpaceIcon}
              size={64}
              defaultName={spaceName}
            />
          </Form.Item>
          <Form.Item label="所属部门">
            <Select
              placeholder="从组织架构中选择（选填）"
              style={{ borderRadius: 6 }}
              value={spaceDept}
              onChange={setSpaceDept}
              allowClear
              options={deptOptions}
            />
          </Form.Item>
          <Form.Item label="负责人" required rules={mode === 'create' ? [{ required: true, message: '请选择空间负责人' }] : undefined}>
            {mode === 'create' ? (
              <Select
                placeholder="请选择空间负责人"
                style={{ borderRadius: 6 }}
                value={spaceOwner}
                onChange={setSpaceOwner}
                options={memberOptions.map(m => ({ label: `${m.name} (${m.dept})`, value: m.value }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            ) : (
              <>
                <Input
                  disabled
                  value="演示用户（科信大队）"
                  style={{ borderRadius: 6 }}
                />
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    负责人默认为当前登录用户，不可更改。
                  </Text>
                </div>
              </>
            )}
          </Form.Item>
          <Form.Item label="空间类型" required>
            <Select
              value={spaceType}
              onChange={setSpaceType}
              style={{ borderRadius: 6 }}
              options={[
                { label: '工作空间', value: '工作空间' },
                { label: '专案空间', value: '专案空间' },
              ]}
            />
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                个人空间为平台默认开启，无需手动创建。
              </Text>
            </div>
          </Form.Item>
        </Form>
      )}

      {/* ── 第二步：预置资源 ── */}
      {step === 1 && (
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
            从资源广场中选择已上架的资源预置到该空间。
          </Text>
          {resourceGroups.map(group => {
            const selectedCount = (presetSelections[group.label] || []).length;
            return (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#333' }}>
                  {group.icon}
                  {group.label}
                  {selectedCount > 0 && (
                    <Tag style={{ marginLeft: 4, fontSize: 12, lineHeight: '18px' }} color="blue">已选 {selectedCount} 个</Tag>
                  )}
                </div>
                <Select
                  mode="multiple"
                  placeholder={group.placeholder}
                  style={{ width: '100%', borderRadius: 6 }}
                  maxTagCount={5}
                  value={presetSelections[group.label] || []}
                  onChange={(vals) => setPresetSelections(prev => ({ ...prev, [group.label]: vals }))}
                  options={group.options}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  optionRender={(opt) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                      }}>
                        {opt.label?.toString().charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{opt.label}</div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(opt.data as any)?.desc || ''}
                        </Text>
                      </div>
                    </div>
                  )}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── 第三步：成员管理 ── */}
      {step === 2 && (
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
            为空间添加成员并设置初始角色，创建后可继续在空间详情中管理。
          </Text>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setMemberAddOpen(true)}>添加成员</Button>
          </div>
          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <Text type="secondary">暂未添加成员，可跳过此步骤</Text>
            </div>
          ) : (
            members.map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid #f5f5f5',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#1677ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, marginRight: 10, flexShrink: 0,
                }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{m.dept}</Text>
                </div>
                {m.role === '所有者' ? (
                  <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 8 }}>所有者</span>
                ) : (
                  <>
                    <Tag color="blue" style={{ borderRadius: 4, marginRight: 8 }}>
                      <UserOutlined style={{ marginRight: 2 }} />普通用户
                    </Tag>
                    <Popconfirm
                      title="确认移除"
                      description={`确定将 ${m.name} 移出？`}
                      onConfirm={() => {
                        setMembers(prev => prev.filter(p => p.id !== m.id));
                      }}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button type="link" size="small" danger>移除</Button>
                    </Popconfirm>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 第四步：确认 ── */}
      {step === 3 && (
        <div>
          <div style={{
            padding: '20px', borderRadius: 10, background: '#f5f8ff',
            border: '1px solid #d6e4ff', marginBottom: 16,
          }}>
            <Title level={5} style={{ margin: 0 }}>基本信息</Title>
            <div style={{ marginTop: 12 }}>
              {[
                  { label: '空间名称', value: spaceName || '未填写' },
                  { label: '空间描述', value: spaceDesc || '未填写' },
                  { label: '空间类型', value: spaceType },
                { label: '所属部门', value: spaceDept || '未选择' },
                { label: '负责人', value: spaceOwner ? memberOptions.find(m => m.value === spaceOwner)?.name || spaceOwner : '未选择' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                  <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                  <span style={{ fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            padding: '20px', borderRadius: 10, background: '#fafafa',
            border: '1px solid #f0f0f0', marginBottom: 16,
          }}>
            <Title level={5} style={{ margin: 0 }}>预置资源清单</Title>
            <div style={{ marginTop: 12 }}>
              {[
                { label: '模型', key: '模型' },
                { label: '工具', key: '工具' },
                { label: '连接器', key: '连接器' },
                { label: '知识库', key: '知识库' },
              ].map(item => {
                const selected = presetSelections[item.key] || [];
                return (
                  <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                    <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                    <span>
                      {selected.length > 0
                        ? selected.map(v => (
                            <Tooltip key={v} title={resourceDescMap[v] || v}>
                              <Tag style={{ marginBottom: 4, cursor: 'default' }}>{v}</Tag>
                            </Tooltip>
                          ))
                        : <Text type="secondary">未选择</Text>
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{
            padding: '20px', borderRadius: 10, background: '#fafafa',
            border: '1px solid #f0f0f0',
          }}>
            <Title level={5} style={{ margin: 0 }}>成员清单</Title>
            <div style={{ marginTop: 12 }}>
              {members.length > 0 ? (
                members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#1677ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, marginRight: 8, flexShrink: 0,
                    }}>
                      {m.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{m.dept}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">未添加成员</Text>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 添加成员对话框 ── */}
      <Modal
        title="添加成员"
        open={memberAddOpen}
        onCancel={() => setMemberAddOpen(false)}
        onOk={() => {
          setMemberAddOpen(false);
          const added = ['孙法官', '刘队长', '赵副组长', '钱警官'];
          const name = added[Math.floor(Math.random() * added.length)];
          const newMember: SpaceMember = {
            id: Date.now().toString(),
            name,
            dept: memberOptions.find(m => m.name === name)?.dept || '指挥中心',
            role: memberAddRole,
            joinTime: new Date().toISOString().slice(0, 10),
            lastActive: '',
          };
          setMembers(prev => [...prev, newMember]);
          message.success(`已添加成员 ${name}（${memberAddRole}）`);
        }}
        okText="确认添加"
        cancelText="取消"
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="选择成员">
            <MemberSelect options={memberOptions} />
          </Form.Item>
          <Form.Item label="初始角色">
            <Select
              value={memberAddRole}
              onChange={(val) => setMemberAddRole(val)}
              style={{ width: '100%', borderRadius: 6 }}
              options={[
                { label: '普通用户', value: '普通用户' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </StepDrawer>
  );
};

export default SpaceCreateDrawer;
