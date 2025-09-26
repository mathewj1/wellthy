"""
Enhanced Copilot Money API Service
Based on the original whoop_copilot implementation but optimized for the web app
"""

import httpx
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..utils.config import load_env, get_required_env, get_env


class CopilotServiceV2:
    """Enhanced service for interacting with Copilot Money API"""
    
    def __init__(self):
        load_env()
        self.api_key = get_required_env("COPILOT_API_KEY")
        self.base_url = get_env("COPILOT_API_URL", "https://api.copilot.money")
        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
    
    async def sync_all_data(self) -> Dict[str, int]:
        """Sync all data from Copilot Money API"""
        try:
            # Sync accounts
            accounts = await self.get_accounts()
            
            # Sync transactions
            transactions = await self.get_transactions()
            
            # Process and store data
            processed_transactions = await self._process_transactions(transactions)
            
            return {
                "accounts": len(accounts),
                "transactions": len(processed_transactions),
                "status": "success"
            }
            
        except Exception as e:
            raise Exception(f"Failed to sync data: {str(e)}")
    
    async def get_accounts(self) -> List[Dict[str, Any]]:
        """Get all financial accounts"""
        try:
            response = await self.client.get(f"{self.base_url}/v1/accounts")
            response.raise_for_status()
            data = response.json()
            return data.get("accounts", [])
        except Exception as e:
            print(f"Error fetching accounts: {e}")
            return []
    
    async def get_transactions(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get transactions with optional date filtering"""
        try:
            params = {"limit": 100}
            if start_date:
                params["start_date"] = start_date
            if end_date:
                params["end_date"] = end_date
            
            response = await self.client.get(f"{self.base_url}/v1/transactions", params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("transactions", [])
        except Exception as e:
            print(f"Error fetching transactions: {e}")
            return []
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Get transaction categories"""
        try:
            response = await self.client.get(f"{self.base_url}/v1/categories")
            response.raise_for_status()
            data = response.json()
            return data.get("categories", [])
        except Exception as e:
            print(f"Error fetching categories: {e}")
            return []
    
    async def get_insights(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Get spending insights and analytics"""
        try:
            params = {}
            if start_date:
                params["start_date"] = start_date
            if end_date:
                params["end_date"] = end_date
            
            response = await self.client.get(f"{self.base_url}/v1/insights", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching insights: {e}")
            return {}
    
    async def _process_transactions(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process and categorize transactions for MBA expense tracking"""
        processed = []
        
        for transaction in transactions:
            # Map Copilot categories to MBA categories
            mba_category = self._map_to_mba_category(transaction)
            
            # Extract relevant information
            processed_transaction = {
                "id": transaction.get("id"),
                "amount": abs(float(transaction.get("amount", 0))),  # Make positive
                "description": transaction.get("description", ""),
                "category": mba_category,
                "date": self._parse_date(transaction.get("date")),
                "merchant": transaction.get("merchant", ""),
                "account": transaction.get("account_name", ""),
                "tags": self._generate_tags(transaction, mba_category),
                "notes": transaction.get("notes", ""),
                "original_category": transaction.get("category", ""),
                "source": "copilot"
            }
            
            processed.append(processed_transaction)
        
        return processed
    
    def _map_to_mba_category(self, transaction: Dict[str, Any]) -> str:
        """Map Copilot categories to MBA-specific categories"""
        original_category = transaction.get("category", "").lower()
        description = transaction.get("description", "").lower()
        merchant = transaction.get("merchant", "").lower()
        
        # Tuition and academic fees
        if any(keyword in description for keyword in ["tuition", "fee", "registration", "enrollment"]):
            return "tuition"
        
        # Books and supplies
        if any(keyword in description for keyword in ["book", "textbook", "supplies", "case study", "materials"]):
            return "books_supplies"
        
        # Housing
        if any(keyword in description for keyword in ["rent", "housing", "apartment", "utilities", "electric", "water", "gas"]):
            return "housing"
        
        # Food
        if any(keyword in description for keyword in ["food", "restaurant", "grocery", "dining", "coffee", "lunch", "dinner"]):
            return "food"
        
        # Transportation
        if any(keyword in description for keyword in ["gas", "fuel", "transport", "uber", "lyft", "parking", "metro", "bus"]):
            return "transportation"
        
        # Networking
        if any(keyword in description for keyword in ["networking", "conference", "event", "club", "association", "professional"]):
            return "networking"
        
        # Entertainment
        if any(keyword in description for keyword in ["entertainment", "movie", "theater", "sports", "recreation"]):
            return "entertainment"
        
        # Health
        if any(keyword in description for keyword in ["health", "medical", "gym", "fitness", "doctor", "pharmacy"]):
            return "health"
        
        # Technology
        if any(keyword in description for keyword in ["software", "hardware", "computer", "tech", "subscription", "app"]):
            return "technology"
        
        # Travel
        if any(keyword in description for keyword in ["travel", "flight", "hotel", "airbnb", "trip", "vacation"]):
            return "travel"
        
        # Default to other
        return "other"
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            if isinstance(date_str, str):
                # Try different date formats
                for fmt in ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"]:
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
            return datetime.now()
        except:
            return datetime.now()
    
    def _generate_tags(self, transaction: Dict[str, Any], mba_category: str) -> List[str]:
        """Generate relevant tags for the transaction"""
        tags = [mba_category]
        
        description = transaction.get("description", "").lower()
        merchant = transaction.get("merchant", "").lower()
        
        # Add specific tags based on content
        if "textbook" in description:
            tags.append("textbook")
        if "case" in description:
            tags.append("case_study")
        if "networking" in description:
            tags.append("networking")
        if "conference" in description:
            tags.append("conference")
        if "club" in description:
            tags.append("club")
        
        # Add semester tags based on date
        date = self._parse_date(transaction.get("date", ""))
        if date.month in [8, 9, 10, 11, 12]:
            tags.append("fall")
        elif date.month in [1, 2, 3, 4, 5]:
            tags.append("spring")
        elif date.month in [6, 7]:
            tags.append("summer")
        
        return tags
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
