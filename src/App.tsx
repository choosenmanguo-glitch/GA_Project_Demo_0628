import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MasterLayout from './layouts/AppLayout';
import StandaloneLayout from './layouts/StandaloneLayout';
import { TabsProvider } from './contexts/TabsContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ResourceCenterProvider } from './features/resource-center/ResourceCenterContext';
import InitPersonalSpacePage from './pages/InitPersonalSpace';
import ModelsPage from './pages/models';
import PromptsPage from './pages/prompts';
import ToolsPage from './pages/tools';
import ConnectorsPage from './pages/connectors';
import DataSourcesPage from './pages/datasources';
import WorkbenchPage from './pages/workbench';
import AgentBuildPage from './pages/agent-build';
import AgentManagePage from './pages/agent-manage';
import SpaceManagePage from './pages/space-ops';
import SpaceStatsPage from './pages/space-stats';
import OpsSpacesPage from './pages/ops-spaces';
import OpsMonitorPage from './pages/ops-monitor';
import OpsInsightPage from './pages/ops-insight';
import OpsAlertPage from './pages/ops-alert';
import OpsSessionsPage from './pages/ops-sessions';
import AgentEvalPage from './pages/agent-eval';
import AgentTemplateMarket from './pages/agent-template';
import AgentConfigPage from './pages/agent-config';
import PlaceholderPage from './pages/Placeholder';
import KnowledgeBasePage from './pages/knowledge';
import SkillsPage from './pages/skills';
import FileStorePage from './pages/filestore';
import FileStoreDetailPage from './pages/filestore-detail';
import SystemConfigPage from './pages/system-config';

const ResourceSquarePage = lazy(() => import('./pages/resource-square'));
const MyResourcesPage = lazy(() => import('./pages/my-resources'));
const ResourceManagePage = lazy(() => import('./pages/resource-manage'));
const ResourcePermissionsPage = lazy(() => import('./pages/resource-permissions'));

function ResourceRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div style={{ padding: 32, color: '#7a8494' }}>资源中心加载中...</div>}>{children}</Suspense>;
}

/** 开发中心守卫：未初始化个人空间时重定向到 /dev/init */
function DevGuard({ children }: { children: React.ReactNode }) {
  const initialized = localStorage.getItem('personal_space_initialized');
  if (!initialized) {
    return <Navigate to="/dev/init" replace />;
  }
  return <>{children}</>;
}

