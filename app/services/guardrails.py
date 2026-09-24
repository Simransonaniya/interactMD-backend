import re
from typing import List, Tuple, Dict, Any


EMPATHY_KEYWORDS = [
    "sorry", "concern", "take care", "help you", "comfortable", 
    "breathe", "rest", "right here", "stay calm", "don't worry", 
    "take your time", "here for you", "make you comfortable",
    "must be difficult", "understand", "i hear you", "we will figure this out",
    "you are safe"
]

MEDICAL_JARGON_TERMS = [
    "ischemic penumbra", "transmural necrosis", "pathognomonic", 
    "atherothrombotic cascade", "myocardial infarction", "st-elevation",
    "curb-65", "bronchospasm", "peritonitis", "appendicolith",
    "leukocytosis", "bandemia"
]

def detect_empathy(text: str) -> bool:
    """Detects whether the clinician user offered reassuring, empathetic bedside phrasing."""
    lower_text = text.lower()
    return any(phrase in lower_text for phrase in EMPATHY_KEYWORDS)

def detect_medical_jargon(text: str) -> List[str]:
    """Flags unexplained dense medical jargon in patient communication."""
    lower_text = text.lower()
    return [term for term in MEDICAL_JARGON_TERMS if term in lower_text]


def sanitize_pronouns(text: str) -> str:
    """
    Converts 3rd-person clinical language into 1st-person patient voice.

    Patient Dialogue Rule enforced:
      'Never refer to yourself as he, she, or the patient.'

    Replacements applied in order:
      'the patient'           → 'I'
      'his / her / their'     → 'my'
      'he / she / they'       → 'I'
      'himself / herself'     → 'myself'

    Args:
        text: Raw clinical or AI-generated patient response string.

    Returns:
        Sanitized string using first-person voice.
    """
    if not text:
        return text

    result = re.sub(r'\bthe patient\b', 'I', text, flags=re.IGNORECASE)
    result = re.sub(r'\b(his|her|their)\b', 'my', result, flags=re.IGNORECASE)
    result = re.sub(r'\bhe\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\bshe\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\bthey\b', 'I', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(himself|herself|themself|themselves)\b', 'myself', result, flags=re.IGNORECASE)

    # Restore sentence-initial capitalisation that substitution may have broken
    result = re.sub(r'(?<=[.!?]\s)i\b', 'I', result)
    if result and result[0] == 'i' and len(result) > 1 and result[1] == ' ':
        result = 'I' + result[1:]

    return result

def sanitize_patient_response(response: str, case_data: Dict[str, Any]) -> str:
    """
    Guardrail to prevent patient from blurting out exact ICD codes or 
    unprompted objective lab numbers that a real lay patient would not know.
    """
    sanitized = response
    
    # Redact any accidental ICD code mentions in dialogue
    sanitized = re.sub(r'\b[A-Z]\d{2}(\.\d{1,2})?\b', '', sanitized)
    
    # Ensure patient sounds like a person, not a textbook
    forbidden_phrases = [
        "My diagnosis is", "According to my lab results", "My troponin is",
        "My electrocardiogram shows", "I have an ICD-10"
    ]
    for phrase in forbidden_phrases:
        if phrase.lower() in sanitized.lower():
            sanitized = re.sub(phrase, "The EMS paramedics said something about my tests", sanitized, flags=re.IGNORECASE)
            
    return sanitized.strip()

def compute_suggested_next_topics(history: List[Dict[str, Any]], case_data: Dict[str, Any]) -> List[str]:
    """Identifies unexplored high-yield clinical domains from OPQRST & SAMPLER."""
    all_doctor_text = " ".join([
        m.get("text", "").lower() for m in history if m.get("sender") == "student"
    ])
    
    suggestions = []
    
    if not any(k in all_doctor_text for k in ["when", "start", "onset", "began"]):
        suggestions.append("Clarify precise onset & what patient was doing when pain started")
    if not any(k in all_doctor_text for k in ["radiat", "spread", "move", "jaw", "arm", "back"]):
        suggestions.append("Screen for symptom radiation (jaw, back, shoulder)")
    if not any(k in all_doctor_text for k in ["medicat", "pill", "prescript", "taking"]):
        suggestions.append("Inquire regarding current prescription medications and adherence")
    if not any(k in all_doctor_text for k in ["allerg"]):
        suggestions.append("Check for drug, environmental, or food allergies")
    if not any(k in all_doctor_text for k in ["family", "father", "mother", "hereditary"]):
        suggestions.append("Explore family history of early cardiovascular disease or respiratory conditions")
        
    return suggestions[:3]
