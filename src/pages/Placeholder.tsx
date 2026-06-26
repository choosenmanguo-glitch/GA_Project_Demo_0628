import React from 'react';
import { Result } from 'antd';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <Result
      status="info"
      title={title}
      subTitle={description || '该模块正在开发中，敬请期待。'}
      style={{ paddingTop: 80 }}
    />
  );
};

export default PlaceholderPage;
