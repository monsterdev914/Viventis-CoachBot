# Viventis CoachBot 🤖

A sophisticated AI-powered coaching platform that provides personalized guidance and support through an intelligent chatbot interface. Built with modern web technologies and featuring comprehensive admin management tools.

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Coaching**: Advanced conversational AI using LangChain and OpenAI for personalized coaching sessions
- **Real-time Chat Interface**: Seamless messaging with streaming responses and message editing
- **Multi-language Support**: English and German localization with draggable language switcher
- **Subscription Management**: Flexible pricing plans with trial, paid, and upgrade options
- **User Authentication**: Secure login/registration with email verification and JWT tokens

### 🛠 **Admin Panel**
- **Dashboard Analytics**: Real-time user metrics, revenue tracking, and growth statistics with charts
- **Bot Configuration**: Customize AI model settings, prompts, and behavior parameters
- **Knowledge Base Management**: Upload and manage documents (PDF, Word) for AI training
- **User Management**: View, edit, and manage user accounts, subscriptions, and profiles
- **Content Moderation**: Monitor conversations and manage chat history
- **Custom User Prompts**: Create and manage user-specific AI prompts

### 📱 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with modern UI
- **Floating Language Switcher**: Intuitive draggable language selection on mobile
- **Real-time Message Editing**: Edit messages and regenerate AI responses inline
- **Chat History**: Persistent conversation storage with chat management features
- **Subscription Integration**: Seamless payment processing with Stripe and payment method management
- **Protected Routes**: Subscription-based access control for premium features

## 🚀 Tech Stack

### **Frontend**
- **Framework**: Next.js 15.3.1 with App Router
- **UI Library**: HeroUI (NextUI) 2.7.8
- **Styling**: Tailwind CSS 3.4.16
- **State Management**: React Context API
- **Internationalization**: react-i18next 15.5.1
- **Animations**: Framer Motion 11.13.1
- **Payment UI**: @stripe/react-stripe-js 3.7.0
- **Charts**: Recharts 2.15.3
- **TypeScript**: 5.6.3 with full type safety

