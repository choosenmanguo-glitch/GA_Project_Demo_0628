---
version: 1
language: "zh-CN"
name: "鲁警智算开发与管理中心视觉规范"
summary: "面向公安多警种 AI 资源建设与空间治理的浅色紧凑型管理界面。以 56px 全局顶栏、220/64px 可折叠侧栏、36px 多页签栏和浅灰内容画布构成稳定应用壳；六类资源页统一使用“统计摘要 + 筛选工具栏 + 资源卡片/表格 + 分页”的工作界面，蓝色承担品牌、资源识别和交互重点，状态色只表达业务状态。"

product:
  type: "government-ai-management-platform"
  archetype: "带空间上下文的多模块政务 AI 管理后台：固定全局导航 + 模块侧栏 + 多页签工作区 + 数据密集型 CRUD/分析页面"
  density: "compact-to-medium"
  primaryUseCases:
    - "在开发中心切换当前空间并查看空间内资源"
    - "管理模型、工具、连接器、数据连接、知识库和文件库"
    - "进入工具的插件管理以及模型源等二级维护能力"
    - "查看当前空间的资源统计与调用趋势"
    - "维护当前空间的基本信息、成员、日志与 API Key"
    - "在管理中心创建、审批、冻结、归档并审计平台空间"

technology:
  framework:
    name: "React"
    version: "19.0.1"
    source: "source-derived"
  styleSystem:
    name: "Ant Design theme tokens + React inline styles + global CSS overrides"
    source: "source-derived"
  componentLibraries:
    - "Ant Design 6.3.7"
    - "@ant-design/icons 6.2.2"
    - "Recharts 3.8.1"
  targetPrototype:
    type: "react"
    recommendation: "继续使用 React、Ant Design 与现有共享组件；新页面优先组合 PageHeader、StatCards、FilterBar、PageTabs、Table、Drawer 和 WorkspaceSwitcher，不另建平行组件库。"

runtime:
  evidenceMode: "source-only"
  observedTheme: "light"
  viewport: "desktop-first，目标宽度 1280px 及以上"
  shell: "observed"
  scopedRoutes:
    - "/dev/agent-manage（排除 /dev/agent-config）"
    - "/dev/models"
    - "/dev/tools 与 /dev/tools/plugins"
    - "/dev/connectors"
    - "/dev/datasources"
    - "/dev/knowledge"
    - "/dev/filestore"
    - "/dev/stats"
    - "/dev/space-manage 及其页内子视图"
    - "/manage/space-manage 及其页内子视图"
    - "开发中心侧栏 WorkspaceSwitcher 的切换、申请和我的申请流程"
  excludedRoutes:
    - "/dev/agent-config"
    - "开发中心与管理中心中用户未指定的其他页面"

tokens:
  colors:
    primary: "#1677ff"
    primaryHover: "#4096ff"
    primaryActive: "#0958d9"
    primarySelected: "#e6f4ff"
    primarySurface: "#f0f5ff"
    primaryBorder: "#d6e4ff"
    primaryBorderHover: "#91caff"
    primaryGradientEnd: "#69b1ff"
    brandDeep: "#1d39c4"
    onPrimary: "#ffffff"
    text: "#1D2129"
    textSecondary: "#5F6B7A"
    textMuted: "#7A8599"
    textDisabled: "#B0B8C8"
    canvas: "#f5f7fa"
    surface: "#ffffff"
    surfaceMuted: "#fafafa"
    neutralSurface: "#f2f3f5"
    border: "#d9d9d9"
    borderSubtle: "#f0f0f0"
    success: "#52c41a"
    warning: "#faad14"
    danger: "#ff4d4f"
    accentPurple: "#722ed1"
    accentCyan: "#13c2c2"
    accentOrange: "#fa8c16"
    accentMagenta: "#eb2f96"
  typography:
    baseFontFamily: "'PingFang SC', '苹方', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    heading:
      fontSize: "18px"
      fontWeight: 600
      lineHeight: "26px"
    sectionTitle:
      fontSize: "14px"
      fontWeight: 600
      lineHeight: "22px"
    body:
      fontSize: "14px"
      fontWeight: 400
      lineHeight: "22px"
    compactBody:
      fontSize: "13px"
      fontWeight: 400
      lineHeight: "20px"
    caption:
      fontSize: "12px"
      fontWeight: 400
      lineHeight: "20px"
    metric:
      fontSize: "28px"
      fontWeight: 600
      lineHeight: "36px"
    resourceMetric:
      fontSize: "26px"
      fontWeight: 700
      lineHeight: "32px"
    cardTitle:
      fontSize: "15px"
      fontWeight: 650
      lineHeight: "22px"
    button:
      fontSize: "14px"
      fontWeight: 400
      lineHeight: 1
  spacing:
    xs: "4px"
    sm: "8px"
    md: "12px"
    lg: "16px"
    cardInset: "20px"
    xl: "24px"
    xxl: "32px"
  radius:
    tag: "4px"
    control: "6px"
    container: "8px"
    identity: "12px"
    pill: 999
  shadow:
    card: "none"
    cardHover: "0 4px 12px rgba(0,0,0,0.08)"
    popover: "0 2px 8px rgba(0,0,0,0.06)"
  motion:
    fast: "150ms ease"
    base: "200ms cubic-bezier(0.4,0,0.2,1)"

