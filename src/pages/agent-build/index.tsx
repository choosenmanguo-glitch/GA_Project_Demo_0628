import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Space } from 'antd';
import { ThunderboltOutlined, RobotOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';

const { Text, Title } = Typography;

const creationCards = [
  {
    key: 'form',
    title: '表单构建',
    subtitle: '从零搭建',
    description: '选择智能体类型后，进入结构化配置页面，按步骤完成模型、提示词、知识库、工具等组件的装配',
    scene: '熟悉平台、需要精细化控制的开发者',
    icon: <ThunderboltOutlined style={{ fontSize: 40, color: '#1677ff' }} />,
    gradient: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
    borderColor: '#91caff',
    btnStyle: {} as React.CSSProperties,
  },
  {
    key: 'conversation',
    title: '智能构建',
    subtitle: '对话式创建',
    description: '以自然语言描述需求，AI 助手通过多轮对话逐步明确要求，自动生成完整的智能体配置方案',
    scene: '新手用户或希望快速验证想法的场景。对话式创建仅支持自主智能体类型。',
    icon: <RobotOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
    gradient: 'linear-gradient(135deg, #f9f0ff 0%, #f0f5ff 100%)',
    borderColor: '#d3adf7',
    btnStyle: { background: 'linear-gradient(135deg, #722ed1, #b37feb)', borderColor: '#722ed1' } as React.CSSProperties,
  },
  {
    key: 'template',
    title: '模板构建',
    subtitle: '从模板创建',
    description: '浏览智能体模板市场，选择警务场景预置模板一键复制创建，在模板基础上微调配置',
    scene: '快速搭建常见警务业务场景的智能体',
    icon: <FileTextOutlined style={{ fontSize: 40, color: '#13c2c2' }} />,
    gradient: 'linear-gradient(135deg, #e6fffb 0%, #f0f5ff 100%)',
    borderColor: '#87e8de',
    btnStyle: { background: 'linear-gradient(135deg, #13c2c2, #36cfc9)', borderColor: '#13c2c2' } as React.CSSProperties,
  },
];

export default function AgentBuildPage() {
  const nav = useNavigate();

  return (
    <div style={{ flex: 1, padding: '16px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="创建智能体" hint="选择一种创建方式开始搭建你的 AI 智能体" />
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
          {/* 三张选择卡片 */}
          <Row gutter={24} style={{ flex: 1, marginBottom: 32 }}>
            {creationCards.map((card) => (
              <Col span={8} key={card.key}>
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 16,
                  border: `2px solid ${card.borderColor}`, background: card.gradient,
                  padding: '32px 24px 24px', transition: 'transform .2s, box-shadow .2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* 图标区域 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 20,
                      background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}>
                      {card.icon}
                    </div>
                  </div>

                  {/* 标题 */}
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>{card.subtitle}</Text>
                  </div>
                  <Title level={4} style={{ margin: '0 0 12px', fontSize: 20 }}>
                    {card.title}
                  </Title>

                  {/* 描述 */}
                  <Text style={{ fontSize: 14, lineHeight: 1.7, color: '#595959', flex: 1, marginBottom: 16 }}>
                    {card.description}
                  </Text>

                  {/* 适用场景 */}
                  <div style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.7)', marginBottom: 20,
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>适用场景</Text>
                    <Text style={{ fontSize: 13 }}>{card.scene}</Text>
                  </div>

                  {/* 开始按钮 */}
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      height: 44, borderRadius: 10, fontSize: 15, fontWeight: 500,
                      ...card.btnStyle,
                    }}
                    onClick={() => {
                      if (card.key === 'form') {
                        nav('/dev/agent-manage');
                      } else {
                        // 其他方式待实现
                      }
                    }}
                  >
                    开始创建
                  </Button>
                </div>
              </Col>
            ))}
          </Row>

          {/* 底部提示 */}
          <div style={{
            textAlign: 'center', padding: '20px 0 0',
            borderTop: '1px solid #f0f0f0',
          }}>
            <Space size={4}>
              <QuestionCircleOutlined style={{ color: '#bfbfbf', fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 14 }}>
                不确定从哪里开始？试试
              </Text>
              <Button
                type="link"
                size="small"
                style={{ fontSize: 14, fontWeight: 500, padding: 0 }}
                icon={<RobotOutlined />}
              >
                智能构建
              </Button>
              <Text type="secondary" style={{ fontSize: 14 }}>，告诉我你想做什么。</Text>
            </Space>
          </div>
        </div>
    </div>
  );
}
