#!/usr/bin/env python3
"""
Test script for document-related queries.

Tests the fixes for the IntelliGov AI chat retrieval problem.
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from services.chat_service import generate_reply
from agents.intent_agent import IntentDetectionAgent
from agents.document_agent import DocumentAssistanceAgent
from core.logger import logger


# ============================================================
# TEST QUERIES
# ============================================================

TEST_QUERIES = [
    "What documents do I need for government schemes?",
    "What documents are required for scholarship?",
    "Documents required for Central Sector Scholarship",
    "What documents do farmers need?",
    "Documents for Kisan Credit Card",
    "Required documents for Fasal Bima",
    "schemes for scholarship",
    "eligibility for scholarship"
]


def test_intent_detection():
    """Test that queries are correctly identified as document intent."""
    print("\n" + "=" * 80)
    print("TEST 1: INTENT DETECTION")
    print("=" * 80)
    
    agent = IntentDetectionAgent()
    
    for query in TEST_QUERIES:
        result = agent.run(query)
        intent = result.get("intent", "unknown")
        confidence = result.get("confidence", 0.0)
        
        # Check if document queries are correctly identified
        is_doc_query = any(
            word in query.lower() 
            for word in ["document", "documents", "required", "need"]
        )
        
        status = "✓" if (is_doc_query and intent == "document") or (not is_doc_query) else "✗"
        
        print(f"{status} Query: {query}")
        print(f"   Intent: {intent} (confidence: {confidence:.2f})")
        print()


def test_document_agent():
    """Test DocumentAssistanceAgent retrieval."""
    print("\n" + "=" * 80)
    print("TEST 2: DOCUMENT ASSISTANCE AGENT")
    print("=" * 80)
    
    agent = DocumentAssistanceAgent()
    
    # Test only document-related queries
    doc_queries = [
        "What documents do I need for government schemes?",
        "What documents are required for scholarship?",
        "Documents required for Central Sector Scholarship",
        "What documents do farmers need?",
    ]
    
    for query in doc_queries:
        print(f"\nQuery: {query}")
        result = agent.run(query)
        
        print(f"   Success: {result.get('success')}")
        print(f"   Schemes: {len(result.get('schemes', []))}")
        
        schemes = result.get('schemes', [])
        for i, scheme in enumerate(schemes[:3], 1):  # Show first 3
            name = scheme.get('name', 'Unknown')
            docs = scheme.get('documents', [])
            print(f"   {i}. {name}")
            if docs:
                print(f"      Documents: {', '.join(docs)}")
            else:
                print(f"      Documents: (none)")
        
        if len(schemes) > 3:
            print(f"   ... and {len(schemes) - 3} more schemes")


def test_chat_service():
    """Test the complete chat pipeline."""
    print("\n" + "=" * 80)
    print("TEST 3: COMPLETE CHAT PIPELINE")
    print("=" * 80)
    
    doc_queries = [
        "What documents do I need for government schemes?",
        "What documents are required for scholarship?",
        "Documents for Kisan Credit Card",
    ]
    
    for query in doc_queries:
        print(f"\nQuery: {query}")
        print("-" * 80)
        
        try:
            result = generate_reply(query)
            
            # Check response
            reply = result.get('reply', '')
            schemes = result.get('recommended_schemes', [])
            agent_flow = result.get('agent_flow', [])
            
            print(f"Agent Flow: {' → '.join(agent_flow)}")
            print(f"Schemes Found: {len(schemes)}")
            
            # Check if response contains actual scheme data
            has_scheme_names = any(
                scheme.get('name', '').lower() in reply.lower()
                for scheme in schemes
            )
            
            # Check if response contains documents
            has_documents = 'document' in reply.lower()
            
            print(f"Has Scheme Names: {has_scheme_names}")
            print(f"Has Documents: {has_documents}")
            print(f"Response (first 200 chars): {reply[:200]}...")
            
            # Check if it's NOT the generic error message
            generic_error = "The available government scheme data does not contain"
            has_error = generic_error.lower() in reply.lower()
            
            status = "✗ FAILED" if has_error else "✓ PASSED"
            print(f"\nStatus: {status}")
            
            if has_error:
                print(f"ERROR: Got generic error message instead of scheme data")
            
        except Exception as e:
            print(f"✗ ERROR: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    print("=" * 80)
    print("IntelliGov AI - Document Query Testing")
    print("=" * 80)
    
    try:
        test_intent_detection()
        test_document_agent()
        test_chat_service()
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print("\n" + "=" * 80)
    print("Testing Complete")
    print("=" * 80)
