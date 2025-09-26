# MBA Expense Explorer

An interactive web application that allows MBA candidates to explore real expense data from an MBA student, with AI-powered insights and visualizations.

## 🎯 **What This Is**

A full-stack web application that transforms your real MBA expense data into an interactive platform where prospective MBA candidates can:
- Explore actual spending patterns from a real MBA student
- Ask AI-powered questions about budgeting and expenses
- Visualize spending trends and categories
- Get MBA-specific financial advice and insights

## 🏗️ **Architecture**

```
Frontend: Next.js + React + TypeScript + Tailwind CSS
Backend: FastAPI + Python + LangChain + OpenAI GPT-4
Data: Real Copilot Money expense data with MBA categorization
```

## 🚀 **Quick Start**

### **Option 1: Use the Startup Script**
```bash
cd web-app
./start.sh
```

### **Option 2: Manual Setup**

**Backend:**
```bash
cd web-app/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd web-app/frontend
npm install
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📊 **Key Features**

- **Interactive Expense Explorer** - Filter and explore real MBA expense data
- **AI-Powered Q&A** - Ask natural language questions about spending patterns
- **Data Visualizations** - Charts and graphs showing spending trends
- **MBA-Specific Insights** - Tailored advice for business school budgeting
- **Real-Time Analysis** - Powered by LangChain and OpenAI GPT-4

## 🔧 **Environment Setup**

Create a `.env` file in `web-app/backend/`:
```bash
OPENAI_API_KEY=your_openai_api_key
COPILOT_API_KEY=your_copilot_api_key
DATABASE_URL=postgresql://user:pass@localhost/mba_expenses
```

## 📁 **Project Structure**

```
web-app/
├── backend/          # FastAPI backend with LangChain
├── frontend/         # Next.js React frontend
├── data/            # Data storage and processing
└── docs/            # Privacy policy and documentation
```

## 🎨 **Technologies Used**

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python, LangChain, OpenAI GPT-4
- **Data**: Pandas, SQLAlchemy, Copilot Money API
- **AI**: LangChain, OpenAI GPT-4, Natural Language Processing

## 📈 **Data Categories**

- Tuition & Fees
- Books & Supplies  
- Housing
- Food & Dining
- Transportation
- Networking
- Entertainment
- Health & Wellness
- Technology
- Travel

## 🤖 **AI Capabilities**

- Natural language queries about expenses
- Intelligent data analysis and insights
- MBA-specific financial advice
- Automated data visualization generation
- Context-aware responses

## 🚀 **Deployment**

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway or Render
- **Database**: PostgreSQL on Railway or Supabase

## 📚 **Documentation**

- **Project Overview**: `web-app/PROJECT_OVERVIEW.md`
- **API Documentation**: http://localhost:8000/docs
- **Privacy Policy**: `docs/privacy-policy.html`
