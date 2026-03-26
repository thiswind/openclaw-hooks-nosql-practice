# 示例运行指南
本指南教你如何在自己的OpenClaw实例中运行本项目的示例Hook。
## 前置要求
- OpenClaw版本 >= 2026.3.24-beta.1
- Node.js >= 22.16.0
## 运行方式（二选一即可）
### 方式1：直接拷贝到工作区（最简单，适合初学者）
1. 首先安装依赖：
   ```bash
   cd openclaw-hooks-nosql-practice
   npm install
   ```
2. 找到你的OpenClaw工作区目录（通常是你执行`openclaw init`时创建的目录，比如`my-openclaw-workspace`）
3. 在工作区根目录创建`hooks/`目录（如果不存在的话）
4. 把本项目`examples/`目录下的所有`.ts`文件拷贝到工作区的`hooks/`目录下
5. 重启OpenClaw服务：
   ```bash
   openclaw restart
   ```
### 方式2：配置额外Hook目录（适合开发，无需拷贝文件）
1. 安装依赖：
   ```bash
   cd openclaw-hooks-nosql-practice
   npm install
   ```
2. 打开OpenClaw工作区的配置文件`.openclaw/config.yaml`
3. 在配置文件中添加以下内容，把路径替换成你电脑上本项目`examples/`目录的绝对路径：
   ```yaml
   hooks:
     internal:
       load:
         extraDirs:
           - "C:/Users/micha/Desktop/openclaw-hooks-nosql-practice/examples"
           # Windows路径注意事项：
           # 1. 使用正斜杠(/)替代反斜杠(\)
           # 2. 路径必须用双引号包裹
           # 3. 不支持相对路径，必须使用绝对路径
           # Linux/macOS路径示例：/home/xxx/openclaw-hooks-nosql-practice/examples
   ```
4. 重启OpenClaw服务（**新增/修改Hook文件必须重启，配置变更不需要**）：
   ```bash
   openclaw restart
   ```
   > 说明：OpenClaw支持配置热重载，修改`config.yaml`不需要重启，但新增/修改Hook文件必须重启才能加载生效。
## 验证Hook是否生效
1. 启动OpenClaw服务后，查看启动日志，你会看到类似以下的输出，说明Hook已经成功加载：
   ```
   [hook] Loaded 3 hooks from extra directory: C:/Users/micha/Desktop/openclaw-hooks-nosql-practice/examples
   ```
2. 发送任意消息给OpenClaw，你会在控制台看到Hook打印的日志：
   - 首先打印Cycle启动的日志（来自01-agent-start-log.ts）
   - 生成回复后打印Cycle结束的日志（来自02-agent-end-log.ts）
   - 同时会打印持久化成功的日志（来自03-agent-end-persist.ts）
3. 运行持久化示例后，你会在`examples/`目录下看到生成的`conversation-history.json`文件，里面存储了所有的对话记录。
## 常见问题
1. **Hook没有生效？**
   - 检查OpenClaw版本是否符合要求
   - 检查配置文件中的路径是否正确，确保是绝对路径
   - 查看OpenClaw启动日志，是否有Hook加载相关的报错
2. **依赖安装失败？**
   - 尝试清除npm缓存重新安装：`npm cache clean --force && npm install`
   - 确保你的npm源可以正常访问npmjs.org
3. **数据库文件找不到？**
   - 03示例默认会在`examples/`目录下创建`conversation-history.json`文件，如果没有生成，检查该目录是否有写入权限
