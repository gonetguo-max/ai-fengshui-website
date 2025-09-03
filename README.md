# 🔮 AI Feng Shui Master - Professional Analysis Platform

An intelligent Feng Shui analysis platform powered by cutting-edge AI technology, providing professional-grade analysis for worldwide luxury homes and commercial spaces.

## ✨ Key Features

### 🤖 Dual AI Engine System
- **DeepSeek-R1**: Advanced reasoning model for in-depth analysis
- **Qwen3**: Speed-optimized model for quick responses
- **Intelligent Fallback**: Automatic model switching for reliability
- **Performance Monitoring**: Real-time statistics and optimization

### 🏠 Professional Analysis
- **8-Level Grading System**: From "极吉格局" (85-95) to "凶险格局" (0-34)
- **Multi-dimensional Assessment**: Direction, layout, timing, and precautions
- **Image Analysis**: Upload floor plans for enhanced accuracy
- **Personalized Recommendations**: Tailored improvement suggestions

### 💎 Tiered Pricing Structure
- **FREE**: Basic analysis with essential insights
- **BASIC ($3.99)**: Complete directional analysis
- **PROFESSIONAL ($4.99)**: Detailed layout recommendations
- **MASTER ($29.99)**: Premium consultation with specialized advice

### 🌍 Global Market Ready
- **Multi-language Support**: Chinese and English interfaces
- **SEO Optimized**: Global reach with professional positioning
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Export Options**: PDF, image, and text formats

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-fengshui-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   Create `.env` file in project root:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   QWEN3_API_KEY=your_qwen3_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open http://localhost:3000 in your browser

### Production Deployment

```bash
npm start
```
Server runs on port 3000 (configurable via PORT environment variable)

## 🛠️ Technology Stack

### Backend
- **Node.js + Express.js**: RESTful API server
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **Environment Configuration**: Secure API key management

### Frontend
- **Vanilla JavaScript**: Lightweight and fast
- **Responsive CSS**: Modern dark theme design
- **Progressive Enhancement**: Works without JavaScript

### AI Integration
- **DeepSeek R1**: Primary analysis engine
- **Qwen3**: Backup and speed optimization
- **Intelligent Routing**: Performance-based model selection

### Deployment
- **Vercel Ready**: Zero-configuration deployment
- **Environment Variables**: Secure production configuration
- **CDN Optimized**: Global content delivery

## 📁 Project Structure

```
├── src/
│   ├── api/                 # AI clients and analysis services
│   │   ├── ai-manager.js    # Intelligent model selection
│   │   ├── deepseek-client.js
│   │   ├── qwen3-client.js
│   │   └── fengshui-analyzer.js
│   ├── auth/                # User authentication system
│   ├── components/          # Frontend JavaScript components
│   ├── data/               # Feng Shui knowledge base
│   ├── i18n/               # Multi-language support
│   ├── payment/            # Stripe integration
│   └── utils/              # User management utilities
├── uploads/                # User-uploaded images
├── docs/                   # Comprehensive documentation
├── index.html              # Main application interface
├── server.js               # Express.js server
├── config.js               # Configuration management
└── vercel.json             # Deployment configuration
```

## 🔧 API Endpoints

- `POST /api/analyze` - Core Feng Shui analysis
- `GET /api/user-status` - User statistics and fingerprinting
- `GET /api/system-stats` - System performance metrics
- `POST /api/feedback` - User feedback collection
- `GET /api/ai-stats` - AI performance monitoring
- `POST /api/ai-switch` - Runtime AI strategy configuration

## 🎯 Business Features

### User Management
- **Fingerprinting**: Privacy-friendly user identification
- **Usage Analytics**: Detailed behavior tracking
- **Rate Limiting**: Fair usage enforcement
- **Session Management**: Secure user sessions

### Monetization
- **Freemium Model**: Free basic analysis with premium upgrades
- **Stripe Integration**: Secure payment processing (Coming Soon)
- **Content Layering**: Tiered access to features
- **Upgrade Prompts**: Smooth conversion funnel

### Marketing
- **Email Collection**: Lead generation system
- **Event Tracking**: User behavior analytics
- **Social Sharing**: Built-in sharing capabilities
- **SEO Optimization**: Search engine visibility

## 🌟 Performance

- **Response Time**: < 3 seconds for basic analysis
- **Uptime**: 99.9% availability target
- **Scalability**: Horizontal scaling ready
- **Caching**: Intelligent response caching

## 🔒 Security

- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: DoS protection
- **Environment Variables**: Secure credential management
- **CORS Configuration**: Cross-origin security

## 📈 Analytics

- **User Metrics**: Daily/monthly active users
- **Conversion Tracking**: Free to paid conversion rates
- **Performance Monitoring**: AI response times and accuracy
- **Error Tracking**: Comprehensive error logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Feature Requests**: Submit via GitHub Discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek AI**: Advanced reasoning capabilities
- **Alibaba Qwen**: Speed-optimized AI processing
- **Traditional Feng Shui Masters**: Ancient wisdom foundation
- **Modern Architecture**: Contemporary application principles

---

**🎯 Ready for Production** | **🌍 Global Market** | **💎 Premium Quality**

Built with ❤️ for the global Feng Shui community