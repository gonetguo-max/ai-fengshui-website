# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- **Start development server**: `npm run dev` (uses nodemon for auto-restart)
- **Start production server**: `npm start`
- **Install dependencies**: `npm install`
- **No test suite**: Tests not configured - use `npm test` to see placeholder

### Requirements
- **Node.js**: >= 16.0.0 (as specified in package.json engines)

### API Key Configuration
- Create `.env` file in project root with `DEEPSEEK_API_KEY` and/or `QWEN3_API_KEY`
- Validate configuration: `node -e "require('./config.js').validateConfig()"`
- Reference: `docs/02-开发文档/setup-api-key.md`

## Architecture Overview

### Core Components
- **Express.js server** (`server.js`): Main application server with file upload, CORS, and API endpoints
- **Dual AI System** (`src/api/ai-manager.js`): Intelligent model selection between DeepSeek and Qwen3 APIs
- **Feng Shui Analyzer** (`src/api/fengshui-analyzer.js`): Core business logic with 8-level grading system
- **User Management** (`src/utils/user-manager.js`): Fingerprint-based user tracking and analytics

### AI Integration Strategy
The application uses a sophisticated dual-model system:
- **Primary Provider**: Configurable between DeepSeek-R1 (reasoning) and Qwen3 (speed-optimized)
- **Fallback System**: Automatic model switching on failures
- **Performance Monitoring**: Real-time statistics and optimization recommendations
- **Mode Options**: Speed test mode, parallel analysis mode, and performance-optimized mode

### Key Directories
- `src/api/`: AI clients and analysis services
- `src/components/`: Frontend JavaScript components (product recommendations)
- `src/data/`: Feng shui knowledge base
- `src/i18n/`: Multi-language support system
- `src/utils/`: User management and internationalization
- `uploads/`: User-uploaded images (auto-created)
- `docs/`: Comprehensive project documentation organized by phases

### Configuration System
- **Environment Variables**: API keys, server settings via `.env`
- **AI Strategy Config** (`config.js`): Model selection, fallback behavior, and performance settings
- **Multi-model Support**: DeepSeek (reasoning) + Qwen3 (speed) with intelligent switching

### API Endpoints
- `POST /api/analyze`: Core feng shui analysis with image upload support
- `GET /api/user-status`: User fingerprint and usage statistics
- `GET /api/system-stats`: System performance and AI model statistics
- `POST /api/feedback`: User feedback collection
- `GET /api/ai-stats`: AI performance monitoring with recommendations
- `POST /api/ai-switch`: Runtime AI strategy configuration

### Data Flow
1. User submits form data (房屋类型, 朝向, etc.) + optional image
2. User fingerprinting for analytics and rate limiting
3. AI Manager selects optimal model (DeepSeek vs Qwen3)
4. Feng Shui Analyzer generates professional analysis with 8-level grading
5. Full report returned to user with performance statistics

### Business Logic
- **8-Level Grading System**: From "极吉格局" (85-95) to "凶险格局" (0-34)
- **Free Analysis**: All users receive complete reports (no paywall)
- **Multi-language Support**: Chinese and English with automatic detection
- **Image Analysis**: Optional photo upload for enhanced analysis accuracy