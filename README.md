# Ormi Property Management SaaS

A modern Property Management SaaS application designed for small-to-mid landlords and boutique property managers.

## 🔐 Security Notice

**⚠️ IMPORTANT: This application uses JWT authentication with secure secrets. Never use default or weak JWT secrets in production.**

Before deploying, generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

See [SECURITY.md](SECURITY.md) for complete security guidelines.

## 🏗️ Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **ShadCN UI** components
- **React Query** for API data fetching and caching
- **React Hook Form** for form management
- **Zod** for validation

### Backend
- **Node.js** with Express and TypeScript
- **Prisma ORM** with PostgreSQL (Supabase)
- **JWT** authentication with bcrypt
- **Stripe** for subscription billing
- **Cloudflare Workers** ready

### DevOps
- **ESLint** and **Prettier** for code quality
- **GitHub Actions** for CI/CD
- **Docker** for containerization
- **Cloudflare Pages** (frontend) and **Cloudflare Workers** (backend)

## 🚀 Features

### MVP Features
- **Dashboard** - Key metrics and quick actions
- **Properties & Units** - Complete property and unit management
- **Tenants** - Tenant information and lease management
- **Rent Management** - Payment tracking with Stripe integration
- **Maintenance Requests** - Request submission and tracking
- **Reporting** - Financial and operational reports
- **User Management** - Role-based access control

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- PostgreSQL database (or Supabase account)
- Stripe account for payments

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ormi-property-management
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example backend/.env
```

**⚠️ SECURITY CRITICAL:** Edit `backend/.env` and generate a secure JWT secret:
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Set up the database
```bash
cd backend
npx prisma db push
npx prisma generate
```

5. Start the development servers
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## 🔧 Environment Variables

See `env.example` for all required environment variables.

### Critical Security Variables
- `JWT_SECRET` - **MUST** be 64+ characters, cryptographically secure
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Frontend Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🚀 Deployment

### Cloudflare Deployment

#### Prerequisites
1. Install Wrangler CLI: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Set up Cloudflare account and zones

#### Quick Deploy
```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to development
./scripts/deploy.sh development
```

#### Manual Deployment

**Backend (Cloudflare Workers):**
```bash
cd backend

# Set production secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put STRIPE_SECRET_KEY --env production

# Deploy
wrangler deploy --env production
```

**Frontend (Cloudflare Pages):**
- Connect repository to Cloudflare Pages
- Configure build settings:
  - Build command: `npm run build:frontend`
  - Output directory: `frontend/dist`
- Set environment variables in Cloudflare dashboard

### GitHub Actions Deployment

The project includes automated CI/CD via GitHub Actions:

1. **Required GitHub Secrets:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Deployment Triggers:**
   - `main` branch → Production deployment
   - `develop` branch → Development deployment

## 📊 API Documentation

API documentation is available at `/api/docs` when running the backend in development mode.

## 🧪 Testing

Run tests for both frontend and backend:
```bash
npm test
```

## 🔒 Security

### JWT Security
- Uses cryptographically secure random secrets
- Tokens expire after 7 days
- Secure token validation on all protected routes

### Database Security
- Connection pooling with secure credentials
- Query parameterization prevents SQL injection
- Multi-tenant data isolation

### API Security
- Helmet.js security headers
- CORS restrictions
- Rate limiting (100 requests/15 minutes)
- Input validation with Zod schemas

**For complete security guidelines, see [SECURITY.md](SECURITY.md)**

## 📁 Project Structure

```
ormi-property-management/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema
│   ├── wrangler.toml       # Cloudflare Workers config
│   └── package.json
├── scripts/                 # Deployment scripts
├── .github/workflows/       # GitHub Actions
├── SECURITY.md             # Security guidelines
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Follow security guidelines
7. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check README.md and SECURITY.md
- **Issues**: Create a GitHub issue
- **Security**: Email security@ormi.com
- **General**: Contact support@ormi.com 