"""
LLM Service for processing natural language queries about expense data
Uses LangChain and LangGraph for complex reasoning
"""

import os
from typing import Dict, List, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from langchain.tools import Tool
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.memory import ConversationBufferMemory
import json
import pandas as pd
from models.transaction import TransactionQuery

class LLMService:
    """Service for processing natural language queries about expense data"""
    
    def __init__(self, data_service=None):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",  # Most cost-effective available model
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.data_service = data_service  # Inject data service
        self._setup_agent()
    
    def _setup_agent(self):
        """Setup the LangChain agent with tools"""
        tools = [
            Tool(
                name="expense_analyzer",
                description="Analyze expense data and generate insights",
                func=self._analyze_expenses
            ),
            Tool(
                name="data_visualizer",
                description="Generate visualization configurations for expense data",
                func=self._generate_visualization
            ),
            Tool(
                name="mba_advisor",
                description="Provide MBA-specific financial advice and insights",
                func=self._provide_mba_advice
            )
        ]
        
        # Simplified prompt without agent scratchpad for compatibility
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", "{input}")
        ])
        
        # For now, let's use a simpler approach without the agent executor
        # We'll process queries directly with the LLM
        self.prompt = prompt
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the LLM"""
        return """
        You are an expert financial advisor specializing in MBA expenses and budgeting. 
        You have access to real expense data from an MBA student and can provide insights, 
        visualizations, and recommendations.

        Your capabilities:
        1. Analyze expense patterns and trends
        2. Generate data visualizations (bar, line, pie, scatter, and Venn diagrams)
        3. Provide MBA-specific financial advice
        4. Answer questions about budgeting and spending
        5. Compare different time periods or categories
        6. Create overlap analysis between tags and categories using Venn diagrams

        Visualization Guidelines:
        - Use Venn diagrams when users ask about overlaps, intersections, or breakdowns
        - Perfect for analyzing trip spending (e.g., "Turkey '24") across categories
        - Great for showing how tagged expenses distribute across spending categories
        - Use when users mention specific trips, events, or want category breakdowns by tag

        Always provide:
        - Clear, actionable insights
        - Data-driven recommendations
        - Relevant visualizations when appropriate
        - MBA-specific context and advice
        - Venn diagrams for overlap analysis when relevant

        Be conversational but professional. Use the expense data to support your recommendations.
        """
    
    async def process_query(self, question: str, context: Dict[str, Any], additional_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process a natural language query about expense data"""
        try:
            # Prepare context for the LLM
            context_str = self._format_context(context, additional_context)
            
            # Check if tools should be called based on the question
            self._analyze_query_for_tools(question)
            
            # Create the full prompt
            full_input = f"Context: {context_str}\n\nQuestion: {question}"
            
            # Process with LLM directly
            formatted_prompt = self.prompt.format_messages(input=full_input)
            response = await self.llm.ainvoke(formatted_prompt)
            
            # Create response object that matches expected format
            response_dict = {"output": response.content}
            
            # Parse the response with visualization generation
            return await self._parse_agent_response(response_dict, question)
            
        except Exception as e:
            return {
                "answer": f"I encountered an error processing your question: {str(e)}",
                "visualizations": None,
                "data_points": None
            }
    
    def _analyze_query_for_tools(self, question: str):
        """Analyze the query to determine what tools/visualizations are needed"""
        # Call the visualization tool to set context
        self._generate_visualization(question)
        # Call analysis tool if needed
        if any(keyword in question.lower() for keyword in ["analyze", "pattern", "trend"]):
            self._analyze_expenses(question)
    
    def _format_context(self, context: Dict[str, Any], additional_context: Optional[Dict[str, Any]]) -> str:
        """Format context data for the LLM"""
        context_parts = []
        
        if context.get("expenses"):
            expenses = context["expenses"]
            context_parts.append(f"Expense Data: {len(expenses)} transactions")
            
            # Add summary statistics
            if expenses:
                df = pd.DataFrame(expenses)
                total_amount = df['amount'].sum()
                avg_amount = df['amount'].mean()
                context_parts.append(f"Total Amount: ${total_amount:,.2f}")
                context_parts.append(f"Average Transaction: ${avg_amount:,.2f}")
                
                # Add category breakdown
                if 'category' in df.columns:
                    category_breakdown = df.groupby('category')['amount'].sum().to_dict()
                    context_parts.append(f"Category Breakdown: {category_breakdown}")
        
        if context.get("summary"):
            summary = context["summary"]
            context_parts.append(f"Summary: {summary}")
        
        if additional_context:
            context_parts.append(f"Additional Context: {additional_context}")
        
        return "\n".join(context_parts)
    
    async def _parse_agent_response(self, response: Dict[str, Any], original_question: str) -> Dict[str, Any]:
        """Parse the agent response into structured format"""
        answer = response.get("output", "I couldn't process your request.")
        
        # Initialize response components
        visualizations = None
        data_points = None
        
        # Check if a visualization was requested and generate it
        if hasattr(self, '_current_viz_type') and self.data_service:
            try:
                if self._current_viz_type == "venn_ask_tag":
                    # User wants breakdown but didn't specify tag - ask for clarification
                    available_tags_data = await self.data_service.get_available_tags()
                    available_tags = available_tags_data["available_tags"][:10]  # Limit to top 10
                    
                    if available_tags:
                        # Format tag options with spending info
                        tag_options = []
                        for i, tag_info in enumerate(available_tags, 1):
                            tag_options.append(
                                f"{i}. **{tag_info['tag']}** - ${tag_info['total_amount']:,.0f} "
                                f"({tag_info['transaction_count']} transactions, {tag_info['category_count']} categories)"
                            )
                        
                        tag_list = "\n".join(tag_options)
                        
                        # Create interactive follow-up response
                        enhanced_answer = (
                            f"I can show you a spending breakdown! Which tag would you like to analyze?\n\n"
                            f"**Available tags:**\n{tag_list}\n\n"
                            f"Please specify which tag you'd like to see the category breakdown for, "
                            f"or ask like: 'Show me \"Turkey '24\" breakdown'"
                        )
                        answer = enhanced_answer
                        
                        # Create a special visualization placeholder for tag selection
                        visualizations = [{
                            "chart_type": "tag_selector",
                            "title": "Select a Tag for Analysis",
                            "description": "Choose which tag you'd like to see the spending breakdown for",
                            "available_options": available_tags
                        }]
                        
                        data_points = available_tags
                    else:
                        answer = "I couldn't find any tags in your expense data to create a breakdown visualization."
                
                elif self._current_viz_type == "venn" and hasattr(self, '_detected_tags'):
                    # Generate Venn diagram data for specific tag
                    tag = self._detected_tags[0] if self._detected_tags else "unknown"
                    overlap_data = await self.data_service.calculate_category_tag_overlap(tag)
                    
                    if overlap_data["venn_data"]:
                        visualizations = [{
                            "chart_type": "venn",
                            "title": f"{tag} Spending Breakdown",
                            "description": f"How your {tag} spending was distributed across categories",
                            "overlap_dimension_1": "tags",
                            "overlap_dimension_2": "category",
                            "venn_sets": overlap_data["venn_data"][:5]  # Limit to top 5 for readability
                        }]
                        
                        # Generate data points for the frontend
                        data_points = [
                            {
                                "category": item["category"],
                                "amount": item["amount"], 
                                "percentage": item["percentage"],
                                "transaction_count": item["transaction_count"]
                            } for item in overlap_data["venn_data"][:5]
                        ]
                        
                        # Enhance the answer with specific data
                        total_amount = overlap_data["total_tagged_amount"]
                        top_categories = sorted(overlap_data["venn_data"], key=lambda x: x["amount"], reverse=True)[:3]
                        
                        category_summary = ", ".join([
                            f"{cat['category']} ({cat['percentage']:.1f}%)"
                            for cat in top_categories
                        ])
                        
                        enhanced_answer = f"Your {tag} spending totaled ${total_amount:,.2f} across {len(overlap_data['venn_data'])} categories. The breakdown: {category_summary}. {answer}"
                        answer = enhanced_answer
                    else:
                        answer = f"I couldn't find any transactions tagged with '{tag}'. Please check the tag name or try a different one."
                
                elif self._current_viz_type in ["pie", "bar", "line"]:
                    # Generate standard visualizations
                    transactions = await self.data_service.get_transactions()
                    if transactions:
                        if self._current_viz_type == "pie":
                            # Category breakdown
                            categories = {}
                            for t in transactions:
                                categories[t.category] = categories.get(t.category, 0) + t.amount
                            
                            visualizations = [{
                                "chart_type": "pie",
                                "title": "Spending by Category",
                                "description": "Your expense distribution across categories"
                            }]
                            
                            data_points = [
                                {"category": cat, "amount": amount}
                                for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True)
                            ]
                
                # Clean up context
                if hasattr(self, '_current_viz_type'):
                    delattr(self, '_current_viz_type')
                if hasattr(self, '_detected_tags'):
                    delattr(self, '_detected_tags')
                        
            except Exception as e:
                print(f"Error generating visualization: {e}")
        
        return {
            "answer": answer,
            "visualizations": visualizations,
            "data_points": data_points
        }
    
    def _analyze_expenses(self, query: str) -> str:
        """Tool for analyzing expense data"""
        # Store query context for later processing
        self._current_analysis_type = "expense_analysis"
        return f"Analyzing expense patterns in your data based on: {query}"
    
    def _generate_visualization(self, query: str) -> str:
        """Tool for generating visualization configurations"""
        query_lower = query.lower()
        
        # Detect visualization type and store context
        if any(keyword in query_lower for keyword in ["overlap", "intersection", "breakdown", "distribution", "trip", "tag"]):
            # Check if user specified a specific tag
            import re
            
            # Look for quoted tags - improved pattern to handle apostrophes in tag names
            # Try double quotes first, then single quotes
            quoted_matches = re.findall(r'"([^"]+)"', query) or re.findall(r"'([^']+)'", query)
            
            if quoted_matches:
                # User specified a tag
                self._current_viz_type = "venn"
                self._detected_tags = quoted_matches
                return f"VENN_DIAGRAM_REQUESTED: {quoted_matches[0]}"
            else:
                # User wants breakdown but didn't specify tag - need to ask
                self._current_viz_type = "venn_ask_tag"
                return "VENN_DIAGRAM_NEEDS_TAG_SELECTION"
        
        # Other visualization types
        if "over time" in query_lower or "trend" in query_lower:
            self._current_viz_type = "line"
            return "LINE_CHART_REQUESTED"
        elif "by category" in query_lower or "categories" in query_lower:
            self._current_viz_type = "pie"
            return "PIE_CHART_REQUESTED"
        elif "compare" in query_lower or "comparison" in query_lower:
            self._current_viz_type = "bar"
            return "BAR_CHART_REQUESTED"
        
        self._current_viz_type = "bar"  # default
        return "STANDARD_CHART_REQUESTED"
    
    def _provide_mba_advice(self, query: str) -> str:
        """Tool for providing MBA-specific advice"""
        # This would provide MBA-specific insights
        return "MBA-specific financial advice provided based on your expense patterns."
    
    async def generate_insights(self, expense_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate insights from expense data"""
        try:
            # Convert to DataFrame for analysis
            df = pd.DataFrame(expense_data)
            
            insights = []
            
            # Analyze spending patterns
            if not df.empty:
                # Monthly spending trend
                df['month'] = pd.to_datetime(df['date']).dt.to_period('M')
                monthly_spending = df.groupby('month')['amount'].sum()
                
                if len(monthly_spending) > 1:
                    trend = "increasing" if monthly_spending.iloc[-1] > monthly_spending.iloc[0] else "decreasing"
                    insights.append({
                        "type": "trend",
                        "title": "Monthly Spending Trend",
                        "description": f"Your spending is {trend} over time",
                        "data": monthly_spending.to_dict()
                    })
                
                # Category analysis
                category_spending = df.groupby('category')['amount'].sum().sort_values(ascending=False)
                top_category = category_spending.index[0]
                insights.append({
                    "type": "category",
                    "title": "Top Spending Category",
                    "description": f"Your highest expense category is {top_category}",
                    "data": category_spending.to_dict()
                })
            
            return insights
            
        except Exception as e:
            return [{
                "type": "error",
                "title": "Analysis Error",
                "description": f"Could not generate insights: {str(e)}"
            }]
