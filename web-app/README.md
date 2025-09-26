# MBA Expense Explorer

An interactive web application that allows MBA candidates to explore real expense data from an MBA student, with AI-powered insights and visualizations.

## 🎯 **Features**

- **Interactive Expense Explorer** - Filter and explore real MBA expense data
- **AI-Powered Q&A** - Ask natural language questions about spending patterns
- **Data Visualizations** - Charts and graphs showing spending trends
- **MBA-Specific Insights** - Tailored advice for business school budgeting
- **Real-Time Analysis** - Powered by LangChain and OpenAI GPT-4

## 🏗️ **Architecture**

```
Frontend: Next.js + React + TypeScript
Backend: FastAPI + Python + LangChain
Database: PostgreSQL + Vector DB
LLM: OpenAI GPT-4
Deployment: Vercel (frontend) + Railway (backend)
```

## 🚀 **Quick Start**

### **Backend Setup**

1. **Install dependencies:**
   ```bash
   cd web-app/backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file
   OPENAI_API_KEY=your_openai_api_key
   COPILOT_API_KEY=your_copilot_api_key
   DATABASE_URL=postgresql://user:pass@localhost/mba_expenses
   ```

3. **Run the backend:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### **Frontend Setup**

1. **Install dependencies:**
   ```bash
   cd web-app/frontend
   npm install
   ```

2. **Run the frontend:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📊 **Data Flow**

1. **Data Ingestion** - Sync from Copilot Money API
2. **Data Processing** - Categorize and enrich expense data
3. **LLM Processing** - Generate insights using LangChain
4. **Visualization** - Create interactive charts and graphs
5. **User Interface** - Present data through React components

## 🔧 **Key Components**

### **Backend Services**

- **`CopilotService`** - Syncs data from Copilot Money API
- **`DataService`** - Manages expense data and generates insights
- **`LLMService`** - Processes natural language queries using LangChain

### **Frontend Components**

- **Expense Explorer** - Interactive data table with filtering
- **AI Chat** - Natural language query interface
- **Visualizations** - Charts and graphs for data analysis
- **Insights Dashboard** - MBA-specific recommendations

## 🎨 **UI/UX Features**

- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Mode** - Toggle between themes
- **Interactive Charts** - Hover, zoom, and filter data
- **Real-Time Search** - Instant filtering and search
- **AI Chat Interface** - Conversational data exploration

## 📈 **Analytics & Insights**

- **Spending Trends** - Monthly and yearly patterns
- **Category Analysis** - Breakdown by expense type
- **Budget Recommendations** - AI-generated advice
- **MBA-Specific Tips** - Tailored for business school

## 🔐 **Security & Privacy**

- **Data Encryption** - All data encrypted in transit and at rest
- **API Authentication** - Secure API endpoints
- **Privacy Controls** - User can control data sharing
- **GDPR Compliant** - Follows data protection regulations

## 🚀 **Deployment**

### **Production Setup**

1. **Backend (Railway/Render):**
   ```bash
   # Deploy FastAPI app
   railway deploy
   ```

2. **Frontend (Vercel):**
   ```bash
   # Deploy Next.js app
   vercel deploy
   ```

3. **Database (PostgreSQL):**
   ```bash
   # Set up production database
   # Configure connection string
   ```

## 📝 **API Documentation**

Once running, visit:
- **Backend API**: `http://localhost:8000/docs`
- **Frontend**: `http://localhost:3000`

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🆘 **Support**

For questions or issues:
- Create an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [link-to-docs]
