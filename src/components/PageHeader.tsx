import React from 'react';
import { Breadcrumb, Popover } from 'antd';
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  hint?: string;
  extra?: React.ReactNode;
  /**
   * 二级页面才传 parentPath——面包屑展示为 "← 父页面名 / 当前页面名"
   * 不传则为一级页面，仅展示标题
   */
  parentPath?: string;
  /** 点击返回的回调（二级页面必传） */
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, hint, extra, parentPath, onBack }) => {
  return (
    <div
      style={{
        padding: '12px 0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {parentPath ? (
          /* 二级页面：面包屑 + 返回 */
          <Breadcrumb
            items={[
              {
                title: (
                  <a onClick={onBack} style={{ cursor: 'pointer' }}>
                    <ArrowLeftOutlined style={{ marginRight: 4 }} />
                    {parentPath}
                  </a>
                ),
              },
              { title },
            ]}
          />
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: parentPath ? 6 : 0,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'rgba(0,0,0,0.88)',
            }}
          >
            {title}
          </span>
          {hint && (
            <Popover content={hint} title="功能说明" trigger="hover" placement="right">
              <QuestionCircleOutlined
                style={{ fontSize: 15, color: 'rgba(0,0,0,0.25)', cursor: 'pointer' }}
              />
            </Popover>
          )}
        </div>
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};

export default PageHeader;