layout:
  appShell:
    topbar:
      height: "56px"
      background: "{tokens.colors.surface}"
      textColor: "{tokens.colors.text}"
      horizontalPadding: "20px"
      borderBottom: "1px solid {tokens.colors.borderSubtle}"
    sidebar:
      width: "220px"
      collapsedWidth: "64px"
      background: "{tokens.colors.surface}"
      activeBackground: "{tokens.colors.primarySelected}"
      activeIndicator: "Ant Design inline menu selected state"
      borderRight: "1px solid {tokens.colors.borderSubtle}"
      menuTopPadding: "12px"
    workspaceSwitcher:
      expandedPadding: "8px 16px"
      collapsedPadding: "8px 0"
      borderBottom: "1px solid {tokens.colors.borderSubtle}"
    tabbar:
      height: "36px"
      background: "{tokens.colors.surface}"
      activeColor: "{tokens.colors.primary}"
      activeBorder: "2px solid {tokens.colors.primary}"
    content:
      background: "{tokens.colors.canvas}"
      leftOffset: "220px（侧栏折叠后为 64px）"
      pagePadding: "{tokens.spacing.lg} {tokens.spacing.xl}"
      minWidth: 0
  pageFrame:
    headerHeight: "50px"
    primaryPanel:
      background: "{tokens.colors.surface}"
      radius: "{tokens.radius.container}"
      border: "1px solid {tokens.colors.borderSubtle}"
      overflow: "内部滚动"
    splitGrid: "24 栅格；双栏图表默认 12/12，三列卡片默认 8/8/8，四项摘要默认 6/6/6/6"
  responsive:
    strategy: "desktop-first with controlled compression"
    rule: "宽度 >=1280px 使用完整应用壳；1024-1279px 默认折叠侧栏至 64px，表格启用横向滚动，图表保持双栏；低于 1024px 将双栏图表与三列卡片改为单列，并保持 {tokens.spacing.lg} 页面水平内边距。源码未提供移动端导航，不推断底部导航。"

