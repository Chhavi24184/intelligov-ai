"""
application_agent.py
--------------------
AI-powered Application Assistance Agent for IntelliGov AI.

=== WHAT IS ACTUALLY AUTOMATED ===

1. Profile field mapping
   The agent reads the user's saved profile (name, age, state, district,
   education, occupation, income, category) and maps each value to the
   corresponding application form field — no re-typing needed.

2. Document gap analysis
   Required documents are checked against profile completeness to produce
   a clear ✓ / ✗ checklist the user can act on before opening the portal.

3. Interactive demo form (IntelliGov Demo Application)
   A fully-functional form spec is generated with every field pre-filled
   from the user's profile.  The user reviews/edits each field, then
   confirms.  On confirmation a local reference ID is issued.
   This is CLEARLY LABELLED as a demonstration — it is NOT connected to
   any real government database and does NOT submit to a real portal.

4. Official portal redirect
   After demo confirmation, the real official portal opens in a new tab.

=== WHAT CANNOT BE AUTOMATED ===

Real government portal form filling:
  All NIC/MeitY portals require Aadhaar OTP, CAPTCHA or DigiLocker
  authentication.  Bypassing these violates IT Act and portal ToS.

Application submission to real portals:
  We never POST to any live government API on behalf of the user.

Real reference / acknowledgement numbers:
  We never fabricate these.  Only the official portal issues them.
  Demo reference IDs are prefixed DEMO- and clearly labelled.
"""

from __future__ import annotations
import uuid
import datetime
from typing import Optional


# ============================================================
# PORTAL CATALOGUE
# ============================================================

_KNOWN_PORTALS: dict[str, dict] = {
    "pmkisan.gov.in": {
        "name": "PM-KISAN Portal",
        "note": "Registration via mobile / Aadhaar on the portal.",
        "direct": True,
    },
    "pmjay.gov.in": {
        "name": "Ayushman Bharat PM-JAY Portal",
        "note": "Eligibility check and e-card download available.",
        "direct": True,
    },
    "scholarships.gov.in": {
        "name": "National Scholarship Portal",
        "note": "Apply directly; Aadhaar + bank account mandatory.",
        "direct": True,
    },
    "nsp.gov.in": {
        "name": "National Scholarship Portal",
        "note": "Apply directly; Aadhaar + bank account mandatory.",
        "direct": True,
    },
    "pmegp.kvic.org.in": {
        "name": "PMEGP Portal",
        "note": "Online application with Aadhaar, business plan, bank details.",
        "direct": True,
    },
    "maandhan.in": {
        "name": "PM Maandhan Portal",
        "note": "Enrol via CSC centre or Maandhan app with Aadhaar.",
        "direct": True,
    },
    "skillindia.gov.in": {
        "name": "Skill India Portal",
        "note": "Register on Skill India portal; choose course and centre.",
        "direct": True,
    },
    "naps.gov.in": {
        "name": "National Apprenticeship Portal",
        "note": "Register as apprentice; choose establishment and trade.",
        "direct": True,
    },
    "pmaay.gov.in": {
        "name": "PM Awas Yojana Portal",
        "note": "Apply via your state government housing portal.",
        "direct": True,
    },
    "pmvishwakarma.gov.in": {
        "name": "PM Vishwakarma Portal",
        "note": "Register at Common Service Centres with Aadhaar.",
        "direct": True,
    },
    "pmkvyofficial.org": {
        "name": "PMKVY Official Portal",
        "note": "Find a training centre near you and enrol.",
        "direct": True,
    },
    "mudra.org.in": {
        "name": "PM Mudra Yojana — apply via your bank",
        "note": "Visit nearest bank branch or apply via bank portal.",
        "direct": False,
    },
    "pmsby.gov.in": {
        "name": "PMSBY / PMJJBY — enrol via your bank",
        "note": "Ask your bank to activate this insurance scheme.",
        "direct": False,
    },
    "pmjdy.gov.in": {
        "name": "PM Jan Dhan Yojana — apply at bank",
        "note": "Visit any bank branch with Aadhaar / voter ID.",
        "direct": False,
    },
    "umang.gov.in": {
        "name": "UMANG App / Portal",
        "note": "Download the UMANG app or visit the portal.",
        "direct": True,
    },
    "uday.gov.in": {
        "name": "Startup India / UDAY Portal",
        "note": "Online registration with Aadhaar and PAN.",
        "direct": True,
    },
    "pmsym.gov.in": {
        "name": "PM Shram Yogi Maan-Dhan Portal",
        "note": "Enrol via CSC or Umang app with Aadhaar.",
        "direct": True,
    },
    "pmkmy.gov.in": {
        "name": "PM Kisan Maan Dhan Yojana Portal",
        "note": "Enrol via CSC with Aadhaar and bank account.",
        "direct": True,
    },
}


