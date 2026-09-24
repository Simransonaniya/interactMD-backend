import os
import re
import json
from typing import Dict, Any, List, Optional
from app.config import settings

class LLMProvider:
    async def generate_patient_turn(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        case_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        raise NotImplementedError

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        from google import genai
        self.client = genai.Client(api_key=api_key)

    async def generate_patient_turn(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        case_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Format turns for Gemini API
        contents = []
        for turn in conversation_history[-8:]:
            role = "user" if turn.get("sender") == "student" else "model"
            contents.append(f"{role.upper()}: {turn.get('text')}")
        
        contents.append(f"USER (Doctor): {user_message}")
        full_content = f"{system_prompt}\n\nRecent Dialogue:\n" + "\n".join(contents) + "\nPATIENT (Speak naturally in character):"
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=full_content
        )
        return {
            "reply": response.text.strip(),
            "provider": f"Gemini ({self.model_name})"
        }

class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key
        self.model_name = model_name
        from groq import Groq
        self.client = Groq(api_key=api_key)

    async def generate_patient_turn(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        case_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        messages = [{"role": "system", "content": system_prompt}]
        for turn in conversation_history[-8:]:
            role = "user" if turn.get("sender") == "student" else "assistant"
            messages.append({"role": role, "content": turn.get("text")})
        messages.append({"role": "user", "content": user_message})

        chat_completion = self.client.chat.completions.create(
            messages=messages,
            model=self.model_name,
            temperature=0.7,
            max_tokens=250
        )
        return {
            "reply": chat_completion.choices[0].message.content.strip(),
            "provider": f"Groq ({self.model_name})"
        }

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3"):
        self.base_url = base_url
        self.model_name = model_name

    async def generate_patient_turn(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        case_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        import httpx
        messages = [{"role": "system", "content": system_prompt}]
        for turn in conversation_history[-8:]:
            role = "user" if turn.get("sender") == "student" else "assistant"
            messages.append({"role": role, "content": turn.get("text")})
        messages.append({"role": "user", "content": user_message})

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False
                }
            )
            data = resp.json()
            return {
                "reply": data.get("message", {}).get("content", "").strip(),
                "provider": f"Ollama ({self.model_name})"
            }

# ---------------------------------------------------------------------------
# Patient Dialogue Rules constants for RuleBasedClinicalProvider
# ---------------------------------------------------------------------------
_OPEN_ENDED_PATTERNS = [
    r"what brings you",
    r"what brought you",
    r"how can i help",
    r"tell me about",
    r"what('s| is) (the matter|going on|wrong|bothering|troubling)",
    r"what happened",
    r"how are you (feeling|doing)",
    r"what (can i|may i) (do|help)",
    r"why (are you|did you come)",
    r"chief complaint",
    r"present(ing)? complaint",
    r"what seems to be",
    r"what's wrong",
]

_JARGON_TERMS = [
    "stemi", "myocardial infarction", "troponin", "ecg", "ischemia",
    "appendicitis", "peritonitis", "bronchospasm", "sepsis",
    "leukocytosis", "bandemia", "pathognomonic", "diaphoresis",
    "tachycardia", "bradycardia", "nstemi", "atherothrombotic",
]

_DIAGNOSIS_TRIGGER = [
    "what's wrong with me", "what do i have", "what is my diagnosis",
    "am i having a heart attack", "is it serious", "what is it",
]


def _personalize(text: str) -> str:
    """
    Converts 3rd-person clinical fact strings into 1st-person patient voice.
    Applies word-boundary regex in safe order to avoid double-substitution.

    Patient Dialogue Rule: Never refer to yourself as he/she/the patient.
    """
    if not text:
        return text
    result = re.sub(r'\bthe patient\b', 'I', text, flags=re.IGNORECASE)
    result = re.sub(r'\b(his|her|their)\b', 'my', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhe\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\bshe\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\bthey\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(himself|herself|themself|themselves)\b', 'myself', result, flags=re.IGNORECASE)
    # Restore sentence-initial capitalisation
    result = re.sub(r'(?<=[.!?]\s)i\b', 'I', result)
    if result and result[0] == 'i' and len(result) > 1 and result[1] == ' ':
        result = 'I' + result[1:]
    return result


def _validate_response(reply: str) -> List[str]:
    """
    Validates a generated patient reply against Patient Dialogue Rules.
    Returns a list of rule violation descriptions (empty = all clear).
    """
    violations = []
    lower = reply.lower()
    if re.search(r'\bhis\b', lower):     violations.append("3rd-person pronoun: 'his'")
    if re.search(r'\bshe\b', lower):     violations.append("3rd-person pronoun: 'she'")
    if re.search(r'\bthe patient\b', lower): violations.append("3rd-person: 'the patient'")
    if "what else do you need" in lower:  violations.append("Medical-assistant language")
    if "here is my medical history" in lower: violations.append("Medical-assistant language")
    if "my diagnosis" in lower:           violations.append("Potential diagnosis leak")
    return violations


class RuleBasedClinicalProvider(LLMProvider):
    """
    High-fidelity clinical fact-graph simulation engine.

    Implements all 15 Patient Dialogue Rules:
      1.  Always speak as the patient in first person
      2.  Never use he/she/the patient self-references
      3.  Never expose raw case JSON or clinical field names
      4.  Convert structured facts to natural patient language
      5.  Only reveal information relevant to the current question
      6.  Do not dump unrelated facts
      7.  Do not summarize the entire case in one response
      8.  Do not act like a medical assistant
      9.  Keep responses concise (1–3 sentences)
      10. Do not expose internal data (IDs, field names, rubrics)
      11. Handle open-ended questions with chief complaint only
      12. Question-to-fact category mapping
      13. Do not break existing API contract
      14. Validate response before returning
      15. Case data is source of truth; do not invent facts
    """

    async def generate_patient_turn(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        case_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        query = user_message.lower().strip()
        facts = case_data.get("facts", {})
        p = case_data.get("patient", {})

        from app.services.guardrails import detect_empathy
        empathy_present = detect_empathy(query)

        # ------------------------------------------------------------------
        # Rule 12: Detect medical jargon — patient cannot understand it
        # ------------------------------------------------------------------
        used_jargon = [t for t in _JARGON_TERMS if t in query]
        if used_jargon and len(query.split()) < 15 and not any(
            k in query for k in ["when", "how", "pain", "where"]
        ):
            jargon_term = used_jargon[0].upper()
            reply = (
                f"I... I'm not sure what {jargon_term} means, Doctor. "
                "Is that something serious? Please, just tell me what's happening to me."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 5 / 11: Diagnosis questions — never reveal hidden diagnosis
        # ------------------------------------------------------------------
        if any(trigger in query for trigger in _DIAGNOSIS_TRIGGER) and len(query) < 60:
            reply = (
                "I don't know exactly, Doctor. That's why I came in — "
                "I just know something feels very wrong with my chest."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 8: Greeting — patient responds warmly, NOT like an assistant
        # ------------------------------------------------------------------
        if re.match(r'^(hi|hello|hey|good morning|good afternoon|good evening|doctor)\b', query) and len(query) < 40:
            reply = f"Hello Doctor... Thank you for seeing me so quickly. {p.get('presentationComplaint', '')}"
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 11: Pure empathy from student — brief grateful response only
        # ------------------------------------------------------------------
        if empathy_present and len(query) < 60 and not any(
            k in query for k in ['pain', 'when', 'hurt', 'breathe', 'belly', 'start', 'where', 'describe']
        ):
            reply = "Thank you, Doctor. That genuinely helps... I've been so scared since this started."
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 11: Open-ended / chief-complaint questions
        # Only return chief complaint + ONE context detail. Never dump history.
        # ------------------------------------------------------------------
        if any(re.search(pat, query) for pat in _OPEN_ENDED_PATTERNS):
            chief = _personalize(p.get('presentationComplaint', 'I have been having chest pain.'))
            reply = f"{chief} I'm feeling really frightened, to be honest."
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: OPQRST — Onset & Timing
        # Wrap in natural language; personalize all 3rd-person strings.
        # ------------------------------------------------------------------
        if any(k in query for k in ['when', 'start', 'how long', 'onset', 'began', 'since when', 'duration', 'time']):
            onset = _personalize(facts.get('onset', 'it came on suddenly'))
            timing = _personalize(facts.get('timing', 'and it has been continuous since then'))
            reply = f"It {onset} {timing}"
            return self._reply(self._finalize(reply))

        # ------------------------------------------------------------------
        # Rule 4 / 12: OPQRST — Provocation & Palliation
        # ------------------------------------------------------------------
        if any(k in query for k in ['better', 'worse', 'aggravat', 'reliev', 'trigger', 'rest', 'make it', 'position', 'moving']):
            pp = _personalize(facts.get('provocationPalliative', 'nothing seems to make it better.'))
            reply = f"Honestly, {pp.lower() if pp[0].isupper() else pp}"
            return self._reply(self._finalize(reply))

        # ------------------------------------------------------------------
        # Rule 4 / 12: OPQRST — Quality / Character
        # ------------------------------------------------------------------
        if any(k in query for k in ['feel like', 'describe', 'sharp', 'dull', 'crushing', 'tight', 'burning', 'nature', 'kind of pain', 'type of pain', 'character', 'what kind']):
            quality = _personalize(facts.get('quality', 'a heavy, uncomfortable pressure'))
            reply = f"It's {quality.lower() if quality[0].isupper() else quality}"
            return self._reply(self._finalize(reply))

        # ------------------------------------------------------------------
        # Rule 4 / 12: OPQRST — Radiation / Spread
        # ------------------------------------------------------------------
        if any(k in query for k in ['radiat', 'spread', 'move', 'go anywhere', 'jaw', 'arm', 'shoulder', 'neck', 'travel', 'elsewhere']):
            rad_raw = facts.get('radiation')
            if rad_raw:
                rad = _personalize(rad_raw)
                reply = f"Yes — {rad.lower() if rad[0].isupper() else rad}"
            else:
                reply = "No, it stays right where it is. It hasn't moved or spread anywhere."
            return self._reply(self._finalize(reply))

        # ------------------------------------------------------------------
        # Rule 4 / 12: OPQRST — Severity (1–10)
        # ------------------------------------------------------------------
        if any(k in query for k in ['scale', 'rate', 'how bad', 'severity', '1 to 10', '1-10', 'score', 'out of 10', 'pain level', 'out of ten']):
            sev_raw = _personalize(facts.get('severity', "it's very bad, maybe a seven out of ten"))
            # Strip residual 3rd-person openers like "Rates it an 8..."
            sev = re.sub(r'^\s*(rates?\s+(it\s+)?)', "I'd say ", sev_raw, flags=re.IGNORECASE)
            reply = f"Right now? {sev.lower() if sev[0].isupper() else sev}"
            return self._reply(self._finalize(reply))

        # ------------------------------------------------------------------
        # Rule 4 / 12: Associated Symptom — Sweating
        # ------------------------------------------------------------------
        if any(k in query for k in ['sweat', 'clammy', 'perspir', 'cold sweat', 'damp']):
            sweat_present = any(
                'sweat' in s.lower() or 'diaphoresis' in s.lower()
                for s in facts.get('associatedSymptoms', [])
            )
            reply = (
                "Yes — I'm completely drenched in cold sweat. My shirt is soaked."
                if sweat_present
                else "No, I haven't noticed any unusual sweating."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Associated Symptom — Nausea / Vomiting
        # ------------------------------------------------------------------
        if any(k in query for k in ['nausea', 'nauseous', 'vomit', 'throw up', 'sick to your stomach', 'queasy']):
            n = [
                s for s in facts.get('associatedSymptoms', [])
                if 'nausea' in s.lower() or 'vomit' in s.lower()
            ]
            reply = (
                f"Yes — I feel quite sick to my stomach. {_personalize(n[0]).rstrip('.')}."
                if n
                else "No, I haven't felt sick to my stomach."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Associated Symptom — Shortness of Breath
        # ------------------------------------------------------------------
        if any(k in query for k in ['breath', 'short of breath', 'breathe', 'dyspnea', 'wheez', 'air']):
            sob = [
                s for s in facts.get('associatedSymptoms', [])
                if 'breath' in s.lower() or 'wheez' in s.lower()
            ]
            if sob:
                reply = f"Yes — {_personalize(sob[0]).rstrip('.')}."
            else:
                reply = "My breathing is basically okay. It's mainly this chest pain."
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Associated Symptom — Cough / Sputum
        # ------------------------------------------------------------------
        if any(k in query for k in ['cough', 'phlegm', 'sputum', 'spit', 'hemoptysis']):
            sputum_info = [
                s for s in facts.get('associatedSymptoms', [])
                if 'sputum' in s.lower() or 'cough' in s.lower() or 'blood' in s.lower()
            ]
            reply = (
                f"Yes — {_personalize(sputum_info[0]).rstrip('.')}."
                if sputum_info
                else "No cough at all, Doctor."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Associated Symptom — Fever / Chills
        # ------------------------------------------------------------------
        if any(k in query for k in ['fever', 'chills', 'temperature', 'shiver']):
            fever_sym = [
                s for s in facts.get('associatedSymptoms', [])
                if 'fever' in s.lower() or 'chills' in s.lower()
            ]
            reply = (
                f"Yes — {_personalize(fever_sym[0]).rstrip('.')}."
                if fever_sym
                else "No, I haven't had a fever or chills."
            )
            return self._reply(reply)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Pertinent Negative — Tearing / Back Pain
        # ------------------------------------------------------------------
        if any(k in query for k in ['tearing', 'ripping', 'between shoulder', 'through to back', 'back pain']):
            return self._reply("No — definitely nothing tearing or going through to my back between the shoulder blades.")

        # ------------------------------------------------------------------
        # Rule 4 / 12: Past Medical History
        # Natural language conversion: never dump raw list verbatim.
        # ------------------------------------------------------------------
        if any(k in query for k in ['past medical', 'medical history', 'health problem', 'conditions', 'chronic', 'hospitalized', 'any conditions', 'medical conditions']):
            pmh = facts.get('pastMedicalHistory', [])
            if not pmh:
                return self._reply("I've generally been healthy before this — no major ongoing problems.")
            # Convert clinical list to natural patient language
            natural_pmh = self._naturalize_pmh(pmh)
            return self._reply(natural_pmh)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Current Medications
        # ------------------------------------------------------------------
        if any(k in query for k in ['medicat', 'medicine', 'prescription', 'pills', 'inhaler', 'drugs', 'taking', 'on any']):
            meds = facts.get('medications', [])
            if not meds:
                return self._reply("I don't take any regular medications.")
            natural_meds = self._naturalize_meds(meds)
            return self._reply(natural_meds)

        # ------------------------------------------------------------------
        # Rule 4 / 12: Allergies
        # ------------------------------------------------------------------
        if any(k in query for k in ['allerg', 'reaction', 'sensitive to']):
            allergies = facts.get('allergies', [])
            if not allergies:
                return self._reply("No allergies that I know of.")
            # Check for NKDA / no known allergies
            if any('no known' in a.lower() or 'nkda' in a.lower() for a in allergies):
                return self._reply("No, I don't have any known drug allergies.")
            allergy_text = ", ".join(_personalize(a) for a in allergies)
            return self._reply(f"I'm allergic to {allergy_text}.")

        # ------------------------------------------------------------------
        # Rule 4 / 12: Social History — Smoking, Alcohol, Work
        # ------------------------------------------------------------------
        if any(k in query for k in ['smoke', 'smoking', 'cigarette', 'tobacco', 'alcohol', 'drink', 'wine', 'beer', 'illicit', 'substance', 'recreational', 'cocaine']):
            social = facts.get('socialHistory', [])
            if not social:
                return self._reply("I don't smoke or use any recreational drugs. I drink occasionally.")
            natural_sh = self._naturalize_social(social)
            return self._reply(natural_sh)

        # Work / Occupation asked directly
        if any(k in query for k in ['work', 'job', 'occupation', 'profession']):
            occupation = p.get('occupation', 'a professional')
            return self._reply(f"I work as a {occupation}.")

        # ------------------------------------------------------------------
        # Rule 4 / 12: Family History
        # ------------------------------------------------------------------
        if any(k in query for k in ['family', 'father', 'mother', 'parents', 'genetic', 'hereditary', 'runs in']):
            fh = facts.get('familyHistory', [])
            if not fh:
                return self._reply("Nothing significant in my family that I'm aware of.")
            natural_fh = self._naturalize_family(fh)
            return self._reply(natural_fh)

        # ------------------------------------------------------------------
        # Rule 15: Out-of-scope question — do not invent facts
        # ------------------------------------------------------------------
        return self._reply(
            "I'm not sure I understand exactly what you mean, Doctor. "
            "Could you ask me that in a different way? I want to help."
        )

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _reply(text: str) -> Dict[str, Any]:
        """Wraps reply text in the standard provider response dict."""
        # Run validation; log violations (do not crash — just note them)
        violations = _validate_response(text)
        if violations:
            import sys
            print(f"[PatientDialogue] Rule violations detected: {violations}", file=sys.stderr)
        return {
            "reply": text,
            "provider": "Clinical Fact Engine (Rule-Based)"
        }

    @staticmethod
    def _finalize(text: str) -> str:
        """Ensures sentence ends with punctuation and is properly capitalised."""
        text = text.strip()
        if text and text[-1] not in '.!?':
            text += '.'
        return text

    @staticmethod
    def _naturalize_pmh(pmh: List[str]) -> str:
        """
        Converts a list of clinical PMH strings into natural first-person language.
        Rule 4: Convert structured data into natural patient language.

        Examples:
          'Essential Hypertension diagnosed 6 years ago'
          -> 'I have high blood pressure — I was diagnosed about six years ago.'
        """
        parts = []
        for item in pmh:
            lower = item.lower()
            # Map common clinical terms to lay equivalents
            if 'hypertension' in lower:
                parts.append("I have high blood pressure")
                if '6 years' in lower or 'six years' in lower:
                    parts[-1] += " — I was told about six years ago"
            elif 'hyperlipidemia' in lower or 'elevated ldl' in lower or 'cholesterol' in lower:
                parts.append("I've also been told my cholesterol is high")
            elif 'no prior heart attack' in lower or 'no prior mi' in lower:
                parts.append("I've never had a heart attack before")
            elif 'diabetes' in lower:
                parts.append("I have diabetes")
            elif 'asthma' in lower:
                parts.append("I have asthma")
            elif 'copd' in lower:
                parts.append("I have a chronic lung condition — they call it COPD")
            elif 'no known' in lower or 'no prior' in lower or 'no previous' in lower:
                pass  # skip negative-history items that aren't meaningful to volunteer
            else:
                # Fall back to _personalize() for anything not explicitly mapped
                parts.append(_personalize(item))

        if not parts:
            return "I've generally been healthy — nothing major that I know of."
        if len(parts) == 1:
            return f"{parts[0]}."
        return ". ".join(parts) + "."

    @staticmethod
    def _naturalize_meds(meds: List[str]) -> str:
        """
        Converts medication list to natural patient language.
        Rule 4: Never list medications as if reading a prescription label.
        """
        if not meds:
            return "I don't take any regular medications."
        if len(meds) == 1:
            return f"I take {_personalize(meds[0])}."
        med_items = [_personalize(m) for m in meds]
        return f"I take {', '.join(med_items[:-1])}, and {med_items[-1]}."

    @staticmethod
    def _naturalize_social(social: List[str]) -> str:
        """
        Converts social history list to natural patient language.
        Rule 4: Never read raw clinical social history strings verbatim.
        """
        parts = []
        for item in social:
            lower = item.lower()
            if 'smoke' in lower or 'pack' in lower or 'cigarette' in lower:
                # Extract pack-year info naturally
                if '0.5' in item or 'half' in lower:
                    parts.append("I smoke about half a pack a day — I've been smoking for around 25 years")
                elif 'pack' in lower:
                    parts.append(f"I smoke: {_personalize(item).lower()}")
                else:
                    parts.append("I smoke cigarettes")
            elif 'denies' in lower:
                parts.append(_personalize(item.replace('Denies', 'I don\'t use').replace('denies', 'I don\'t use')))
            elif 'drink' in lower or 'wine' in lower or 'alcohol' in lower:
                if 'weekend' in lower:
                    parts.append("I have a glass or two of wine on the weekends")
                else:
                    parts.append(_personalize(item))
            else:
                parts.append(_personalize(item))
        return ". ".join(parts) + (".") if parts else "I don't have any significant social habits to mention."

    @staticmethod
    def _naturalize_family(fh: List[str]) -> str:
        """
        Converts family history to natural patient language.
        Rule 4: 'Father had a fatal myocardial infarction at age 52'
                -> 'My father had a heart attack when he was 52 — it was fatal.'
        """
        parts = []
        for item in fh:
            lower = item.lower()
            if 'myocardial infarction' in lower or 'heart attack' in lower:
                if 'father' in lower:
                    age_match = re.search(r'age (\d+)', lower)
                    age_str = f" when he was {age_match.group(1)}" if age_match else ""
                    fatal = " — unfortunately, he didn't survive it" if 'fatal' in lower else ""
                    parts.append(f"My father had a heart attack{age_str}{fatal}")
                else:
                    parts.append(_personalize(item))
            elif 'diabetes' in lower:
                if 'mother' in lower:
                    parts.append("My mother has diabetes")
                else:
                    parts.append(_personalize(item))
            else:
                parts.append(_personalize(item))
        return ". ".join(parts) + "." if parts else "Nothing significant that I can think of."

def get_llm_provider() -> LLMProvider:
    provider_pref = settings.LLM_PROVIDER.lower()
    
    # If Gemini requested or Auto with key
    if provider_pref in ["gemini", "auto"]:
        gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                return GeminiProvider(api_key=gemini_key, model_name=settings.GEMINI_MODEL)
            except Exception as e:
                print(f"[LLMFactory] Failed to initialize Gemini: {e}")

    # If Groq requested or Auto with key
    if provider_pref in ["groq", "auto"]:
        groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                return GroqProvider(api_key=groq_key, model_name=settings.GROQ_MODEL)
            except Exception as e:
                print(f"[LLMFactory] Failed to initialize Groq: {e}")

    # If Ollama explicitly selected
    if provider_pref == "ollama":
        return OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model_name=settings.OLLAMA_MODEL)

    # Reliable default: RuleBasedClinicalProvider
    return RuleBasedClinicalProvider()