components:
  appTopbar:
    source: "src/layouts/HeaderNav.tsx"
    height: "{layout.appShell.topbar.height}"
    use: "承载品牌、一级模块导航、门户入口、全局助手、通知和用户入口；所有业务页共享。"
    rule: "白底细分割线，一级导航使用紧凑正文；选中项只用主色文字与轻阴影，不使用大色块。"
  sidebar:
    source: "src/layouts/AppLayout.tsx + src/config.tsx"
    use: "显示当前一级模块的分组菜单；开发中心顶部固定空间切换器。"
    rule: "展开 220px、折叠 64px；折叠时隐藏分组标题并仅保留居中图标。"
  workspaceSwitcher:
    source: "src/components/WorkspaceSwitcher.tsx"
    trigger: "24px 空间字标 + 12px/600 名称 + 下拉箭头"
    modalWidth: "680px"
    modalBody: "{tokens.spacing.xl}，最大高度 72vh"
    listItem: "{tokens.spacing.lg} 内边距、{tokens.radius.container} 圆角、44px 字标、{tokens.spacing.sm} 垂直间隔"
    rule: "当前空间使用 primarySurface 背景和绿色状态标签；冻结空间降低透明度并禁止进入；底部保留申请新空间与我的申请入口。"
  pageHeader:
    source: "src/components/PageHeader.tsx"
    title: "{tokens.typography.heading.fontSize}/{tokens.typography.heading.fontWeight}/{tokens.colors.text}"
    padding: "{tokens.spacing.md} 0"
    use: "一级页面只显示标题与帮助提示；二级页面才显示返回面包屑。"
  statCards:
    source: "src/components/StatCards.tsx"
    layout: "默认四列，{tokens.spacing.lg} gutter，底部 {tokens.spacing.md} 间距"
    card: "{tokens.colors.surface}、{tokens.radius.container} 圆角、1px {tokens.colors.borderSubtle}、无常驻阴影"
    metric: "{tokens.typography.metric.fontSize}/{tokens.typography.metric.fontWeight}；颜色可按业务语义变化"
    selected: "使用对应指标色边框、8% 浅底和轻阴影"
    initialState: "首次进入页面不选中任何统计卡片，包括“全部/总数”卡片"
    filterLinkage: "点击分类卡片写入对应筛选条件；点击“全部/总数”清空分类条件；用户直接修改关联筛选项或重置时清除统计卡高亮"
  resourceStatCards:
    source: "模型、工具、连接器、数据连接、知识库和文件库页面"
    layout: "3 至 4 列等宽，使用 {tokens.spacing.lg} gutter"
    icon: "44px 方形图标底，使用 {tokens.radius.identity} 与 {tokens.colors.primarySelected}"
    metric: "{tokens.typography.resourceMetric.fontSize}/{tokens.typography.resourceMetric.fontWeight}/{tokens.colors.primary}"
    colorRule: "总数与分类统计统一使用主色体系，不按资源类型分配紫、青、橙、品红等类别色"
    interaction: "继承 statCards 的无默认选中与筛选联动规则"
  filterToolbar:
    source: "src/components/FilterBar.tsx"
    height: "内容自适应，默认 {tokens.spacing.md} {tokens.spacing.xl} 内边距"
    structure: "左侧搜索/下拉/搜索/重置/视图切换，右侧二级入口与主创建操作"
    gap: "{tokens.spacing.sm}"
    rule: "搜索框统一 240px，下拉选择默认 120px，日期范围 240px；右侧最多放两个次级入口与一个主创建动作，主创建动作必须位于最右侧。"
  button:
    source: "Ant Design Button"
    primary:
      use: "创建、确认、保存、发布、进入等单一主动作"
      height: "32px"
      background: "{tokens.colors.primary}"
      hoverBackground: "{tokens.colors.primaryHover}"
      textColor: "{tokens.colors.onPrimary}"
      radius: "{tokens.radius.control}"
    secondary:
      use: "取消、重置、导出和非破坏性次操作"
      background: "{tokens.colors.surface}"
      border: "{tokens.colors.border}"
    link:
      use: "表格内查看、编辑、配置等行级操作"
      rule: "操作不超过 3 个可直接显示，超过 3 个收进省略号菜单；破坏性动作使用 danger。"
  input:
    source: "Ant Design Input/Select/DatePicker"
    height: "32px"
    border: "{tokens.colors.border}"
    placeholderColor: "{tokens.colors.textMuted}"
    radius: "{tokens.radius.control}"
    rule: "筛选控件保持紧凑宽度；抽屉表单使用纵向标签和 16px 双列 gutter。"
  table:
    source: "Ant Design Table"
    size: "middle"
    headerBackground: "{tokens.colors.surfaceMuted}"
    headerTextColor: "{tokens.colors.text}"
    bodyTextColor: "{tokens.colors.text}"
    rule: "表格位于白色主面板内，工具栏下方留 12px；分页靠右并显示总条数；宽表启用横向滚动。"
  resourceCard:
    source: "src/index.css 的 resource-* 类与模型、工具、连接器、数据连接、知识库、文件库卡片视图"
    background: "{tokens.colors.surface}"
    radius: "{tokens.radius.container}"
    border: "1px solid {tokens.colors.borderSubtle}"
    padding: "{tokens.spacing.cardInset} {tokens.spacing.cardInset} {tokens.spacing.lg}"
    minHeight: "204px"
    grid: "repeat(auto-fill, minmax(320px, 1fr))，{tokens.spacing.lg} 间距"
    accent: "顶部 2px {tokens.colors.primary} 识别线"
    icon: "40px 方形浅蓝图标底，使用 {tokens.radius.identity}；禁止按资源类型改成多色渐变"
    title: "{tokens.typography.cardTitle.fontSize}/{tokens.typography.cardTitle.fontWeight}/{tokens.colors.text}，单行省略"
    metadataLine: "标题下方使用“主类型 Tag + 提供方/标识/数量文本”；只有一个 Tag 时不得单独占据一行"
    countPlacement: "连接器和 API 工具的工具数量紧跟提供方或标识，格式为“提供方 · N 个工具”"
    description: "{tokens.typography.compactBody.fontSize}/{tokens.typography.compactBody.lineHeight}，固定两行"
    footer: "底部左侧为“来源（如果有） · 创建人 · 创建时间”，右侧仅在存在独立快捷动作时显示更多菜单"
    hover: "边框切换为 {tokens.colors.primaryBorderHover} 并使用 {tokens.shadow.cardHover}；不位移、不改变尺寸"
    toolInteraction: "工具卡片整卡点击进入详情，不显示更多菜单；编辑和删除只保留在表格视图"
    rule: "卡片视图是表格的等价浏览方式；六类资源页默认使用卡片视图，并保留表格切换。"
  resourceTag:
    source: "src/index.css 的 resource-tag-primary / resource-tag-neutral"
    primary: "{tokens.colors.primarySelected} 背景、{tokens.colors.primary} 文本、透明边框"
    neutral: "{tokens.colors.neutralSurface} 背景、{tokens.colors.textSecondary} 文本、透明边框"
    radius: "{tokens.radius.tag}"
    rule: "主类型使用 primary，部署方式、来源等辅助属性使用 neutral；成功、停用、未授权等状态继续使用语义状态 Tag。"
  statusTag:
    source: "Ant Design Tag"
    radius: "{tokens.radius.tag}"
    fontSize: "{tokens.typography.caption.fontSize}"
    rule: "启用/已发布/已授权/已通过用 success；待审/冻结/停用/未授权用 warning；驳回/删除风险用 danger；资源类型不使用状态色。"
  tabs:
    source: "src/components/PageTabs.tsx + Ant Design Tabs"
    label: "14px/500"
    use: "同一对象或同一管理任务内的并列子视图，如基本信息/成员/日志、空间管理/待审批/审批记录。"
    rule: "页签下方保持 1px 分割线；不要把一级模块导航重复为页面页签。"
  drawer:
    source: "Ant Design Drawer + SpaceCreateDrawer + SpaceDetailTabs"
    compactWidth: "480px"
    standardWidth: "560px"
    wideWidth: "640px"
    outerRadius: "0（贴合视口边缘）"
    rule: "用于不离开列表上下文的创建、编辑、详情与审批；标题栏放取消/确认，正文按 {tokens.spacing.lg} 至 {tokens.spacing.xl} 节奏分组，内部面板使用 {tokens.radius.container}。"
  modal:
    source: "Ant Design Modal"
    standardWidth: "520px"
    workspaceSwitcherWidth: "680px"
    radius: "{tokens.radius.container}"
    rule: "仅用于短决策、切换和确认；长表单使用 Drawer，不创造第三种常规模态框宽度。"
  spaceSummary:
    source: "统计分析与当前空间管理页面"
    background: "{tokens.colors.primarySurface}"
    border: "1px solid {tokens.colors.primaryBorder}"
    radius: "{tokens.radius.container}"
    identityRadius: "{tokens.radius.identity}"
    rule: "只用于显示当前空间上下文，不作为普通页面区块背景。"
  chartPanel:
    source: "Ant Design Card + Recharts"
    height: "260px 图表绘图区"
    radius: "{tokens.radius.container}"
    grid: "{tokens.colors.borderSubtle}"
    axis: "{tokens.colors.textDisabled} / {tokens.typography.caption.fontSize}"
    rule: "图表标题 14px/600；主系列使用 primary，第二系列优先 success；面积填充透明度不超过 15%。"
  container:
    source: "目标页面主内容容器"
    background: "{tokens.colors.surface}"
    radius: "{tokens.radius.container}"
    border: "1px solid {tokens.colors.borderSubtle}"
    rule: "主面板不加常驻阴影，不在卡片内部再嵌套装饰卡片；通过背景、边框和间距建立层级。"

