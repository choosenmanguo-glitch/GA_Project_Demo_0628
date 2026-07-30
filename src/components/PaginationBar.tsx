import React from 'react';
import { Pagination } from 'antd';

interface PaginationBarProps {
  current: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: string[];
  showTotal?: (total: number) => string;
  onChange: (page: number, pageSize: number) => void;
}

/** 卡片视图分页选项（4 的倍数） */
const CARD_PAGE_SIZE_OPTIONS = ['8', '12', '16', '20', '24'];

/** 列表/表格视图分页选项 */
const TABLE_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

/** 统一 Table 分页配置（列表/表格模式） */
export function tablePagination() {
  return {
    defaultPageSize: 10,
    showSizeChanger: true,
    showTotal: (t: number) => `共 ${t} 条`,
    pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
  };
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  current,
  pageSize,
  total,
  pageSizeOptions = CARD_PAGE_SIZE_OPTIONS,
  showTotal = (t) => `共 ${t} 条`,
  onChange,
}) => {
  return (
    <div className="resource-page-pagination">
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        showTotal={showTotal}
        pageSizeOptions={pageSizeOptions}
        onChange={onChange}
      />
    </div>
  );
};

export default PaginationBar;
