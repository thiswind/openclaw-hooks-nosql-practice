/**
 * OpenClaw Hook示例1：Agent轮次开始日志打印
 * 触发时机：before_agent_start
 * 功能：在每轮Agent处理用户请求前，打印会话ID和用户输入预览
 */
import { defineHook } from '@openclaw/sdk';

export default defineHook('before_agent_start', async (event, ctx) => {
  const input = event.input || '';
  const inputPreview = input.length > 50 
    ? input.slice(0, 50) + '...' 
    : input;
  
  console.log(`
====================================
🚀 Agent Cycle 启动
⏰ 时间: ${new Date().toLocaleString('zh-CN')}
🆔 会话ID: ${ctx.sessionId}
💬 用户输入: ${inputPreview}
====================================
  `);
});