# ============================================================
# FORM FIELD DEFINITIONS
# Maps profile keys to application form fields with labels,
# type, and whether the field can be auto-filled from profile.
# ============================================================

_PROFILE_FIELD_MAP = [
    # (profile_key, form_label, field_type, required)
    ("name",       "Full Name",                    "text",   True),
    ("age",        "Age",                          "number", True),
    ("state",      "State / UT",                   "text",   True),
    ("district",   "District",                     "text",   False),
    ("education",  "Educational Qualification",    "text",   True),
    ("occupation", "Occupation / Category",        "text",   True),
    ("income",     "Annual Family Income",         "text",   True),
    ("category",   "Social Category (Caste)",      "text",   True),
]

# Fields that are always in the form but CANNOT come from profile
_EXTRA_FORM_FIELDS = [
    ("aadhaar_number", "Aadhaar Number",    "aadhaar",  True,
     "Enter your 12-digit Aadhaar number"),
    ("mobile_number",  "Mobile Number",     "mobile",   True,
     "Enter your registered mobile number"),
    ("bank_account",   "Bank Account No.",  "text",     False,
     "Bank account for benefit transfer (if applicable)"),
    ("ifsc_code",      "IFSC Code",         "text",     False,
     "Bank IFSC code"),
]


# ============================================================
# APPLICATION AGENT
# ============================================================

