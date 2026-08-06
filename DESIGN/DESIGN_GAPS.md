# DESIGN_GAPS.md｜设计待确认项与冲突清单

本文件记录 design-generator 在分析产品源码、截图、URL 或产品描述时发现的不确定项、冲突项、缺失项和低置信度判断。

这些内容不会直接作为 AI 生成页面的主规则。AI 生成页面时应以 `DESIGN.md` 为准。

当人工确认本文件中的问题后，应将确认结果回写到 `DESIGN.md`，并重新生成 `preview.html`。

> **生成时间**：2026-07-24 11:24:20
> **证据模式**：source-only
> **置信度**：high

---

## 1. 总体置信度摘要

| 维度 | 置信度 | 说明 |
|---|---|---|
| 整体 | high | — |
| 设计令牌 | high | — |
| 组件体系 | high | — |
| 页面模板 | high | — |
| 暗色模式 | low | — |
| 移动端 | medium | — |

---

## 1b. 当前默认决策

AI 在收到 DESIGN.md 后遇到以下项应直接使用下表决策，无需等待人工确认。

| 决策项 | 当前选择 | 处理方式 |
|---|---|---|
| tokens.colors.primary | 见 DESIGN.md 当前权威字段 | App ConfigProvider、全局壳和全部目标页面一致使用 #1677ff。 |
| layout.appShell | 见 DESIGN.md 当前权威字段 | AppLayout 与 TabBar 明确定义 56px 顶栏、220/64px 侧栏和 36px 页签栏。 |
| tokens.radius | 见 DESIGN.md 当前权威字段 | 用户确认不必忠实保留源码中的 8/10/12px 容器差异；卡片、面板和 Modal 统一为 8px，12px 只用于头像和身份图形。 |
| tokens.colors.text | 见 DESIGN.md 当前权威字段 | rgba(0,0,0,0.88) 与 #1D2129 承担相同主文本角色，统一为项目中反复出现且更稳定的 #1D2129。 |
| tokens.colors.border | 见 DESIGN.md 当前权威字段 | 原 border/borderLight 命名与明暗关系相反；改为控件边框 #d9d9d9 与结构分隔线 borderSubtle #f0f0f0。 |
| tokens.spacing | 见 DESIGN.md 当前权威字段 | 页面布局统一使用 4/8/12/16/24/32px 主尺度；资源卡片反复出现的 20px 内边距作为 cardInset 语义值保留，不扩展为通用间距档位。 |
| tokens.shadow | 见 DESIGN.md 当前权威字段 | 删除只在个别卡片出现的蓝色 hover 阴影；交互卡片统一使用中性轻阴影且不发生位移。 |
| layout.responsive | 见 DESIGN.md 当前权威字段 | 源码为桌面优先且缺少完整断点实现；采用侧栏折叠、表格横向滚动和栅格单列化作为保守默认。 |
| runtime.observedTheme | 见 DESIGN.md 当前权威字段 | 目标源码只配置并实现浅色主题。 |
| pageTemplates | 见 DESIGN.md 当前权威字段 | 模板由用户指定路由以及今日统一后的模型、工具、连接器、数据连接、知识库和文件库源码归纳。 |
| components.resourceCard | 见 DESIGN.md 当前权威字段 | 用户确认采用统一卡片信息层级：类型与提供方同行、数量紧跟提供方、底部按来源/创建人/创建时间排列，并允许对旧页面差异合理统一。 |
| components.resourceStatCards.initialState | 见 DESIGN.md 当前权威字段 | 用户明确要求六页首次进入时不默认选中全部或总数统计卡。 |
| components.resourceStatCards.colorRule | 见 DESIGN.md 当前权威字段 | 用户指出数据连接页面配色杂乱，当前六类资源页已将类别图标、识别线与统计摘要收敛到主色体系。 |
| components.resourceCard.toolInteraction | 见 DESIGN.md 当前权威字段 | 用户明确要求工具卡片去掉省略号，仅支持整卡点击。 |
| pageTemplates.resource-management-list | 见 DESIGN.md 当前权威字段 | 用户明确补充模型部署方式、知识库类型筛选、插件管理入口及占位文案，均已写入页面变体规则。 |

---

## 2. 高优先级待确认项

高优先级指会直接影响 AI 生成页面准确性的内容。

无高优先级待确认项。

---

## 3. 中优先级待确认项

