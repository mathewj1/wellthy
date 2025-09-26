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

class LLMService:
    """Service for processing natural language queries about expense data"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
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
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        
        agent = create_openai_tools_agent(self.llm, tools, prompt)
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True
        )
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the LLM"""
        return """
        You are an expert financial advisor specializing in MBA expenses and budgeting. 
        You have access to real expense data from an MBA student and can provide insights, 
        visualizations, and recommendations.

        Your capabilities:
        1. Analyze expense patterns and trends
        2. Generate data visualizations
        3. Provide MBA-specific financial advice
        4. Answer questions about budgeting and spending
        5. Compare different time periods or categories

        Always provide:
        - Clear, actionable insights
        - Data-driven recommendations
        - Relevant visualizations when appropriate
        - MBA-specific context and advice

        Be conversational but professional. Use the expense data to support your recommendations.
        """
    
    async def process_query(self, question: str, context: Dict[str, Any], additional_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process a natural language query about expense data"""
        try:
            # Prepare context for the agent
            context_str = self._format_context(context, additional_context)
            
            # Process the query
            response = await self.agent_executor.ainvoke({
                "input": f"Context: {context_str}\n\nQuestion: {question}"
            })
            
            # Parse the response
            return self._parse_agent_response(response)
            
        except Exception as e:
            return {
                "answer": f"I encountered an error processing your question: {str(e)}",
                "visualizations": None,
                "data_points": None
            }
    
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
    
    def _parse_agent_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the agent response into structured format"""
        answer = response.get("output", "I couldn't process your request.")
        
        # Try to extract visualizations and data points from the response
        visualizations = None
        data_points = None
        
        # This is a simplified parser - in production, you'd want more sophisticated parsing
        if "visualization" in answer.lower() or "chart" in answer.lower():
            visualizations = [{
                "type": "bar",
                "title": "Expense Analysis",
                "description": "Generated visualization based on your query"
            }]
        
        return {
            "answer": answer,
            "visualizations": visualizations,
            "data_points": data_points
        }
    
    def _analyze_expenses(self, query: str) -> str:
        """Tool for analyzing expense data"""
        # This would integrate with your data service
        return "Expense analysis completed. I can see patterns in your spending data."
    
    def _generate_visualization(self, query: str) -> str:
        """Tool for generating visualization configurations"""
        # This would generate visualization configs
        return "Visualization configuration generated for your data."
    
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