pageTemplates:
  - id: "workspace-switch-flow"
    name: "空间切换与申请流程"
    priority: primary
    appliesTo:
      - "开发中心全局空间切换"
      - "申请新空间"
      - "查看我的申请"
    structure:
      - "侧栏顶部空间触发器"
      - "680px 切换空间弹窗：标题说明、搜索框、可滚动空间列表、底部双入口"
      - "申请空间抽屉或我的申请抽屉"
    components:
      - workspaceSwitcher
      - modal
      - input
      - statusTag
      - drawer
    rules:
      - "切换后只更新当前空间上下文，不重建全局应用壳。"
      - "冻结和归档状态必须有明确不可进入反馈。"
    sampleContent:
      title: "切换工作空间"
      entities: "我的空间、反诈专项空间、交通治理空间"
    evidence: "source-derived"
    confidence: "high"
  - id: "resource-management-list"
    name: "资源管理列表页"
    priority: primary
    appliesTo:
      - "模型管理"
      - "工具管理"
      - "连接器管理"
      - "数据连接管理"
      - "知识库"
      - "文件库管理"
      - "智能体管理中的同类资源浏览区"
      - "后续同类资源管理页面"
    structure:
      - "PageHeader"
      - "三至四项 resourceStatCards 摘要，首次进入无选中项"
      - "白色主面板"
      - "FilterBar：搜索、页面相关筛选、搜索、重置、表格/卡片切换、可选二级入口、创建按钮"
      - "默认 resourceCard 网格 + 右下分页；可切换为等价 Table"
      - "创建/编辑/查看 Drawer"
    components:
      - pageHeader
      - resourceStatCards
      - filterToolbar
      - table
      - resourceCard
      - resourceTag
      - drawer
    rules:
      - "六类资源页默认卡片视图；表格只作为高密度对照视图，不改变筛选条件。"
      - "卡片固定使用“图标与名称 -> 类型/提供方/数量 -> 两行描述 -> 来源/创建人/创建时间”的信息顺序。"
      - "仅有一个标签时，将标签与提供方或标识放在同一行，不新增孤立标签行。"
      - "模型部署方式只允许“公网”和“本地”，不提供“私有云”。"
      - "知识库筛选栏必须包含“知识库类型”，与状态筛选并列。"
      - "工具栏中的模型源管理、插件管理、从广场获取属于次级入口，排列在主创建按钮之前。"
      - "工具卡片只响应整卡点击，不显示省略号菜单；连接器与 API 工具在提供方后显示工具数量。"
      - "资源类型、图标底、顶部识别线和统计摘要统一使用主色；状态标签按语义色显示。"
      - "底部元数据统一为“来源（如果有） · 创建人 · 创建时间”；无来源字段时从创建人开始。"
      - "表格操作超过 3 项时用省略号菜单。"
    sampleContent:
      title: "工具管理"
      primaryAction: "创建工具"
      cardMetadata: "API · 全国人口基础信息库 · 4 个工具"
      footer: "自定义 · 系统初始化 · 2026-01-10"
    evidence: "source-derived"
    confidence: "high"
  - id: "resource-secondary-maintenance"
    name: "资源二级维护页"
    priority: secondary
    appliesTo:
      - "工具管理 / 插件管理"
      - "模型管理 / 模型源管理"
    structure:
      - "保留完整应用壳与多页签上下文"
      - "PageHeader 使用二级页面标题"
      - "白色主内容容器"
      - "能力未接入时显示简洁占位文案，不伪造第三方原生界面"
    components:
      - pageHeader
      - container
      - filterToolbar
      - table
      - drawer
    rules:
      - "从所属资源页工具栏的次级按钮进入。"
      - "插件管理当前占位文案固定为“集成DIFY的原生插件页面”。"
      - "正式接入 DIFY 前不推断插件市场、安装流程或第三方组件样式。"
    sampleContent:
      title: "插件管理"
      placeholder: "集成DIFY的原生插件页面"
    evidence: "source-derived"
    confidence: "high"
  - id: "space-analytics-dashboard"
    name: "空间统计分析页"
    priority: primary
    appliesTo:
      - "开发中心统计分析"
      - "后续空间级运营看板"
    structure:
      - "PageHeader"
      - "当前空间摘要条 + 时间范围分段控件"
      - "六项资源指标卡"
      - "两列图表网格：趋势、分布、消耗、Top 排名"
      - "两列最近资源列表"
    components:
      - pageHeader
      - statCards
      - chartPanel
      - statusTag
    rules:
      - "先概览、再趋势、最后明细；图表两列等宽。"
      - "业务色用于区分指标，不将整个页面染成单一蓝色。"
    sampleContent:
      title: "统计分析"
      timeRange: "近三十天"
    evidence: "source-derived"
    confidence: "high"
  - id: "current-space-settings"
    name: "当前空间管理页"
    priority: primary
    appliesTo:
      - "开发中心空间管理"
    structure:
      - "PageHeader"
      - "当前空间摘要条"
      - "白色主面板内页签：基本信息、成员管理、操作日志、空间 API Key"
      - "页签内表单、筛选表格、安全提示或代码示例"
    components:
      - pageHeader
      - tabs
      - input
      - table
      - statusTag
      - button
    rules:
      - "基本信息表单正文最大宽度约 640px；成员和日志表格可占满。"
      - "安全告警使用浅黄色提示，不用大面积红色。"
    sampleContent:
      title: "空间管理"
      tabs: "基本信息 / 成员管理 / 操作日志 / 空间 API Key"
    evidence: "source-derived"
    confidence: "high"
  - id: "platform-space-governance"
    name: "平台空间治理页"
    priority: primary
    appliesTo:
      - "管理中心空间管理"
      - "空间申请审批与历史记录"
    structure:
      - "PageHeader"
      - "一级任务页签：空间管理、待审批、审批记录"
      - "可选统计摘要"
      - "白色主面板 + FilterBar + Table"
      - "空间详情、审批详情、创建空间 Drawer"
      - "冻结/归档/删除确认 Modal"
    components:
      - pageHeader
      - tabs
      - statCards
      - filterToolbar
      - table
      - drawer
      - modal
    rules:
      - "审批待办数量使用红色小圆角计数徽标，不使用大提示横幅。"
      - "详情抽屉内复用基本信息/成员/日志页签，避免复制页面结构。"
      - "破坏性动作必须二次确认并解释影响。"
    sampleContent:
      title: "空间管理"
      tabs: "空间管理 / 待审批 / 审批记录"
    evidence: "source-derived"
    confidence: "high"