/** 通过 MasterLayout 包装的路由 */
function AppRoutes() {
  return (
    <WorkspaceProvider>
    <ResourceCenterProvider>
    <TabsProvider>
    <Routes>
      {/* ===== 独立页面路由（无侧栏、无页签、无菜单选中） ===== */}
      <Route path="/standalone/resource-square" element={
        <StandaloneLayout>
          <Suspense fallback={<div style={{ padding: 32, color: '#7a8494' }}>资源中心加载中...</div>}>
            <ResourceSquarePage />
          </Suspense>
        </StandaloneLayout>
      } />
      <Route path="/standalone/my-resources" element={
        <StandaloneLayout>
          <Suspense fallback={<div style={{ padding: 32, color: '#7a8494' }}>资源中心加载中...</div>}>
            <MyResourcesPage />
          </Suspense>
        </StandaloneLayout>
      } />

      {/* ===== 主布局路由 ===== */}
      <Route path="*" element={
        <MasterLayout>
          <Routes>
            {/* 默认重定向到开发中心工作台 */}
            <Route path="/" element={<Navigate to="/dev/workbench" replace />} />
            <Route path="/home" element={<Navigate to="/dev/workbench" replace />} />

            {/* 首页 / 应用中心 - 占位 */}
            <Route path="/app-center" element={<PlaceholderPage title="应用中心" description="应用市场与已安装应用管理" />} />

            {/* ===== 开发中心 ===== */}
            <Route path="/dev" element={<Navigate to="/dev/workbench" replace />} />
            {/* 个人空间初始化页（未初始化时 DevGuard 重定向到此，无守卫） */}
            <Route path="/dev/init" element={<InitPersonalSpacePage />} />
            <Route path="/dev/workbench" element={<DevGuard><WorkbenchPage /></DevGuard>} />
            <Route path="/dev/agent-build" element={<DevGuard><AgentBuildPage /></DevGuard>} />
            <Route path="/dev/agent-build/template" element={<DevGuard><AgentTemplateMarket /></DevGuard>} />
            <Route path="/dev/agent-config" element={<DevGuard><AgentConfigPage /></DevGuard>} />
            <Route path="/dev/agent-manage" element={<DevGuard><AgentManagePage /></DevGuard>} />
            <Route path="/dev/agent-eval" element={<DevGuard><AgentEvalPage /></DevGuard>} />
            <Route path="/dev/resource-square" element={<DevGuard><ResourceRoute><ResourceSquarePage /></ResourceRoute></DevGuard>} />
            <Route path="/dev/my-resources" element={<DevGuard><ResourceRoute><MyResourcesPage /></ResourceRoute></DevGuard>} />
            <Route path="/dev/models" element={<DevGuard><ModelsPage /></DevGuard>} />
            <Route path="/dev/prompts" element={<DevGuard><PromptsPage /></DevGuard>} />
            <Route path="/dev/tools/plugins" element={<DevGuard><PlaceholderPage title="插件管理" description="集成DIFY的原生插件页面" /></DevGuard>} />
            <Route path="/dev/tools" element={<DevGuard><ToolsPage /></DevGuard>} />
            <Route path="/dev/connectors" element={<DevGuard><ConnectorsPage /></DevGuard>} />
            <Route path="/dev/skills" element={<DevGuard><SkillsPage /></DevGuard>} />
            <Route path="/dev/datasources" element={<DevGuard><DataSourcesPage /></DevGuard>} />
            <Route path="/dev/knowledge" element={<DevGuard><KnowledgeBasePage /></DevGuard>} />
            <Route path="/dev/filestore/:id" element={<DevGuard><FileStoreDetailPage /></DevGuard>} />
            <Route path="/dev/filestore" element={<DevGuard><FileStorePage /></DevGuard>} />
            <Route path="/dev/stats" element={<DevGuard><SpaceStatsPage /></DevGuard>} />
            <Route path="/dev/space-manage" element={<DevGuard><SpaceManagePage /></DevGuard>} />

            {/* ===== 运维中心 ===== */}
            <Route path="/ops" element={<Navigate to="/ops/agent-analysis" replace />} />
            <Route path="/ops/agent-analysis" element={<OpsMonitorPage />} />
            <Route path="/ops/model-analysis" element={<OpsMonitorPage />} />
            <Route path="/ops/knowledge-analysis" element={<OpsMonitorPage />} />
            <Route path="/ops/tool-analysis" element={<OpsMonitorPage />} />
            <Route path="/ops/connector-analysis" element={<OpsMonitorPage />} />
            <Route path="/ops/dept-analysis" element={<OpsInsightPage />} />
            <Route path="/ops/user-analysis" element={<OpsInsightPage />} />
            <Route path="/ops/space-analysis" element={<OpsInsightPage />} />
            <Route path="/ops/alert-monitor" element={<OpsAlertPage />} />
            <Route path="/ops/session-log" element={<OpsSessionsPage />} />

            {/* ===== 管理中心 ===== */}
            <Route path="/manage" element={<Navigate to="/manage/space-manage" replace />} />
            <Route path="/manage/space-manage" element={<OpsSpacesPage />} />
            <Route path="/manage/resource-manage" element={<ResourceRoute><ResourceManagePage /></ResourceRoute>} />
            <Route path="/manage/resource-permissions" element={<ResourceRoute><ResourcePermissionsPage /></ResourceRoute>} />
            <Route path="/manage/org" element={<PlaceholderPage title="组织管理" description="组织架构与部门管理" />} />
            <Route path="/manage/users" element={<PlaceholderPage title="用户管理" description="平台用户账号与权限管理" />} />
            <Route path="/manage/roles" element={<PlaceholderPage title="角色管理" description="角色定义与岗位权限配置" />} />
            <Route path="/manage/system-config" element={<DevGuard><SystemConfigPage /></DevGuard>} />
          </Routes>
        </MasterLayout>
      } />
    </Routes>
    </TabsProvider>
    </ResourceCenterProvider>
    </WorkspaceProvider>
  );
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: "'PingFang SC', '苹方', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}
