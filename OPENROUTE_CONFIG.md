# OpenRoute模型配置指南

## 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# OpenRoute API配置
OPENROUTE_API_KEY=your_openroute_api_key_here
OPENROUTE_BASE_URL=https://openrouter.ai/api/v1
OPENROUTE_MODEL=openai/gpt-4
```

## 配置参数说明

### OPENROUTE_API_KEY
- **必需**: 是
- **说明**: 你的OpenRoute API密钥
- **获取方式**: 在 [OpenRouter](https://openrouter.ai/) 注册账户后获取

### OPENROUTE_BASE_URL
- **必需**: 否
- **默认值**: `https://openrouter.ai/api/v1`
- **说明**: OpenRoute API的基础URL
- **自定义**: 如果你使用自托管的OpenRoute实例，可以修改此URL

### OPENROUTE_MODEL
- **必需**: 否
- **默认值**: `openai/gpt-4o`
- **说明**: 要使用的模型名称
- **常用模型**:
  - `openai/gpt-4` - GPT-4
  - `openai/gpt-3.5-turbo` - GPT-3.5 Turbo
  - `anthropic/claude-3-sonnet` - Claude 3 Sonnet
  - `anthropic/claude-3-haiku` - Claude 3 Haiku
  - `meta-llama/llama-2-70b-chat` - Llama 2 70B
  - `google/palm-2-chat-bison` - PaLM 2

## 兼容性说明

此配置保持了与原OpenAI集成的向后兼容性：
- 如果未设置OpenRoute环境变量，系统将回退到使用 `OPENAI_API_KEY`
- 可以同时配置两套API密钥，根据需要切换

## 示例配置

### 使用Claude 3 Sonnet
```bash
OPENROUTE_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTE_BASE_URL=https://openrouter.ai/api/v1
OPENROUTE_MODEL=anthropic/claude-3-sonnet
```

### 使用自托管实例
```bash
OPENROUTE_API_KEY=your_api_key
OPENROUTE_BASE_URL=https://your-custom-openroute-instance.com/api/v1
OPENROUTE_MODEL=your/custom-model
```

## 注意事项

1. **API密钥安全**: 请勿将API密钥提交到版本控制系统
2. **模型可用性**: 确保选择的模型在你的OpenRoute账户中可用
3. **费用控制**: 不同模型的定价不同，请注意使用成本
4. **速率限制**: 遵守OpenRoute的API速率限制
