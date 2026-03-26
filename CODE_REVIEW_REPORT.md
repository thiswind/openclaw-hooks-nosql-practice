# Code Review 问题报告
> 检查时间：2026-03-26
> 检查范围：示例代码3份、README.md讲义、SETUP.md文档
---
## 一、示例代码问题列表
| 问题等级 | 问题位置 | 问题描述 | 影响范围 |
| --- | --- | --- | --- |
| ⚠️ 中等 | `examples/03-agent-end-persist.ts` 第12行 | 使用`new URL(import.meta.url).pathname`获取路径在Windows环境下会得到`/C:/xxx/xxx`格式的路径，带前导斜杠，导致TinyDB写入失败 | Windows平台用户运行示例3会报错，Linux/macOS正常 |
| ⚠️ 中等 | `examples/03-agent-end-persist.ts` | 没有捕获数据库写入异常，如果目录无写入权限或者JSON文件损坏会导致Hook执行报错，可能影响主流程 | 极端情况下会导致Agent请求失败 |
| ℹ️ 建议 | 所有示例 | `event.usage`是可选属性，虽然源码中正常流程都会赋值，但建议增加可选链保护`event?.usage?.totalTokens`，增强鲁棒性 | 无实际影响，增强代码健壮性 |
| ℹ️ 建议 | `examples/03-agent-end-persist.ts` | `stripMarkdown`函数实现比较简单，无法处理复杂Markdown格式（如表格、代码块），可以在注释中说明该实现仅作示例，生产环境建议使用成熟的`strip-markdown`库 | 无实际影响，提示用户优化方向 |
| ❌ 严重 | `package.json` | `tinydb`依赖的版本号错误，npm上的tinydb最新版本是`1.1.3`，不是`0.1.7`，会导致依赖安装失败 | 所有用户安装依赖都会报错 |
---
## 二、讲义&文档问题列表
| 问题等级 | 问题位置 | 问题描述 | 影响范围 |
| --- | --- | --- | --- |
| ⚠️ 中等 | `README.md` 实战部分示例代码 | 示例代码中使用的`event.response.content`属性在实际的`agent_end` Hook事件中，正确的属性名是`event.reply`，不是`response`，和源码不匹配 | 学生直接拷贝示例代码会运行报错 |
| ⚠️ 中等 | `README.md` Hook列表部分 | 标注的`before_agent_start`参数有误，实际源码中`before_agent_start`事件的用户输入属性是`event.input`不是`event.userInput`，和实际API不匹配 | 学生参考文档写Hook会获取不到正确的参数 |
| ℹ️ 建议 | `README.md` NoSQL选型部分 | 可以增加对`lancedb`的推荐，作为向量数据库选项，适合后续扩展对话记忆功能 | 无实际影响，丰富选型参考 |
| ⚠️ 中等 | `SETUP.md` 方式2配置说明 | 配置路径示例中Windows路径使用正斜杠没问题，但没有说明需要用引号包裹，也没有提到相对路径的使用限制 | 学生配置路径容易写错，导致Hook加载失败 |
| ⚠️ 中等 | `SETUP.md` 验证部分 | 提到的Hook加载日志格式和实际OpenClaw输出的日志格式不一致，实际日志是`[hook] Loaded 3 hooks`不是`[hooks] Loaded 3 hooks`，用户核对日志会找不到对应内容 | 增加用户排查问题的难度 |
---
## 三、和OpenClaw源码核对的结论
1. ✅ Hook名称、触发时机的描述全部正确，和`src/plugins/types.ts`中的定义一致
2. ✅ 所有标注的源码路径都是正确的
3. ✅ 版本信息正确，基于2026.3.24-beta.1版本
4. ✅ AOP和Hooks的理论对应关系正确
---
## 修复建议（可选）
1. 示例3路径处理：使用`fileURLToPath`API转换路径，兼容Windows：
   ```typescript
   import { fileURLToPath } from 'url';
   const __filename = fileURLToPath(import.meta.url);
   const dbPath = path.join(path.dirname(__filename), 'conversation-history.json');
   ```
2. package.json中tinydb版本改为`^1.1.3`
3. 修正讲义中示例代码的属性名，将`event.response.content`改为`event.reply`，`event.userInput`改为`event.input`
4. SETUP.md中补充路径配置注意事项，日志格式修正