generationRules:
  must:
    - "必须复用 56px 顶栏、220/64px 侧栏、36px 多页签栏与 #f5f7fa 内容画布的应用壳。"
    - "业务页面默认使用 16px 24px 页面内边距、18px/600 页面标题；卡片、面板和 Modal 统一使用 {tokens.radius.container}。"
    - "控件边框使用 {tokens.colors.border}，容器和结构分隔线使用 {tokens.colors.borderSubtle}，不可互换命名。"
    - "列表型功能必须按 PageHeader -> 可选 StatCards -> FilterBar -> Table/Card -> Drawer/Modal 的顺序组织。"
    - "六类资源管理页必须复用 resourceStatCards、filterToolbar、resourceCard、resourceTag 与统一分页，不为单页另造卡片结构。"
    - "资源页首次进入不得默认选中“全部/总数”统计卡；统计卡高亮必须与当前分类筛选真实同步。"
    - "资源卡信息顺序必须为图标与名称、类型/提供方/数量、两行描述、来源（如果有）/创建人/创建时间。"
    - "连接器与 API 工具的工具数量必须放在提供方或标识之后，不单独新增一行或独立标签。"
    - "只有一个标签时必须与相邻元数据同行，避免形成孤立标签带。"
    - "工具卡片必须仅支持整卡点击，不显示更多菜单；模型、连接器等页面可按实际快捷动作保留更多菜单。"
    - "模型部署方式仅使用公网与本地；知识库筛选必须包含知识库类型。"
    - "主色只用于主操作、链接、选中态和主图表系列；状态必须使用 success/warning/danger 语义色。"
    - "空间相关页面必须明确显示当前空间上下文；开发中心全局切换器固定在侧栏顶部。"
    - "优先使用 Ant Design 组件和 @ant-design/icons，不手绘已有图标。"
    - "表格操作不超过 3 项直接显示，超过 3 项放入省略号菜单。"
  mustNot:
    - "不要把智能体配置页的宽抽屉、内部配置导航或编辑器样式纳入本规范。"
    - "不要从未指定页面提取新的品牌色、营销式布局或大幅插画。"
    - "不要为普通页面添加大标题 Hero、渐变背景、浮动装饰、重阴影或大圆角卡片墙。"
    - "不要把每个页面区块都包成卡片，也不要在卡片内继续嵌套装饰卡片。"
    - "不要按模型、插件、工作流、数据库或知识库类型使用紫/青/橙/品红等大面积类别配色；辅助类别统一使用主色或中性灰。"
    - "不要让统计卡在页面初始状态伪装成已经生效的筛选条件。"
    - "不要在工具卡片右下角添加省略号、编辑或删除快捷动作。"
    - "不要自行新增移动端底部导航或宣称存在完整深色主题。"
    - "不要把 legacyTokens 当作推荐值。"
  selfCheck:
    - "页面是否仍处于统一应用壳内，顶栏、侧栏、页签栏尺寸是否正确？"
    - "页面是否使用 24 栅格和 16/24px 主间距，而非随意间距？"
    - "列表页是否有清晰的筛选、重置、主操作、分页和空状态？"
    - "六类资源页的卡片网格、顶部识别线、图标底、标签与底部元数据位置是否一致？"
    - "统计卡首次进入是否无选中项，点击后是否与筛选条件双向一致？"
    - "单标签是否与提供方/标识同行，工具数量是否紧跟提供方？"
    - "工具卡是否只保留整卡点击，模型是否已排除私有云，知识库是否包含类型筛选？"
    - "抽屉、弹窗和页签是否匹配任务长度与上下文保留需求？"
    - "颜色是否有语义，蓝色是否被限制在品牌和交互重点？"
    - "卡片、面板和 Modal 是否统一使用 container 圆角，按钮和输入是否使用 control 圆角？"
    - "边框是否按控件 border 与结构 borderSubtle 两种角色使用？"
    - "是否排除了 /dev/agent-config 与其他未指定页面的视觉特征？"

