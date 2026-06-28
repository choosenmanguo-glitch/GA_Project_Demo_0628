import React from 'react';
import { Drawer, Tag, Typography, Descriptions } from 'antd';
import {
  ApiOutlined, CodeOutlined, CloudServerOutlined, FolderOpenOutlined,
  FileTextOutlined, ToolOutlined, DatabaseOutlined,
  UserOutlined, CalendarOutlined, EyeOutlined, CloudDownloadOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import type { ResourceItem, ResourceType } from '@/mock/data';

const { Text, Title } = Typography;

interface ResourceDetailDrawerProps {
  open: boolean;
  resource: ResourceItem | null;
  onClose: () => void;
}

const typeConfig: Record<ResourceType, { color: string; bg: string; icon: React.ReactNode }> = {
  '模型':   { color: '#1677ff', bg: '#e6f4ff', icon: <CodeOutlined /> },
  'API':    { color: '#52c41a', bg: '#f6ffed', icon: <ApiOutlined /> },
  '连接器': { color: '#722ed1', bg: '#f9f0ff', icon: <CloudServerOutlined /> },
  '知识库':  { color: '#fa8c16', bg: '#fff7e6', icon: <FolderOpenOutlined /> },
  '提示词':  { color: '#13c2c2', bg: '#e6fffb', icon: <FileTextOutlined /> },
  '插件工具': { color: '#eb2f96', bg: '#fff0f6', icon: <ToolOutlined /> },
  '数据连接': { color: '#2f54eb', bg: '#f0f5ff', icon: <DatabaseOutlined /> },
};

const publicStrategyConfig: Record<string, { color: string; label: string }> = {
  '完全公开': { color: '#52c41a', label: '完全公开' },
  '公开可见授权可用': { color: '#1677ff', label: '公开可见/授权可用' },
  '授权可见': { color: '#722ed1', label: '授权可见' },
};

export const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({ open, resource, onClose }) => {
  if (!resource) return null;

  const tc = typeConfig[resource.type];
  const ps = publicStrategyConfig[resource.publicStrategy];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>资源详情</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>
            {resource.key}
          </span>
        </div>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{ body: { padding: '20px 24px', background: '#f5f6f8' } }}
    >
      {/* ── Resource Header Card ── */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '20px 24px',
        marginBottom: 20, border: '1px solid #e8ebf0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: tc.bg, color: tc.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>
            {tc.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1D2129', marginBottom: 6 }}>
              {resource.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag style={{ borderRadius: 4, margin: 0, background: tc.bg, color: tc.color, border: 'none' }}>
                {resource.type}
              </Tag>
              <Tag style={{ borderRadius: 4, margin: 0 }}>{resource.subType}</Tag>
              <Tag style={{ borderRadius: 4, margin: 0, color: '#666' }}>{resource.deployType}</Tag>
            </div>
          </div>
        </div>

        <Descriptions size="small" column={2} style={{ marginBottom: 0 }}
          labelStyle={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, paddingBottom: 8 }}
          contentStyle={{ fontSize: 13, paddingBottom: 8 }}
        >
          <Descriptions.Item label={<><UserOutlined style={{ marginRight: 4 }} />负责人</>}>
            {resource.owner}
          </Descriptions.Item>
          <Descriptions.Item label={<><EyeOutlined style={{ marginRight: 4 }} />公开策略</>}>
            <Tag style={{ borderRadius: 4, margin: 0, color: ps.color, background: ps.color + '15', border: 'none', fontSize: 12 }}>
              {ps.label}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 4 }} />发布日期</>}>
            {resource.publishDate}
          </Descriptions.Item>
          <Descriptions.Item label={<><CloudDownloadOutlined style={{ marginRight: 4 }} />安装数</>}>
            {resource.installCount.toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {resource.tags && resource.tags.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {resource.tags.map(tag => (
              <Tag key={tag} style={{ borderRadius: 4, margin: 0, fontSize: 11, background: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                #{tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* ── Description ── */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px',
        marginBottom: 20, border: '1px solid #e8ebf0',
      }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 8, fontSize: 14 }}>简介</Title>
        <Text style={{ fontSize: 14, color: '#5F6B7A', lineHeight: 1.8 }}>{resource.description}</Text>
      </div>

      {/* ── Detail (Markdown) ── */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '20px 24px',
        border: '1px solid #e8ebf0',
      }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 16, fontSize: 14 }}>详细介绍</Title>
        <div className="resource-markdown">
          <ReactMarkdown>{resource.detail}</ReactMarkdown>
        </div>
      </div>
    </Drawer>
  );
};
