import React from 'react';
import { Button, Result } from 'antd';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Page render failed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="error"
          title="页面渲染异常"
          subTitle={this.state.error.message || '当前页面加载时出现错误，请返回工作台或刷新重试。'}
          extra={[
            <Button key="home" type="primary" onClick={() => window.location.assign('/dev/workbench')}>
              返回工作台
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
