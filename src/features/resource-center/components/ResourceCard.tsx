import React from 'react';
import { Button, Checkbox, Space, Tag, Tooltip, Typography } from 'antd';

const { Text } = Typography;
import {
  CloudDownloadOutlined, FireFilled,
} from '@ant-design/icons';
import type { ResourceAccessView, ResourceItem } from '../types';
import { installConfig, strategyConfig, typeConfig } from '../ui';

interface ResourceCardProps {
  resource: ResourceItem;
  access?: ResourceAccessView;
  mode: 'square' | 'mine' | 'manage';
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDetail?: () => void;
  onInstall?: () => void;
  onRemove?: () => void;
  onStrategyClick?: () => void;
  onCardClick?: () => void;
  footer?: React.ReactNode;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource, access, mode, selectable, selected, onSelect, onDetail, onInstall, onRemove, onStrategyClick, onCardClick, footer,
}) => {
  const type = typeConfig[resource.type];
  const invalid = access?.invalidReason;
  const installStatus = access?.grant?.installStatus;
  const subtitle = resource.modelType || resource.knowledgeType || resource.deployment;

  const publishLabel: Record<string, string> = {
    published: '已上架', publishing: '发布审核中', pending: '待上架', offline: '已下架',
  };
  const publishColor: Record<string, string> = {
    published: 'success', publishing: 'processing', pending: 'warning', offline: 'default',
  };

  return (
    <div
      className="resource-card"
      style={{
        height: '100%',
        border: `1px solid ${selected ? '#1677ff' : '#f0f0f0'}`,
        borderRadius: 10,
        background: '#fff',
        padding: '20px 20px 16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onCardClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: 'none',
        transition: 'all .2s',
      }}
      onClick={onCardClick}
    >
      <div className="resource-card-accent" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
      {/* 顶部行：图标 + 名称/标识 + 状态标签 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {selectable && (
          <Checkbox checked={selected} onChange={event => onSelect?.(event.target.checked)} style={{ marginTop: 5 }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: type.bg, color: type.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {type.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <Tooltip title={resource.name}>
                  <span style={{ fontSize: 15, fontWeight: 650, color: 'rgba(0,0,0,0.88)', lineHeight: '22px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{resource.name}</span>
                </Tooltip>
                {resource.isPinned && <Tag icon={<FireFilled />} color="orange" style={{ margin: 0, fontSize: 11, borderRadius: 4, flexShrink: 0 }}>置顶</Tag>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text type="secondary" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.resourceKey || resource.id}</Text>
                <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}><CloudDownloadOutlined style={{ fontSize: 10 }} /> {resource.heat}</Text>
              </div>
            </div>
          </div>
          {mode === 'manage' && (
            <Tag color={publishColor[resource.publishStatus]} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>
              {publishLabel[resource.publishStatus]}
            </Tag>
          )}
          {mode === 'mine' && invalid && (
            <Tooltip title={invalid === 'deleted' ? '管理员已删除该资源' : invalid === 'expired' ? '资源授权已到期' : '管理员已收回资源授权'}>
              <Tag color="error" style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>失效</Tag>
            </Tooltip>
          )}
          {mode === 'mine' && !invalid && installStatus && <Tag color={installConfig[installStatus].color} style={{ borderRadius: 4, margin: 0, fontSize: 11, flexShrink: 0 }}>{installConfig[installStatus].label}</Tag>}
        </div>
      </div>

      {/* 标签行：类型 + 子类型 + 公开策略 */}
      <Space size={4} wrap>
        <Tag className="resource-tag-primary" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{type.label}</Tag>
        {subtitle && <Tag className="resource-tag-neutral" style={{ borderRadius: 4, margin: 0, fontSize: 11 }}>{subtitle}</Tag>}
        {mode === 'manage' && (
          <Tag
            color={strategyConfig[resource.publicStrategy].color}
            style={{ borderRadius: 4, margin: 0, fontSize: 11, cursor: onStrategyClick ? 'pointer' : 'default' }}
            onClick={(e) => { e.stopPropagation(); onStrategyClick?.(); }}
          >{strategyConfig[resource.publicStrategy].label}</Tag>
        )}
      </Space>

      {/* 描述 */}
      <div style={{ fontSize: 13, lineHeight: '20px', height: 40, color: '#5f6b7a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {resource.description}
      </div>

      {/* 底部：创建人 · 日期 + 操作 */}
      <div className="resource-card-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>{resource.owner} · {resource.updateTime}</Text>
        {invalid ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button danger size="small" onClick={onRemove}>删除</Button>
          </div>
        ) : footer ?? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {mode === 'mine' && (
              <Button type={installStatus === 'failed' ? 'default' : 'primary'} danger={installStatus === 'failed'} loading={installStatus === 'installing'} onClick={onInstall}>
                {installStatus === 'installed' ? '更新安装' : installStatus === 'failed' ? '重新安装' : installStatus === 'installing' ? '安装中' : '安装资源'}
              </Button>
            )}
            {onDetail && <Button type="link" size="small" onClick={onDetail} style={{ padding: 0 }}>查看详情</Button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
