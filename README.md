# Viventis CoachBot 🤖

A sophisticated AI-powered coaching platform that provides personalized guidance and support through an intelligent chatbot interface. Built with modern web technologies and featuring comprehensive admin management tools.

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Coaching**: Advanced conversational AI for personalized coaching sessions
- **Real-time Chat Interface**: Seamless messaging with streaming responses
- **Multi-language Support**: English and German localization
- **Subscription Management**: Flexible pricing plans with trial and paid options
- **User Authentication**: Secure login/registration with email verification

### 🛠 **Admin Panel**
- **Dashboard Analytics**: User metrics, revenue tracking, and growth statistics
- **Bot Configuration**: Customize AI model settings, prompts, and behavior
- **Knowledge Base Management**: Upload and manage documents for AI training
- **User Management**: View, edit, and manage user accounts and subscriptions
- **Content Moderation**: Monitor conversations and manage chat history

### 📱 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Draggable Language Switcher**: Intuitive language selection on mobile
- **Real-time Message Editing**: Edit messages and regenerate AI responses
- **Chat History**: Persistent conversation storage and retrieval
- **Subscription Integration**: Seamless payment processing with Stripe

## 🚀 Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **UI Library**: HeroUI (NextUI)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Internationalization**: react-i18next
- **Animations**: Framer Motion
- **TypeScript**: Full type safety

### **Backend**
- **Runtime**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Custom streaming chat API
- **Payment Processing**: Stripe
- **File Management**: Document upload and processing
- **API**: RESTful endpoints with TypeScript

### **Infrastructure**
- **Hosting**: Vercel (Frontend) + Backend deployment
- **Database**: Supabase cloud PostgreSQL
- **Storage**: Supabase Storage for documents
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in analytics and error tracking

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account for payments
- OpenAI or compatible AI API key

## 🛠 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/viventis-coachbot.git
cd viventis-coachbot
```

### 2. Frontend Setup
```bash
cd front-end
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_API_URL=your_backend_url
```

### 3. Backend Setup
```bash
cd ../back-end
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 4. Database Setup
```bash
# Run Supabase migrations (if available)
npx supabase db reset

# Or manually create tables using the SQL schema
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend
cd back-end
npm run dev

# Terminal 2: Frontend
cd front-end
npm run dev
```

## 📁 Project Structure

```
viventis-coachbot/
├── front-end/                 # Next.js frontend application
│   ├── app/                   # App router pages
│   │   ├── (user)/           # User-facing pages
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── chat/         # Chat interface
│   │   │   ├── pricing/      # Subscription plans
│   │   │   └── settings/     # User settings
│   │   ├── admin/            # Admin panel
│   │   │   ├── (protected)/  # Protected admin routes
│   │   │   └── login/        # Admin authentication
│   │   └── api/              # API route handlers
│   ├── components/           # Reusable React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── auth/             # Authentication components
│   │   └── chat/             # Chat interface components
│   ├── contexts/             # React Context providers
│   ├── lib/                  # Utility libraries
│   ├── public/               # Static assets
│   │   ├── locales/          # Translation files
│   │   ├── images/           # Images and icons
│   │   └── flags/            # Language flag icons
│   └── styles/               # Global styles
├── back-end/                 # Express.js backend
│   ├── src/                  # Source code
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── lib/              # External service integrations
│   │   ├── types/            # TypeScript type definitions
│   │   └── router/           # Route definitions
│   └── database/             # Database migrations
└── README.md                 # Project documentation
```

## 🔧 Configuration

### **Environment Variables**

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
JWT_SECRET=your_random_jwt_secret
PORT=3001
DATABASE_URL=your_database_connection_string
```

## 🌐 Deployment

### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Backend (Your Choice)**
- **Railway**: Connect GitHub repo and deploy
- **Heroku**: Use Heroku CLI or GitHub integration
- **DigitalOcean**: Deploy using App Platform
- **AWS/GCP**: Use container services or serverless

### **Database**
- Supabase handles hosting and scaling automatically
- Configure RLS (Row Level Security) policies
- Set up database backups and monitoring

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Sensitive data protection

## 🌍 Internationalization

The application supports multiple languages:
- **English** (default)
- **German** (Deutsch)

### Adding New Languages
1. Create translation files in `public/locales/[lang]/`
2. Add language option to language switcher
3. Update i18n configuration

## 📊 Analytics & Monitoring

- **User Analytics**: Track user engagement and retention
- **Revenue Metrics**: Monitor subscription performance
- **Chat Analytics**: Analyze conversation patterns
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Response times and usage statistics

## 🧪 Testing

```bash
# Frontend tests
cd front-end
npm run test

# Backend tests
cd back-end
npm run test

# E2E tests
npm run test:e2e
```

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `POST /auth/signout` - User logout
- `POST /auth/verify` - Email verification

### **Chat Endpoints**
- `GET /chats` - Get user's chat history
- `POST /chats` - Create new chat
- `GET /chats/:id/messages` - Get chat messages
- `POST /messages` - Send new message
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

### **Admin Endpoints**
- `GET /admin/users` - Get all users
- `GET /admin/analytics` - Get dashboard metrics
- `POST /admin/bot-settings` - Update bot configuration
- `GET /admin/documents` - Get knowledge base documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@viventis.com
- **Discord**: Join our community server

## 🚀 Roadmap

- [ ] **Mobile App**: React Native mobile application
- [ ] **Voice Chat**: Voice-to-text and text-to-voice features
- [ ] **Advanced Analytics**: ML-powered insights
- [ ] **Third-party Integrations**: Calendar, CRM, and productivity tools
- [ ] **White-label Solution**: Customizable branding options
- [ ] **API Marketplace**: Third-party plugin ecosystem

## 👥 Team

- **Adrian Müller** - Founder & Expert Coach
- **Development Team** - Full-stack developers
- **Design Team** - UX/UI specialists

---

**Built with ❤️ by the Viventis Team**

*Empowering personal and professional growth through AI-powered coaching.* 