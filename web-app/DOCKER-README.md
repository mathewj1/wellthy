# 🐳 Docker Setup for MBA Expense Explorer

This guide will help you run the MBA Expense Explorer using Docker for a consistent, production-like environment.

## 🚀 Quick Start

### 1. **Prerequisites**
- Docker Desktop installed and running
- Your transaction CSV file (place in `data/transactions.csv`)
- OpenAI API key

### 2. **Environment Setup**
Create a `.env` file in the `web-app` directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
COPILOT_API_KEY=your_copilot_api_key_here  # Optional
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. **Run the Application**
```bash
cd web-app
./run-docker.sh
```

**Or manually:**
```bash
docker-compose up --build
```

### 4. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs

## 🧪 Testing Your Venn Diagram System

### **Test the Interactive Tag Selection:**

1. **Open Frontend**: http://localhost:3000
2. **Ask for breakdown**: In the AI chat, type:
   ```
   "Show me spending breakdown by trip"
   ```
3. **AI will respond** with available tags:
   ```
   I can show you a spending breakdown! Which tag would you like to analyze?
   
   Available tags:
   1. Turkey '24 - $2,340 (23 transactions, 4 categories)
   2. Spain Conference - $1,850 (18 transactions, 5 categories)
   ...
   ```

4. **Select specific tag**:
   ```
   "Show me 'Turkey '24' breakdown"
   ```
5. **Get Venn diagram** showing category distribution

### **Test Backend API Directly:**

```bash
# Test health check
curl http://localhost:8000/health

# Test available tags
curl http://localhost:8000/transactions

# Test AI query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me spending breakdown"}'
```

## 🔧 Development Commands

### **View Logs**
```bash
docker-compose logs -f
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only
```

### **Rebuild Services**
```bash
docker-compose up --build
```

### **Stop Services**
```bash
docker-compose down
```

### **Clean Up**
```bash
docker-compose down -v  # Remove volumes
docker system prune     # Clean up unused images
```

## 📁 File Structure
```
web-app/
├── docker-compose.yml      # Orchestration
├── run-docker.sh          # Easy startup script
├── .env                   # Your API keys (create this)
├── data/
│   └── transactions.csv   # Your CSV data
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    └── ...
```

## 🚨 Troubleshooting

### **Port Conflicts**
If ports 3000 or 8000 are in use:
```bash
# Edit docker-compose.yml and change ports:
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### **Dependencies Issues**
```bash
# Rebuild with no cache
docker-compose build --no-cache
```

### **Data Not Loading**
- Ensure `data/transactions.csv` exists
- Check CSV format matches `CSV_FORMAT.md`
- Check backend logs: `docker-compose logs backend`

## 🌐 Production Deployment

This Docker setup is ready for production deployment to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **Railway/Render**
- **Any Docker-compatible platform**

Simply push to your container registry and deploy!

## ✨ Benefits of This Docker Setup

- ✅ **Consistent Environment** - Same on all machines
- ✅ **Easy Setup** - One command to run everything  
- ✅ **Production Ready** - Same containers in dev/prod
- ✅ **Isolated Dependencies** - No conflicts with local Python/Node
- ✅ **Health Checks** - Automatic service monitoring
- ✅ **Volume Mounting** - Data persists between restarts
