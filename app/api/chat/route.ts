import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

// 模型分类逻辑（与前端保持一致）
const getModelCategory = (modelId: string) => {
  const id = modelId.toLowerCase();
  
  if (id.includes('dall-e') || id.includes('midjourney') || id.includes('stable-diffusion') ||
      id.includes('flux') || id.includes('imagen') || id.includes('firefly') || id.includes('playground')) {
    const isEdit = id.includes('edit') || id.includes('inpaint') || id.includes('outpaint');
    return {
      category: 'images',
      subcategory: isEdit ? 'edits' : 'generations',
      endpoint: isEdit ? '/images/edits' : '/images/generations'
    };
  }
  
  if (id.includes('whisper') || id.includes('tts') || id.includes('speech') || 
      id.includes('audio') || id.includes('voice')) {
    return {
      category: 'audio',
      endpoint: id.includes('tts') || id.includes('speech') ? '/audio/speech' : '/audio/transcriptions'
    };
  }
  
  if (id.includes('sora') || id.includes('runway') || id.includes('pika') ||
      id.includes('video') || id.includes('gen-2') || id.includes('gen-3')) {
    return {
      category: 'videos',
      endpoint: '/videos/generations'
    };
  }
  
  return {
    category: 'chat',
    endpoint: '/chat/completions'
  };
};

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  // 从headers获取客户端设置
  const headerApiKey = req.headers.get('X-API-Key');
  const headerBaseURL = req.headers.get('X-Base-URL');
  const headerModel = req.headers.get('X-Model');
  const headerTitle = req.headers.get('X-Title') || 'SpryChat';
  const incomingReferer = req.headers.get('referer') || req.headers.get('referrer') || '';
  const incomingOrigin = req.headers.get('origin') || '';
  const siteUrlFallback = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '';
  const effectiveReferer = incomingReferer || siteUrlFallback || incomingOrigin;

  // 优先使用客户端传递的设置，然后是环境变量
  const finalApiKey = headerApiKey || process.env.OPENROUTE_API_KEY || process.env.OPENAI_API_KEY;
  const finalBaseURL = headerBaseURL || process.env.OPENROUTE_BASE_URL || "https://api.openai.com/v1";
  const finalModel = headerModel || process.env.OPENROUTE_MODEL || "gpt-4o";

  // 获取模型类别和对应的端点
  const modelInfo = getModelCategory(finalModel);

  // 调试日志
  console.log('🚀 API Request Debug:', {
    headerApiKey: headerApiKey ? '***configured***' : 'missing',
    headerBaseURL: headerBaseURL || 'using default',
    headerModel: headerModel || 'using default',
    headerTitle,
    incomingReferer,
    incomingOrigin,
    effectiveReferer,
    finalModel,
    finalBaseURL,
    hasApiKey: !!finalApiKey,
    modelCategory: modelInfo.category,
    modelEndpoint: modelInfo.endpoint
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
    // 对于非聊天模型，返回不支持的错误信息
    if (modelInfo.category !== 'chat') {
      return new Response(
        JSON.stringify({ 
          error: `${modelInfo.category} 模型暂不支持聊天功能`,
          modelCategory: modelInfo.category,
          suggestedEndpoint: modelInfo.endpoint,
          message: `此模型属于 ${modelInfo.category} 类别，需要使用专门的 ${modelInfo.endpoint} 端点`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建OpenRoute提供商实例
    const openroute = createOpenAI({
      apiKey: finalApiKey,
      baseURL: finalBaseURL,
      headers: {
        'X-Title': headerTitle,
        // OpenRouter uses HTTP-Referer to attribute app/source
        ...(effectiveReferer ? { 'HTTP-Referer': effectiveReferer } : {}),
        ...(incomingOrigin ? { 'Origin': incomingOrigin } : {}),
      },
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
