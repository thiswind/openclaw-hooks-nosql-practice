/**
 * 纯JS版本：消息前置Hook - 收到用户消息时记录时间戳
 * 注意事项：
 * 1. 使用.js扩展名，避免TypeScript编译和模块类型问题
 * 2. 使用CommonJS规范（require/module.exports），无需配置type:module即可直接运行
 * 3. 无需依赖@openclaw/sdk，直接导出默认函数即可
 * 触发时机：message_received
 */
const fs = require("fs");
const LOG_FILE = "./interaction_full.log";

module.exports = async function handler(event, ctx) {
  if (event.type !== "message" || event.action !== "received") return;

  const time = new Date().toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const entry = `\n=== [交互开始] ${time} 会话ID: ${ctx.sessionId || event.sessionKey} ===\n👤 用户: ${event.context.content || event.input}\n`;
  fs.appendFileSync(LOG_FILE, entry);
  console.log(`[前置Hook][纯JS版] 已记录用户消息，时间：${time}`);
}
