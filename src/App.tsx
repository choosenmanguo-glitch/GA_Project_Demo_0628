import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MasterLayout from './layouts/AppLayout';
import { TabsProvider } from './contexts/TabsContext';
import ModelsPage from './pages/models';
import PromptsPage from './pages/prompts';
import ToolsPage from './pages/tools';
import ConnectorsPage from './pages/connectors';
import DataSourcesPage from './pages/datasources';
import WorkbenchPage from './pages/workbench';
import AgentBuildPage from './pages/agent-build';
import AgentManagePage from './pages/agent-manage';
import SpaceOpsPage from './pages/space-ops';
import OpsSpacesPage from './pages/ops-spaces';
import OpsMonitorPage from './pages/ops-monitor';
import OpsInsightPage from './pages/ops-insight';
import OpsAlertPage from './pages/ops-alert';
import OpsSessionsPage from './pages/ops-sessions';
import PlaceholderPage from './pages/Placeholder';

/** 通过 MasterLayout 包装的路由 */
function AppRoutes() {
  return (
    <TabsProvider>
      <MasterLayout>
      <Routes>
        {/* 默认重定向到开发中心工作台 */}
        <Route path="/" element={<Navigate to="/dev/workbench" replace />} />
        <Route path="/home" element={<Navigate to="/dev/workbench" replace />} />

        {/* 首页 / 应用中心 / 资源中心 - 占位 */}
        <Route path="/app-center" element={<PlaceholderPage title="应用中心" description="应用市场与已安装应用管理" />} />
        <Route path="/resource-center" element={<PlaceholderPage title="资源中心" description="平台公共资源浏览与管理" />} />

        {/* ===== 开发中心 ===== */}
        <Route path="/dev" element={<Navigate to="/dev/workbench" replace />} />
        <Route path="/dev/workbench" element={<WorkbenchPage />} />
        <Route path="/dev/agent-build" element={<AgentBuildPage />} />
        <Route path="/dev/agent-manage" element={<AgentManagePage />} />
        <Route path="/dev/agent-eval" element={<PlaceholderPage title="智能体测评" description="测评任务 / 测评集 / 评估器" />} />
        <Route path="/dev/resource-square" element={<PlaceholderPage title="资源广场" description="浏览和应用平台共享资源" />} />
        <Route path="/dev/my-resources" element={<PlaceholderPage title="我的资源" description="管理个人上传或收藏的资源" />} />
        <Route path="/dev/models" element={<ModelsPage />} />
        <Route path="/dev/prompts" element={<PromptsPage />} />
        <Route path="/dev/tools" element={<ToolsPage />} />
        <Route path="/dev/connectors" element={<ConnectorsPage />} />
        <Route path="/dev/skills" element={<PlaceholderPage title="技能管理" description="可复用技能单元管理" />} />
        <Route path="/dev/datasources" element={<DataSourcesPage />} />
        <Route path="/dev/knowledge" element={<PlaceholderPage title="知识库" description="知识库创建、文档管理与检索配置" />} />
        <Route path="/dev/stats" element={<SpaceOpsPage />} />
        <Route path="/dev/space-manage" element={<PlaceholderPage title="空间管理" description="当前空间的基本信息、成员、日志与高级操作" />} />

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
        },
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}
