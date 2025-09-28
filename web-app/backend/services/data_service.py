"""
Data Service for managing expense data and generating insights
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from models.transaction import Transaction, TransactionCategory, TransactionSummary, MBAInsight, TransactionQuery, TransactionType
import json

class DataService:
    """Service for managing and analyzing expense data"""
    
    def __init__(self):
        self.transactions: List[Transaction] = []
        self.categories = self._initialize_categories()
    
    def _initialize_categories(self) -> List[TransactionCategory]:
        """Initialize categories dynamically from actual data"""
        # This will be populated from actual transaction data
        return []
    
    async def get_transactions(self, filters: TransactionQuery) -> List[Transaction]:
        """Get transactions with optional filtering"""
        # Load transaction data
        transactions = self._load_transaction_data()
        
        # Apply filters
        if not filters.include_excluded:
            transactions = [t for t in transactions if not t.excluded]
        
        if filters.start_date:
            transactions = [t for t in transactions if t.date >= filters.start_date]
        if filters.end_date:
            transactions = [t for t in transactions if t.date <= filters.end_date]
        if filters.categories:
            transactions = [t for t in transactions if t.category in filters.categories]
        if filters.transaction_types:
            transactions = [t for t in transactions if t.transaction_type in filters.transaction_types]
        if filters.min_amount:
            transactions = [t for t in transactions if t.absolute_amount >= filters.min_amount]
        if filters.max_amount:
            transactions = [t for t in transactions if t.absolute_amount <= filters.max_amount]
        if filters.search_text:
            transactions = [t for t in transactions if filters.search_text.lower() in t.description.lower()]
        if filters.tags:
            transactions = [t for t in transactions if any(tag in t.tags for tag in filters.tags)]
        
        return transactions
    
    async def get_categories(self) -> List[TransactionCategory]:
        """Get all transaction categories dynamically from actual data"""
        transactions = self._load_transaction_data()
        
        # Extract unique categories from actual data
        unique_categories = {}
        for transaction in transactions:
            category_name = transaction.category
            if category_name not in unique_categories:
                unique_categories[category_name] = {
                    "regular": 0,
                    "income": 0,
                    "transfers": 0,
                    "count": 0
                }
            
            if transaction.transaction_type == TransactionType.REGULAR:
                unique_categories[category_name]["regular"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INCOME:
                unique_categories[category_name]["income"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INTERNAL_TRANSFER:
                unique_categories[category_name]["transfers"] += transaction.amount
            
            unique_categories[category_name]["count"] += 1
        
        # Convert to TransactionCategory objects
        categories = []
        colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
                 "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#D5DBDB"]
        icons = ["graduation-cap", "book", "home", "utensils", "car", 
                "users", "film", "heart", "laptop", "plane", "ellipsis-h"]
        
        for i, (category_name, stats) in enumerate(unique_categories.items()):
            color = colors[i % len(colors)]
            icon = icons[i % len(icons)]
            
            categories.append(TransactionCategory(
                name=category_name,
                display_name=category_name.replace('_', ' ').title(),
                description=f"Transactions in {category_name}",
                color=color,
                icon=icon,
                total_amount=stats["regular"] - stats["income"],  # Net amount (regular - income)
                transaction_count=stats["count"]
            ))
        
        return categories
    
    async def get_transaction_summary(self, filters: TransactionQuery) -> TransactionSummary:
        """Get transaction summary statistics"""
        transactions = await self.get_transactions(filters)
        
        if not transactions:
            return TransactionSummary(
                total_regular_amount=0,
                total_income_amount=0,
                net_amount=0,
                transaction_count=0,
                regular_count=0,
                income_count=0,
                transfer_count=0,
                average_amount=0,
                category_breakdown={},
                monthly_trends=[],
                top_merchants=[],
                spending_velocity={"daily": 0, "weekly": 0, "monthly": 0}
            )
        
        # Calculate basic statistics by transaction type
        regular_transactions = [t for t in transactions if t.transaction_type == TransactionType.REGULAR]
        income_transactions = [t for t in transactions if t.transaction_type == TransactionType.INCOME]
        transfer_transactions = [t for t in transactions if t.transaction_type == TransactionType.INTERNAL_TRANSFER]
        
        total_regular = sum(t.amount for t in regular_transactions)
        total_income = sum(t.amount for t in income_transactions)
        net_amount = total_regular - total_income  # Regular spending minus income
        
        transaction_count = len(transactions)
        average_amount = sum(t.absolute_amount for t in transactions) / transaction_count if transaction_count > 0 else 0
        
        # Category breakdown by transaction type
        category_breakdown = {}
        for transaction in transactions:
            category = transaction.category
            if category not in category_breakdown:
                category_breakdown[category] = {"regular": 0, "income": 0, "transfers": 0, "net": 0}
            
            if transaction.transaction_type == TransactionType.REGULAR:
                category_breakdown[category]["regular"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INCOME:
                category_breakdown[category]["income"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INTERNAL_TRANSFER:
                category_breakdown[category]["transfers"] += transaction.amount
            
            category_breakdown[category]["net"] = category_breakdown[category]["regular"] - category_breakdown[category]["income"]
        
        # Monthly trends
        monthly_trends = self._calculate_monthly_trends(transactions)
        
        # Top merchants
        top_merchants = self._calculate_top_merchants(transactions)
        
        # Spending velocity
        spending_velocity = self._calculate_spending_velocity(transactions)
        
        return TransactionSummary(
            total_regular_amount=total_regular,
            total_income_amount=total_income,
            net_amount=net_amount,
            transaction_count=transaction_count,
            regular_count=len(regular_transactions),
            income_count=len(income_transactions),
            transfer_count=len(transfer_transactions),
            average_amount=average_amount,
            category_breakdown=category_breakdown,
            monthly_trends=monthly_trends,
            top_merchants=top_merchants,
            spending_velocity=spending_velocity
        )
    
    async def get_context_for_query(self, question: str) -> Dict[str, Any]:
        """Get relevant context data for a query"""
        # This would use more sophisticated query understanding
        # For now, return recent transactions and summary
        transactions = self._load_transaction_data()
        summary = await self.get_transaction_summary(TransactionQuery())
        
        return {
            "transactions": [t.dict() for t in transactions[-50:]],  # Last 50 transactions
            "summary": summary.dict(),
            "question": question
        }
    
    async def get_mba_insights(self) -> List[MBAInsight]:
        """Get MBA-specific insights and recommendations based on Kellogg-tagged transactions grouped by unique tags"""
        transactions = self._load_transaction_data()
        # Only analyze regular transactions for insights
        regular_transactions = [t for t in transactions if t.transaction_type == TransactionType.REGULAR]
        
        # Filter for MBA-related transactions using Kellogg tag
        mba_transactions = [t for t in regular_transactions if "kellogg" in [tag.lower() for tag in t.tags]]
        
        insights = []
        
        if not mba_transactions:
            # If no Kellogg-tagged transactions, provide general insights
            return self._get_general_insights(regular_transactions)
        
        # Analyze total MBA spending
        total_mba_spending = sum(t.amount for t in mba_transactions)
        insights.append(MBAInsight(
            category="mba_total",
            title="Total MBA Investment",
            description=f"Total Kellogg-related spending: ${total_mba_spending:,.2f}",
            recommendation="Track your MBA investment to ensure you're getting value for your money",
            data_support={"total_amount": total_mba_spending, "transaction_count": len(mba_transactions)},
            confidence_score=0.95,
            priority="high"
        ))
        
        # Group MBA transactions by unique tags
        mba_groups = self._group_mba_transactions_by_tags(mba_transactions, regular_transactions)
        
        # Generate insights for each group
        for group_name, group_transactions in mba_groups.items():
            total_amount = sum(t.amount for t in group_transactions)
            avg_amount = total_amount / len(group_transactions)
            
            # Get date range for this group
            dates = [t.date for t in group_transactions]
            min_date = min(dates)
            max_date = max(dates)
            date_range = f"{min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}"
            
            # Determine priority based on amount and transaction count
            if total_amount > 1000 or len(group_transactions) > 5:
                priority = "high"
                confidence = 0.9
            elif total_amount > 500 or len(group_transactions) > 3:
                priority = "medium"
                confidence = 0.8
            else:
                priority = "low"
                confidence = 0.7
            
            # Generate basic recommendation
            recommendation = f"Monitor your {group_name} spending to ensure it aligns with your MBA goals and provides good value"
            
            insights.append(MBAInsight(
                category=group_name,
                title=f"MBA {group_name.title()} Activity",
                description=f"Total spent on {group_name}: ${total_amount:,.2f} (${avg_amount:.2f} avg per transaction) from {date_range}",
                recommendation=recommendation,
                data_support={
                    "total_amount": total_amount, 
                    "avg_amount": avg_amount, 
                    "transaction_count": len(group_transactions),
                    "date_range": date_range,
                    "min_date": min_date.isoformat(),
                    "max_date": max_date.isoformat()
                },
                confidence_score=confidence,
                priority=priority
            ))
        
        # Analyze monthly MBA spending trends
        monthly_mba = {}
        for transaction in mba_transactions:
            month_key = transaction.date.strftime("%Y-%m")
            if month_key not in monthly_mba:
                monthly_mba[month_key] = 0
            monthly_mba[month_key] += transaction.amount
        
        if len(monthly_mba) > 1:
            avg_monthly = sum(monthly_mba.values()) / len(monthly_mba)
            max_month = max(monthly_mba.items(), key=lambda x: x[1])
            insights.append(MBAInsight(
                category="mba_trends",
                title="MBA Spending Trends",
                description=f"Average monthly MBA spending: ${avg_monthly:.2f}. Highest month: {max_month[0]} (${max_month[1]:,.2f})",
                recommendation="Consider spreading MBA expenses more evenly across months to manage cash flow",
                data_support={"avg_monthly": avg_monthly, "max_month": max_month[0], "max_amount": max_month[1]},
                confidence_score=0.8,
                priority="medium"
            ))
        
        return insights
    
    def _group_mba_transactions_by_tags(self, mba_transactions: List[Transaction], all_transactions: List[Transaction]) -> Dict[str, List[Transaction]]:
        """Group MBA transactions by their tags, excluding Kellogg tag"""
        groups = {}
        general_activities = []
        
        for transaction in mba_transactions:
            # Get non-Kellogg tags for this transaction
            non_kellogg_tags = [tag.lower() for tag in transaction.tags if tag.lower() != "kellogg"]
            
            if not non_kellogg_tags:
                # No other tags, add to general activities
                general_activities.append(transaction)
            else:
                # Use the first non-Kellogg tag as the group name
                group_tag = non_kellogg_tags[0]
                
                if group_tag not in groups:
                    groups[group_tag] = []
                groups[group_tag].append(transaction)
        
        # Add general activities group if there are any
        if general_activities:
            groups["general_activities"] = general_activities
        
        return groups
    
    def _get_general_insights(self, regular_transactions: List[Transaction]) -> List[MBAInsight]:
        """Fallback insights when no Kellogg-tagged transactions are found"""
        insights = []
        
        # Analyze tuition spending
        tuition_transactions = [t for t in regular_transactions if t.category == "tuition"]
        if tuition_transactions:
            total_tuition = sum(t.amount for t in tuition_transactions)
            insights.append(MBAInsight(
                category="tuition",
                title="Tuition Investment Analysis",
                description=f"Total tuition investment: ${total_tuition:,.2f}",
                recommendation="I paid a little tuition out of pocket. The rest was covered by loans or scholarships.",
                data_support={"total_amount": total_tuition, "payment_count": len(tuition_transactions)},
                confidence_score=0.9,
                priority="high"
            ))

        
        return insights
    
    def _load_transaction_data(self) -> List[Transaction]:
        """Load transaction data from CSV file"""
        from .csv_service import CSVService
        csv_service = CSVService()
        transactions = csv_service.load_transactions_from_csv()
        
        # If no CSV data found, return sample data
        if not transactions:
            return [
                Transaction(
                    id="1",
                    amount=1500.00,
                    description="Fall 2024 Tuition",
                    category="tuition",
                    date=datetime(2024, 8, 15),
                    merchant="University",
                    tags=["tuition", "fall2024"],
                    transaction_type=TransactionType.REGULAR
                ),
                Transaction(
                    id="2",
                    amount=89.99,
                    description="Strategic Management Textbook",
                    category="books_supplies",
                    date=datetime(2024, 8, 20),
                    merchant="University Bookstore",
                    tags=["textbook", "strategy"],
                    transaction_type=TransactionType.REGULAR
                ),
                Transaction(
                    id="3",
                    amount=45.00,
                    description="Networking Event - Finance Club",
                    category="networking",
                    date=datetime(2024, 9, 5),
                    merchant="Finance Club",
                    tags=["networking", "finance"],
                    transaction_type=TransactionType.REGULAR
                )
            ]
        
        return transactions
    
    def _calculate_monthly_trends(self, transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """Calculate monthly spending trends by transaction type"""
        if not transactions:
            return []
        
        # Group by month
        monthly_data = {}
        for transaction in transactions:
            month_key = transaction.date.strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = {"regular": 0, "income": 0, "transfers": 0, "net": 0, "count": 0}
            
            if transaction.transaction_type == TransactionType.REGULAR:
                monthly_data[month_key]["regular"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INCOME:
                monthly_data[month_key]["income"] += transaction.amount
            elif transaction.transaction_type == TransactionType.INTERNAL_TRANSFER:
                monthly_data[month_key]["transfers"] += transaction.amount
            
            monthly_data[month_key]["net"] = monthly_data[month_key]["regular"] - monthly_data[month_key]["income"]
            monthly_data[month_key]["count"] += 1
        
        # Convert to list format
        trends = []
        for month, data in sorted(monthly_data.items()):
            trends.append({
                "month": month,
                "regular": data["regular"],
                "income": data["income"],
                "transfers": data["transfers"],
                "net": data["net"],
                "transaction_count": data["count"]
            })
        
        return trends
    
    def _calculate_top_merchants(self, transactions: List[Transaction], limit: int = 10) -> List[Dict[str, Any]]:
        """Calculate top merchants by spending (regular transactions only)"""
        if not transactions:
            return []
        
        # Only include regular transactions for merchant analysis
        regular_transactions = [t for t in transactions if t.transaction_type == TransactionType.REGULAR]
        
        merchant_data = {}
        for transaction in regular_transactions:
            merchant = transaction.merchant or "Unknown"
            if merchant not in merchant_data:
                merchant_data[merchant] = {"amount": 0, "count": 0}
            merchant_data[merchant]["amount"] += transaction.amount
            merchant_data[merchant]["count"] += 1
        
        # Sort by amount and return top merchants
        sorted_merchants = sorted(merchant_data.items(), key=lambda x: x[1]["amount"], reverse=True)
        
        return [
            {
                "merchant": merchant,
                "amount": data["amount"],
                "count": data["count"]
            }
            for merchant, data in sorted_merchants[:limit]
        ]
    
    def _calculate_spending_velocity(self, transactions: List[Transaction]) -> Dict[str, float]:
        """Calculate spending velocity (daily, weekly, monthly averages) for regular transactions"""
        if not transactions:
            return {"daily": 0, "weekly": 0, "monthly": 0}
        
        # Only include regular transactions for velocity calculation
        regular_transactions = [t for t in transactions if t.transaction_type == TransactionType.REGULAR]
        
        if not regular_transactions:
            return {"daily": 0, "weekly": 0, "monthly": 0}
        
        # Calculate date range
        dates = [t.date for t in regular_transactions]
        min_date = min(dates)
        max_date = max(dates)
        
        # Calculate time spans
        total_days = (max_date - min_date).days + 1
        total_weeks = total_days / 7
        total_months = total_days / 30
        
        # Calculate total spending
        total_amount = sum(t.amount for t in regular_transactions)
        
        return {
            "daily": total_amount / total_days if total_days > 0 else 0,
            "weekly": total_amount / total_weeks if total_weeks > 0 else 0,
            "monthly": total_amount / total_months if total_months > 0 else 0
        }
    
    async def calculate_category_tag_overlap(self, target_tag: str, filters: Optional[TransactionQuery] = None) -> Dict[str, Any]:
        """Calculate spending overlap between a specific tag and all categories - perfect for Venn diagrams"""
        transactions = await self.get_transactions(filters or TransactionQuery())
        
        # Filter for transactions with the target tag
        tagged_transactions = [
            t for t in transactions 
            if target_tag.lower() in [tag.lower() for tag in t.tags]
        ]
        
        if not tagged_transactions:
            return {
                "target_tag": target_tag,
                "total_tagged_amount": 0,
                "category_overlaps": {},
                "venn_data": []
            }
        
        total_tagged_amount = sum(t.amount for t in tagged_transactions)
        
        # Calculate overlap with each category
        category_overlaps = {}
        venn_data = []
        
        # Group tagged transactions by category
        category_groups = {}
        for transaction in tagged_transactions:
            category = transaction.category
            if category not in category_groups:
                category_groups[category] = []
            category_groups[category].append(transaction)
        
        # Calculate overlaps and prepare Venn diagram data
        for category, category_transactions in category_groups.items():
            category_amount = sum(t.amount for t in category_transactions)
            overlap_percentage = (category_amount / total_tagged_amount) * 100
            
            category_overlaps[category] = {
                "amount": category_amount,
                "transaction_count": len(category_transactions),
                "percentage_of_tag": overlap_percentage
            }
            
            # Venn diagram data structure
            venn_data.append({
                "set_name": f"{target_tag} ∩ {category.title()}",
                "category": category,
                "tag": target_tag,
                "amount": category_amount,
                "transaction_count": len(category_transactions),
                "percentage": overlap_percentage,
                "transactions": [
                    {
                        "id": t.id,
                        "description": t.description,
                        "amount": t.amount,
                        "date": t.date.isoformat(),
                        "merchant": t.merchant
                    } for t in category_transactions
                ]
            })
        
        return {
            "target_tag": target_tag,
            "total_tagged_amount": total_tagged_amount,
            "total_tagged_transactions": len(tagged_transactions),
            "category_overlaps": category_overlaps,
            "venn_data": sorted(venn_data, key=lambda x: x["amount"], reverse=True)
        }
    
    async def calculate_multi_tag_category_overlap(self, tags: List[str], categories: List[str], filters: Optional[TransactionQuery] = None) -> Dict[str, Any]:
        """Calculate complex overlaps between multiple tags and categories for advanced Venn analysis"""
        transactions = await self.get_transactions(filters or TransactionQuery())
        
        # Create sets for each dimension
        tag_sets = {}
        category_sets = {}
        
        for tag in tags:
            tag_sets[tag] = [
                t for t in transactions 
                if tag.lower() in [tag_name.lower() for tag_name in t.tags]
            ]
        
        for category in categories:
            category_sets[category] = [
                t for t in transactions 
                if t.category == category
            ]
        
        # Calculate all possible intersections
        overlaps = []
        
        for tag_name, tag_transactions in tag_sets.items():
            for category_name, category_transactions in category_sets.items():
                # Find intersection
                intersection = [
                    t for t in tag_transactions 
                    if t in category_transactions
                ]
                
                if intersection:
                    overlap_amount = sum(t.amount for t in intersection)
                    overlaps.append({
                        "intersection": f"{tag_name} ∩ {category_name}",
                        "tag": tag_name,
                        "category": category_name,
                        "amount": overlap_amount,
                        "transaction_count": len(intersection),
                        "transactions": intersection
                    })
        
        return {
            "tags": tags,
            "categories": categories,
            "overlaps": sorted(overlaps, key=lambda x: x["amount"], reverse=True),
            "total_analyzed_transactions": len(transactions)
        }
    
    async def get_available_tags(self, filters: Optional[TransactionQuery] = None) -> Dict[str, Any]:
        """Get all available tags with usage statistics for user selection"""
        transactions = await self.get_transactions(filters or TransactionQuery())
        
        tag_stats = {}
        
        for transaction in transactions:
            for tag in transaction.tags:
                if tag not in tag_stats:
                    tag_stats[tag] = {
                        "tag": tag,
                        "transaction_count": 0,
                        "total_amount": 0,
                        "categories": set()
                    }
                
                tag_stats[tag]["transaction_count"] += 1
                tag_stats[tag]["total_amount"] += transaction.amount
                tag_stats[tag]["categories"].add(transaction.category)
        
        # Convert to list and add category count
        available_tags = []
        for tag, stats in tag_stats.items():
            available_tags.append({
                "tag": tag,
                "transaction_count": stats["transaction_count"],
                "total_amount": stats["total_amount"],
                "category_count": len(stats["categories"]),
                "categories": list(stats["categories"])
            })
        
        # Sort by total amount (most significant tags first)
        available_tags.sort(key=lambda x: x["total_amount"], reverse=True)
        
        return {
            "available_tags": available_tags,
            "total_tags": len(available_tags),
            "total_transactions": len(transactions)
        }