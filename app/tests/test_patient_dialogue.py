"""
InteractMD Patient Dialogue Rules -- Automated Test Suite
Tests the RuleBasedClinicalProvider against all 10 required scenarios.

Run from: backend/
  python app/tests/test_patient_dialogue.py
"""

import sys
import os
import re
import asyncio
import unittest
import importlib.util
import types

# ---------------------------------------------------------------------------
# Bootstrap: load llm_factory without triggering app.config / pydantic-settings
# ---------------------------------------------------------------------------
_FACTORY_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'services', 'llm_factory.py')
)

# Stub app.config so Settings() never instantiates
_stub_config = types.ModuleType("app.config")
class _StubSettings:
    LLM_PROVIDER = "rule_based"
    GEMINI_API_KEY = ""
    GEMINI_MODEL = "gemini-2.5-flash"
    GROQ_API_KEY = ""
    GROQ_MODEL = "llama-3.3-70b-versatile"
    OLLAMA_BASE_URL = "http://localhost:11434"
    OLLAMA_MODEL = "llama3"

_stub_config.settings = _StubSettings()
sys.modules.setdefault("app", types.ModuleType("app"))
sys.modules["app.config"] = _stub_config

# Stub app.services.guardrails
_stub_gr = types.ModuleType("app.services.guardrails")
def _stub_detect_empathy(text: str) -> bool:
    EMPATHY = ["sorry", "concern", "take care", "help you", "comfortable",
               "don't worry", "here for you", "you are safe", "i hear you"]
    return any(p in text.lower() for p in EMPATHY)
_stub_gr.detect_empathy = _stub_detect_empathy
sys.modules.setdefault("app.services", types.ModuleType("app.services"))
sys.modules["app.services.guardrails"] = _stub_gr

# Load llm_factory cleanly
_spec = importlib.util.spec_from_file_location("llm_factory", _FACTORY_PATH)
_factory = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_factory)
RuleBasedClinicalProvider = _factory.RuleBasedClinicalProvider

# ---------------------------------------------------------------------------
# Minimal case fixture -- Robert Chen ACS case
# ---------------------------------------------------------------------------
CASE_ACS_1 = {
    "id": "case-acs-1",
    "patient": {
        "name": "Robert Chen",
        "age": 58,
        "gender": "Male",
        "occupation": "Architectural Project Manager",
        "presentationComplaint": "Severe pressure and heaviness in my chest that started less than an hour ago.",
        "initialStatement": "Doctor, please... It feels like an elephant is sitting right in the middle of my chest.",
        "mood": "Anxious, pale, clutching center of chest",
        "appearance": "Diaphoretic, breathing shallowly.",
    },
    "initialVitals": {"heartRate": 98, "bloodPressure": "154/94", "painScore": 8},
    "facts": {
        "onset": "Started approximately 45 minutes ago while walking up two flights of stairs to his office desk.",
        "provocationPalliative": "Worse with minimal exertion. Stopping and resting in his chair did not relieve the tightness at all.",
        "quality": "Deep, tight, crushing pressure; feels like a vice grip or heavy weight pressing down on his chest bone.",
        "radiation": "Radiates up into the left side of his jaw, lower teeth, and down the inner aspect of his left arm.",
        "severity": "Rates it an 8 out of 10 in severity right now, previously 9/10 at peak.",
        "timing": "Continuous and unremitting since it began 45 minutes ago.",
        "associatedSymptoms": [
            "Profuse cold sweats (diaphoresis)",
            "Mild lightheadedness",
            "Nausea without vomiting",
            "Shortness of breath",
        ],
        "pertinentNegatives": [
            "No sharp pleuritic pain with breathing",
            "No sudden tearing pain between shoulder blades",
            "No fever or chills",
        ],
        "pastMedicalHistory": [
            "Essential Hypertension diagnosed 6 years ago",
            "Hyperlipidemia (elevated LDL)",
            "No prior heart attack or stroke",
        ],
        "medications": [
            "Amlodipine 5 mg daily",
            "Atorvastatin 20 mg daily (admits to missing doses frequently)",
        ],
        "allergies": ["No known drug allergies (NKDA)"],
        "familyHistory": [
            "Father had a fatal myocardial infarction at age 52; Mother has type 2 diabetes."
        ],
        "socialHistory": [
            "Smokes 0.5 packs per day for 25 years (12.5 pack-years)",
            "Drinks 1-2 glasses of wine on weekends",
            "Denies illicit drug use, including cocaine or amphetamines.",
        ],
    },
}

