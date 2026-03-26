# OpenClaw Hooks 机制详解与NoSQL持久化实战
> 本项目是 [DevLearnHub](https://github.com/DevLearnHub) 出品的OpenClaw实战教程，包含完整的理论讲义和可直接运行的示例代码。
> 🚧 基于OpenClaw版本：**2026.3.24-beta.1（内部测试版）**，所有内容均对应该版本开源仓库源码实现，部分特性可能和稳定版有差异
---
## 📁 项目结构
```
openclaw-hooks-nosql-practice/
├── README.md                  # 完整讲义文档（你正在看的文件）
├── SETUP.md                   # 示例运行指南
├── package.json               # 依赖声明
└── examples/                  # 可直接运行的示例代码
    ├── 01-agent-start-log.ts  # 示例1：Agent轮次开始日志Hook
    ├── 02-agent-end-log.ts    # 示例2：Agent轮次结束日志Hook
    └── 03-agent-end-persist.ts # 示例3：对话数据持久化到TinyDB
```
## 🚀 快速开始
直接克隆本项目，按照 [SETUP.md](./SETUP.md) 中的步骤配置，5分钟就能运行所有示例，无需自己手写代码。
---
---
## 第一部分：理论基础
### 1.1 AOP（面向切面编程）发展简史
AOP的思想起源可以追溯到20世纪90年代，是为了解决传统OOP（面向对象编程）在处理横切关注点时的局限性而诞生的：
- **1997年**：施乐帕洛阿尔托研究中心（Xerox PARC）的Gregor Kiczales团队首次提出AOP概念，同时推出了第一个AOP实现语言AspectJ，专为Java生态设计，通过编译期织入、类加载期织入实现切面逻辑，至今仍是Java生态AOP的标准实现，广泛应用于Spring框架中，用于处理日志、事务、权限等通用逻辑。
- **2000年~2010年**：AOP思想扩散到其他编程语言生态：
  - Python生态：出现了`aspectlib`、`decorator`等库，通过装饰器语法天然支持AOP，开发者可以非常方便地用装饰器实现函数层面的切面增强。
  - PHP、Ruby等动态语言也纷纷推出了各自的AOP实现，核心都是无侵入式地扩展业务逻辑。
- **2010年后**：前端生态开始普及AOP思想：
  - 早期通过jQuery的事件绑定、中介者模式实现切面逻辑
  - React/Vue等框架出现后，高阶组件（HOC）、Render Props模式本质上也是AOP思想的体现，用于复用组件逻辑
  - 2018年React推出Hooks架构，将AOP思想进一步轻量化，成为前端逻辑复用的标准方案
- **当前**：AOP思想已经渗透到几乎所有开发领域，从后端框架到前端UI，再到AI Agent平台，都在使用AOP的设计理念实现无侵入式扩展。
### 1.2 Hooks架构发展简史
- **起源**：2018年React团队在React Conf上首次公布Hooks提案，2019年2月React 16.8版本正式发布稳定版React Hooks，解决了之前高阶组件、Render Props模式带来的嵌套地狱、逻辑复用困难、生命周期逻辑分散等问题，让组件逻辑可以更优雅地抽取和复用。
- **扩散**：Hooks架构的优势快速得到开发者认可，迅速从React扩散到整个前端生态：
  - Vue 3推出了Composition API，本质上是Vue版本的Hooks实现
  - Svelte、SolidJS等新兴框架也都原生支持Hooks风格的逻辑复用
  - 后端工具链（Webpack、Vite、Koa、FastAPI）也纷纷引入Hooks机制作为扩展方式
- **AI领域应用**：近年来Hooks架构成为AI Agent平台的标准扩展机制，OpenClaw、LangChain、AutoGPT等框架都通过Hooks机制让开发者可以自定义Agent的生命周期逻辑，无需修改核心源码。
### 1.3 Hooks是AOP的轻量化实现
两者的设计思想完全一致，概念对应关系如下：
| AOP核心概念 | OpenClaw Hooks对应实现 | 说明 |
| --- | --- | --- |
| 横切关注点 | Hook实现的通用逻辑 | 如日志记录、数据持久化、权限校验等非核心业务逻辑 |
| 连接点（Join Point） | Hook的固定触发时机 | 如Agent Cycle开始/结束、工具调用前后、消息收发前后等 |
| 切入点（Pointcut） | Hook的注册逻辑 | 指定Hook在哪个连接点触发 |
| 通知（Advice） | 用户编写的Hook回调函数 | 具体的扩展逻辑实现 |
| 织入（Weaving） | OpenClaw运行时自动执行Hook的过程 | 无需修改核心代码，运行时自动加载并执行Hook |
> 源码对应：AOP思想在OpenClaw中的实现核心位于 `/src/plugins/hooks.ts`，Hook运行时会按优先级顺序执行所有注册的对应Hook，实现对核心流程的无侵入增强。
---
## 第二部分：OpenClaw Hooks 机制详解
### 2.1 设计思路
OpenClaw Hooks是一套完全遵循AOP思想的扩展机制，核心设计目标是让开发者无需修改OpenClaw核心源码，就能实现对平台能力的扩展：
- **运行时自动触发**：OpenClaw内核执行到特定生命周期节点时，会按优先级顺序自动调用所有注册的对应Hook
- **零侵入扩展**：只需要在工作区的`hooks/`目录下新增Hook文件，重启服务即可生效，完全不影响核心业务逻辑
- **TypeScript原生支持**：所有Hook都有完整的类型定义，开发时自动提示参数、返回值结构，IDE友好
- **优先级调度**：支持设置Hook的优先级，高优先级的Hook会先执行，可以实现逻辑的顺序控制
> 源码对应：Hook核心调度逻辑位于 `/src/plugins/hooks.ts` 的 `createHookRunner` 函数，实现了不同类型Hook的执行策略（并行/顺序/优先声明）
### 2.2 核心可用Hook列表
> 注意：这里列的是**OpenClaw内核原生支持的Plugin生命周期Hook触发点**（共28个，所有Hook开发都基于这些触发点），和官方内置的可直接启用的「Hook Pack实例」是不同概念：
> 官方预打包的现成Hook Pack共有4个：`session-memory`（会话记忆增强）、`bootstrap-extra-files`（启动文件加载）、`command-logger`（命令审计日志）、`boot-md`（启动引导文档），可以通过`openclaw hooks list`命令查看
OpenClaw 2026.3.24-beta.1版本内核原生支持28个Hook触发点，按场景分为以下几类：
| 分类 | Hook名称 | 触发时机 | 可获取参数 | 源码定义位置 |
| --- | --- | --- | --- | --- |
| **Agent生命周期类** | `before_agent_start` | Agent会话轮次开始，处理用户输入前 | 会话ID、用户输入内容、会话上下文 | `/src/plugins/types.ts` |
|  | `agent_end` | Agent会话轮次结束，生成回复后 | 会话ID、用户输入、Agent回复内容、工具调用记录、Token消耗 | `/src/plugins/types.ts` |
|  | `before_model_resolve` | 模型解析前 | 当前模型配置、会话上下文 | `/src/plugins/types.ts` |
|  | `before_prompt_build` | Prompt构建前 | 历史消息列表、系统Prompt | `/src/plugins/types.ts` |
|  | `llm_input` | 发送请求给LLM前 | 完整的LLM请求Payload | `/src/plugins/types.ts` |
|  | `llm_output` | 收到LLM回复后 | 完整的LLM返回Payload | `/src/plugins/types.ts` |
|  | `before_reset` | 执行`/new`/`/reset`清空会话前 | 当前会话所有消息 | `/src/plugins/types.ts` |
| **消息生命周期类** | `message_received` | 收到用户消息时 | 消息内容、发送者信息、渠道信息 | `/src/plugins/types.ts` |
|  | `before_dispatch` | 消息分发到Agent前 | 消息内容、上下文 | `/src/plugins/types.ts` |
|  | `message_sending` | 发送消息给用户前 | 待发送消息内容、接收者信息 | `/src/plugins/types.ts` |
|  | `message_sent` | 消息发送成功后 | 已发送消息内容、发送结果 | `/src/plugins/types.ts` |
| **工具生命周期类** | `before_tool_call` | 调用工具前 | 工具名称、调用参数、上下文 | `/src/plugins/types.ts` |
|  | `after_tool_call` | 调用工具后 | 工具名称、返回结果、执行耗时 | `/src/plugins/types.ts` |
| **会话生命周期类** | `session_start` | 新会话创建时 | 会话ID、创建时间 | `/src/plugins/types.ts` |
|  | `session_end` | 会话销毁时 | 会话ID、会话时长、所有消息 | `/src/plugins/types.ts` |
| **网关生命周期类** | `gateway_start` | OpenClaw网关启动时 | 网关配置、监听端口 | `/src/plugins/types.ts` |
|  | `gateway_stop` | OpenClaw网关停止时 | 运行时长、统计信息 | `/src/plugins/types.ts` |
### 2.3 Hook开发SDK
OpenClaw提供了官方SDK用于开发Hook，通过`@openclaw/sdk`包导入：
```typescript
import { defineHook } from '@openclaw/sdk';
```
> 源码对应：SDK定义位于 `/src/plugin-sdk/hook-runtime.ts`，提供了类型安全的Hook定义方式
---
## 第三部分：实战内容
### 3.1 基础示例：Agent Cycle Hook实现
#### 示例1：Agent Cycle开始Hook，打印日志
```typescript
// hooks/agent-cycle-start-log.ts
import { defineHook } from '@openclaw/sdk';
/**
 * Agent轮次开始Hook，打印会话信息
 * 触发时机：before_agent_start
 * 源码对应触发位置：/src/agents/session-runner.ts 处理用户输入前
 */
export default defineHook('before_agent_start', async (event, ctx) => {
  console.log(`[Cycle 启动] 会话ID: ${ctx.sessionId} | 用户输入: ${event.input.slice(0, 50)}...`);
});
```
#### 示例2：Agent Cycle结束Hook，打印日志
```typescript
// hooks/agent-cycle-end-log.ts
import { defineHook } from '@openclaw/sdk';
/**
 * Agent轮次结束Hook，打印回复统计
 * 触发时机：agent_end
 * 源码对应触发位置：/src/agents/session-runner.ts 生成回复后
 */
export default defineHook('agent_end', async (event, ctx) => {
  console.log(`[Cycle 结束] 会话ID: ${ctx.sessionId} | 回复长度: ${event.reply.length} 字符 | Token消耗: ${event?.usage?.totalTokens || 0}`);
});
```
#### 部署方式
1. 在OpenClaw工作区根目录创建`hooks/`目录
2. 将上述Hook文件放到`hooks/`目录下
3. 执行`openclaw restart`重启服务，Hook会自动加载生效
4. 触发任意对话即可看到控制台打印的日志
### 3.2 课后作业
#### 3.2.1 前置任务：从0部署OpenClaw实例
1. 安装Node.js >= 22.16.0版本
2. 执行`npm install -g openclaw@2026.3.24-beta.1`全局安装指定版本的OpenClaw
3. 执行`openclaw init my-openclaw-workspace`初始化工作区
4. 执行`cd my-openclaw-workspace && openclaw start`启动服务
5. 访问`http://localhost:7890`验证部署成功
#### 3.2.2 作业要求
开发一个`agent_end` Hook，实现以下功能：
1. 提取当前轮次的核心字段：会话ID、用户输入、Agent回复、时间戳、Token消耗
2. 对内容做自定义整理（如去除Markdown格式、统计回复字数、过滤敏感内容等，整理方式自由发挥）
3. 将整理后的结构化数据持久化存入NoSQL数据库
#### 3.2.3 NoSQL数据库选型推荐（适合初学者的轻量选项）
| 数据库名称 | 特点 | 适用场景 | SDK安装方式 |
| --- | --- | --- | --- |
| **TinyDB** | 纯TypeScript/Python实现的嵌入式文档数据库，无需额外服务进程，直接以JSON文件存储，部署零成本 | 小型项目、学习场景、临时数据存储 | `npm install tinydb` |
| **LevelDB** | 谷歌开源的键值对嵌入式数据库，性能极高，Node.js/Python都有成熟SDK，本地IO速度极快 | 本地开发场景、需要高性能读写的缓存场景 | `npm install level` |
| **MongoDB Community** | 最流行的文档型NoSQL数据库，生态完善，支持Docker一键部署，JSON格式存储非常适合对话数据 | 后续需要扩展到生产环境、需要复杂查询的场景 | Docker一键启动：`docker run -d -p 27017:27017 mongo` |
| **Redis** | 内存型键值数据库，性能极高，支持持久化，支持丰富的数据结构 | 需要快速读写的实时数据、缓存场景 | Docker一键启动：`docker run -d -p 6379:6379 redis` |
#### 3.2.4 参考实现思路（以TinyDB为例）
```typescript
// hooks/agent-cycle-end-persist.ts
import { defineHook } from '@openclaw/sdk';
import { TinyDB } from 'tinydb';
// 初始化数据库，数据存储在当前工作区的conversation-history.json文件中
const db = new TinyDB('conversation-history.json');
export default defineHook('agent_end', async (event, ctx) => {
  // 整理数据
  const record = {
    sessionId: ctx.sessionId,
    timestamp: Date.now(),
    userInput: event.userInput.trim(),
    agentReply: event.response.content.replace(/\[[^\]]+\]\([^)]+\)/g, ''), // 去除Markdown链接
    tokenUsage: event.usage.totalTokens,
    toolCalls: event.toolCalls?.map(t => t.name) || []
  };
  // 存入数据库
  await db.insert(record);
  console.log(`[持久化完成] 会话ID: ${ctx.sessionId} 记录已存入数据库`);
});
```
---
## 参考资料
1. OpenClaw官方源码：https://github.com/openclaw/openclaw
2. AOP维基百科：https://zh.wikipedia.org/zh-hans/%E9%9D%A2%E5%90%91%E5%88%87%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1
3. React Hooks官方文档：https://react.dev/reference/react
