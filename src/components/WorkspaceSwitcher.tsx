import React, { useState, useMemo } from 'react';
import { Modal, Tag, Typography, Avatar, Input } from 'antd';
import {
  SearchOutlined, TeamOutlined, RobotOutlined, CheckCircleFilled,
  BankOutlined,
} from '@ant-design/icons';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { SpaceItem } from '@/mock/data';

const { Text } = Typography;

const brandColor = '#1677ff';
const brandBg = '#e6f4ff';

interface Props {
  collapsed?: boolean;
}

const WorkspaceSwitcher: React.FC<Props> = ({ collapsed }) => {
  const { currentSpace, spaces, switchSpace } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconChar = currentSpace.name.charAt(0);

  const filteredSpaces = useMemo(() => {
    if (!search.trim()) return spaces;
    const kw = search.trim().toLowerCase();
    return spaces.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.dept.toLowerCase().includes(kw) ||
      s.creator.toLowerCase().includes(kw)
    );
  }, [spaces, search]);

  const currentIndex = useMemo(
    () => filteredSpaces.findIndex(s => s.id === currentSpace.id),
    [filteredSpaces, currentSpace],
  );

  return (
    <>
      {/* ── Sidebar trigger ── */}
      <div
        onClick={() => setModalOpen(true)}
        style={{
          padding: collapsed ? '12px 0' : '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s',
          userSelect: 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {collapsed ? (
          <div
            style={{
              width: 30,
              height: 30,
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
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: brandBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: brandColor,
                  flexShrink: 0,
                }}
              >
                {iconChar}
              </div>
              <span
                style={{
                  fontSize: 13,
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
            选择您要进入的工作空间，当前共有 {spaces.length} 个可用空间
          </Text>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#B0B8C8' }} />}
            placeholder="搜索空间名称、部门或创建人"
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
              return (
                <div
                  key={space.id}
                  onClick={() => {
                    if (!isCurrent) {
                      switchSpace(space.id);
                      setModalOpen(false);
                      setSearch('');
                    }
                  }}
                  style={{
                    background: isCurrent ? '#F7F9FC' : '#fff',
                    borderRadius: 8,
                    border: isCurrent ? `1px solid ${brandColor}30` : '1px solid #E5EAF3',
                    padding: '16px 20px',
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = '#BCC7DB';
                      e.currentTarget.style.background = '#FAFBFC';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = '#E5EAF3';
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                >
                  {/* Avatar — 浅色底深色字，与侧边栏触发区一致 */}
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
                    {isCurrent ? (
                      <span style={{
                        fontSize: 12,
                        color: '#7A8599',
                        fontWeight: 500,
                        padding: '5px 14px',
                        borderRadius: 5,
                        background: '#F2F3F8',
                      }}>
                        当前已进入
                      </span>
                    ) : (
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
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
};

export default WorkspaceSwitcher;