evidence:
  mode: "source-only"
  priority:
    - "用户明确限定的页面范围"
    - "目标路由中已启用的源码样式"
    - "目标页面复用组件"
    - "Ant Design 6 默认交互值"
    - "保守响应式默认值"
  sources:
    sourceFiles:
      - "src/App.tsx"
      - "src/config.tsx"
      - "src/index.css"
      - "src/layouts/AppLayout.tsx"
      - "src/layouts/HeaderNav.tsx"
      - "src/contexts/WorkspaceContext.tsx"
      - "src/components/WorkspaceSwitcher.tsx"
      - "src/components/PageHeader.tsx"
      - "src/components/PageTabs.tsx"
      - "src/components/FilterBar.tsx"
      - "src/components/StatCards.tsx"
      - "src/components/SpaceDetailTabs.tsx"
      - "src/components/SpaceCreateDrawer.tsx"
      - "src/pages/agent-manage/index.tsx"
      - "src/pages/models/index.tsx"
      - "src/pages/tools/index.tsx"
      - "src/pages/connectors/index.tsx"
      - "src/pages/datasources/index.tsx"
      - "src/pages/knowledge/index.tsx"
      - "src/pages/filestore/index.tsx"
      - "src/pages/space-stats/index.tsx"
      - "src/pages/space-ops/index.tsx"
      - "src/pages/ops-spaces/index.tsx"
    screenshots: []
    urls: []
    inferredFrom:
      - "Ant Design 6 的默认 32px 控件高度及主色 hover/active 派生值"
      - "目标页面中重复出现的 4/8/12/16/24/32px 主间距"
      - "用户明确允许对未遵循规范的源码差异进行合理统一"
      - "用户对六类资源页卡片层级、配色、统计卡初始状态和工具卡交互的逐项确认"
  decisions:
    - field: "tokens.colors.primary"
      source: "source-derived"
      confidence: "high"
      rationale: "App ConfigProvider、全局壳和全部目标页面一致使用 #1677ff。"
    - field: "layout.appShell"
      source: "source-derived"
      confidence: "high"
      rationale: "AppLayout 与 TabBar 明确定义 56px 顶栏、220/64px 侧栏和 36px 页签栏。"
    - field: "tokens.radius"
      source: "user-provided"
      confidence: "high"
      rationale: "用户确认不必忠实保留源码中的 8/10/12px 容器差异；卡片、面板和 Modal 统一为 8px，12px 只用于头像和身份图形。"
    - field: "tokens.colors.text"
      source: "source-derived"
      confidence: "high"
      rationale: "rgba(0,0,0,0.88) 与 #1D2129 承担相同主文本角色，统一为项目中反复出现且更稳定的 #1D2129。"
    - field: "tokens.colors.border"
      source: "source-derived"
      confidence: "high"
      rationale: "原 border/borderLight 命名与明暗关系相反；改为控件边框 #d9d9d9 与结构分隔线 borderSubtle #f0f0f0。"
    - field: "tokens.spacing"
      source: "source-derived"
      confidence: "high"
      rationale: "页面布局统一使用 4/8/12/16/24/32px 主尺度；资源卡片反复出现的 20px 内边距作为 cardInset 语义值保留，不扩展为通用间距档位。"
    - field: "tokens.shadow"
      source: "source-derived"
      confidence: "high"
      rationale: "删除只在个别卡片出现的蓝色 hover 阴影；交互卡片统一使用中性轻阴影且不发生位移。"
    - field: "layout.responsive"
      source: "recommended-default"
      confidence: "medium"
      rationale: "源码为桌面优先且缺少完整断点实现；采用侧栏折叠、表格横向滚动和栅格单列化作为保守默认。"
    - field: "runtime.observedTheme"
      source: "source-derived"
      confidence: "high"
      rationale: "目标源码只配置并实现浅色主题。"
    - field: "pageTemplates"
      source: "source-derived"
      confidence: "high"
      rationale: "模板由用户指定路由以及今日统一后的模型、工具、连接器、数据连接、知识库和文件库源码归纳。"
    - field: "components.resourceCard"
      source: "user-provided"
      confidence: "high"
      rationale: "用户确认采用统一卡片信息层级：类型与提供方同行、数量紧跟提供方、底部按来源/创建人/创建时间排列，并允许对旧页面差异合理统一。"
    - field: "components.resourceStatCards.initialState"
      source: "user-provided"
      confidence: "high"
      rationale: "用户明确要求六页首次进入时不默认选中全部或总数统计卡。"
    - field: "components.resourceStatCards.colorRule"
      source: "user-provided"
      confidence: "high"
      rationale: "用户指出数据连接页面配色杂乱，当前六类资源页已将类别图标、识别线与统计摘要收敛到主色体系。"
    - field: "components.resourceCard.toolInteraction"
      source: "user-provided"
      confidence: "high"
      rationale: "用户明确要求工具卡片去掉省略号，仅支持整卡点击。"
    - field: "pageTemplates.resource-management-list"
      source: "user-provided"
      confidence: "high"
      rationale: "用户明确补充模型部署方式、知识库类型筛选、插件管理入口及占位文案，均已写入页面变体规则。"
  confidence:
    overall: "high"
    tokens: "high"
    components: "high"
    layout: "high"
    pageTemplates: "high"
    darkMode: "low"
    mobile: "medium"

