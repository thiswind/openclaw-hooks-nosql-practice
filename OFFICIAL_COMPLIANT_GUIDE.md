# 官方规范适配指南
## ⚠️ 原仓库示例问题说明
原仓库中的示例基于自定义的Plugin Hook SDK设计，与OpenClaw官方Hooks机制不兼容，存在以下问题：
1. **事件名不匹配**：使用`before_agent_start`、`agent_end`等不存在的自定义事件，官方网关不会触发
2. **结构不规范**：没有按照官方要求的`HOOK.md + 目录`结构组织，无法被自动扫描发现
3. **API不兼容**：使用不存在的`defineHook` SDK API，Handler签名和事件结构与官方不匹配
4. **最佳实践缺失**：不符合官方推荐的异步非阻塞、错误处理、路径规范等最佳实践

## ✅ 本次更新内容
本版本完全按照[官方Hooks文档](https://docs.openclaw.ai/automation/hooks)重构所有示例，100%符合官方规范，可以直接运行：
1. **事件全部使用官方真实存在的事件**：`command:new`、`command:stop`、`command:reset`等
2. **严格遵循目录结构规范**：每个Hook都是独立目录，包含`HOOK.md`元数据和Handler文件
3. **兼容TypeScript和纯JS两种版本**：TypeScript版本带类型定义，纯JS版本无需任何配置直接运行
4. **遵循官方最佳实践**：重IO逻辑异步执行不阻塞主流程，使用`workspaceDir`避免路径问题，包含完整错误处理

## 🚀 快速使用
### TypeScript版本示例
1. 将`examples/`下的Hook目录复制到你的工作区`hooks/`目录
2. 启用Hook：
```bash
openclaw hooks enable session-start-log
openclaw hooks enable session-end-log
openclaw hooks enable session-end-persist-tinydb
```
3. 重启网关：`openclaw gateway restart`

### 纯JS版本示例（推荐新手使用，零配置）
1. 将`examples/pure-js-*`目录复制到你的工作区`hooks/`目录
2. 启用Hook：
```bash
openclaw hooks enable pure-js-session-start-log
openclaw hooks enable pure-js-session-end-log
openclaw hooks enable pure-js-session-end-persist
```
3. 重启网关：`openclaw gateway restart`

## 🎯 效果验证
1. 发送`/new`命令：会收到「🚀 新会话已创建」的提示，网关日志输出会话创建记录
2. 发送`/reset`或`/stop`命令：网关日志输出会话结束记录，会话数据自动持久化到工作区`data/conversations.json`文件
