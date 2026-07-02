import React from 'react';
import { Drawer, Steps, Button } from 'antd';

export interface StepDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  size?: number;
  destroyOnClose?: boolean;
  /** Steps 配置 */
  steps: { title: string }[];
  /** 当前步骤索引（0-based） */
  current: number;
  /** 步骤总数 */
  totalSteps: number;
  /** 最后一步确认回调 */
  onFinish: () => void;
  /** 步骤切换后回调 */
  onCurrentChange: (step: number) => void;
  /** 渲染当前步骤内容 */
  children: React.ReactNode;
}

const StepDrawer: React.FC<StepDrawerProps> = ({
  title,
  open,
  onClose,
  size = 640,
  destroyOnClose = true,
  steps,
  current,
  totalSteps,
  onFinish,
  onCurrentChange,
  children,
}) => {
  const isLastStep = current >= totalSteps - 1;

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={size}
      destroyOnClose={destroyOnClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          {current > 0 && (
            <Button onClick={() => onCurrentChange(current - 1)}>上一步</Button>
          )}
          {isLastStep ? (
            <Button type="primary" onClick={onFinish}>确认创建</Button>
          ) : (
            <Button type="primary" onClick={() => onCurrentChange(current + 1)}>下一步</Button>
          )}
        </div>
      }
    >
      <div style={{ padding: '8px 0' }}>
        <Steps current={current} size="small" style={{ marginBottom: 24 }} items={steps} />
        {children}
      </div>
    </Drawer>
  );
};

export default StepDrawer;
