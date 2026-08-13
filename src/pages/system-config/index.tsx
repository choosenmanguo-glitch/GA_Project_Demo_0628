import React, { useState, useEffect } from 'react';
import { Table, Drawer, Form, Switch, InputNumber, Button, message, Typography, Divider } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

// ── 智能体对话限制配置 ──
export interface ChatLimitConfig {
  enabled: boolean;
  dailyLimit: number;
}

const CHAT_LIMIT_STORAGE_KEY = 'system_config_chat_limit';

const chatLimitDefault: ChatLimitConfig = {
  enabled: true,
  dailyLimit: 10,
};

export function getChatLimitConfig(): ChatLimitConfig {
  try {
    const raw = localStorage.getItem(CHAT_LIMIT_STORAGE_KEY);
    if (raw) return { ...chatLimitDefault, ...JSON.parse(raw) };
  } catch {}
  return chatLimitDefault;
}

// ── 配置项定义 ──
interface ConfigItem {
  key: string;
  name: string;
  description: string;
}

const configItems: ConfigItem[] = [
  {
    key: 'chat_limit',
    name: '智能体对话限制',
    description: '控制开发中心智能体对话的每日使用次数上限，超出后发送按钮禁用并显示提示。',
  },
];

const columns: ColumnsType<ConfigItem> = [
  {
    title: '配置项名称',
    dataIndex: 'name',
    width: 240,
    render: (name: string) => (
      <span style={{ fontWeight: 500 }}>
        <SettingOutlined style={{ marginRight: 8, color: '#1677ff' }} />
        {name}
      </span>
    ),
  },
  {
    title: '说明',
    dataIndex: 'description',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: () => (
      <Button type="link" size="small">配置</Button>
    ),
  },
];

// ── 对话限制配置抽屉内容 ──
const ChatLimitDrawer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue(getChatLimitConfig());
  }, [form]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const values: ChatLimitConfig = await form.validateFields();
      localStorage.setItem(CHAT_LIMIT_STORAGE_KEY, JSON.stringify(values));
      message.success('保存成功');
      onClose();
    } catch {
      // validation failed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
        <Form form={form} layout="vertical" initialValues={chatLimitDefault}>
          <Form.Item
            name="enabled"
            label="启用每日使用次数限制"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Text type="secondary" style={{ display: 'block', marginTop: -8, marginBottom: 16 }}>
            开启后，开发中心智能体对话将受每日次数限制；关闭后不限制。
          </Text>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.enabled !== cur.enabled}
          >
            {({ getFieldValue }) => {
              const enabled = getFieldValue('enabled');
              return (
                <Form.Item
                  name="dailyLimit"
                  label="每日使用上限（次）"
                  rules={[{ required: true, message: '请输入每日上限' }]}
                  style={{ opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? 'auto' : 'none' }}
                >
                  <InputNumber min={1} max={100} style={{ width: 200 }} disabled={!enabled} />
                </Form.Item>
              );
            }}
          </Form.Item>

          {form.getFieldValue('enabled') && (
            <Text type="secondary" style={{ display: 'block', marginTop: -8 }}>
              超出上限后发送按钮禁用，鼠标悬停显示「今日使用次数已用完」提示。
            </Text>
          )}
        </Form>
      </div>
      <Divider style={{ margin: '0 0 16px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
          保存
        </Button>
      </div>
    </div>
  );
};

// ── 配置抽屉路由 ──
const renderDrawerContent = (key: string, onClose: () => void) => {
  switch (key) {
    case 'chat_limit':
      return <ChatLimitDrawer onClose={onClose} />;
    default:
      return <Text type="secondary">未知配置项</Text>;
  }
};

// ── 页面组件 ──
const SystemConfigPage: React.FC = () => {
  const [drawerKey, setDrawerKey] = useState<string | null>(null);

  const currentItem = configItems.find((item) => item.key === drawerKey);

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="系统配置"
        hint="配置平台级别的系统参数与控制开关"
      />
      <div style={{ flex: 1, overflow: 'auto', background: '#fff', borderRadius: 8, padding: '0 24px 16px' }}>
        <Table
          columns={columns}
          dataSource={configItems}
          rowKey="key"
          pagination={false}
          onRow={(record) => ({
            onClick: () => setDrawerKey(record.key),
            style: { cursor: 'pointer' },
          })}
          style={{ marginTop: 12 }}
        />
      </div>

      <Drawer
        title={currentItem ? `配置 - ${currentItem.name}` : ''}
        open={!!drawerKey}
        onClose={() => setDrawerKey(null)}
        width={520}
        placement="right"
        destroyOnClose
        footer={null}
      >
        {drawerKey && renderDrawerContent(drawerKey, () => setDrawerKey(null))}
      </Drawer>
    </div>
  );
};

export default SystemConfigPage;
