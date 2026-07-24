import React from 'react';
import { Button, Card, Checkbox, Space, Tag, Tooltip } from 'antd';
import {
  CalendarOutlined, CloudDownloadOutlined, FireFilled, UserOutlined,
} from '@ant-design/icons';
import type { ResourceAccessView, ResourceItem } from '../types';
import { installConfig, statusConfig, strategyConfig, typeConfig } from '../ui';

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
  footer?: React.ReactNode;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource, access, mode, selectable, selected, onSelect, onDetail, onInstall, onRemove, footer,
}) => {
  const type = typeConfig[resource.type];
  const invalid = access?.invalidReason;
  const installStatus = access?.grant?.installStatus;
  const subtitle = resource.modelType || resource.knowledgeType || resource.deployment;

  return (
    <Card
      hoverable
      styles={{ body: { padding: 18, height: '100%', display: 'flex', flexDirection: 'column' } }}
      style={{ height: '100%', borderColor: selected ? '#1677ff' : '#e8ebf0', borderRadius: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {selectable && (
          <Checkbox checked={selected} onChange={event => onSelect?.(event.target.checked)} style={{ marginTop: 7 }} />
        )}
        <div style={{ width: 44, height: 44, borderRadius: 8, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0 }}>
          {type.icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Tooltip title={resource.name}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1f2329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.name}</span>
            </Tooltip>
            {resource.isPinned && <Tag icon={<FireFilled />} color="orange" style={{ margin: 0 }}>置顶</Tag>}
          </div>
          <Space size={4} wrap style={{ marginTop: 5 }}>
            <Tag variant="filled" style={{ color: type.color, background: type.bg, margin: 0 }}>{type.label}</Tag>
            {subtitle && <Tag variant="filled" style={{ margin: 0 }}>{subtitle}</Tag>}
            {mode === 'manage' && <Tag color={strategyConfig[resource.publicStrategy].color}>{strategyConfig[resource.publicStrategy].label}</Tag>}
            {mode === 'mine' && installStatus && <Tag color={installConfig[installStatus].color}>{installConfig[installStatus].label}</Tag>}
            {mode === 'square' && access && <Tag color={statusConfig[access.status].color}>{access.isAcquired ? '已获取' : statusConfig[access.status].label}</Tag>}
          </Space>
        </div>
      </div>

      <div style={{ color: '#5f6b7a', lineHeight: 1.7, margin: '14px 0', minHeight: 44, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {resource.description}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #f0f2f5', paddingTop: 12 }}>
        <div style={{ display: 'flex', color: '#8c95a5', fontSize: 12, gap: 14, marginBottom: 12 }}>
          <span><UserOutlined /> {resource.owner}</span>
          <span><CalendarOutlined /> {resource.updateTime}</span>
          <span style={{ marginLeft: 'auto' }}><CloudDownloadOutlined /> {resource.heat}</span>
        </div>
        {invalid ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tag color="error">{invalid === 'deleted' ? '资源已删除' : invalid === 'expired' ? '授权已过期' : '授权已收回'}</Tag>
            <Button danger size="small" onClick={onRemove}>删除记录</Button>
          </div>
        ) : footer ?? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {mode === 'mine' && (
              <Button type={installStatus === 'failed' ? 'default' : 'primary'} danger={installStatus === 'failed'} loading={installStatus === 'installing'} onClick={onInstall}>
                {installStatus === 'installed' ? '更新安装' : installStatus === 'failed' ? '重新安装' : installStatus === 'installing' ? '安装中' : '安装资源'}
              </Button>
            )}
            {onDetail && <Button type={mode === 'square' ? 'primary' : 'default'} ghost={mode === 'square'} onClick={onDetail}>查看详情</Button>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResourceCard;