briefConsultation:
  required: false
  status: "not-required"
  proposalSummary: "不适用：本次从用户指定的既有源码页面提取，不进行 brief 视觉方向创作。"
  approvedBy: "not-applicable"
  approvedAt: "not-applicable"
  skipReason: ""

legacyTokens:
  - field: "tokens.radius.container"
    value: "10px / 12px"
    reason: "部分图表、模型卡片和空间摘要沿用了不同容器圆角。"
    currentDecision: "卡片、面板和 Modal 统一使用 8px；12px 只用于头像和身份图形。"
  - field: "tokens.colors.text"
    value: "rgba(0,0,0,0.88)"
    reason: "与 #1D2129 同时承担主文本角色，差异不足以形成有效层级。"
    currentDecision: "主文本统一使用 #1D2129。"
  - field: "tokens.colors.border"
    value: "#E5EAF3"
    reason: "旧 borderLight 名称与实际明暗关系相反，容易误导生成工具。"
    currentDecision: "控件边框使用 #d9d9d9；容器和结构分隔线使用 #f0f0f0。"
  - field: "tokens.shadow.cardHover"
    value: "0 6px 20px rgba(22,119,255,0.08)"
    reason: "蓝色阴影只在个别实体卡片出现，并与中性 hover 阴影冲突。"
    currentDecision: "交互卡片统一使用 0 4px 12px rgba(0,0,0,0.08)，且不位移。"

openQuestions:
  - id: "dark-mode"
    question: "未来是否需要正式深色主题？"
    currentDecision: "当前产品只把浅色主题视为正式规范；preview-dark.html 仅作为兼容性检查。"
    fallbackRule: "新功能只实现浅色主题，但颜色必须引用语义 token，避免阻碍未来主题化。"
    impact: "影响深色 token、图表颜色与浮层对比度。"
  - id: "mobile-navigation"
    question: "是否需要支持小于 1024px 的完整移动端导航？"
    currentDecision: "按桌面优先处理；窄屏折叠侧栏、表格横向滚动、栅格单列化。"
    fallbackRule: "不新增底部导航，不改变一级模块信息架构。"
    impact: "影响全局导航和复杂表格在手机上的可用性。"
knownLimits:
  - "本次为 source-only 提取，没有运行时截图或 computed styles；Ant Design 派生 hover/active 色与 32px 控件高度按当前库默认值记录。"
  - "严格限定在用户指定页面以及今日确认的模型、工具、连接器、数据连接、知识库、文件库；智能体配置页与其他未指定页面不参与规范归纳。"
  - "统计分析中的示例数据为 mock，规范只继承其图表结构与视觉语法，不继承随机数值。"

assumptions:
  - "后续 vibe coding 继续基于现有 React + Ant Design 工程，而不是迁移到静态 HTML 或其他组件库。"
  - "主要使用场景是 1280px 及以上桌面浏览器。"
  - "中文界面继续使用 PingFang SC 优先的系统字体栈，不额外加载 Web Font。"
---

## 1. 使用说明

本文件是目标页面范围内的唯一视觉真相源。后续开发新功能或新页面时，先选择第 7 章中的页面模板，再组合第 6 章组件，并直接引用 front matter 中的语义 token。不得从 `/dev/agent-config` 或未指定页面补充样式。

## 2. 产品与界面画像

鲁警智算是面向公安多警种的 AI 资源建设与空间治理平台。界面采用多模块管理后台骨架，用户在固定的全局壳内切换开发中心或管理中心，并在当前空间上下文中完成模型、工具、连接器、数据连接、知识库、文件库管理以及统计分析和空间治理。整体密度偏紧凑，优先支持高频扫描、比较和连续操作。

## 3. 设计原则

1. **上下文稳定**：顶栏、侧栏、多页签栏和当前空间始终可辨识，抽屉用于保留列表上下文。
2. **信息优先**：表格、筛选、指标和图表承担主要信息，不使用营销式 Hero 或装饰性大卡片。
3. **克制用色**：蓝色表达品牌、资源识别、主操作和选中；中性灰表达辅助属性；绿色、黄色、红色只表达正常、待处理和风险，不用多彩类别色制造差异。
4. **层级靠结构**：白色主面板、浅灰画布、细边框和稳定间距建立层级，阴影只出现在 hover 或浮层。
5. **复用优先**：六类资源页复用 PageHeader、resourceStatCards、FilterBar、resourceCard、Table 与 Drawer；空间详情复用 SpaceDetailTabs。

## 4. 设计令牌

颜色以 `#1677ff` 为主色，画布为 `#f5f7fa`，主表面为白色，主文本统一为 `#1D2129`。控件边框使用 `#d9d9d9`，容器与结构分隔线使用 `#f0f0f0`，中性标签底使用 `#f2f3f5`。正文默认 14px，紧凑信息 13px，辅助信息 12px，页面标题 18px/600，资源卡标题 15px/650，资源统计数字 26px/700。主间距限定为 4、8、12、16、24、32px，资源卡 20px 内边距作为单独语义值。Tag 为 4px 圆角，按钮和输入为 6px，卡片、面板和 Modal 统一为 8px，12px 只用于头像和身份图形。

### 4.8 Legacy Token 与冲突处理

