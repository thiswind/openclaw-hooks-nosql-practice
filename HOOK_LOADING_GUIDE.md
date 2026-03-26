# OpenClaw Hook 加载方式全指南
## 三种Hook部署方式对比
| 加载方式 | 适用场景 | 是否需要重启 | 配置复杂度 |
| --- | --- | --- | --- |
| 工作区内置Hook | 个人开发、简单Hook | ✅ 新增/修改Hook文件后需要重启 | 极低，直接拷贝文件即可 |
| 额外目录Hook | 多项目共享Hook、开发调试 | ⚠️ 修改配置会热重载，新增/修改Hook文件需要重启 | 低，只需配置一次extraDirs |
| 插件打包Hook | 分发、生产环境 | ✅ 安装/更新插件后需要重启 | 高，需要按插件规范打包 |
| 动态注册Hook | 运行时动态加载/卸载 | ❌ 完全不需要重启 | 高，需要通过API调用 |
---
## 各方式详细说明
### 1. 工作区内置Hook（最常用，本示例使用的方式）
> 就是我们示例里用的方式，适合初学者和快速开发
1. 在OpenClaw工作区根目录创建`hooks/`目录
2. 把`.ts`格式的Hook文件放到这个目录下
3. **需要执行`openclaw restart`重启服务才能加载**
4. 重启后Hook永久生效，直到删除文件
### 2. 额外目录Hook
> 适合同时开发多个Hook项目，不需要来回拷贝文件
1. 在`.openclaw/config.yaml`中配置：
   ```yaml
   hooks:
     internal:
       load:
         extraDirs:
           - "/path/to/your/hook/directory"
   ```
2. **修改配置文件会自动热重载，不需要重启**
3. 但如果新增/修改了Hook目录里的文件，还是需要执行`openclaw restart`才能生效
3. 适合开发阶段，修改配置不用重启
### 3. 插件打包Hook
> 适合把Hook分享给其他人，或者生产环境部署
1. 按照OpenClaw插件规范把Hook打包成插件包
2. 执行`openclaw plugins install <插件包>`安装
3. 需要重启服务生效
4. 可以通过插件市场分发
### 4. 动态注册Hook（高级用法）
> 适合在运行时动态加载/卸载Hook，不需要重启
1. 在插件代码中通过`registerHook`API动态注册：
   ```typescript
   import { registerHook } from '@openclaw/sdk';
   // 动态注册一个Hook
   const unregister = registerHook('agent_end', async (event, ctx) => {
     console.log('动态注册的Hook触发了');
   });
   // 不需要的时候可以卸载
   // unregister();
   ```
2. **完全不需要重启，注册后立即生效**
3. 适合需要动态开关Hook的场景
---
## 热重载说明
OpenClaw目前只支持**配置变更的热重载**，不支持Hook文件变更的热重载：
- ✅ 修改`config.yaml`中Hook相关的配置会自动生效，不需要重启
- ❌ 新增、修改、删除Hook文件必须重启服务才能生效
