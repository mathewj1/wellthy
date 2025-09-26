# MBA Expense Explorer - Project Overview

## 🎯 **Project Vision**

Transform your real MBA expense data into an interactive web application that helps prospective MBA candidates understand and plan their business school budgets through AI-powered insights and visualizations.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Data Sources  │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Copilot API) │
│                 │    │                 │    │                 │
│ • React UI      │    │ • LangChain     │    │ • Real Expense  │
│ • TypeScript    │    │ • OpenAI GPT-4  │    │   Data          │
│ • Tailwind CSS  │    │ • Data Analysis │    │ • Categorized   │
│ • Recharts      │    │ • FastAPI       │    │   Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Key Features**

### **1. Interactive Data Explorer**
- **Real Expense Data** - Your actual MBA spending patterns
- **Smart Filtering** - Search by category, date, amount, merchant
- **Visual Analytics** - Charts, graphs, and trend analysis
- **Responsive Design** - Works on desktop and mobile

### **2. AI-Powered Q&A**
- **Natural Language Queries** - "How much did I spend on textbooks?"
- **Intelligent Responses** - Context-aware answers with data
- **Visual Insights** - Charts generated from your questions
- **MBA-Specific Advice** - Tailored recommendations

### **3. Data Visualization**
- **Category Breakdown** - Pie charts of spending by type
- **Monthly Trends** - Bar charts showing spending over time
- **Merchant Analysis** - Top spending locations
- **Budget Recommendations** - AI-generated insights

## 🔧 **Technical Stack**

### **Frontend (Next.js + React)**
```typescript
// Key Technologies
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Recharts - Data visualization
- Lucide React - Icons
- Axios - API calls
- React Query - Data fetching
```

### **Backend (FastAPI + Python)**
```python
# Key Technologies
- FastAPI - Web framework
- LangChain - LLM orchestration
- OpenAI GPT-4 - Language model
- Pandas - Data analysis
- SQLAlchemy - Database ORM
- Pydantic - Data validation
```

### **Data Processing**
```python
# Data Flow
1. Copilot API → Raw transactions
2. Data Service → Categorization & enrichment
3. LLM Service → AI insights & Q&A
4. Frontend → Interactive visualization
```

## 📊 **Data Categories**

### **MBA-Specific Categories**
- **Tuition & Fees** - Academic costs
- **Books & Supplies** - Textbooks, case studies
- **Housing** - Rent, utilities
- **Food & Dining** - Groceries, restaurants
- **Transportation** - Gas, public transit
- **Networking** - Professional events
- **Entertainment** - Social activities
- **Health & Wellness** - Healthcare, gym
- **Technology** - Software, hardware
- **Travel** - Business trips, conferences

## 🤖 **AI Capabilities**

### **LangChain Integration**
```python
# AI Tools
- Expense Analyzer - Data analysis
- Data Visualizer - Chart generation
- MBA Advisor - Financial advice
- Query Processor - Natural language understanding
```

### **Query Examples**
- "Show me my biggest expense categories"
- "How much should I budget for networking events?"
- "What was my average monthly food spending?"
- "Compare my fall vs spring semester expenses"

## 🚀 **Getting Started**

### **Quick Start**
```bash
# 1. Clone and setup
git clone <your-repo>
cd web-app

# 2. Start both servers
./start.sh

# 3. Open in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### **Environment Setup**
```bash
# Backend (.env)
OPENAI_API_KEY=your_openai_key
COPILOT_API_KEY=your_copilot_key
DATABASE_URL=postgresql://...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📈 **Development Roadmap**

### **Phase 1: Core Features** ✅
- [x] Basic web app structure
- [x] FastAPI backend with LangChain
- [x] React frontend with data visualization
- [x] Copilot API integration
- [x] AI-powered Q&A system

### **Phase 2: Enhanced Features** 🚧
- [ ] User authentication
- [ ] Data persistence (PostgreSQL)
- [ ] Advanced visualizations
- [ ] Export functionality
- [ ] Mobile optimization

### **Phase 3: Advanced AI** 🔮
- [ ] LangGraph for complex reasoning
- [ ] Vector database for context
- [ ] Multi-modal responses
- [ ] Predictive analytics
- [ ] Budget recommendations

## 🎨 **UI/UX Design**

### **Design Principles**
- **Clean & Modern** - Professional appearance
- **Data-Focused** - Clear information hierarchy
- **Interactive** - Engaging user experience
- **Accessible** - Inclusive design
- **Responsive** - Works on all devices

### **Color Scheme**
```css
Primary: Blue (#3B82F6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Error: Red (#EF4444)
Background: Gray (#F9FAFB)
Text: Gray (#111827)
```

## 🔐 **Security & Privacy**

### **Data Protection**
- **Local Processing** - Data stays on your servers
- **Encryption** - All data encrypted in transit
- **Access Control** - Secure API endpoints
- **Privacy Controls** - User controls data sharing

### **API Security**
- **Authentication** - Secure API keys
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize all inputs
- **CORS** - Configured for security

## 📊 **Performance**

### **Optimization Strategies**
- **Lazy Loading** - Load data on demand
- **Caching** - Redis for API responses
- **CDN** - Static asset delivery
- **Database Indexing** - Optimized queries
- **Code Splitting** - Smaller bundle sizes

## 🚀 **Deployment**

### **Production Setup**
```bash
# Backend (Railway/Render)
railway deploy

# Frontend (Vercel)
vercel deploy

# Database (PostgreSQL)
# Configure production database
```

### **Environment Variables**
```bash
# Production
OPENAI_API_KEY=prod_key
COPILOT_API_KEY=prod_key
DATABASE_URL=prod_db_url
SECRET_KEY=prod_secret
```

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Code Standards**
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Testing** - Unit and integration tests

## 📚 **Documentation**

### **API Documentation**
- **Swagger UI** - http://localhost:8000/docs
- **OpenAPI Spec** - Available for download
- **Code Examples** - In repository

### **User Guide**
- **Getting Started** - Quick setup guide
- **Feature Overview** - Detailed feature descriptions
- **FAQ** - Common questions and answers

## 🆘 **Support**

### **Getting Help**
- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides
- **Community** - Discord/Slack for discussions

### **Troubleshooting**
- **Common Issues** - Known problems and solutions
- **Debug Mode** - Detailed logging
- **Performance** - Optimization tips

---

**Built with ❤️ for MBA candidates and data enthusiasts**
