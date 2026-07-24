import React, { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Radio } from 'antd';
import type { ResourceItem } from '../types';

interface ApplyValues {
  duration: 'permanent' | 'custom';
  expireDate?: { format: (value: string) => string };
  reason?: string;
}

interface ResourceApplyModalProps {
  open: boolean;
  resource: ResourceItem | null;
  spaceName: string;
  onCancel: () => void;
  onSubmit: (values: { duration: 'permanent' | 'custom'; expireDate?: string; reason: string }) => void;
}

const ResourceApplyModal: React.FC<ResourceApplyModalProps> = ({ open, resource, spaceName, onCancel, onSubmit }) => {
  const [form] = Form.useForm<ApplyValues>();
  const duration = Form.useWatch('duration', form);

  useEffect(() => {
    if (open) form.setFieldsValue({ duration: 'permanent', reason: '' });
  }, [form, open]);

  return (
    <Modal
      title="资源使用申请"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="提交申请"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={values => onSubmit({
        duration: values.duration,
        expireDate: values.expireDate?.format('YYYY-MM-DD'),
        reason: values.reason?.trim() || '',
      })}>
        <Form.Item label="资源名称"><Input value={resource?.name} disabled /></Form.Item>
        <Form.Item label="申请空间"><Input value={spaceName} disabled /></Form.Item>
        <Form.Item name="duration" label="授权时效" rules={[{ required: true }]}>
          <Radio.Group options={[{ label: '长期有效', value: 'permanent' }, { label: '指定日期', value: 'custom' }]} />
        </Form.Item>
        {duration === 'custom' && (
          <Form.Item name="expireDate" label="授权到期日" rules={[{ required: true, message: '请选择授权到期日' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item name="reason" label="申请理由" rules={[{ max: 100, message: '申请理由最多 100 字' }]}>
          <Input.TextArea rows={4} maxLength={100} showCount placeholder="请说明使用场景" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResourceApplyModal;

