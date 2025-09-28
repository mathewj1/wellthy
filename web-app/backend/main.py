"""
MBA Expense Explorer - Backend API
A web application for MBA candidates to explore real expense data with LLM-powered insights.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from services.csv_service import CSVService
from services.llm_service import LLMService
from services.data_service import DataService
from models.transaction import Transaction, TransactionCategory, TransactionQuery, TransactionType

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(
    title="MBA Expense Explorer",
    description="Explore real MBA expense data with AI-powered insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
csv_service = CSVService()
data_service = DataService()
llm_service = LLMService(data_service=data_service)  # Inject data service

# Pydantic models for API
class QueryRequest(BaseModel):
    question: str
    context: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    answer: str
    visualizations: Optional[List[Dict[str, Any]]] = None
    data_points: Optional[List[Dict[str, Any]]] = None

# Using ExpenseQuery from models instead of defining here

# API Routes
@app.get("/")
async def root():
    return {"message": "MBA Expense Explorer API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/transactions", response_model=List[Transaction])
async def get_transactions(filters: TransactionQuery = Depends()):
    """Get transactions with optional filtering"""
    try:
        transactions = await data_service.get_transactions(filters)
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/categories", response_model=List[TransactionCategory])
async def get_categories():
    """Get all transaction categories"""
    try:
        categories = await data_service.get_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/summary")
async def get_transaction_summary(filters: TransactionQuery = Depends()):
    """Get transaction summary statistics"""
    try:
        summary = await data_service.get_transaction_summary(filters)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Backward compatibility endpoints
@app.get("/expenses", response_model=List[Transaction])
async def get_expenses(filters: TransactionQuery = Depends()):
    """Get transactions (backward compatibility)"""
    return await get_transactions(filters)

@app.get("/expenses/categories", response_model=List[TransactionCategory])
async def get_expense_categories():
    """Get transaction categories (backward compatibility)"""
    return await get_categories()

@app.get("/expenses/summary")
async def get_expense_summary(filters: TransactionQuery = Depends()):
    """Get transaction summary (backward compatibility)"""
    return await get_transaction_summary(filters)

@app.post("/query", response_model=QueryResponse)
async def query_expenses(request: QueryRequest):
    """Ask questions about expense data using LLM"""
    try:
        # Get relevant data based on query
        context_data = await data_service.get_context_for_query(request.question)
        
        # Generate LLM response
        response = await llm_service.process_query(
            question=request.question,
            context=context_data,
            additional_context=request.context
        )
        
        return QueryResponse(
            answer=response["answer"],
            visualizations=response.get("visualizations"),
            data_points=response.get("data_points")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights/mba-specific")
async def get_mba_insights():
    """Get MBA-specific expense insights and recommendations"""
    try:
        insights = await data_service.get_mba_insights()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/data/sync")
async def sync_csv_data():
    """Load data from CSV file"""
    try:
        transactions = csv_service.load_transactions_from_csv()
        return {"message": f"Data loaded successfully from CSV", "records": len(transactions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/upload")
async def upload_csv_data(file: UploadFile = File(...)):
    """Upload and process CSV file"""
    try:
        # Save uploaded file
        file_path = os.path.join("data", file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load and process the CSV
        transactions = csv_service.load_transactions_from_csv(file_path)
        
        return {"message": f"CSV uploaded and processed successfully", "records": len(transactions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/categories")
async def get_categories():
    """Get all categories and parent categories from the data"""
    try:
        transactions = data_service.get_transactions()
        
        categories = set()
        parent_categories = set()
        parent_to_children = {}
        category_counts = {}
        
        for t in transactions:
            cat = t.category
            parent_cat = t.parent_category
            
            categories.add(cat)
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
            if parent_cat:
                parent_categories.add(parent_cat)
                if parent_cat not in parent_to_children:
                    parent_to_children[parent_cat] = {}
                if cat not in parent_to_children[parent_cat]:
                    parent_to_children[parent_cat][cat] = 0
                parent_to_children[parent_cat][cat] += 1
        
        return {
            "categories": sorted(list(categories)),
            "parent_categories": sorted(list(parent_categories)),
            "hierarchy": {parent: dict(children) for parent, children in parent_to_children.items()},
            "category_counts": category_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data/sample-csv")
async def create_sample_csv():
    """Create a sample CSV file for reference"""
    try:
        file_path = csv_service.create_sample_csv()
        return {"message": "Sample CSV created", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
