# SpryChat - AI Chat Assistant

A modern AI chat assistant with multi-model support, conversation history, and rich customization features.

[中文文档](./README_CN.md) | [English](./README.md)

## ✨ Key Features

- 🤖 **Multi-Model Support** - OpenAI, OpenRouter, and various AI models
- 💬 **Conversation History** - Local persistent chat records
- ⚙️ **Client-Side Settings** - Complete browser-based configuration for API keys, models, themes
- 🌐 **Multi-Language Support** - Chinese/English interface switching
- 🎨 **Theme Toggle** - Light/Dark theme support
- 📁 **File Upload Support** - Upload and process files in chat
- 🔄 **Real-Time Model Switching** - Switch AI models without page refresh
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🔒 **Privacy-First** - All settings stored locally in browser
- ⚡ **Instant Updates** - Real-time conversation management without page reloads

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# OpenRouter API Configuration (Recommended)
OPENROUTE_API_KEY=your_openrouter_api_key_here
OPENROUTE_BASE_URL=https://openrouter.ai/api/v1
OPENROUTE_MODEL=openai/gpt-4o

# Or use OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Application

Open [http://localhost:3000](http://localhost:3000) to start using SpryChat

## ⚙️ Configuration

### API Key Configuration

SpryChat supports two configuration methods:

1. **Client-Side Configuration** (Recommended):
   - Click the settings button in the top right
   - Enter API key in the "API Configuration" tab
   - Settings are saved locally in browser

2. **Environment Variable Configuration**:
   - Configure in `.env.local` file
   - Used as default values

### Supported AI Models

- **OpenRouter**: Multiple free and paid models
- **OpenAI**: GPT-4o, GPT-3.5, etc.
- **Others**: Access Anthropic, Google models via OpenRouter

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **UI Library**: Assistant UI SDK
- **Styling**: Tailwind CSS + Radix UI
- **Language**: TypeScript
- **State Management**: React Hooks + localStorage
- **AI Integration**: AI SDK with OpenAI provider

## 📁 Project Structure

```
SpryChat/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI chat API routes
│   ├── assistant.tsx      # Main chat component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── settings-dialog.tsx # Settings dialog
│   ├── model-selector.tsx  # Model selector
│   └── conversation-list.tsx # Conversation list
├── hooks/                # Custom React Hooks
│   ├── use-settings.ts   # Settings management
│   ├── use-chat-runtime.ts # Chat runtime
│   └── use-simple-conversations.ts # Conversation management
└── env.example           # Environment variables example
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `OPENROUTE_API_KEY`
     - `OPENROUTE_BASE_URL`
     - `OPENROUTE_MODEL`
   - Click "Deploy"

3. **Custom Domain** (Optional):
   - Add your custom domain in Vercel dashboard
   - Configure DNS settings

### Deploy to Netlify

1. **Build Configuration**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Visit [netlify.com](https://netlify.com)
   - Drag and drop the `.next` folder
   - Or connect GitHub repository

### Deploy to Other Platforms

SpryChat is compatible with any platform supporting Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Requirements

- Node.js 18+
- npm or yarn
- Modern browser (ES2020+ support)

## 🐛 Troubleshooting

### Common Issues

1. **Model Not Responding**:
   - Check if API key is correctly configured
   - Verify selected model is available
   - Check network connection

2. **Conversation History Lost**:
   - Check if browser localStorage was cleared
   - Ensure browser supports localStorage

3. **Model Switching Not Working**:
   - Refresh page and try again
   - Check console for error messages

## 📝 Changelog

### v1.0.0 (2025-08-13)

- 🎉 Complete rebranding to SpryChat
- 🔧 Fixed all hydration errors and model switching issues
- 💬 Implemented complete conversation history management
- ⚙️ Added client-side settings interface
- 🌐 Multi-language and theme switching support
- 📁 Integrated file upload functionality

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome to improve SpryChat!

## 🌟 Star History

If you find SpryChat helpful, please consider giving it a star on GitHub!

---

**SpryChat - Making AI Chat Simpler and More Powerful!** 🚀
