import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';

const { Text } = Typography;

export interface StatCardItem {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

/** 便捷接口：带趋势提示的统计项 */
export interface StatItemSimple {
  label: string;
  value: number | string;
  hint?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

interface StatCardsProps {
  items?: StatCardItem[];
  /** 便捷接口 */
  stats?: StatItemSimple[];
  gutter?: number;
  colSpan?: number;
  style?: React.CSSProperties;
  /** 高亮选中卡片的索引 */
  activeIndex?: number;
}

const StatCards: React.FC<StatCardsProps> = ({ items, stats, gutter = 16, colSpan = 6, style, activeIndex }) => {
  // 便捷模式
  if (stats && !items) {
    return (
      <Row gutter={gutter} style={{ padding: '0 0 12px', ...style }}>
        {stats.map((item, idx) => (
          <Col span={colSpan} key={idx}>
            <Card
              className="stat-card"
              size="small"
              style={{ borderRadius: 8, borderColor: '#f0f0f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: item.color }}>
                    {item.value}
                  </div>
                </div>
              </div>
              {(item.trend || item.hint) && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  {item.hint && <Text type="secondary">{item.hint}</Text>}
                  {item.trend && (
                    <span style={{ color: item.trendUp ? '#52c41a' : '#ff4d4f', marginLeft: 8, fontWeight: 500 }}>
                      {item.trend}
                    </span>
                  )}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const effectiveItems = items || [];
  return (
    <Row gutter={gutter} style={{ padding: '0 0 12px', ...style }}>
      {effectiveItems.map((item, idx) => (
        <Col span={colSpan} key={idx}>
          <Card
            className="stat-card"
            size="small"
            onClick={item.onClick}
            style={{
              borderRadius: 8,
              borderColor: activeIndex === idx ? (item.color || '#1677ff') : '#f0f0f0',
              borderWidth: activeIndex === idx ? 2 : 1,
              cursor: item.onClick ? 'pointer' : 'default',
              boxShadow: activeIndex === idx ? `0 0 0 2px ${item.color || '#1677ff'}20` : 'none',
            }}
          >
            <Statistic
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              prefix={item.prefix}
              valueStyle={{
                color: item.color || 'rgba(0,0,0,0.88)',
                fontSize: 28,
                fontWeight: 600,
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatCards;
