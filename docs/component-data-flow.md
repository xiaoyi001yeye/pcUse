# 组件间数据交互图

基于当前 MVP 代码实现整理，重点描述任务执行、设置下发和结果持久化三条主数据流。

```mermaid
flowchart TB
    user["用户"]

    subgraph ui["UI 层 · apps/app-ui"]
        chat["ChatPage"]
        context["TaskContextPanel"]
        settingsPage["SettingsPage"]
        history["HistoryPage<br/>当前仍是占位页"]
        store["useAppStore"]
        api["apiClient / invoke()"]

        chat -->|读写 messages| store
        chat -->|发送 TaskRequest| api
        settingsPage -->|读写 AppSettings| api
        store -->|渲染任务上下文| context
    end

    subgraph host["宿主层 · apps/desktop-host (Tauri + Rust)"]
        appCmd["commands/app.rs<br/>runtime_health / start_runtime / send_task"]
        settingsCmd["commands/settings.rs<br/>read_settings / write_settings"]
        systemCmd["commands/system.rs<br/>get_system_info"]
        runtimeState["RuntimeState<br/>child + base_url"]
        settingsFile["settings.json<br/>app_config_dir"]
        runtimeProc["Python Runtime 子进程"]

        settingsCmd <--> |设置 JSON| settingsFile
        appCmd -->|读取 / 更新| runtimeState
        appCmd -->|start_runtime 时 spawn| runtimeProc
        settingsFile -.->|启动 Runtime 时映射为 OPENAI_* 环境变量| appCmd
    end

    subgraph runtime["执行层 · agent-runtime (FastAPI)"]
        http["server.py<br/>/health /task /history"]
        exec["ExecutionManager.run()"]
        planner["Planner.plan()"]
        guard["PermissionGuard.check()"]
        router["ToolRouter.run()"]
        repo["SQLiteRepo"]
        policy["security/policy/default_policy.json"]

        http -->|POST /task| exec
        exec -->|TaskRequest -> ToolCall[]| planner
        exec -->|逐步校验风险| guard
        guard -->|读取策略| policy
        exec -->|分发 ToolCall| router
        exec -->|create_task / add_step / update_*| repo
    end

    subgraph tools["工具层 · agent_runtime.tools"]
        file["FileTool"]
        cmd["CmdTool"]
        browser["BrowserTool"]
        uia["UiTool"]
        vision["VisionTool"]
        system["SystemTool"]
        registry["RegistryTool<br/>MVP 默认返回禁用"]
    end

    subgraph local["本机资源与持久化"]
        filesystem["文件系统 / 工作区文件"]
        shell["Shell / PowerShell / CMD"]
        browserEnv["系统浏览器 / Playwright"]
        desktop["Windows UIA / 桌面窗口"]
        screenshots["~/.pc-use-agent/screenshots"]
        sqlite["~/.pc-use-agent/app.db"]
    end

    user -->|自然语言指令| chat

    api -->|invoke send_task / runtime_health / start_runtime| appCmd
    api -->|invoke read_settings / write_settings| settingsCmd
    api -->|invoke get_system_info| systemCmd

    appCmd -->|HTTP JSON| http
    runtimeProc -->|承载 FastAPI 服务| http

    router --> file
    router --> cmd
    router --> browser
    router --> uia
    router --> vision
    router --> system
    router --> registry

    file -->|open / read_preview| filesystem
    cmd -->|run(command)| shell
    browser -->|open_url / search / click_selector| browserEnv
    uia -->|list_windows / click_text| desktop
    vision -->|保存 PNG| screenshots
    repo -->|tasks / steps| sqlite

    file -->|ToolResult| exec
    cmd -->|stdout / stderr / exit_code| exec
    browser -->|ToolResult| exec
    uia -->|ToolResult| exec
    vision -->|截图路径| exec
    system -->|系统上下文| exec
    registry -->|error / disabled| exec

    exec -->|TaskResponse {summary, steps, artifacts?}| http
    http -->|HTTP JSON 响应| appCmd
    appCmd -->|invoke 返回| api
    api -->|summary / steps / settings| store
    store -->|渲染消息| chat

    history -.->|后续可接 /history，当前未实现| http
```

## 关键数据对象

- `TaskRequest`：由前端提交，包含 `prompt`、`auto_execute`、`execution_mode`、`confirm_risky` 等字段。
- `ToolCall`：`Planner` 从 `TaskRequest` 中解析出的结构化工具调用，交给 `PermissionGuard` 和 `ToolRouter` 继续处理。
- `ExecutionStep`：每一步执行状态都会写入 SQLite，并在 `TaskResponse` 中回传给 UI。
- `AppSettings`：由 Tauri 写入 `settings.json`，在启动 Runtime 时转换为 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 等环境变量。

## 说明

- 当前真正跑通的主链路是 `ChatPage -> Tauri invoke -> Rust Host -> Python /task -> Planner/Guard/Router -> Tools -> SQLite -> UI`。
- `HistoryPage` 还没有接入 `/history`，图中使用虚线表示预留的数据流。
- `shared/protocol/task.ts` 定义了跨进程协议形状，`app-ui` 当前也在自己的 `types` 中保留了一份对应结构。
