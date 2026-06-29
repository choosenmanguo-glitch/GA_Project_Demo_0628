import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography } from 'antd';

const { Text } = Typography;

type Severity = 'warning' | 'info' | 'danger';

const severityConfig: Record<Severity, { bg: string; border: string; titleLabel: string }> = {
  warning: { bg: '#fffbe6', border: '#ffe58f', titleLabel: '影响说明：' },
  info: { bg: '#f6ffed', border: '#b7eb8f', titleLabel: '影响说明：' },
  danger: { bg: '#fff2f0', border: '#ffccc7', titleLabel: '风险提示：' },
};

export interface ConfirmActionModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** 弹窗标题（不含 emoji 前缀） */
  title: string;
  /** 操作对象名称 */
  targetName: string;
  /** 严重程度：warning / info / danger */
  severity: Severity;
  /** 说明列表（每条一行） */
  description: string[];
  /** 是否需要输入目标名称确认 */
  requireNameInput?: boolean;
  /** 确认按钮文案 */
  okText?: string;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
  targetName,
  severity,
  description,
  requireNameInput = false,
  okText = '确认',
}) => {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => { setInputValue(''); }, [open]);

  const style = severityConfig[severity];
  const danger = severity === 'danger';
  const confirmDisabled = requireNameInput && inputValue !== targetName;

  return (
    <Modal
      title={danger ? `⚠️ ${title}` : title}
      open={open}
      onCancel={() => { onCancel(); setInputValue(''); }}
      onOk={onConfirm}
      okText={okText}
      cancelText="取消"
      okButtonProps={{ danger, disabled: confirmDisabled }}
      destroyOnClose
    >
      <p style={{ marginBottom: 12, fontWeight: 500, fontSize: 14 }}>
        即将{title}「{targetName}」
      </p>
      <div style={{
        background: style.bg, padding: '12px 16px', borderRadius: 6,
        border: `1px solid ${style.border}`, marginBottom: 8, fontSize: 13, lineHeight: 1.8,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4, color: danger ? '#cf1322' : undefined }}>
          {style.titleLabel}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {description.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      {requireNameInput && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
            请输入名称「<b>{targetName}</b>」以确认：
          </Text>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={targetName}
            style={{ borderRadius: 6 }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ConfirmActionModal;