THIRD_PERSON = re.compile(r'\b(he\b|she\b|his\b|her\b|the patient\b)', re.IGNORECASE)

FORBIDDEN_PHRASES = [
    "what else do you need",
    "here is my medical history",
    "based on my symptoms",
    "would you like to know",
]

DIAGNOSIS_TERMS = [
    "myocardial infarction",
    "stemi",
    "nstemi",
    "acute coronary syndrome",
    "inferior mi",
]


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def get_reply(question: str, history=None) -> str:
    provider = RuleBasedClinicalProvider()
    result = run(provider.generate_patient_turn(
        system_prompt="",
        user_message=question,
        conversation_history=history or [],
        case_data=CASE_ACS_1,
    ))
    return result["reply"]


class TestPatientDialogueRules(unittest.TestCase):

    # ------ Shared helpers ------

    def assertFirstPerson(self, reply, ctx=""):
        m = THIRD_PERSON.search(reply)
        self.assertIsNone(m, f"[Rule 1] 3rd-person '{m.group() if m else ''}' in {ctx}:\n{reply}")

    def assertNoAssistantLanguage(self, reply, ctx=""):
        lower = reply.lower()
        for phrase in FORBIDDEN_PHRASES:
            self.assertNotIn(phrase, lower, f"[Rule 8] Assistant phrase '{phrase}' in {ctx}:\n{reply}")

    def assertNoDiagnosis(self, reply, ctx=""):
        lower = reply.lower()
        for term in DIAGNOSIS_TERMS:
            self.assertNotIn(term, lower, f"[Rule 5] Diagnosis leak '{term}' in {ctx}:\n{reply}")

    # ------ Tests ------

    def test_01_open_ended_chief_complaint_only(self):
        """Open-ended -> chief complaint only, no history dump, first person."""
        reply = get_reply("Hello, can you tell me what brought you here today?")
        print(f"\n[T01] {reply}")
        self.assertFirstPerson(reply, "open-ended")
        self.assertNoDiagnosis(reply, "open-ended")
        self.assertNoAssistantLanguage(reply, "open-ended")
        self.assertTrue(
            any(w in reply.lower() for w in ["chest", "pressure", "pain", "heavy"]),
            f"Chief complaint missing:\n{reply}"
        )
        # No PMH or medications volunteered
        for bad in ["amlodipine", "atorvastatin", "hypertension", "smokes"]:
            self.assertNotIn(bad, reply.lower(), f"History dumped ('{bad}'):\n{reply}")

    def test_02_onset_timing(self):
        """'When did the pain start?' -> ~45 min, stairs, no unrelated info."""
        reply = get_reply("When did the pain start?")
        print(f"\n[T02] {reply}")
        self.assertFirstPerson(reply, "onset")
        self.assertNoDiagnosis(reply, "onset")
        self.assertTrue(
            any(w in reply.lower() for w in ["45", "stairs", "started", "began", "minutes"]),
            f"Onset timing missing:\n{reply}"
        )
        for bad in ["hypertension", "amlodipine", "family"]:
            self.assertNotIn(bad, reply.lower(), f"Unrelated info in onset ('{bad}'):\n{reply}")

    def test_03_quality_of_pain(self):
        """'Can you describe the pain?' -> crushing/pressure, first person, no dump."""
        reply = get_reply("Can you describe the pain?")
        print(f"\n[T03] {reply}")
        self.assertFirstPerson(reply, "quality")
        self.assertNoDiagnosis(reply, "quality")
        self.assertTrue(
            any(w in reply.lower() for w in ["crushing", "pressure", "tight", "heavy", "squeezing", "vice"]),
            f"Pain quality missing:\n{reply}"
        )

    def test_04_radiation(self):
        """'Does the pain radiate?' -> jaw/arm in first person."""
        reply = get_reply("Does the pain radiate anywhere?")
        print(f"\n[T04] {reply}")
        self.assertFirstPerson(reply, "radiation")
        self.assertNoDiagnosis(reply, "radiation")
        self.assertTrue(
            any(w in reply.lower() for w in ["jaw", "arm", "teeth", "left"]),
            f"Radiation destination missing:\n{reply}"
        )

    def test_05_past_medical_history_natural_language(self):
        """'Any medical conditions?' -> hypertension + cholesterol, natural language."""
        reply = get_reply("Do you have any medical conditions?")
        print(f"\n[T05] {reply}")
        self.assertFirstPerson(reply, "PMH")
        self.assertNoDiagnosis(reply, "PMH")
        self.assertNoAssistantLanguage(reply, "PMH")
        self.assertTrue(
            any(w in reply.lower() for w in ["blood pressure", "hypertension", "cholesterol", "lipid"]),
            f"PMH not naturally conveyed:\n{reply}"
        )
        # Must NOT dump medications, social, or allergies unprompted
        for bad in ["amlodipine", "atorvastatin", "smokes", "alcohol"]:
            self.assertNotIn(bad, reply.lower(), f"Unrelated info in PMH ('{bad}'):\n{reply}")

    def test_06_medications_only_case_defined(self):
        """'What medications do you take?' -> Amlodipine + Atorvastatin, no invented meds."""
        reply = get_reply("What medications do you take?")
        print(f"\n[T06] {reply}")
        self.assertFirstPerson(reply, "medications")
        self.assertNoDiagnosis(reply, "medications")
        self.assertTrue(
            any(w in reply.lower() for w in ["amlodipine", "atorvastatin", "blood pressure pill", "cholesterol"]),
            f"Case medications not mentioned:\n{reply}"
        )

    def test_07_diagnosis_not_revealed(self):
        """'What is your diagnosis?' -> patient doesn't know, no STEMI/MI."""
        reply = get_reply("What is your diagnosis?")
        print(f"\n[T07] {reply}")
        self.assertFirstPerson(reply, "diagnosis")
        self.assertNoDiagnosis(reply, "diagnosis")

    def test_08_no_invented_investigations(self):
        """'Did your CT show PE?' -> no invented CT or PE result."""
        reply = get_reply("Did your CT scan show a pulmonary embolism?")
        print(f"\n[T08] {reply}")
        self.assertFirstPerson(reply, "CT/PE")
        self.assertNotIn("pulmonary embolism", reply.lower(), f"Invented PE result:\n{reply}")
        self.assertNotIn("ct scan showed", reply.lower(), f"Invented CT result:\n{reply}")

    def test_09_consistency(self):
        """Ask onset twice -- consistent answer both times."""
        r1 = get_reply("When did the pain start?")
        r2 = get_reply(
            "Sorry, can you remind me when exactly you said it started?",
            history=[
                {"sender": "student", "text": "When did the pain start?"},
                {"sender": "patient", "text": r1, "category": "HPI"},
            ]
        )
        print(f"\n[T09] R1: {r1}")
        print(f"[T09] R2: {r2}")
        for r in [r1, r2]:
            self.assertFirstPerson(r, "consistency")
            self.assertTrue(
                any(w in r.lower() for w in ["45", "stairs", "started", "minutes", "began"]),
                f"Onset missing from answer:\n{r}"
            )

    def test_10_out_of_scope_stays_in_character(self):
        """'What is your favorite movie?' -> stays in character, no medical data invented."""
        reply = get_reply("What is your favorite movie?")
        print(f"\n[T10] {reply}")
        self.assertFirstPerson(reply, "out-of-scope")
        self.assertNoDiagnosis(reply, "out-of-scope")
        for jargon in ["stemi", "myocardial", "troponin", "ecg", "ischemia"]:
            self.assertNotIn(jargon, reply.lower(), f"Medical jargon invented:\n{reply}")


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestPatientDialogueRules)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
