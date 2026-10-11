"""
granite_service.py
------------------
Backward-compatibility alias pointing to GeminiClient.
IntelliGov AI now utilizes Google Gemini.
"""

from services.gemini_service import gemini_client, GeminiClient

# Backward-compatibility aliases
granite_client = gemini_client
IBMGraniteClient = GeminiClient
