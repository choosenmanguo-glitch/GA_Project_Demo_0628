import React from 'react';
import { Alert, Button, Card, Descriptions, Drawer, Space, Tag } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import type { ResourceAccessView, ResourceItem } from '../types';
import { strategyConfig, typeConfig } from '../ui';

interface ResourceDetailDrawerProps {
  open: boolean;
  resource: ResourceItem | null;
  access: ResourceAccessView | null;
  spaceName: string;
  onClose: () => void;
  onAcquire: () => void;
  onApply: () => void;
}

const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({ open, resource, access, spaceName, onClose, onAcquire, onApply }) => {
  if (!resource || !access) return null;
  const type = typeConfig[resource.type];
  const callUrl = `http://10.193.0.41:8080${resource.gatewayPath || '/gateway/placeholder'}${resource.type === 'model' ? `/v1${resource.path || '/chat/completions'}` : ''}`;

  return (
    <Drawer title="资源详情" open={open} onClose={onClose} size="large" styles={{ body: { background: '#f5f7fa' } }}>
      <Card styles={{ body: { padding: 20 } }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: type.bg, color: type.color, display: 'grid', placeItems: 'center', fontSize: 26 }}>{type.icon}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 650 }}>{resource.name}</div>
            <Space size={4} style={{ marginTop: 6 }}>
              <Tag color={type.color}>{type.label}</Tag>
              <Tag color={strategyConfig[resource.publicStrategy].color}>{strategyConfig[resource.publicStrategy].label}</Tag>
            </Space>
          </div>
        </div>
        <Descriptions column={2} size="small" items={[
          { key: 'owner', label: '所有权人', children: resource.owner },
          { key: 'date', label: '更新时间', children: resource.updateTime },
          { key: 'key', label: '资源 Key', children: resource.resourceKey || '—' },
          { key: 'deploy', label: '部署方式', children: resource.deployment || '—' },
          { key: 'desc', label: '资源描述', span: 2, children: resource.description },
        ]} />
      </Card>

      <Card title="使用权授权状态" style={{ marginBottom: 16 }}>
        {access.status === 'authorized' && access.isAcquired && (
          <Alert type="success" showIcon title="已获取资源" description={<div>当前空间“{spaceName}”已获取该资源。<br />调用地址：{callUrl}<br />API Key：请前往空间管理查看。</div>} />
        )}
        {access.status === 'authorized' && !access.isAcquired && (
          <Alert type="info" showIcon title="未获取" description={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}><span>该资源对当前空间开放，获取后会进入“我的资源”。</span><Button type="primary" icon={<SafetyCertificateOutlined />} onClick={onAcquire}>获取资源</Button></div>} />
        )}
        {access.status === 'view_only' && (
          <Alert type="warning" showIcon title="未授权" description={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}><span>当前空间仅可查看资源信息，需要提交使用申请。</span><Button type="primary" icon={<SafetyCertificateOutlined />} onClick={onApply}>申请使用</Button></div>} />
        )}
        {access.status === 'reviewing' && <Alert type="warning" showIcon title="审批中" description="申请已提交，审批完成前无需重复申请。" />}
        {access.status === 'revoked' && <Alert type="error" showIcon title="资源不可获取" description="该资源已撤销、过期或被删除。" />}
      </Card>

      <Card title="资源介绍">
        <div className="resource-markdown"><ReactMarkdown>{resource.markdownIntro || resource.description}</ReactMarkdown></div>
      </Card>
    </Drawer>
  );
};

export default ResourceDetailDrawer;

