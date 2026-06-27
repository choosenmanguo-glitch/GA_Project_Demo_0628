import React from 'react';
import { Drawer, Tag, Typography, Button, Empty } from 'antd';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import type { SessionLog, SessionMessage } from '@/mock/data';

const { Text, Paragraph } = Typography;

interface SessionDetailDrawerProps {
  open: boolean;
  session: SessionLog | null;
  onClose: () => void;
}

const channelColorMap: Record<string, string> = { 'Web端': 'blue', 'API': 'purple', '企业微信': 'green', '第三方': 'orange' };

export const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({ open, session, onClose }) => {
  if (!session) return null;

  const hasMessages = session.messages && session.messages.length > 0;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>对话详情</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>
            {session.id}
          </span>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button size="small" icon={<DownloadOutlined />}>导出PDF</Button>
      }
      styles={{ body: { padding: '20px 24px', background: '#f5f6f8' } }}
    >
      {/* ── Session Info Card ── */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px',
        marginBottom: 20, border: '1px solid #e8ebf0',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <UserOutlined style={{ color: '#1677ff' }} />
          <Text strong style={{ fontSize: 14 }}>{session.userName}</Text>
          <Tag color={channelColorMap[session.channel] || 'default'}>{session.channel}</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>{session.spaceName}</Text>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>消息数: <Text strong style={{ fontSize: 12 }}>{session.messageCount}</Text></Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Token: <Text strong style={{ fontSize: 12 }}>{session.tokenConsumption.toLocaleString()}</Text></Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{session.startTime} → {session.lastActive}</Text>
        </div>
      </div>

      {/* ── Messages Timeline ── */}
      {hasMessages ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {session.messages!.map((msg: SessionMessage) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '82%' }}>
                {/* Role + time row */}
                <div style={{
                  marginBottom: 6,
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8, alignItems: 'center',
                }}>
                  <Tag style={{
                    borderRadius: 4, margin: 0, fontSize: 11,
                    background: msg.role === 'user' ? '#e6f4ff' : '#f6ffed',
                    color: msg.role === 'user' ? '#1677ff' : '#52c41a',
                    border: 'none', fontWeight: 600,
                  }}>
                    {msg.role === 'user' ? '用户' : '智能体'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>{msg.time}</Text>
                  {msg.role === 'assistant' && msg.latency !== undefined && (
                    <Text type="secondary" style={{ fontSize: 11 }}>延迟 {msg.latency}ms</Text>
                  )}
                  {msg.hasError && (
                    <Tag color="red" style={{ borderRadius: 4, margin: 0, fontSize: 10, lineHeight: '16px' }}>出错</Tag>
                  )}
                </div>

                {/* Bubble */}
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: msg.role === 'user' ? '#1677ff' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'user' ? 12 : 4,
                  boxShadow: msg.role === 'user'
                    ? '0 1px 4px rgba(22,119,255,0.25)'
                    : '0 1px 2px rgba(0,0,0,0.04)',
                  border: msg.role === 'user' ? 'none' : '1px solid #e8ebf0',
                }}>
                  <Paragraph style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                    {msg.content}
                  </Paragraph>
                </div>

                {/* Model meta for assistant */}
                {msg.role === 'assistant' && msg.tokens && msg.model && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 14 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>模型: {msg.model}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Token: <span style={{ color: '#1677ff', fontWeight: 500 }}>{msg.tokens.input.toLocaleString()}</span> in
                      + <span style={{ color: '#52c41a', fontWeight: 500 }}>{msg.tokens.output.toLocaleString()}</span> out
                    </Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 10, padding: '48px 0',
          textAlign: 'center',
        }}>
          <Empty description="暂无该会话的完整对话记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </Drawer>
  );
};