中优先级指影响局部组件或部分页面，但不影响整体生成。

| ID | 类型 | 待确认问题 | 当前判断 | 证据来源 | 置信度 | 影响范围 | 当前处理策略 | 需要确认 | 回写位置 |
|---|---|---|---|---|---|---|---|---|---|
| dark-mode | 未确认 | 未来是否需要正式深色主题？ | 当前产品只把浅色主题视为正式规范；preview-dark.html 仅作为兼容性检查。 | unresolvedItems | — | 影响深色 token、图表颜色与浮层对比度。 | 按 DESIGN.md 当前默认规则处理；确认后回写权威规则 | 是 | — |
| mobile-navigation | 未确认 | 是否需要支持小于 1024px 的完整移动端导航？ | 按桌面优先处理；窄屏折叠侧栏、表格横向滚动、栅格单列化。 | unresolvedItems | — | 影响全局导航和复杂表格在手机上的可用性。 | 按 DESIGN.md 当前默认规则处理；确认后回写权威规则 | 是 | — |
| DECISION-008 | 推荐默认 | layout.responsive 基于 recommended-default 写入，需要在有更多证据时确认。 | 见 DESIGN.md 当前权威字段 | evidence.decisions | medium | 影响后续原型保真度 | 源码为桌面优先且缺少完整断点实现；采用侧栏折叠、表格横向滚动和栅格单列化作为保守默认。 | 是 | layout.responsive |

---

## 4. 低优先级待确认项

低优先级指不会明显影响 AI 生成页面，但可后续完善。

| ID | 类型 | 待确认问题 | 当前判断 | 证据来源 | 置信度 | 影响范围 | 当前处理策略 | 需要确认 | 回写位置 |
|---|---|---|---|---|---|---|---|---|---|
| ASM-001 | 推断 | 后续 vibe coding 继续基于现有 React + Ant Design 工程，而不是迁移到静态 HTML 或其他组件库。 | — | assumptions | — | 影响局部原型生成准确性 | 按 DESIGN.md 当前默认规则处理；确认后回写权威规则 | 是 | — |
| ASM-002 | 推断 | 主要使用场景是 1280px 及以上桌面浏览器。 | — | assumptions | — | 影响局部原型生成准确性 | 按 DESIGN.md 当前默认规则处理；确认后回写权威规则 | 是 | — |
| ASM-003 | 推断 | 中文界面继续使用 PingFang SC 优先的系统字体栈，不额外加载 Web Font。 | — | assumptions | — | 影响局部原型生成准确性 | 按 DESIGN.md 当前默认规则处理；确认后回写权威规则 | 是 | — |

---

## 5. 设计冲突清单

冲突项必须展示候选值、当前采用值和采用原因。

未发现设计冲突。

---

## 6. 未覆盖 / 未观察到的内容

以下内容在当前输入中未观察到，默认不会作为 DESIGN.md 的主规则：

| 类别 | 状态 | 默认处理 |
|---|---|---|
| 本次为 source-only 提取，没有运行时截图或 computed styles；Ant Design 派生 hover/active 色与 32px 控件高度按当前库默认值记录。 | 默认处理已写入 DESIGN.md | 本次为 source-only 提取，没有运行时截图或 computed styles；Ant Design 派生 hover/active 色与 32px 控件高度按当前库默认值记录。 |
| 严格限定在用户指定页面以及今日确认的模型、工具、连接器、数据连接、知识库、文件库；智能体配置页与其他未指定页面不参与规范归纳。 | 默认处理已写入 DESIGN.md | 严格限定在用户指定页面以及今日确认的模型、工具、连接器、数据连接、知识库、文件库；智能体配置页与其他未指定页面不参与规范归纳。 |
| 统计分析中的示例数据为 mock，规范只继承其图表结构与视觉语法，不继承随机数值。 | 默认处理已写入 DESIGN.md | 统计分析中的示例数据为 mock，规范只继承其图表结构与视觉语法，不继承随机数值。 |

---

## 7. 人工确认记录

用于后续迭代闭环。

暂无人工确认记录。

---

## 确认流程

1. 逐项确认上述待确认项
2. 提供反馈（如「侧栏宽度确认是 240px」）
3. AI 会自动更新 DESIGN.md
4. AI 会更新本文档（将已确认项移到「人工确认记录」）
5. 重新生成 preview.html
