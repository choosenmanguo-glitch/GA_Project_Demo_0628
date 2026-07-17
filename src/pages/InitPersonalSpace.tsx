import React, { useState } from 'react';
import { Button, Typography, Progress, Card, message } from 'antd';
import {
  RocketOutlined, SafetyOutlined, TeamOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const { Title, Text } = Typography;

const INIT_KEY = 'personal_space_initialized';

export default function InitPersonalSpacePage() {
  const navigate = useNavigate();
  const { switchSpace } = useWorkspace();
  const [initializing, setInitializing] = useState(false);
  const [reInitializing, setReInitializing] = useState(false);
  const [reInitPercent, setReInitPercent] = useState(0);
  const alreadyInitialized = localStorage.getItem(INIT_KEY) !== null;

  const handleInit = () => {
    setInitializing(true);
    // 模拟初始化个人空间（demo 中 mock 数据已有个人空间 id='0'，直接关联即可）
    setTimeout(() => {
      // 切换到个人空间
      switchSpace('0');
      // 标记已初始化
      localStorage.setItem(INIT_KEY, 'true');
      message.success('个人空间已就绪，欢迎使用！');
      setInitializing(false);
      // 跳转到工作台
      navigate('/dev/workbench', { replace: true });
    }, 1200);
  };

  const handleReInit = () => {
    setReInitializing(true);
    const duration = 2000;
    const interval = 50;
    const step = 100 / (duration / interval);
    const timer = setInterval(() => {
      setReInitPercent(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            switchSpace('0');
            navigate('/dev/workbench', { replace: true });
          }, 200);
          return 100;
        }
        return next;
      });
    }, interval);
  };

  const featureCards = [
    {
      icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
      title: '独立工作区',
      desc: '专属于您的个人空间，管理智能体、知识库等资源',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      title: '灵活协作',
      desc: '随时加入或申请工作空间和专案空间，与团队高效协同',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
      title: '数据隔离',
      desc: '个人空间数据完全私有，仅您本人可访问和操作',
    },
  ];

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 30%, #f5f0ff 70%, #fff0f0 100%)',
      padding: 40,
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo / 图标 */}
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 8px 24px rgba(22, 119, 255, 0.25)',
        }}>
          <RocketOutlined style={{ fontSize: 40, color: '#fff' }} />
        </div>

        <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
          欢迎来到 GA 智能警务平台
        </Title>
        <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 32 }}>
          AI 驱动的新一代警务智能协作平台
        </Text>

        {/* 功能卡片 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {featureCards.map(card => (
            <Card
              key={card.title}
              size="small"
              style={{
                flex: 1, textAlign: 'center', borderRadius: 10,
                border: '1px solid #f0f0f0', cursor: 'default',
              }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{card.title}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{card.desc}</Text>
            </Card>
          ))}
        </div>

        {/* 说明文字 */}
        <Card
          style={{
            textAlign: 'left', borderRadius: 10, marginBottom: 28,
            background: '#f5f8ff', border: '1px solid #d6e4ff',
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <Text style={{ fontSize: 13, lineHeight: '22px', color: '#555' }}>
            在开始使用之前，系统将为您创建一个<b>专属的个人工作空间</b>。
            个人空间是您在平台上的独立工作区，您可以在这里构建和管理智能体、知识库、提示词等 AI 资源。
            <br /><br />
            创建完成后，您也可以随时加入其他工作空间或专案空间，与团队成员高效协作。
          </Text>
        </Card>

        {alreadyInitialized ? (
          reInitializing ? (
            <div style={{ width: '100%' }}>
              <Progress
                percent={Math.round(reInitPercent)}
                status="active"
                strokeColor={{ from: '#1677ff', to: '#69b1ff' }}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                正在初始化个人空间...
              </Text>
            </div>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              icon={<RocketOutlined />}
              onClick={handleReInit}
              style={{
                height: 52, borderRadius: 12, fontSize: 17, fontWeight: 600,
                background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(22, 119, 255, 0.3)',
              }}
            >
              初始化个人空间
            </Button>
          )
        ) : (
          <Button
            type="primary"
            size="large"
            block
            loading={initializing}
            icon={initializing ? undefined : <RocketOutlined />}
            onClick={handleInit}
            style={{
              height: 52, borderRadius: 12, fontSize: 17, fontWeight: 600,
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(22, 119, 255, 0.3)',
            }}
          >
            {initializing ? '正在初始化个人空间...' : '初始化我的工作空间'}
          </Button>
        )}
      </div>
    </div>
  );
}
