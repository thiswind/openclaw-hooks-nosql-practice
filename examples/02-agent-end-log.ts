/**
 * OpenClaw Hook示例2：Agent轮次结束日志打印
 * 触发时机：agent_end
 * 功能：在每轮Agent生成回复后，打印回复统计信息和Token消耗
 */
import { defineHook } from '@openclaw/sdk';

export default defineHook('agent_end', async (event, ctx) => {
  const replyLength = (event.reply || '').length;
  const totalTokens = event?.usage?.totalTokens || 0;
  const toolCount = event?.toolCalls?.length || 0;

  console.log(`
====================================
✅ Agent Cycle 结束
⏰ 时间: ${new Date().toLocaleString('zh-CN')}
🆔 会话ID: ${ctx.sessionId}
📝 回复长度: ${replyLength} 字符
🔢 Token消耗: ${totalTokens}
🛠️ 调用工具数: ${toolCount}
⚡ 耗时: ${event.durationMs}ms
====================================
  `);
});
