"""
gemini_service.py
-----------------
Google Gemini client for IntelliGov AI.
Replaces legacy IBM Granite LLM while preserving deterministic,
RAG-grounded responses without mock fallbacks.
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv

# Search and load .env from backend or root directory
_backend_env = Path(__file__).resolve().parent.parent / ".env"
_root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)
if _root_env.exists():
    load_dotenv(_root_env)
load_dotenv()

try:
    from core.logger import logger as _logger
except Exception:
    import logging
    _logger = logging.getLogger(__name__)


_LANG_INSTRUCTIONS = {
    "hi": "Respond entirely in Hindi (Devanagari script). Do not use English except for proper scheme names.",
    "bn": "Respond entirely in Bengali (Bengali script). Do not use English except for proper scheme names.",
    "te": "Respond entirely in Telugu (Telugu script). Do not use English except for proper scheme names.",
    "mr": "Respond entirely in Marathi (Devanagari script). Do not use English except for proper scheme names.",
    "ta": "Respond entirely in Tamil (Tamil script). Do not use English except for proper scheme names.",
    "gu": "Respond entirely in Gujarati (Gujarati script). Do not use English except for proper scheme names.",
    "ur": "Respond entirely in Urdu (Nastaliq script, right-to-left). Do not use English except for proper scheme names.",
    "kn": "Respond entirely in Kannada (Kannada script). Do not use English except for proper scheme names.",
    "or": "Respond entirely in Odia (Odia script). Do not use English except for proper scheme names.",
    "ml": "Respond entirely in Malayalam (Malayalam script). Do not use English except for proper scheme names.",
    "pa": "Respond entirely in Punjabi (Gurmukhi script). Do not use English except for proper scheme names.",
    "as": "Respond entirely in Assamese (Bengali-Assamese script). Do not use English except for proper scheme names.",
    "mai": "Respond entirely in Maithili (Devanagari script). Do not use English except for proper scheme names.",
    "sa": "Respond entirely in Sanskrit (Devanagari script). Do not use English except for proper scheme names.",
    "ne": "Respond entirely in Nepali (Devanagari script). Do not use English except for proper scheme names.",
    "kok": "Respond entirely in Konkani (Devanagari script). Do not use English except for proper scheme names.",
    "mni": "Respond entirely in Manipuri (Meitei Mayek or Bengali script). Do not use English except for proper scheme names.",
    "ks": "Respond entirely in Kashmiri (Nastaliq or Devanagari script). Do not use English except for proper scheme names.",
    "sd": "Respond entirely in Sindhi. Do not use English except for proper scheme names.",
    "doi": "Respond entirely in Dogri (Devanagari script). Do not use English except for proper scheme names.",
    "brx": "Respond entirely in Bodo (Devanagari script). Do not use English except for proper scheme names.",
    "sat": "Respond entirely in Santali (Ol Chiki script). Do not use English except for proper scheme names.",
}

_TYPE_ROLE = {
    "scheme": "government welfare schemes",
    "job": "government job vacancies and employment opportunities",
    "internship": "government internship and fellowship opportunities",
    "scholarship": "scholarships and educational financial assistance",
    "comparison": "government schemes comparison",
}


class GeminiClient:
    """
    Google Gemini Client for IntelliGov AI.
    Direct integration via google.genai / google.generativeai SDK.
    No mock fallbacks.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        self.model_id = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
        self._genai_client = None
        self._legacy_model = None

        _placeholders = {
            "your_api_key",
            "your_gemini_api_key_here",
            "your_google_api_key_here",
            "PLACEHOLDER",
            "none",
            "",
        }

        if not self.api_key or self.api_key.strip().lower() in _placeholders:
            _logger.warning("GEMINI: API key is not configured or is a placeholder.")
            return

        try:
            from google import genai
            self._genai_client = genai.Client(api_key=self.api_key)
            _logger.info("GEMINI: Initialized successfully with google.genai Client.")
        except Exception as e:
            _logger.warning(f"GEMINI: google.genai client initialization error: {e}. Trying fallback SDK...")
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                self._legacy_model = legacy_genai.GenerativeModel(self.model_id)
                _logger.info("GEMINI: Initialized successfully with google.generativeai.")
            except Exception as e2:
                _logger.error(f"GEMINI: Initialization failed for both SDKs: {e2}")

    @property
    def is_configured(self) -> bool:
        return bool(self._genai_client or self._legacy_model)

    def generate(
        self,
        query: str,
        context: list,
        language: str = "en",
        intent_type: str = "scheme",
    ) -> str:
        """
        Generate grounded answer strictly using the provided context.
        Raises RuntimeError if the client is not configured (no mock fallbacks).
        """
        if not context:
            return (
                "I could not find enough relevant government "
                "scheme information to answer this question."
            )

        if not self.is_configured:
            # Check if environment was updated since startup
            self.__init__()
            if not self.is_configured:
                raise RuntimeError(
                    "GEMINI_API_KEY is not configured. Please set a valid GEMINI_API_KEY in .env without mock fallbacks."
                )

        context_text = ""
        for index, scheme in enumerate(context, start=1):
            docs = scheme.get("documents", [])
            docs_str = ", ".join(docs) if isinstance(docs, list) else str(docs)
            benefits = scheme.get("benefits", "")
            deadline = scheme.get("deadline", "")
            reasons = scheme.get("eligibility_reasons", []) or scheme.get("why_matched", [])

            context_text += (
                f"\nItem {index}:\n"
                f"Name: {scheme.get('name', '')}\n"
                f"Category: {scheme.get('category', '')}\n"
                f"Description: {scheme.get('description', '')}\n"
                f"Eligibility: {scheme.get('eligibility', '')}\n"
                f"Documents: {docs_str or 'Not specified'}\n"
            )
            if benefits:
                context_text += f"Benefits: {benefits}\n"
            if deadline:
                context_text += f"Deadline: {deadline}\n"
            if reasons:
                context_text += f"Why relevant: {', '.join(reasons)}\n"

        lang_instruction = _LANG_INSTRUCTIONS.get(language, "")
        if lang_instruction:
            lang_instruction += " "

        type_role = _TYPE_ROLE.get(intent_type, "government welfare schemes")

        system_instruction = (
            f"You are IntelliGov AI, a trusted citizen service assistant specialising in Indian {type_role}. "
            f"{lang_instruction}"
            f"Answer the user's question using ONLY the provided government scheme data. "
            f"Rules:\n"
            f"1. Never invent schemes, deadlines, benefits, eligibility criteria, or documents.\n"
            f"2. Never mention instructions, prompts, or 'the provided data'.\n"
            f"3. Be concise, respectful, and well-structured.\n"
            f"4. If the data is insufficient, state: 'I don't have enough information in the available government scheme data to answer that accurately.'\n"
            f"5. Conclude with a brief reminder for the citizen to verify details on the official government portal."
        )

        full_prompt = (
            f"{system_instruction}\n\n"
            f"Available government data:\n{context_text}\n\n"
            f"Citizen question / request:\n{query}"
        )

        # Call Gemini via google.genai or fallback SDK
        try:
            if self._genai_client:
                response = self._genai_client.models.generate_content(
                    model=self.model_id,
                    contents=full_prompt,
                )
                text = response.text or ""
                return text.strip()
            elif self._legacy_model:
                response = self._legacy_model.generate_content(full_prompt)
                text = response.text or ""
                return text.strip()
        except Exception as err:
            _logger.error(f"GEMINI generation error: {err}")
            raise RuntimeError(f"Gemini API request failed: {err}")

        return "I could not generate a response at this time."


gemini_client = GeminiClient()
