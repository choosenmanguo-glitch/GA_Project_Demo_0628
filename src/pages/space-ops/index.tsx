import React, { useState } from 'react';
import {
  Tabs, Tag, Button, Space, Typography, message,
} from 'antd';
import {
  TeamOutlined, HistoryOutlined,
  InfoCircleOutlined, SafetyOutlined,
  KeyOutlined, CopyOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import {
  type SpaceItem,
} from '@/mock/data';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSpaceDetailTabs } from '@/components/SpaceDetailTabs';

const { Text, Title } = Typography;

export default function SpaceManagePage() {
  const { currentSpace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('info');

  // ── 复用空间详情 Tab ──
  const { infoContent, membersContent, logsContent } = useSpaceDetailTabs(currentSpace, true, false);

  const tabItems = [
    { key: 'info', label: <Space><InfoCircleOutlined />基本信息</Space>, children: infoContent },
    { key: 'members', label: <Space><TeamOutlined />成员管理</Space>, children: membersContent },
    { key: 'logs', label: <Space><HistoryOutlined />操作日志</Space>, children: logsContent },
    // ═══════ Tab 4: 空间 API Key ═══════
    {
      key: 'api-key',
      label: <Space><KeyOutlined />空间 API Key</Space>,
      children: (
        <div style={{ maxWidth: 740 }}>
          {/* 安全提示 */}
          <div style={{
            padding: '16px 20px', borderRadius: 10, marginBottom: 24,
            background: '#fffbe6', border: '1px solid #ffe58f',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <SafetyOutlined style={{ color: '#d48806', fontSize: 16 }} />
              <span style={{ fontWeight: 600, color: '#d48806', fontSize: 14 }}>安全提示</span>
            </div>
            <div style={{ fontSize: 13, color: '#8c6d00', lineHeight: '22px' }}>
              API Key 是您访问组织内已授权资源的唯一鉴权凭证。请妥善保管，切勿在前端代码或公开代码库中泄露该凭证。
            </div>
          </div>

          {/* API Key 展示 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#1D2129' }}>您的 API Key：</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', borderRadius: 8,
              background: '#f5f8ff', border: '1px solid #d6e4ff',
            }}>
              <span style={{
                fontSize: 15, fontWeight: 500, color: '#1677ff',
                fontFamily: 'monospace', letterSpacing: 1,
              }}>
                {'••••••••••••••••••••••••••••••••'}
              </span>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText('sk-plaza-v3-8f7d2a1c4e6b9f3d5a7c8b2e4a6d9f1c');
                  message.success('API Key 已复制到剪贴板');
                }}
              >
                复制
              </Button>
            </div>
          </div>

          {/* 接口调用示例 */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#1D2129' }}>接口调用示例 (cURL)：</div>
            <div style={{
              padding: '18px 20px', borderRadius: 8,
              background: '#1D2129', border: '1px solid #333',
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontSize: 13, color: '#e6e8ec', lineHeight: '22px',
              overflow: 'auto',
            }}>
              <div style={{ color: '#7a8599', marginBottom: 4 }}>
                # 使用您的 API Key 作为 Bearer Token 查询已授权的模型、API 或知识库资源
              </div>
              <div>
                <span style={{ color: '#69b1ff' }}>curl</span>
                <span style={{ color: '#e6e8ec' }}> -X POST </span>
                <span style={{ color: '#a0d911' }}>"https://api.org-plaza.internal/v3/gateway/call"</span>
                <span style={{ color: '#e6e8ec' }}> \</span>
              </div>
              <div>
                <span style={{ color: '#e6e8ec' }}>  -H </span>
                <span style={{ color: '#a0d911' }}>"Authorization: Bearer sk-plaza-v3-••••••••••••••••"</span>
                <span style={{ color: '#e6e8ec' }}> \</span>
              </div>
              <div>
                <span style={{ color: '#e6e8ec' }}>  -H </span>
                <span style={{ color: '#a0d911' }}>"Content-Type: application/json"</span>
                <span style={{ color: '#e6e8ec' }}> \</span>
              </div>
              <div>
                <span style={{ color: '#e6e8ec' }}>  -d </span>
                <span style={{ color: '#a0d911' }}>{`'{"resourceKey": "deepseek-r1-service", "prompt": "您好！"}'`}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

  ];

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .space-ops-tabs {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .space-ops-tabs > .ant-tabs-content-holder {
          flex: 1;
          overflow: hidden;
        }
        .space-ops-tabs > .ant-tabs-content-holder > .ant-tabs-content {
          height: 100%;
        }
        .space-ops-tabs .ant-tabs-tabpane-active {
          height: 100%;
          overflow: auto;
        }
      `}</style>
      <PageHeader
        title="空间管理"
        hint="管理当前空间的基本信息、成员与操作日志"
      />

      {/* 当前空间名称 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', borderRadius: 10,
        background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
        border: '1px solid #d6e4ff',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0,
        }}>
          {currentSpace.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{currentSpace.name}</span>
            <Tag color={currentSpace.type === '个人空间' ? 'blue' : 'green'} style={{ borderRadius: 4 }}>{currentSpace.type}</Tag>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
            <span>创建时间：{currentSpace.createTime}</span>
            <span>所有者：{currentSpace.creator}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <Tabs
          className="space-ops-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ padding: '0 24px', borderBottom: '1px solid #f0f0f0', marginBottom: 0 }}
          items={tabItems.map(item => ({
            key: item.key,
            label: <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>,
            children: <div style={{ padding: '16px 24px' }}>{item.children}</div>,
          }))}
        />
      </div>
    </div>
  );
}
