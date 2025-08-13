This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project.

## Getting Started

### 配置OpenRoute模型

创建 `.env.local` 文件并添加以下配置：

```bash
# OpenRoute API配置
OPENROUTE_API_KEY=your_openroute_api_key_here
OPENROUTE_BASE_URL=https://openrouter.ai/api/v1
OPENROUTE_MODEL=openai/gpt-4

# 或者继续使用OpenAI（可选）
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**配置说明：**
- `OPENROUTE_API_KEY`: 你的OpenRoute API密钥
- `OPENROUTE_BASE_URL`: OpenRoute API的基础URL（默认为 https://openrouter.ai/api/v1）
- `OPENROUTE_MODEL`: 要使用的模型名称（如 openai/gpt-4, anthropic/claude-3-sonnet 等）

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
