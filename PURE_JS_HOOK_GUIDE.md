# 纯JS版本Hook开发指南
## 🎯 为什么提供纯JS版本？
在实战开发中，很多用户反馈TypeScript版本Hook会遇到以下问题：
1. `Cannot use import statement outside a module` 模块类型错误
2. 需要额外配置`package.json`的`type: "module"`字段
3. TypeScript编译配置冲突
4. 新手学习门槛高

纯JS版本Hook完全解决了以上问题，无需任何额外配置，直接放到`hooks/`目录重启服务即可生效，是初学者快速上手的最佳选择。

## ✅ 纯JS Hook开发规则
1. **文件扩展名必须为`.js`**，不要用`.ts`/`.mjs`/`.cjs`
2. **使用CommonJS模块规范**：用`require`导入依赖，用`module.exports`导出Handler函数
3. **无需依赖`@openclaw/sdk`**，直接导出异步函数即可，参数和TS版本完全一致
4. **零配置生效**：放到工作区`hooks/`目录，执行`openclaw gateway restart`即可自动加载

## 🚀 快速运行示例
1. 安装LevelDB依赖（可选，只有05示例需要）：
```bash
npm install level
```
2. 将`04-pure-js-message-prepend.js`和`05-pure-js-message-append-leveldb.js`复制到OpenClaw工作区的`hooks/`目录
3. 重启网关：`openclaw gateway restart`
4. 发送任意消息即可看到效果：
   - 交互日志自动写入`./interaction_full.log`
   - 结构化对话数据自动持久化到LevelDB数据库`./conversation-db`

## 🐛 常见问题解决
1. **Hook加载失败？**
   - 检查文件扩展名是否为`.js`
   - 检查是否使用了`import`/`export`语法，必须改成`require`/`module.exports`
   - 查看网关日志：`journalctl --user -u openclaw-gateway.service -f`
2. **文件写入权限错误？**
   - 确保工作区目录有读写权限，日志文件和数据库会自动生成在当前工作区
3. **需要使用TS类型？**
   - 可以在JS文件开头添加`// @ts-check`注解，配合JSDoc获得类型提示
