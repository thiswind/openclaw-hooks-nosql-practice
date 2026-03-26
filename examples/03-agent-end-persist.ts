/**
 * OpenClaw Hook示例3：Agent轮次结束数据持久化到TinyDB
 * 触发时机：agent_end
 * 功能：将会话记录整理后存入NoSQL数据库，是课后作业的参考实现
 */
import { defineHook } from '@openclaw/sdk';
import { TinyDB } from 'tinydb';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 兼容Windows/Linux/macOS的路径处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 初始化数据库，数据存储在当前Hook文件同级的conversation-history.json中
const dbPath = path.join(__dirname, 'conversation-history.json');
const db = new TinyDB(dbPath);

// 辅助函数：去除Markdown格式
// 注意：本实现仅作简单示例，生产环境建议使用成熟的 strip-markdown 库处理复杂格式
function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
    .replace(/[*_~`#>+-]/g, '') // 移除基础markdown标记
    .replace(/\n{2,}/g, '\n') // 合并多余换行
    .trim();
}

export default defineHook('agent_end', async (event, ctx) => {
  try {
    // 整理结构化对话数据
    const conversationRecord = {
      id: `${ctx.sessionId}-${Date.now()}`,
      sessionId: ctx.sessionId,
      timestamp: Date.now(),
      datetime: new Date().toLocaleString('zh-CN'),
      userInput: event.input?.trim() || '',
      agentReply: stripMarkdown(event.reply || ''),
      tokenUsage: {
        input: event?.usage?.promptTokens || 0,
        output: event?.usage?.completionTokens || 0,
        total: event?.usage?.totalTokens || 0
      },
      toolsUsed: event?.toolCalls?.map(tool => ({
        name: tool.name,
        params: tool.parameters,
        duration: tool.durationMs
      })) || []
    };

    // 存入数据库
    await db.insert(conversationRecord);
    console.log(`[💾 持久化成功] 会话ID: ${ctx.sessionId} | 记录ID: ${conversationRecord.id}`);
  } catch (err) {
    console.error(`[❌ 持久化失败] 会话ID: ${ctx.sessionId} | 错误信息: ${String(err)}`);
  }
});
