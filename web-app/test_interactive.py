#!/usr/bin/env python3
"""
Interactive test for the MBA Expense Explorer Venn diagram system
Simulates the conversational AI experience
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def simulate_conversation():
    """Simulate the interactive tag selection conversation"""
    print("🗣️  MBA Expense Explorer - Interactive Conversation Simulation")
    print("=" * 65)
    
    try:
        from backend.services.data_service import DataService
        from backend.services.llm_service import LLMService
        
        # Initialize services
        data_service = DataService()
        
        print("👤 USER: Show me spending breakdown by trip")
        print("\n🤖 AI: I can show you a spending breakdown! Which tag would you like to analyze?")
        print("\n**Available tags:**")
        
        # Get available tags
        available_tags_data = await data_service.get_available_tags()
        available_tags = available_tags_data["available_tags"][:10]  # Top 10
        
        # Show relevant trip-related tags
        trip_tags = [tag for tag in available_tags if any(keyword in tag['tag'].lower() 
                    for keyword in ['japan', 'trip', 'travel', 'kellogg', 'snowboarding'])]
        
        for i, tag_info in enumerate(trip_tags[:5], 1):
            print(f"   {i}. **{tag_info['tag']}** - ${tag_info['total_amount']:,.0f} "
                  f"({tag_info['transaction_count']} transactions, {tag_info['category_count']} categories)")
        
        print(f"\nPlease specify which tag you'd like to see the category breakdown for,")
        print(f"or ask like: 'Show me \"japan '25\" breakdown'")
        
        # Simulate user selecting a specific tag
        selected_tag = "japan '25"
        print(f"\n👤 USER: Show me \"{selected_tag}\" breakdown")
        
        # Generate Venn diagram
        overlap_data = await data_service.calculate_category_tag_overlap(selected_tag)
        
        if overlap_data["venn_data"]:
            total_amount = overlap_data["total_tagged_amount"]
            top_categories = sorted(overlap_data["venn_data"], key=lambda x: x["amount"], reverse=True)[:3]
            
            category_summary = ", ".join([
                f"{cat['category']} ({cat['percentage']:.1f}%)"
                for cat in top_categories
            ])
            
            print(f"\n🤖 AI: Your {selected_tag} spending totaled ${total_amount:,.2f} across {len(overlap_data['venn_data'])} categories.")
            print(f"The breakdown: {category_summary}")
            
            print(f"\n📊 **Venn Diagram Data Generated:**")
            print(f"   Chart Type: venn")
            print(f"   Title: {selected_tag} Spending Breakdown")
            print(f"   Description: How your {selected_tag} spending was distributed across categories")
            
            print(f"\n🔍 **Category Details:**")
            for item in overlap_data["venn_data"][:5]:
                print(f"   • {item['category'].title()}: ${item['amount']:,.0f} ({item['percentage']:.1f}%) - {item['transaction_count']} transactions")
        
        print(f"\n✨ **This demonstrates your interactive Venn diagram system!**")
        print(f"   🗣️  Users ask general questions")
        print(f"   🤖 AI offers specific tag choices") 
        print(f"   📊 Dynamic Venn diagrams are generated")
        print(f"   🎯 Rich data insights are provided")
        
    except Exception as e:
        print(f"❌ Error during simulation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import asyncio
    asyncio.run(simulate_conversation())
