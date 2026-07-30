import React, { useState, useMemo } from 'react';
import { Modal, Tag, Typography, Avatar, Input, Button, message, Drawer } from 'antd';
import {
  SearchOutlined, TeamOutlined, RobotOutlined, CheckCircleFilled,
  BankOutlined, PlusCircleOutlined, PlusOutlined, CrownOutlined, UserOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { mockSpaces, mockApprovals, type SpaceItem, type SpaceApproval } from '@/mock/data';
import SpaceCreateDrawer from '@/components/SpaceCreateDrawer';
import type { SpaceCreateValues } from '@/components/SpaceCreateDrawer';

const { Text, Title } = Typography;

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
  /** 浅色主题：用于深色 banner 背景，文字和箭头变白 */
  light?: boolean;
}

const WorkspaceSwitcher: React.FC<Props> = ({ collapsed, inline, light }) => {
  const { currentSpace, spaces, switchSpace } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // ── 申请抽屉状态 ──
  const [applyDrawerOpen, setApplyDrawerOpen] = useState(false);

  // ── 我的申请状态 ──
  const [myAppsOpen, setMyAppsOpen] = useState(false);

  // ── 当前登录用户 ──
  const currentUserName = '演示用户';

  // ── 我的申请列表 ──
  const myApplications = useMemo(() => {
    return mockApprovals
      .filter(a => a.applicant === currentUserName)
      .sort((a, b) => b.applyTime.localeCompare(a.applyTime));
  }, []);

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

  // ── 提交申请 ──
  const handleApplySubmit = (values: SpaceCreateValues) => {
    const newId = 'A' + String(mockApprovals.length + 1).padStart(2, '0');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newApproval: SpaceApproval = {
      id: newId,
      spaceName: values.spaceName,
      spaceType: values.spaceType as '工作空间' | '专案空间',
      dept: values.spaceDept || (values.spaceOwner ? memberOptions.find(m => m.value === values.spaceOwner)?.dept ?? '未指定' : '未指定'),
      applicant: currentUserName,
      applyTime: now,
      status: '待审核',
      presetResources: {
        models: values.presetSelections.模型 || [],
        prompts: [],
        tools: values.presetSelections.工具 || [],
        connectors: values.presetSelections.连接器 || [],
        knowledge: values.presetSelections.知识库 || [],
      },
      members: values.members.map(m => ({ name: m.name, dept: m.dept, role: m.role })),
    };
    mockApprovals.push(newApproval);
    message.success('空间申请已提交，请等待管理员审核');
    setApplyDrawerOpen(false);
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
              background: light ? 'rgba(255,255,255,0.2)' : brandBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: light ? '#fff' : brandColor,
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
                  background: light ? 'rgba(255,255,255,0.2)' : brandBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: light ? '#fff' : brandColor,
                  flexShrink: 0,
                }}
              >
                {iconChar}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: light ? '#fff' : '#1D2129',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentSpace.name}
              </span>
            </div>
            <span style={{ fontSize: 10, color: light ? 'rgba(255,255,255,0.85)' : '#B0B8C8', flexShrink: 0, marginLeft: 4 }}>
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
                      {space.description || '-'}
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

        {/* ── 底部操作区：申请新的空间 + 我的申请 ── */}
        <div style={{ flexShrink: 0, paddingTop: 16, marginTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => {
              setModalOpen(false);
              setSearch('');
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
          <div style={{ flex: 1 }} />
          <div
            onClick={() => {
              setModalOpen(false);
              setSearch('');
              setMyAppsOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              color: brandColor,
              fontSize: 13,
              userSelect: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <span>我的申请</span>
          </div>
        </div>
      </Modal>

      {/* ── 申请新空间抽屉 ── */}
      <SpaceCreateDrawer
        mode="apply"
        open={applyDrawerOpen}
        onClose={() => setApplyDrawerOpen(false)}
        onSubmit={handleApplySubmit}
      />

      {/* ── 我的申请 Drawer ── */}
      <Drawer
        title="我的申请"
        open={myAppsOpen}
        onClose={() => setMyAppsOpen(false)}
        size={480}
        destroyOnHidden
      >
        {myApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#B0B8C8', fontSize: 13 }}>
            暂无申请记录，点击下方"申请新的空间"发起申请
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myApplications.map(app => {
              const statusConfig: Record<string, { color: string; text: string }> = {
                '待审核': { color: 'orange', text: '待审核' },
                '已通过': { color: 'green', text: '已通过' },
                '已驳回': { color: 'red', text: '已驳回' },
              };
              const cfg = statusConfig[app.status] || { color: 'default', text: app.status };
              // 已通过的申请，查找对应的空间以支持"进入"
              const targetSpace = app.status === '已通过'
                ? mockSpaces.find(s => s.name === app.spaceName && s.status === '启用')
                : null;
              return (
                <div
                  key={app.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1px solid #E5EAF3',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: brandBg,
                      color: brandColor,
                      fontSize: 15,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {app.spaceName.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#1D2129' }}>{app.spaceName}</span>
                      <Tag color={cfg.color} style={{ borderRadius: 4, margin: 0, fontSize: 11, lineHeight: '18px' }}>
                        {cfg.text}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#7A8599' }}>
                      {app.dept} · 申请于 {app.applyTime}
                    </div>
                    {app.status === '已驳回' && app.rejectionReason && (
                      <div style={{
                        marginTop: 6,
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: '#fff2f0',
                        border: '1px solid #ffccc7',
                        fontSize: 12,
                        color: '#cf1322',
                      }}>
                        驳回原因：{app.rejectionReason}
                      </div>
                    )}
                  </div>
                  {targetSpace && (
                    <Button
                      type="primary"
                      size="small"
                      style={{ flexShrink: 0 }}
                      onClick={() => {
                        switchSpace(targetSpace.id);
                        setMyAppsOpen(false);
                      }}
                    >
                      进入
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </>
  );
};

export default WorkspaceSwitcher;
