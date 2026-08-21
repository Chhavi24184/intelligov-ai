import os
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# MOCK GRANITE CLIENT
# ============================================================

class MockGraniteClient:
    """
    Fallback Granite client for IntelliGov AI.

    Used when IBM watsonx credentials are not configured.

    The response is generated ONLY from the retrieved
    government scheme context.
    """

    def generate(
        self,
        query: str,
        context: list
    ) -> str:

        # ----------------------------------------------------
        # No context
        # ----------------------------------------------------

        if not context:

            return (
                "I could not find a relevant government scheme "
                "in the available government data.\n\n"
                "Please try asking about education, farming, "
                "employment, healthcare, housing, business, "
                "skill development, or pensions."
            )

        # ----------------------------------------------------
        # Grounded response
        # ----------------------------------------------------

        response = (
            "Based on the available government scheme data, "
            f"these schemes may be relevant to your query:\n\n"
        )

        for index, scheme in enumerate(
            context,
            start=1
        ):

            name = scheme.get(
                "name",
                "Unknown Scheme"
            )

            category = scheme.get(
                "category",
                "General"
            )

            description = scheme.get(
                "description",
                "No description available."
            )

            eligibility = scheme.get(
                "eligibility",
                "Eligibility information is not available."
            )

            documents = scheme.get(
                "documents",
                []
            )

            response += (
                f"{index}. {name}\n"
                f"   Category: {category}\n"
                f"   Description: {description}\n"
                f"   Eligibility: {eligibility}\n"
            )

            if documents:

                response += (
                    "   Common documents: "
                    + ", ".join(documents)
                    + "\n"
                )

            response += "\n"

        response += (
            "Important: This answer is grounded only in "
            "the government scheme data available to the "
            "application. Please verify the latest official "
            "eligibility requirements before applying."
        )

        return response


# ============================================================
# REAL IBM GRANITE CLIENT
# ============================================================

class IBMGraniteClient:
    """
    IBM Granite client using watsonx.ai.

    This client is used only when valid IBM watsonx
    credentials are configured.
    """

    def __init__(self):

        self.api_key = os.getenv(
            "WATSONX_APIKEY"
        )

        self.project_id = os.getenv(
            "WATSONX_PROJECT_ID"
        )

        self.url = os.getenv(
            "WATSONX_URL",
            "https://us-south.ml.cloud.ibm.com"
        )

        self.model_id = os.getenv(
            "WATSONX_MODEL_ID",
            "ibm/granite-3-3-8b-instruct"
        )

        self.client = None

        # ----------------------------------------------------
        # Check credentials
        # ----------------------------------------------------

        if (
            not self.api_key
            or self.api_key == "your_api_key"
            or not self.project_id
            or self.project_id == "your_project_id"
        ):

            print(
                "IBM Granite credentials not configured. "
                "Using MockGraniteClient."
            )

            return

        # ----------------------------------------------------
        # Initialize IBM watsonx
        # ----------------------------------------------------

        try:

            from ibm_watsonx_ai import Credentials
            from ibm_watsonx_ai.foundation_models import ModelInference

            credentials = Credentials(
                url=self.url,
                api_key=self.api_key
            )

            self.client = ModelInference(
                model_id=self.model_id,
                credentials=credentials,
                project_id=self.project_id
            )

            print(
                "IBM Granite client initialized successfully."
            )

        except Exception as e:

            print(
                f"IBM Granite initialization failed: {e}"
            )

            self.client = None

    # ========================================================
    # GROUNDED GENERATION
    # ========================================================

    def generate(
        self,
        query: str,
        context: list
    ) -> str:

        # ----------------------------------------------------
        # No context
        # ----------------------------------------------------

        if not context:

            return (
                "I could not find enough relevant government "
                "scheme information to answer this question."
            )

        # ----------------------------------------------------
        # If IBM client unavailable
        # ----------------------------------------------------

        if self.client is None:

            return mock_granite_client.generate(
                query=query,
                context=context
            )

        # ----------------------------------------------------
        # Build grounded context
        # ----------------------------------------------------

        context_text = ""

        for index, scheme in enumerate(
            context,
            start=1
        ):

            context_text += (
                f"\nScheme {index}:\n"
                f"Name: {scheme.get('name', '')}\n"
                f"Category: {scheme.get('category', '')}\n"
                f"Description: {scheme.get('description', '')}\n"
                f"Eligibility: {scheme.get('eligibility', '')}\n"
                f"Documents: "
                f"{', '.join(scheme.get('documents', []))}\n"
            )

        # ----------------------------------------------------
        # Grounding Prompt
        # ----------------------------------------------------

        prompt = f"""
You are IntelliGov AI, a government-scheme assistance
assistant.

Answer the user's question using ONLY the government
scheme information provided in the CONTEXT below.

IMPORTANT RULES:

1. Do not invent schemes.
2. Do not invent eligibility requirements.
3. Do not invent benefits.
4. Do not add information that is not present in the context.
5. If the context does not contain enough information,
   clearly say that the available data is insufficient.
6. Keep the answer clear and useful.
7. Mention the relevant scheme names.
8. If documents are present in the context, mention them.
9. Do not claim that the user is definitely eligible unless
   the provided context explicitly supports that conclusion.
10. Remind the user to verify current official requirements.

USER QUESTION:
{query}

CONTEXT:
{context_text}

Now provide a concise, grounded answer.
"""

        # ----------------------------------------------------
        # Call IBM Granite
        # ----------------------------------------------------

        try:

            response = self.client.generate_text(
                prompt=prompt
            )

            # Some SDK versions return a string
            if isinstance(
                response,
                str
            ):

                return response.strip()

            # Try common response structures
            if isinstance(
                response,
                dict
            ):

                results = response.get(
                    "results",
                    []
                )

                if results:

                    generated_text = results[0].get(
                        "generated_text"
                    )

                    if generated_text:

                        return generated_text.strip()

            return str(response)

        except Exception as e:

            print(
                f"IBM Granite generation failed: {e}"
            )

            # Safe fallback
            return mock_granite_client.generate(
                query=query,
                context=context
            )


# ============================================================
# CREATE CLIENTS
# ============================================================

mock_granite_client = MockGraniteClient()

granite_client = IBMGraniteClient()