#!/usr/bin/env python3
"""
Quick test script for the MBA Expense Explorer backend
This will help us test the Venn diagram functionality without needing the full server
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def test_system():
    """Test the core Venn diagram functionality"""
    print("🧪 Testing MBA Expense Explorer - Venn Diagram System")
    print("=" * 60)
    
    try:
        # Import the services
        from backend.services.data_service import DataService
        from backend.services.llm_service import LLMService
        from backend.models.transaction import TransactionQuery
        
        print("✅ Successfully imported services")
        
        # Initialize services
        data_service = DataService()
        print("✅ DataService initialized")
        
        # Test getting available tags
        print("\n📋 Testing: Get Available Tags")
        available_tags_data = await data_service.get_available_tags()
        available_tags = available_tags_data["available_tags"]
        
        print(f"✅ Found {len(available_tags)} tags:")
        for i, tag_info in enumerate(available_tags[:5]):  # Show top 5
            print(f"   {i+1}. {tag_info['tag']} - ${tag_info['total_amount']:,.0f} ({tag_info['transaction_count']} transactions)")
        
        if available_tags:
            # Test Venn diagram with first tag
            test_tag = available_tags[0]['tag']
            print(f"\n🔄 Testing: Venn Diagram for '{test_tag}'")
            
            overlap_data = await data_service.calculate_category_tag_overlap(test_tag)
            
            if overlap_data["venn_data"]:
                print(f"✅ Venn diagram data generated for '{test_tag}':")
                print(f"   Total amount: ${overlap_data['total_tagged_amount']:,.2f}")
                print(f"   Categories: {len(overlap_data['venn_data'])}")
                
                for venn_item in overlap_data["venn_data"][:3]:  # Show top 3
                    print(f"   • {venn_item['category']}: ${venn_item['amount']:,.0f} ({venn_item['percentage']:.1f}%)")
            else:
                print(f"❌ No Venn diagram data for '{test_tag}'")
        
        # Test LLM service initialization (without API key for now)
        print(f"\n🤖 Testing: LLM Service")
        try:
            llm_service = LLMService(data_service=data_service)
            print("✅ LLMService initialized (AI features will need API key)")
        except Exception as e:
            print(f"⚠️  LLMService initialization issue: {e}")
        
        print(f"\n🎉 Core system test completed successfully!")
        print(f"Your interactive Venn diagram system is ready to use!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_system())
