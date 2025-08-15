# SpryChat - AI聊天助手

一个现代化的AI聊天助手，支持多模型、对话历史和丰富的自定义功能。

[中文文档](./README_CN.md) | [English](./README.md)

## ✨ 项目特色功能

- 🤖 **多模型支持** - OpenAI、OpenRouter等多种AI模型
- 💬 **对话历史管理** - 本地持久化对话记录
- ⚙️ **客户端设置界面** - API密钥、模型、主题等完全浏览器端配置
- 🌐 **多语言支持** - 中文/英文界面无缝切换
- 🎨 **主题切换** - 明暗主题支持
- 📁 **文件上传支持** - 聊天中上传和处理文件
- 🔄 **实时模型切换** - 无需刷新页面即可切换AI模型
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔒 **隐私优先** - 所有设置仅存储在浏览器本地
- ⚡ **即时更新** - 对话管理实时响应，无需页面重载

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env.local` 并配置：

```bash
# OpenRouter API配置（推荐）
OPENROUTE_API_KEY=your_openrouter_api_key_here
OPENROUTE_BASE_URL=https://openrouter.ai/api/v1
OPENROUTE_MODEL=openai/gpt-4o

# 或者使用OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开 [http://localhost:3000](http://localhost:3000) 开始使用SpryChat

## ⚙️ 配置说明

### API密钥配置

SpryChat支持两种配置方式：

1. **客户端配置**（推荐）：
   - 点击右上角设置按钮
   - 在"API配置"标签页中输入API密钥
   - 设置会保存在浏览器本地

2. **环境变量配置**：
   - 在 `.env.local` 文件中配置
   - 作为默认值使用

### 支持的AI模型

- **OpenRouter**: 支持多种免费和付费模型
- **OpenAI**: GPT-4o、GPT-3.5等
- **其他**: 通过OpenRouter访问Anthropic、Google等模型

## 🛠️ 技术栈

- **框架**: Next.js 15
- **UI库**: Assistant UI SDK
- **样式**: Tailwind CSS + Radix UI
- **语言**: TypeScript
- **状态管理**: React Hooks + localStorage
- **AI集成**: AI SDK with OpenAI provider

## 📁 项目结构

```
SpryChat/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI聊天API路由
│   ├── assistant.tsx      # 主聊天组件
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── settings-dialog.tsx # 设置对话框
│   ├── model-selector.tsx  # 模型选择器
│   └── conversation-list.tsx # 对话列表
├── hooks/                # 自定义React Hooks
│   ├── use-settings.ts   # 设置管理
│   ├── use-chat-runtime.ts # 聊天运行时
│   └── use-simple-conversations.ts # 对话管理
└── env.example           # 环境变量示例
```

## 🚀 部署到生产环境

### 部署到Vercel（推荐）

1. **推送到GitHub**：
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin master
   ```

2. **在Vercel上部署**：
   - 访问 [vercel.com](https://vercel.com)
   - 点击"New Project"
   - 导入你的GitHub仓库
   - 配置环境变量：
     - `OPENROUTE_API_KEY`
     - `OPENROUTE_BASE_URL`
     - `OPENROUTE_MODEL`
   - 点击"Deploy"

3. **自定义域名**（可选）：
   - 在Vercel控制面板中添加自定义域名
   - 配置DNS设置

### 部署到Netlify

1. **构建配置**：
   ```bash
   npm run build
   ```

2. **部署**：
   - 访问 [netlify.com](https://netlify.com)
   - 拖拽 `.next` 文件夹上传
   - 或连接GitHub仓库自动部署

### 部署到其他平台

SpryChat兼容任何支持Next.js的平台：
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🔧 开发说明

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器（支持ES2020+）

## 🐛 故障排除

### 常见问题

1. **模型无响应**：
   - 检查API密钥是否正确配置
   - 确认选择的模型可用
   - 检查网络连接

2. **对话历史丢失**：
   - 检查浏览器localStorage是否被清除
   - 确认浏览器支持localStorage

3. **模型切换不生效**：
   - 刷新页面重试
   - 检查控制台是否有错误信息

## 📝 更新日志

### v1.0.0 (2025-08-13)

- 🎉 完整重构为SpryChat
- 🔧 修复所有水合错误和模型切换问题
- 💬 实现完整的对话历史管理
- ⚙️ 添加客户端设置界面
- 🌐 支持多语言和主题切换
- 📁 集成文件上传功能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进SpryChat！

## 🌟 Star历史

如果你觉得SpryChat有用，请考虑在GitHub上给它一个star！

---

**SpryChat - 让AI聊天更简单、更强大！** 🚀
