# AI Agent Nexa 🤖

A web-based AI agent with chat interface, code editor, and execution capabilities - built like Vercel/Bolt from scratch.

## 🚀 Features

- **Chat Interface**: Natural language conversations with AI
- **Code Editor**: Monaco Editor with syntax highlighting
- **Code Execution**: Safe JavaScript code execution
- **Memory System**: Conversation history and context
- **Multi-step Tasks**: Complex task handling
- **Modern UI**: Beautiful interface with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4 API
- **Database**: SQLite
- **Code Execution**: VM2 (safe sandbox)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js v18+ installed
- OpenAI API key
- Git (for version control)

## 🚀 Quick Start

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-agent-nexa

# Install all dependencies
npm run setup
```

### 2. Environment Configuration
```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit .env with your OpenAI API key
# OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Start Development
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run backend:dev    # Backend on port 5000
npm run frontend:dev   # Frontend on port 3000
```

## 🧪 Testing

### Backend Test
```bash
cd backend
npm run dev
# Visit http://localhost:5000/health
```

### Frontend Test
```bash
cd frontend
npm start
# Visit http://localhost:3000
```

## 📁 Project Structure

```
ai-agent-nexa/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js server
│   ├── services/      # AI, code execution
│   ├── memory/        # Database operations
│   ├── routes/        # API endpoints
│   └── server.js
├── shared/            # Common utilities
└── package.json       # Root configuration
```

## 🔧 Development Commands

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run frontend:build

# Database setup
npm run setup:db
```

## 🌐 API Endpoints

- `POST /api/chat` - Chat with AI
- `POST /api/execute` - Execute code
- `GET /api/memory` - Get conversation history
- `POST /api/memory` - Save conversation

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy!

### Environment Variables for Production
- `OPENAI_API_KEY`
- `NODE_ENV=production`
- `CORS_ORIGIN`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the issues section
- Create new issue for bugs
- Join our community!

---

**Happy Coding! 🎉**
