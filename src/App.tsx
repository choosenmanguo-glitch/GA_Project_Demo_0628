import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MasterLayout from './layouts/AppLayout';
import { TabsProvider } from './contexts/TabsContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
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
import ResourceSquarePage from './pages/resource-square';
import MyResourcesPage from './pages/my-resources';
import KnowledgeBasePage from './pages/knowledge';

/** 通过 MasterLayout 包装的路由 */
function AppRoutes() {
  return (
    <TabsProvider>
    <WorkspaceProvider>
      <MasterLayout>
      <Routes>
        {/* 默认重定向到开发中心工作台 */}
        <Route path="/" element={<Navigate to="/dev/workbench" replace />} />
        <Route path="/home" element={<Navigate to="/dev/workbench" replace />} />

        {/* 首页 / 应用中心 - 占位 */}
        <Route path="/app-center" element={<PlaceholderPage title="应用中心" description="应用市场与已安装应用管理" />} />

        {/* ===== 开发中心 ===== */}
        <Route path="/dev" element={<Navigate to="/dev/workbench" replace />} />
        <Route path="/dev/workbench" element={<WorkbenchPage />} />
        <Route path="/dev/agent-build" element={<AgentBuildPage />} />
        <Route path="/dev/agent-build/template" element={<AgentTemplateMarket />} />
        <Route path="/dev/agent-config" element={<AgentConfigPage />} />
        <Route path="/dev/agent-manage" element={<AgentManagePage />} />
        <Route path="/dev/agent-eval" element={<AgentEvalPage />} />
        <Route path="/dev/resource-square" element={<ResourceSquarePage />} />
        <Route path="/dev/my-resources" element={<MyResourcesPage />} />
        <Route path="/dev/models" element={<ModelsPage />} />
        <Route path="/dev/prompts" element={<PromptsPage />} />
        <Route path="/dev/tools" element={<ToolsPage />} />
        <Route path="/dev/connectors" element={<ConnectorsPage />} />
        <Route path="/dev/skills" element={<PlaceholderPage title="技能管理" description="可复用技能单元管理" />} />
        <Route path="/dev/datasources" element={<DataSourcesPage />} />
        <Route path="/dev/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/dev/stats" element={<SpaceStatsPage />} />
        <Route path="/dev/space-manage" element={<SpaceManagePage />} />

        {/* ===== 运维中心 ===== */}
        <Route path="/ops" element={<Navigate to="/ops/space-manage" replace />} />
        <Route path="/ops/space-manage" element={<OpsSpacesPage />} />
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
        <Route path="/manage" element={<Navigate to="/manage/org" replace />} />
        <Route path="/manage/org" element={<PlaceholderPage title="组织管理" description="组织架构与部门管理" />} />
        <Route path="/manage/users" element={<PlaceholderPage title="用户管理" description="平台用户账号与权限管理" />} />
        <Route path="/manage/roles" element={<PlaceholderPage title="角色管理" description="角色定义与岗位权限配置" />} />
      </Routes>
    </MasterLayout>
    </WorkspaceProvider>
    </TabsProvider>
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}
