import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Tag, Typography, Avatar, Input, Form, Select, Button, message, Popconfirm, Row, Col } from 'antd';
import {
  SearchOutlined, TeamOutlined, RobotOutlined, CheckCircleFilled,
  BankOutlined, PlusCircleOutlined, PlusOutlined, CrownOutlined,
  RobotOutlined as RobotIcon, FileTextOutlined, ToolOutlined, ApiOutlined, BookOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { mockSpaces, type SpaceItem, type SpaceMember } from '@/mock/data';
import StepDrawer from '@/components/StepDrawer';
import IconPicker, { type IconPickerValue } from '@/components/IconPicker';
import MemberSelect from '@/components/MemberSelect';

const { Text, Title } = Typography;
const { TextArea } = Input;

const brandColor = '#1677ff';
const brandBg = '#e6f4ff';

// ── 可选成员列表 ──
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

interface Props {
  collapsed?: boolean;
  /** 内联模式：用于页面头部，无边框无背景 */
  inline?: boolean;
}

const WorkspaceSwitcher: React.FC<Props> = ({ collapsed, inline }) => {
  const { currentSpace, spaces, switchSpace } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // ── 申请抽屉状态 ──
  const [applyDrawerOpen, setApplyDrawerOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(0);
  const [applySpaceName, setApplySpaceName] = useState('');
  const [applySpaceDept, setApplySpaceDept] = useState<string | undefined>(undefined);
  const [applySpaceType, setApplySpaceType] = useState('工作空间');
  const [applySpaceOwner, setApplySpaceOwner] = useState<string | undefined>('u0');
  const [applyMembers, setApplyMembers] = useState<SpaceMember[]>([]);
  const [applyPresetSelections, setApplyPresetSelections] = useState<Record<string, string[]>>({});
  const [applySpaceIcon, setApplySpaceIcon] = useState<IconPickerValue>({ mode: 'text' });
  const [applyMemberAddOpen, setApplyMemberAddOpen] = useState(false);
  const [applyMemberAddRole, setApplyMemberAddRole] = useState<'普通用户'>('普通用户');

  // ── 申请：同步负责人到成员管理 ──
  useEffect(() => {
    if (applyStep === 2 && applySpaceOwner) {
      const ownerInfo = memberOptions.find(m => m.value === applySpaceOwner);
      if (ownerInfo) {
        setApplyMembers(prev => {
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
  }, [applyStep, applySpaceOwner]);

  const iconChar = currentSpace.name.charAt(0);

  const filteredSpaces = useMemo(() => {
    const available = spaces.filter(s => s.status !== '归档');
    if (!search.trim()) return available;
    const kw = search.trim().toLowerCase();
    return available.filter(s =>
      s.name.toLowerCase().includes(kw)
    );
  }, [spaces, search]);

  const currentIndex = useMemo(
    () => filteredSpaces.findIndex(s => s.id === currentSpace.id),
    [filteredSpaces, currentSpace],
  );

  // ── 申请步骤定义 ──
  const applySteps = [
    { title: '基本信息' },
    { title: '预置资源' },
    { title: '成员管理' },
    { title: '确认提交' },
  ];

  // ── 重置申请表单 ──
  const resetApplyForm = () => {
    setApplySpaceName('');
    setApplySpaceDept(undefined);
    setApplySpaceType('工作空间');
    setApplySpaceOwner('u0');
    setApplyMembers([]);
    setApplyPresetSelections({});
    setApplySpaceIcon({ mode: 'text' });
    setApplyStep(0);
  };

  // ── 提交申请 ──
  const handleApplySubmit = () => {
    const newId = String(Number(mockSpaces[mockSpaces.length - 1]?.id || '0') + 1);
    const newSpace: SpaceItem = {
      id: newId,
      name: applySpaceName,
      dept: applySpaceDept || memberOptions.find(m => m.value === applySpaceOwner)?.dept || '未指定',
      type: applySpaceType as '工作空间' | '专案空间',
      status: '待审核',
      memberCount: applyMembers.length || 1,
      agentCount: 0,
      knowledgeCount: 0,
      promptCount: 0,
      toolCount: 0,
      modelCount: 0,
      connectorCount: 0,
      creator: applySpaceOwner ? memberOptions.find(m => m.value === applySpaceOwner)?.name || '未知' : '未知',
      createTime: new Date().toISOString().slice(0, 10),
      updateTime: new Date().toISOString().slice(0, 10),
    };
    mockSpaces.push(newSpace);
    message.success('空间申请已提交，请等待管理员审核');
    setApplyDrawerOpen(false);
    resetApplyForm();
  };

  return (
    <>
      {/* ── Trigger ── */}
      <div
        onClick={() => setModalOpen(true)}
        style={{
          padding: inline ? '0' : collapsed ? '8px 0' : '8px 16px',
          borderBottom: inline ? 'none' : '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s',
          userSelect: 'none',
          gap: inline ? 8 : 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = inline ? 'transparent' : '#fafafa'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {collapsed ? (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: brandBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: brandColor,
            }}
          >
            {iconChar}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: brandBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: brandColor,
                  flexShrink: 0,
                }}
              >
                {iconChar}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1D2129',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentSpace.name}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#B0B8C8', flexShrink: 0, marginLeft: 4 }}>
              &#9660;
            </span>
          </>
        )}
      </div>

      {/* ── Space switch modal ── */}
      <Modal
        title={null}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setSearch(''); }}
        footer={null}
        width={680}
        destroyOnHidden
        styles={{ body: { padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', maxHeight: '72vh', overflow: 'hidden' } }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', marginBottom: 4 }}>
            切换工作空间
          </div>
          <Text style={{ fontSize: 13, color: '#7A8599' }}>
            选择您要进入的工作空间，当前共有 {spaces.filter(s => s.status !== '归档').length} 个可用空间
          </Text>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
            placeholder="搜索空间名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 6 }}
          />
        </div>

        {/* Space list — scrollable */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 2 }}>
          {filteredSpaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#B0B8C8', fontSize: 13 }}>
              未找到匹配的空间
            </div>
          ) : (
            filteredSpaces.map((space) => {
              const isCurrent = space.id === currentSpace.id;
              const isPersonal = space.type === '个人空间';
              const isFrozen = space.status === '冻结';
              return (
                <div
                  key={space.id}
                  onClick={() => {
                    if (!isCurrent && !isFrozen) {
                      switchSpace(space.id);
                      setModalOpen(false);
                      setSearch('');
                    }
                  }}
                  style={{
                    background: isFrozen ? '#fafafa' : isCurrent ? '#F7F9FC' : '#fff',
                    borderRadius: 8,
                    border: isCurrent ? `1px solid ${brandColor}30` : isFrozen ? '1px solid #e8e8e8' : '1px solid #E5EAF3',
                    padding: '16px 20px',
                    cursor: isFrozen ? 'not-allowed' : isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexShrink: 0,
                    opacity: isFrozen ? 0.6 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent && !isFrozen) {
                      e.currentTarget.style.borderColor = '#BCC7DB';
                      e.currentTarget.style.background = '#FAFBFC';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent && !isFrozen) {
                      e.currentTarget.style.borderColor = '#E5EAF3';
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: brandBg,
                      color: brandColor,
                      fontSize: 18,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {space.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1D2129' }}>
                        {space.name}
                      </span>
                      {isPersonal && (
                        <Tag
                          style={{
                            borderRadius: 4,
                            margin: 0,
                            fontSize: 11,
                            color: brandColor,
                            background: brandColor + '10',
                            border: `1px solid ${brandColor}20`,
                            lineHeight: '18px',
                            flexShrink: 0,
                          }}
                        >
                          默认空间
                        </Tag>
                      )}
                      {isFrozen && (
                        <Tag
                          style={{
                            borderRadius: 4,
                            margin: 0,
                            fontSize: 11,
                            color: '#8c8c8c',
                            background: '#fafafa',
                            border: '1px solid #d9d9d9',
                            lineHeight: '18px',
                            flexShrink: 0,
                          }}
                        >
                          已冻结
                        </Tag>
                      )}
                      {isCurrent && (
                        <Tag
                          style={{
                            borderRadius: 4,
                            margin: 0,
                            fontSize: 11,
                            color: '#52c41a',
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            lineHeight: '18px',
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircleFilled style={{ fontSize: 10, marginRight: 3 }} />
                          当前空间
                        </Tag>
                      )}
                    </div>

                    <Text style={{ fontSize: 13, color: '#5F6B7A', lineHeight: '20px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isPersonal
                        ? '您的专属个人工作空间，包含个人智能体、资源和工具'
                        : `${space.dept} · 由${space.creator}创建及维护 · 空间用于${space.dept}的智能体开发协作`}
                    </Text>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TeamOutlined style={{ fontSize: 12, color: '#B0B8C8' }} />
                        <Text style={{ fontSize: 12, color: '#7A8599' }}>{space.memberCount} 位成员</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RobotOutlined style={{ fontSize: 12, color: '#B0B8C8' }} />
                        <Text style={{ fontSize: 12, color: '#7A8599' }}>{space.agentCount} 智能体</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BankOutlined style={{ fontSize: 12, color: '#B0B8C8' }} />
                        <Text style={{ fontSize: 12, color: '#7A8599' }}>{space.dept}</Text>
                      </div>
                      {isPersonal && (
                        <Text style={{ fontSize: 12, color: '#7A8599' }}>{space.creator}</Text>
                      )}
                      {!isPersonal && (
                        <Text style={{ fontSize: 12, color: '#7A8599' }}>创建于 {space.createTime}</Text>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {isFrozen ? (
                      <span style={{
                        fontSize: 12,
                        color: '#8c8c8c',
                        fontWeight: 500,
                        padding: '5px 14px',
                        borderRadius: 5,
                        background: '#f5f5f5',
                      }}>
                        已冻结
                      </span>
                    ) : !isCurrent ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          switchSpace(space.id);
                          setModalOpen(false);
                          setSearch('');
                        }}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#fff',
                          background: brandColor,
                          padding: '5px 16px',
                          borderRadius: 5,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      >
                        进入
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── 底部操作区：申请新的空间 ── */}
        <div style={{ flexShrink: 0, paddingTop: 16, marginTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <div
            onClick={() => {
              setModalOpen(false);
              setSearch('');
              setApplyStep(0);
              setApplyDrawerOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              color: brandColor,
              fontSize: 13,
              userSelect: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <PlusCircleOutlined style={{ fontSize: 14 }} />
            <span>申请新的空间</span>
          </div>
          <Text style={{ fontSize: 12, color: '#B0B8C8', marginLeft: 6 }}>
            需要加入新的工作空间？
          </Text>
        </div>
      </Modal>

      {/* ── 申请新空间抽屉 ── */}
      <StepDrawer
        title="申请新的空间"
        open={applyDrawerOpen}
        onClose={() => { setApplyDrawerOpen(false); resetApplyForm(); }}
        steps={applySteps}
        current={applyStep}
        totalSteps={applySteps.length}
        onCurrentChange={setApplyStep}
        onFinish={handleApplySubmit}
      >
        {/* 第一步：基本信息 */}
        {applyStep === 0 && (
          <Form layout="vertical">
            <Form.Item label="空间名称" required>
              <Input
                placeholder="请输入空间名称"
                style={{ borderRadius: 6 }}
                value={applySpaceName}
                onChange={(e) => setApplySpaceName(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="空间描述">
              <TextArea rows={3} placeholder="描述该空间的用途和适用范围" style={{ borderRadius: 6 }} />
            </Form.Item>
            <Form.Item label="空间图标">
              <IconPicker
                value={applySpaceIcon}
                onChange={setApplySpaceIcon}
                size={64}
                defaultName={applySpaceName}
              />
            </Form.Item>
            <Form.Item label="所属警种/部门">
              <Select
                placeholder="从组织架构中选择（选填）"
                style={{ borderRadius: 6 }}
                value={applySpaceDept}
                onChange={setApplySpaceDept}
                allowClear
                options={[
                  '指挥中心', '反诈中心', '刑警大队', '交警支队', '治安支队',
                  '法制大队', '派出所', '科信大队', '巡特警支队', '网安支队',
                ].map(d => ({ label: d, value: d }))}
              />
            </Form.Item>
            <Form.Item label="负责人" required>
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
            </Form.Item>
            <Form.Item label="空间类型" required>
              <Select
                value={applySpaceType}
                onChange={setApplySpaceType}
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

        {/* 第二步：预置资源 */}
        {applyStep === 1 && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              从平台组件管理已登记的资源中选择预置到该空间，创建后可继续添加。
            </Text>
            {[
              { label: '模型', icon: <RobotIcon />, placeholder: '搜索并选择模型', options: [
                { label: 'DeepSeek-Chat', value: 'deepseek-chat' },
                { label: 'DeepSeek-Reasoner', value: 'deepseek-reasoner' },
                { label: 'Qwen-72B-Chat', value: 'qwen-72b' },
                { label: 'GPT-4o', value: 'gpt-4o' },
                { label: 'Claude-3.5-Sonnet', value: 'claude-3.5' },
                { label: 'Hunyuan-Pro', value: 'hunyuan-pro' },
              ]},
              { label: '提示词', icon: <FileTextOutlined />, placeholder: '搜索并选择提示词', options: [
                { label: '案情摘要模板', value: 'case-summary' },
                { label: '违章分析模板', value: 'violation-analysis' },
                { label: '接警分析模板', value: 'alarm-analysis' },
                { label: '证件审核模板', value: 'id-review' },
              ]},
              { label: '工具', icon: <ToolOutlined />, placeholder: '搜索并选择工具', options: [
                { label: '文书智能解析', value: 'doc-parser' },
                { label: '人口信息查询', value: 'population-query' },
                { label: '车辆轨迹查询', value: 'vehicle-track' },
                { label: '图像识别', value: 'image-recognition' },
              ]},
              { label: '连接器', icon: <ApiOutlined />, placeholder: '搜索并选择连接器', options: [
                { label: '公安数据库连接器', value: 'police-db-mcp' },
                { label: '交管数据连接器', value: 'traffic-mcp' },
                { label: '政务云连接器', value: 'gov-cloud-mcp' },
              ]},
              { label: '知识库', icon: <BookOutlined />, placeholder: '搜索并选择知识库', options: [
                { label: '公安法规库', value: 'legal-db' },
                { label: '警情案例库', value: 'case-db' },
                { label: '标准文书库', value: 'template-db' },
              ]},
            ].map(group => {
              const selectedCount = (applyPresetSelections[group.label] || []).length;
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
                    value={applyPresetSelections[group.label] || []}
                    onChange={(vals) => setApplyPresetSelections(prev => ({ ...prev, [group.label]: vals }))}
                    options={group.options}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 第三步：成员管理 */}
        {applyStep === 2 && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
              为空间添加成员并设置初始角色，创建后可继续在空间详情中管理。
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setApplyMemberAddOpen(true)}>添加成员</Button>
            </div>
            {applyMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <Text type="secondary">暂未添加成员，可跳过此步骤</Text>
              </div>
            ) : (
              applyMembers.map((m) => (
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
                    <Tag color="gold" style={{ borderRadius: 4, marginRight: 8 }}>
                      <CrownOutlined style={{ marginRight: 2 }} />所有者
                    </Tag>
                  ) : (
                    <>
                      <Select
                        size="small"
                        value={m.role}
                        style={{ width: 100, marginRight: 8 }}
                        onChange={(val) => {
                          setApplyMembers(prev => prev.map(p => p.id === m.id ? { ...p, role: val as '普通用户' } : p));
                        }}
                        options={[
                          { label: '普通用户', value: '普通用户' },
                        ]}
                      />
                      <Popconfirm
                        title="确认移除"
                        description={`确定将 ${m.name} 移出？`}
                        onConfirm={() => {
                          setApplyMembers(prev => prev.filter(p => p.id !== m.id));
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

        {/* 第四步：确认提交 */}
        {applyStep === 3 && (
          <div>
            <div style={{
              padding: '20px', borderRadius: 10, background: '#f5f8ff',
              border: '1px solid #d6e4ff', marginBottom: 16,
            }}>
              <Title level={5} style={{ margin: 0 }}>基本信息</Title>
              <div style={{ marginTop: 12 }}>
                {[
                  { label: '空间名称', value: applySpaceName || '未填写' },
                  { label: '空间类型', value: applySpaceType },
                  { label: '所属部门', value: applySpaceDept || '未选择' },
                  { label: '负责人', value: applySpaceOwner ? memberOptions.find(m => m.value === applySpaceOwner)?.name || applySpaceOwner : '未选择' },
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
                  { label: '提示词', key: '提示词' },
                  { label: '工具', key: '工具' },
                  { label: '连接器', key: '连接器' },
                  { label: '知识库', key: '知识库' },
                ].map(item => {
                  const selected = applyPresetSelections[item.key] || [];
                  return (
                    <div key={item.label} style={{ display: 'flex', padding: '6px 0' }}>
                      <Text type="secondary" style={{ width: 100 }}>{item.label}</Text>
                      <span>
                        {selected.length > 0
                          ? selected.map(v => (
                              <Tag key={v} style={{ marginBottom: 4 }}>{v}</Tag>
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
                {applyMembers.length > 0 ? (
                  applyMembers.map(m => (
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
                      <Tag style={{ marginLeft: 8 }}>{m.role}</Tag>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">未添加成员</Text>
                )}
              </div>
            </div>
          </div>
        )}
      </StepDrawer>

      {/* ── 申请成员添加对话框 ── */}
      <Modal
        title="添加成员"
        open={applyMemberAddOpen}
        onCancel={() => setApplyMemberAddOpen(false)}
        onOk={() => {
          setApplyMemberAddOpen(false);
          const added = ['孙法官', '刘队长', '赵副组长', '钱警官'];
          const name = added[Math.floor(Math.random() * added.length)];
          const newMember: SpaceMember = {
            id: Date.now().toString(),
            name,
            dept: memberOptions.find(m => m.name === name)?.dept || '指挥中心',
            role: applyMemberAddRole,
            joinTime: new Date().toISOString().slice(0, 10),
            lastActive: '',
          };
          setApplyMembers(prev => [...prev, newMember]);
          message.success(`已添加成员 ${name}（${applyMemberAddRole}）`);
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
              value={applyMemberAddRole}
              onChange={(val) => setApplyMemberAddRole(val)}
              style={{ width: '100%', borderRadius: 6 }}
              options={[
                { label: '普通用户', value: '普通用户' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkspaceSwitcher;
