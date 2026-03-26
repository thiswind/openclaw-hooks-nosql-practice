/**
 * 纯JS版本：消息后置Hook + LevelDB NoSQL持久化
 * 满足作业要求：agent_end触发，结构化存储对话数据到NoSQL
 * 依赖安装：npm install level
 * 触发时机：agent_end / message_sent
 */
const { Level } = require('level');
const fs = require("fs");

// 初始化LevelDB数据库，数据存储在./conversation-db目录
const db = new Level('./conversation-db', { valueEncoding: 'json' });
const LOG_FILE = "./interaction_full.log";
const SIGNATURE = "\n---\n🤖 由 OpenClaw 纯JS Hook自动记录";

module.exports = async function handler(event, ctx) {
  // 兼容两种触发时机：message_sent和agent_end
  const isMessageSent = event.type === "message" && event.action === "sent";
  const isAgentEnd = event.type === "agent" && event.action === "end";
  if (!isMessageSent && !isAgentEnd) return;

  const time = new Date().toLocaleString("zh-CN");
  const sessionId = ctx.sessionId || event.sessionKey;
  
  // 1. 写入日志文件
  const replyContent = isMessageSent ? event.context.content : event.response.content;
  const entry = `🤖 助理: ${replyContent}\n📝 落款: ${SIGNATURE.trim()}\n=== [交互结束] ${time} 会话ID: ${sessionId} ===\n`;
  fs.appendFileSync(LOG_FILE, entry);

  // 2. 结构化数据持久化到LevelDB NoSQL数据库
  const record = {
    sessionId,
    timestamp: Date.now(),
    timeString: time,
    userInput: isAgentEnd ? event.userInput.trim() : "来自message_sent事件",
    agentReply: replyContent.replace(/\[[^\]]+\]\([^)]+\)/g, ''), // 去除Markdown链接
    tokenUsage: isAgentEnd ? (event?.usage?.totalTokens || 0) : 0,
    source: "pure-js-hook"
  };

  // 以时间戳作为key存入数据库
  await db.put(`conv:${Date.now()}:${sessionId}`, record);
  console.log(`[后置Hook][纯JS版] 已记录助理回复，已持久化到LevelDB，ID: ${sessionId}`);
}