### **Backend**
- **Runtime**: Node.js with Express 4.21.2
- **Database**: Supabase 2.49.1 (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **AI Integration**: LangChain 0.3.27 + OpenAI 4.103.0
- **Payment Processing**: Stripe 17.7.0
- **File Processing**: Mammoth, PDF-parse for document handling
- **API**: RESTful endpoints with TypeScript 5.8.2

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
- OpenAI API key for AI features

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
│   │   ├── lib/              # LangChain integration
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
# Database & Authentication
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_jwt_secret

# AI Integration
OPENAI_API_KEY=sk-...

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...

# Server Configuration
PORT=3001
DATABASE_URL=your_database_connection_string
```

## 🔄 Supabase Migration Guide

### **Migrating to Another Supabase Project**

This guide helps you migrate your existing Viventis CoachBot data and schema from one Supabase project to another (e.g., from development to production).

#### **Prerequisites**
- Supabase CLI installed (`npm install -g supabase`)
- Access to both source and destination Supabase projects
- Database passwords for both projects

#### **Step 1: Backup Current Project**

```bash
# 1. Initialize Supabase in your project (if not already done)
supabase init

# 2. Link to your source project
supabase link --project-ref YOUR_SOURCE_PROJECT_ID

# 3. Pull the current schema
supabase db pull --schema public,auth,storage

# 4. Export your data (optional - for data migration)
supabase db dump --data-only > backup_data.sql
```

#### **Step 2: Create New Supabase Project**

1. **Create New Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project initialization

2. **Note New Project Details**:
   - Project URL: `https://your-new-project.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **Step 3: Migrate Schema**

```bash
# 1. Unlink from source project
supabase unlink

# 2. Link to new destination project
supabase link --project-ref YOUR_NEW_PROJECT_ID

# 3. Push schema to new project
supabase db push

# 4. Verify migration
supabase db diff
```

#### **Step 4: Migrate Data (Optional)**

```bash
# Option 1: Using Supabase CLI (recommended for small datasets)
supabase db reset --linked # This will apply migrations and seed data

# Option 2: Manual data migration (for large datasets)
# Connect to source database and export specific tables
pg_dump "postgresql://postgres:password@db.source-project.supabase.co:5432/postgres" \
  --data-only \
  --table=public.users \
  --table=public.chats \
  --table=public.messages \
  --table=public.subscriptions \
  > production_data.sql

# Import to destination database
psql "postgresql://postgres:password@db.new-project.supabase.co:5432/postgres" \
  < production_data.sql
```

#### **Step 5: Update Configuration**

1. **Update Environment Variables**:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key

# Backend (.env)
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

2. **Update Supabase Client Configuration**:

```typescript
// frontend/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### **Step 6: Configure Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies (example for users table)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Add similar policies for other tables
```

#### **Step 7: Configure Storage**

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('avatars', 'avatars', true);

-- Set storage policies
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');
```

#### **Step 8: Update Stripe Webhook**

If you're using Stripe webhooks, update the endpoint URL:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Webhooks
3. Update the endpoint URL to point to your new backend
4. Test the webhook connection

#### **Step 9: Test Migration**

```bash
# 1. Start your application
npm run dev

# 2. Test key functionalities:
# - User registration and login
# - Chat functionality
# - Subscription management
# - Admin dashboard
# - Document upload

# 3. Check database connections
supabase db ping
```

#### **Step 10: Update DNS/Domain (Production)**

For production deployments:

```bash
# 1. Update your domain's DNS records
# 2. Configure SSL certificates
# 3. Update CORS settings in Supabase dashboard
# 4. Update redirect URLs for authentication
```

### **Migration Troubleshooting**

#### **Common Issues**

1. **Permission Errors**:
   ```bash
   # Ensure you have the correct service role key
   supabase db pull --schema public,auth,storage
   ```

2. **Schema Differences**:
   ```bash
   # Check for differences
   supabase db diff
   
   # Reset if needed
   supabase db reset --linked
   ```

3. **Data Migration Failures**:
   ```bash
   # Check for foreign key constraints
   # Migrate data in correct order (users first, then dependent tables)
   ```

4. **Authentication Issues**:
   ```bash
   # Verify JWT secret and auth settings
   # Check redirect URLs in Supabase dashboard
   ```

#### **Rollback Plan**

If migration fails:

```bash
# 1. Keep source project active
# 2. Update environment variables back to source
# 3. Test application functionality
# 4. Investigate and fix issues before retry
```

### **Best Practices**

1. **Test in Staging**: Always test migration in a staging environment first
2. **Backup Everything**: Create complete backups before starting
3. **Incremental Migration**: For large datasets, consider incremental migration
4. **Monitor Performance**: Check query performance after migration
5. **Update Documentation**: Keep environment documentation updated

### **Post-Migration Checklist**

- [ ] All environment variables updated
- [ ] Database schema migrated successfully
- [ ] Data integrity verified
- [ ] Authentication working
- [ ] Stripe webhooks updated
- [ ] Storage buckets configured
- [ ] RLS policies applied
- [ ] Admin access verified
- [ ] Application functionality tested
- [ ] Performance monitoring enabled

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
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout
- `POST /api/auth/resend-verification` - Resend email verification
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/change-password` - Change user password (protected)
- `DELETE /api/auth/delete-account` - Delete user account (protected)

### **Chat Endpoints**
- `GET /api/chats` - Get user's chat history (protected, requires subscription)
- `POST /api/chats` - Create new chat (protected, requires subscription)
- `GET /api/chats/:chatId` - Get specific chat (protected, requires subscription)
- `GET /api/chats/:chatId/messages` - Get chat messages (protected, requires subscription)
- `POST /api/chats/:chatId/messages` - Send new message (protected, requires subscription)
- `PUT /api/chats/:chatId` - Update chat (protected, requires subscription)
- `PUT /api/chats/:chatId/messages/:messageId` - Update message (protected, requires subscription)
- `DELETE /api/chats/:chatId/messages/:messageId` - Delete message (protected, requires subscription)
- `DELETE /api/chats/:chatId` - Delete chat (protected, requires subscription)
- `POST /api/chat/stream` - Stream chat response (protected, requires subscription)

### **User Management Endpoints**
- `GET /api/userProfile` - Get current user profile (protected)
- `PUT /api/userProfile` - Update user profile (protected)
- `GET /api/userProfile/all` - Get all users (admin only)
- `PUT /api/userProfile/:userId` - Update user profile by admin (admin only)

### **Subscription & Payment Endpoints**
- `GET /api/stripe/prices` - Get available prices
- `GET /api/stripe/plans` - Get subscription plans
- `GET /api/stripe/subscriptions/current` - Get current subscription (protected)
- `POST /api/stripe/subscriptions` - Create subscription (protected)
- `DELETE /api/stripe/subscriptions/:subscriptionId` - Cancel subscription (protected)
- `GET /api/stripe/subscriptions/:userId` - Get user subscription (protected)
- `POST /api/stripe/upgrade` - Upgrade subscription (protected)
- `POST /api/stripe/convert-trial` - Convert trial to paid (protected)
- `GET /api/stripe/payments` - Get payment history (protected)
- `GET /api/stripe/payment-methods` - Get payment methods (protected)
- `POST /api/stripe/sync-payment-methods` - Sync payment methods (protected)

### **Admin Endpoints**
- `GET /api/analytics/dashboard` - Get dashboard metrics (admin only)
- `GET /api/analytics/user-growth` - Get user growth data (admin only)
- `GET /api/analytics/revenue` - Get revenue metrics (admin only)
- `GET /api/bot-settings` - Get bot settings (admin only)
- `POST /api/bot-settings` - Update bot configuration (admin only)
- `GET /api/documents` - Get knowledge base documents (admin only)
- `POST /api/documents` - Upload documents (admin only)
- `GET /api/documents/queue-status` - Get document processing queue status (admin only)
- `DELETE /api/documents/:id` - Delete document (admin only)
- `GET /api/user-prompts` - Get all user prompts (admin only)
- `POST /api/user-prompts` - Create user prompt (admin only)
- `GET /api/user-prompts/user/:userId` - Get user's prompts (admin only)
- `GET /api/user-prompts/:promptId` - Get specific prompt (admin only)
- `PUT /api/user-prompts/:promptId` - Update user prompt (admin only)
- `DELETE /api/user-prompts/:promptId` - Delete user prompt (admin only)

### **Webhook Endpoints**
- `POST /api/webhook/stripe` - Stripe webhook handler

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

- [x] **Advanced Analytics**: Real-time dashboard with charts ✅
- [x] **AI Chat Integration**: LangChain + OpenAI streaming responses ✅
- [x] **Document Processing**: PDF and Word document knowledge base ✅
- [x] **Subscription Management**: Complete Stripe integration with trials ✅
- [x] **Admin Dashboard**: Full admin panel with user management ✅
- [ ] **Mobile App**: React Native mobile application
- [ ] **Voice Features**: Voice-to-text and text-to-voice capabilities
- [ ] **Enhanced AI Models**: Support for multiple AI providers and models
- [ ] **API Integrations**: Calendar, CRM, and productivity tools
- [ ] **White-label Solution**: Customizable branding options
- [ ] **Multi-tenant Architecture**: Support for multiple organizations
- [ ] **Advanced Analytics**: ML-powered insights and recommendations

## 👥 Team

- **Adrian Müller** - Founder & Expert Coach
- **Development Team** - Full-stack developers
- **Design Team** - UX/UI specialists

---

**Built with ❤️ by the Viventis Team**

*Empowering personal and professional growth through AI-powered coaching.* 