源码中的 10/12px 容器圆角、两套主文本颜色、名称相反的 border/borderLight，以及蓝色/中性两套 hover 阴影均已归入 `legacyTokens`。这些值只用于解释历史页面，不得被新页面继续采用。

## 5. 布局与应用壳

应用壳由 56px 白色顶栏、220px 可折叠侧栏、36px 多页签栏和浅灰内容画布组成。侧栏折叠后为 64px。业务页面统一使用 `16px 24px` 内边距；标题之后放摘要或主面板。数据图表遵循 24 栅格，双栏为 12/12，三列卡片为 8/8/8，四项指标为 6/6/6/6。

## 6. 组件系统

- **页面头**：18px/600 标题，12px 垂直内边距；帮助图标弱化处理。
- **资源统计卡**：3-4 列等宽、统一蓝色体系、无常驻阴影；首次进入无选中项，点击后才与分类筛选联动。
- **筛选栏**：左侧为搜索、下拉、搜索、重置和视图切换；右侧最多两个次级入口与一个位于最右的主创建动作。
- **表格**：默认 `middle` 密度，分页显示总数；操作项遵循“最多 3 个直显”的项目约定。
- **资源卡片**：默认浏览视图。顶部 2px 蓝色识别线，40px 浅蓝图标底；标题下将类型 Tag 与提供方/标识/数量同行，描述固定两行，底部为来源（如果有）/创建人/创建时间。hover 只改变边框和轻阴影，不上移、不改变尺寸。
- **标签与状态**：类型用浅蓝 Tag，来源和部署方式用中性灰 Tag，启用/停用/授权等状态使用语义色；只有一个 Tag 时不得独立成行。
- **工具卡交互**：整卡点击进入详情，不显示省略号；表格视图才承载编辑与删除。连接器与 API 工具的数量跟在提供方后。
- **抽屉与弹窗**：长任务用抽屉，短确认用弹窗；抽屉按 480/560/640px 对应紧凑/标准/宽型任务，Modal 只保留 520px 标准型和 680px 空间切换型。
- **图表**：260px 高，14px/600 标题，11-12px 坐标；主色 + 语义辅助色，不使用彩虹配色。

## 7. 页面模板

`workspace-switch-flow` 负责空间切换、申请和申请记录；`resource-management-list` 负责模型、工具、连接器、数据连接、知识库、文件库及后续同类资源管理；`resource-secondary-maintenance` 负责插件管理、模型源等二级维护入口；`space-analytics-dashboard` 负责空间级指标与趋势；`current-space-settings` 负责当前空间信息、成员、日志和 API Key；`platform-space-governance` 负责平台空间、审批与状态治理。新页面应选择最接近的一种模板，不把多个模板的所有区块堆在同一页。

## 8. 交互状态与响应式规则

颜色、边框和阴影的微交互使用 150ms；导航展开、布局切换使用 200ms 标准缓动。卡片不得通过位移制造层级，普通按钮和菜单只改变颜色或浅背景。资源统计卡初始无高亮，只有真实筛选生效后才高亮；用户直接修改关联筛选项时应清除旧高亮。工具卡整卡可点击且不出现局部操作菜单。禁用/冻结必须同时降低对比度并禁止交互，不能只改变颜色。桌面宽度不足时先折叠侧栏和启用表格横向滚动；低于 1024px 时图表与卡片改单列。当前没有正式深色模式，深色预览仅用于检查语义 token 的未来适配性。

## 9. 原型生成规则与自检

### 9.1 AI 生成规则

生成页面前先确定页面模板，再检查是否需要当前空间摘要、统计卡、筛选栏、卡片/表格、分页和抽屉。生成资源页时必须先套用统一卡片信息顺序，再增加页面特有字段；任何新样式必须能解释为已有 token 或组件规则的延伸。

### 9.2 禁止事项

不得引入营销式 Hero、装饰性渐变、重阴影、卡片套卡片或未在目标页面中出现的新导航体系；不得引用智能体配置页作为视觉依据；不得把资源类别重新染成紫、青、橙、品红等多色体系，也不得在工具卡片恢复省略号操作。

### 9.3 自检清单

完成后逐项执行 `generationRules.selfCheck`，尤其检查应用壳尺寸、资源卡信息顺序、统计卡初始状态、标签与数量位置、工具卡交互、筛选完整性以及状态色语义。

## 10. 证据、限制与默认决策

### 10.1 来源摘要

规范由用户指定路由、今日统一后的六类资源页以及其直接复用组件提取，整体可信度高。主色、应用壳、页面框架、资源卡结构、筛选联动、二级入口和页面模板均有源码或用户明确决策作为证据。

### 10.2 当前默认决策

本规范优先保证可执行一致性，而非逐项复制历史页面。卡片、面板和 Modal 统一 8px；资源类别视觉收敛为蓝色与中性灰；六类资源页统一卡片骨架、统计卡和分页；首次进入不选中全部/总数；单标签与提供方同行；数量跟随提供方；底部统一为来源（如果有）/创建人/创建时间；工具卡只保留整卡点击。模型部署方式仅保留公网和本地，知识库增加类型筛选，工具页提供插件管理二级入口。后续页面保持浅色、桌面优先，并继续使用 React、Ant Design 与现有共享组件。

### 10.3 未确认能力与默认处理

响应式断点与深色模式缺少完整实现。当前默认在窄屏折叠侧栏、让表格横向滚动并将栅格改单列；深色模式不作为正式交付主题，`preview-dark.html` 仅用于兼容性检查。这些未确认项不阻塞后续原型生成。
