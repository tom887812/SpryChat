import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  // 从headers获取客户端设置
  const headerApiKey = req.headers.get('X-API-Key');
  const headerBaseURL = req.headers.get('X-Base-URL');
  const headerModel = req.headers.get('X-Model');

  // 优先使用客户端传递的设置，然后是环境变量
  const finalApiKey = headerApiKey || process.env.OPENROUTE_API_KEY || process.env.OPENAI_API_KEY;
  const finalBaseURL = headerBaseURL || process.env.OPENROUTE_BASE_URL || "https://api.openai.com/v1";
  const finalModel = headerModel || process.env.OPENROUTE_MODEL || "gpt-4o";

  // 调试日志
  console.log('🚀 API Request Debug:', {
    headerApiKey: headerApiKey ? '***configured***' : 'missing',
    headerBaseURL: headerBaseURL || 'using default',
    headerModel: headerModel || 'using default',
    finalModel,
    finalBaseURL,
    hasApiKey: !!finalApiKey
  });
  
  // 额外调试：检查所有headers
  console.log('📋 All request headers:');
  req.headers.forEach((value, key) => {
    if (key.startsWith('x-') || key.toLowerCase().includes('model') || key.toLowerCase().includes('api')) {
      console.log(`  ${key}: ${value}`);
    }
  });

  // 如果没有API密钥，返回错误
  if (!finalApiKey) {
    return new Response(
      JSON.stringify({ error: '请在设置中配置API密钥' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 创建OpenRoute提供商实例
    const openroute = createOpenAI({
      apiKey: finalApiKey,
      baseURL: finalBaseURL,
    });

    const result = streamText({
      model: openroute(finalModel),
      messages,
      // forward system prompt and tools from the frontend
      toolCallStreaming: true,
      system,
      tools: {
        ...frontendTools(tools),
      },
      onError: console.log,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'API调用失败，请检查网络连接和API密钥' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
