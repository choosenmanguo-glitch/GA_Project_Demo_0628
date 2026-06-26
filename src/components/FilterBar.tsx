import React from 'react';
import { Input, Select, Button, Space, DatePicker, Radio } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export interface FilterField {
  type: 'search' | 'select' | 'dateRange';
  key: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  width?: number;
}

interface FilterBarProps {
  filters?: FilterField[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onSearch?: () => void;
  onReset?: () => void;
  onCreate?: () => void;
  createText?: string;
  extra?: React.ReactNode;
  /** 便捷模式：单一搜索框 */
  placeholder?: string;
  /** 便捷模式：状态筛选 */
  onStatusFilter?: (val: any) => void;
  statusOptions?: { label: string; value: string }[];
  showStatusFilter?: boolean;
  /** 子元素（备选 extra） */
  children?: React.ReactNode;
  /** 便捷模式：搜索回调 */
  onSubmit?: (keyword: string) => void;
  /** 列表/卡片视图切换 */
  viewMode?: 'table' | 'card';
  onViewModeChange?: (mode: 'table' | 'card') => void;
  style?: React.CSSProperties;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterValues,
  onFilterChange,
  onSearch,
  onReset,
  onCreate,
  createText = '新建',
  extra,
  placeholder,
  onStatusFilter,
  statusOptions,
  showStatusFilter = true,
  children,
  onSubmit,
  viewMode,
  onViewModeChange,
  style,
}) => {
  // 便捷模式：没有传入 filters 时，自动生成简化筛选区
  const effectiveFilters: FilterField[] = filters || [
    { type: 'search', key: 'keyword', placeholder: placeholder || '请输入关键词搜索' },
    ...(statusOptions && showStatusFilter !== false
      ? [{ type: 'select' as const, key: 'status', placeholder: '状态筛选', options: statusOptions }]
      : []),
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
        flexWrap: 'wrap',
        gap: 10,
        ...style,
      }}
    >
      {/* 左侧：筛选区 + 视图切换 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {effectiveFilters.map((f) => {
          if (f.type === 'search') {
            return (
              <Input
                key={f.key}
                placeholder={f.placeholder || '请输入关键词搜索'}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: f.width || 200 }}
                value={filterValues?.[f.key]}
                onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                onPressEnter={() => {
                  if (onSubmit && filterValues?.keyword) onSubmit(filterValues.keyword);
                  onSearch?.();
                }}
              />
            );
          }
          if (f.type === 'select') {
            return (
              <Select
                key={f.key}
                placeholder={f.placeholder || '请选择'}
                allowClear
                style={{ width: f.width || 130 }}
                value={filterValues?.[f.key]}
                onChange={(v) => {
                  onFilterChange?.(f.key, v);
                  onStatusFilter?.(v);
                }}
                options={f.options}
              />
            );
          }
          if (f.type === 'dateRange') {
            return (
              <RangePicker
                key={f.key}
                style={{ width: 240 }}
                value={filterValues?.[f.key]}
                onChange={(dates) => onFilterChange?.(f.key, dates)}
              />
            );
          }
          return null;
        })}
        {(filters || filterValues) && (
          <>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => {
              if (onSubmit && filterValues?.keyword) onSubmit(filterValues.keyword);
              onSearch?.();
            }}>
              搜索
            </Button>
            {onReset && (
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            )}
          </>
        )}
        {viewMode && onViewModeChange && (
          <Radio.Group
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value)}
            size="small"
            optionType="button"
            style={{ marginLeft: 8 }}
          >
            <Radio.Button value="table" style={{ padding: '0 8px', height: 28, lineHeight: '26px' }}><UnorderedListOutlined style={{ fontSize: 13 }} /></Radio.Button>
            <Radio.Button value="card" style={{ padding: '0 8px', height: 28, lineHeight: '26px' }}><AppstoreOutlined style={{ fontSize: 13 }} /></Radio.Button>
          </Radio.Group>
        )}
      </div>

      {/* 右侧：操作按钮区 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {extra}
        {children}
        {onCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            {createText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