class ApplicationAgent:
    """
    Prepares a structured ApplicationPlan and a DemoFormSpec
    for a government scheme.

    NEVER:
      - invents personal information
      - submits forms to real government portals
      - creates fake government reference numbers
      - stores passwords, OTPs, or sensitive credentials
    """

    # ----------------------------------------------------------
    def prepare(self, scheme: dict, profile: dict | None) -> dict:
        """
        Build a full ApplicationPlan including a demo form spec.
        """
        name         = scheme.get("name") or scheme.get("scheme_name") or "Unknown Scheme"
        category     = scheme.get("category", "")
        official_url = (scheme.get("official_url") or "").strip()
        eligibility  = scheme.get("eligibility", "")
        benefits     = scheme.get("benefits", "")
        documents    = scheme.get("documents") or []
        if isinstance(documents, str):
            import json as _j
            try:
                documents = _j.loads(documents)
            except Exception:
                documents = [documents]

        portal_name, portal_supported, portal_note, portal_direct = \
            self._classify_portal(official_url)

        prefilled_fields  = self._prefill_from_profile(profile)
        docs_available, docs_missing = self._analyse_documents(documents, profile)
        missing_profile   = self._missing_profile_fields(profile)

        blockers = []
        if not official_url:
            blockers.append(
                "No official application URL is available for this scheme. "
                "Please check the scheme's official website."
            )

        warnings = []
        if docs_missing:
            warnings.append(f"Collect before applying: {', '.join(docs_missing[:5])}.")
        if missing_profile:
            warnings.append(
                f"Profile is incomplete — {', '.join(missing_profile[:3])} not set. "
                "Go to Profile to add these for better accuracy."
            )

        # Demo form spec — the key new addition
        demo_form = self._build_demo_form(scheme, profile, prefilled_fields)

        steps = self._build_steps(
            official_url=official_url,
            portal_name=portal_name,
            portal_direct=portal_direct,
            portal_note=portal_note,
            docs_missing=docs_missing,
        )

        return {
            "scheme_name":      name,
            "scheme_category":  category,
            "scheme_benefits":  benefits,
            "official_url":     official_url,
            "portal_name":      portal_name,
            "portal_supported": portal_supported,
            "portal_note":      portal_note,
            "prefilled_fields": prefilled_fields,
            "missing_fields":   missing_profile,
            "required_docs":    documents,
            "docs_available":   docs_available,
            "docs_missing":     docs_missing,
            "ready_to_proceed": not blockers,
            "blockers":         blockers,
            "warnings":         warnings,
            "steps":            steps,
            "eligibility_hint": eligibility,
            # New: full interactive demo form spec
            "demo_form":        demo_form,
        }

    # ----------------------------------------------------------
    def submit_demo(
        self,
        scheme_name: str,
        form_values: dict,
        user_id: int,
    ) -> dict:
        """
        Process a demo form submission.

        Validates that required fields are present, then issues a
        clearly-labelled DEMO reference ID.

        NEVER submits to any real government portal.
        NEVER creates a real application record.
        Reference IDs are prefixed DEMO- and cannot be mistaken
        for real government acknowledgement numbers.
        """
        errors = []

        # Validate required fields
        required = [k for k, _, _, req in _PROFILE_FIELD_MAP if req]
        required += [k for k, _, _, req, _ in _EXTRA_FORM_FIELDS
                     if req and k in ("aadhaar_number", "mobile_number")]

        for field in required:
            val = (form_values.get(field) or "").strip()
            if not val:
                label = next(
                    (lab for k, lab, _, _ in _PROFILE_FIELD_MAP if k == field),
                    None
                ) or next(
                    (lab for k, lab, _, _, _ in _EXTRA_FORM_FIELDS if k == field),
                    field
                )
                errors.append(f"{label} is required.")

        # Basic Aadhaar format check (12 digits, no verification)
        aadhaar = (form_values.get("aadhaar_number") or "").replace(" ", "").replace("-", "")
        if aadhaar and (not aadhaar.isdigit() or len(aadhaar) != 12):
            errors.append("Aadhaar Number must be exactly 12 digits.")

        # Basic mobile format check
        mobile = (form_values.get("mobile_number") or "").replace(" ", "").replace("-", "")
        if mobile and (not mobile.isdigit() or len(mobile) != 10):
            errors.append("Mobile Number must be exactly 10 digits.")

        if errors:
            return {
                "success":   False,
                "errors":    errors,
                "reference": None,
            }

        # Issue demo reference ID — clearly NOT a government reference
        short_id  = str(uuid.uuid4()).upper()[:8]
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
        ref_id    = f"DEMO-{timestamp}-{short_id}"

        return {
            "success":      True,
            "reference_id": ref_id,
            "scheme_name":  scheme_name,
            "submitted_at": datetime.datetime.now().isoformat(),
            "important_note": (
                "This is a DEMO submission by IntelliGov AI. "
                "No application has been sent to any government portal. "
                "To complete your real application, use the official "
                "government portal link provided."
            ),
        }

    # ----------------------------------------------------------
    def _build_demo_form(
        self,
        scheme: dict,
        profile: dict | None,
        prefilled: dict,
    ) -> dict:
        """
        Build a field-by-field demo form spec.

        Each field includes:
          key, label, type, value (from profile or ""), auto_filled, required,
          hint, editable

        Sensitive fields (Aadhaar, mobile, bank) are NEVER pre-filled —
        the user must type them explicitly.
        """
        profile = profile or {}
        fields  = []

        # ---- Profile-backed fields ----
        profile_label_map = {
            "Full Name":                 "name",
            "Age":                       "age",
            "State / UT":                "state",
            "District":                  "district",
            "Educational Qualification": "education",
            "Occupation / Category":     "occupation",
            "Annual Family Income":      "income",
            "Social Category (Caste)":   "category",
        }

        for pk, label, ftype, required in _PROFILE_FIELD_MAP:
            raw_val   = profile.get(pk)
            str_val   = str(raw_val) if raw_val is not None else ""
            filled    = bool(str_val)

            fields.append({
                "key":         pk,
                "label":       label,
                "type":        ftype,
                "value":       str_val,
                "auto_filled": filled,
                "required":    required,
                "editable":    True,
                "hint":        f"Auto-filled from your profile." if filled else "Please enter this value.",
                "sensitive":   False,
            })

        # ---- Sensitive fields — NEVER pre-filled ----
        for fk, label, ftype, required, hint in _EXTRA_FORM_FIELDS:
            fields.append({
                "key":         fk,
                "label":       label,
                "type":        ftype,
                "value":       "",   # intentionally blank
                "auto_filled": False,
                "required":    required,
                "editable":    True,
                "hint":        hint,
                "sensitive":   True,
            })

        auto_count  = sum(1 for f in fields if f["auto_filled"])
        total_count = len(fields)

        return {
            "fields":         fields,
            "auto_filled":    auto_count,
            "total_fields":   total_count,
            "fill_pct":       round(auto_count / total_count * 100) if total_count else 0,
            "scheme_name":    scheme.get("name", ""),
            "is_demo":        True,
            "demo_notice":    (
                "This is an IntelliGov AI demonstration form. "
                "Fields marked '✓ Auto-filled' were populated from your saved profile. "
                "Sensitive fields (Aadhaar, mobile, bank) must be entered by you. "
                "Submitting this demo form does NOT send any application to a real "
                "government portal. Use the official portal link to apply for real."
            ),
        }

    # ----------------------------------------------------------
    def _classify_portal(self, url: str) -> tuple[str, bool, str, bool]:
        if not url:
            return "Unknown portal", False, "", False
        clean = url.lower().replace("https://", "").replace("http://", "").replace("www.", "")
        for domain, meta in _KNOWN_PORTALS.items():
            if clean.startswith(domain) or domain in clean:
                return (meta["name"], True, meta["note"], meta.get("direct", True))
        return (
            _pretty_domain(url),
            False,
            "Manual completion required. Open the official portal below.",
            False,
        )

    # ----------------------------------------------------------
    def _prefill_from_profile(self, profile: dict | None) -> dict:
        if not profile:
            return {}
        filled: dict[str, str] = {}
        mapping = [
            ("name",       "Full Name"),
            ("age",        "Age"),
            ("state",      "State / UT"),
            ("district",   "District"),
            ("education",  "Educational Qualification"),
            ("occupation", "Occupation"),
            ("income",     "Annual Income Range"),
            ("category",   "Social Category"),
        ]
        for pk, label in mapping:
            v = profile.get(pk)
            if v is not None and str(v).strip():
                filled[label] = str(v)
        return filled

    # ----------------------------------------------------------
    def _analyse_documents(
        self, required_docs: list, profile: dict | None
    ) -> tuple[list, list]:
        available, missing = [], []
        p = profile or {}
        has_age  = bool(p.get("age"))
        has_st   = bool(p.get("state"))
        has_cat  = bool(p.get("category"))
        has_inc  = bool(p.get("income"))
        has_edu  = bool(p.get("education"))

        for doc in required_docs:
            dl = str(doc).lower()
            if any(k in dl for k in ("aadhaar", "aadhar", "uid")):
                available.append(doc)
            elif any(k in dl for k in ("age proof", "birth cert", "dob")):
                (available if has_age else missing).append(doc)
            elif "income" in dl:
                (available if has_inc else missing).append(doc)
            elif any(k in dl for k in ("caste", "category", "sc cert", "st cert", "obc cert")):
                ok = has_cat and p.get("category", "").lower() not in ("general", "general/unreserved", "")
                (available if ok else missing).append(doc)
            elif any(k in dl for k in ("mark sheet", "certificate", "degree", "educational", "qualification")):
                (available if has_edu else missing).append(doc)
            elif any(k in dl for k in ("domicile", "residency", "residence", "address")):
                (available if has_st else missing).append(doc)
            else:
                missing.append(doc)
        return available, missing

    # ----------------------------------------------------------
    def _missing_profile_fields(self, profile: dict | None) -> list:
        if not profile:
            return ["name", "age", "state", "occupation", "income", "category", "education"]
        useful = ["age", "state", "district", "education", "occupation", "income", "category"]
        return [f for f in useful if not profile.get(f)]

    # ----------------------------------------------------------
    def _build_steps(
        self, official_url, portal_name, portal_direct, portal_note, docs_missing
    ) -> list:
        steps, n = [], 1
        if docs_missing:
            steps.append({
                "step": n, "title": "Gather missing documents",
                "detail": f"Collect before proceeding: {', '.join(docs_missing[:5])}."
            }); n += 1
        steps.append({
            "step": n, "title": "Review & confirm demo form",
            "detail": "Review the auto-filled application form. "
                      "Edit any incorrect fields and fill in sensitive details."
        }); n += 1
        if official_url:
            steps.append({
                "step": n,
                "title": f"Open official portal: {portal_name}",
                "detail": portal_note or f"Complete your real application at {official_url}.",
                "url": official_url,
            }); n += 1
        steps.append({
            "step": n, "title": "Submit on the official portal",
            "detail": "Fill and submit the form on the official government portal. "
                      "Keep the acknowledgement number safe."
        })
        return steps


# ============================================================
# MODULE-LEVEL SINGLETON
# ============================================================

application_agent = ApplicationAgent()


# ============================================================
# HELPERS
# ============================================================

def _pretty_domain(url: str) -> str:
    url = url.replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].capitalize() + " Portal"
