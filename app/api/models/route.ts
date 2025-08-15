import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  // Read configuration from headers
  const headerApiKey = req.headers.get('X-API-Key');
  const headerBaseURL = req.headers.get('X-Base-URL');
  const headerTitle = req.headers.get('X-Title') || 'SpryChat';
  const incomingReferer = req.headers.get('referer') || req.headers.get('referrer') || '';
  const incomingOrigin = req.headers.get('origin') || '';
  const siteUrlFallback = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '';
  const effectiveReferer = incomingReferer || siteUrlFallback || incomingOrigin;

  const finalApiKey = headerApiKey || process.env.OPENROUTE_API_KEY || process.env.OPENAI_API_KEY;
  const finalBaseURL = (headerBaseURL || process.env.OPENROUTE_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, '');

  if (!finalApiKey) {
    return NextResponse.json({ error: '缺少API密钥' }, { status: 400 });
  }

  const url = `${finalBaseURL}/models`;

  try {
    console.log('[Models API] Fetching', url, 'with baseURL:', finalBaseURL);
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json',
        'X-Title': headerTitle,
        ...(effectiveReferer ? { 'HTTP-Referer': effectiveReferer, 'Referer': effectiveReferer } : {}),
        ...(incomingOrigin ? { 'Origin': incomingOrigin } : {}),
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new NextResponse(text || JSON.stringify({ error: '上游接口返回错误' }), { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Models API proxy error:', err);
    const message = err?.message || String(err);
    return NextResponse.json({ error: '获取模型失败，请检查网络或配置', detail: message }, { status: 502 });
  }
}
