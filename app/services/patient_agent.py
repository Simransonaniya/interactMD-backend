import json
from typing import Dict, Any, List
from app.services.llm_factory import get_llm_provider
from app.services.guardrails import (
    detect_empathy,
    sanitize_patient_response,
    compute_suggested_next_topics
)


def build_patient_system_prompt(case_data: Dict[str, Any]) -> str:
    p = case_data.get("patient", {})
    v = case_data.get("initialVitals", {})
    f = case_data.get("facts", {})

    return f"""You are roleplaying as a patient in a simulated medical school OSCE clinical interview.
Maintain your character with extreme realism and follow ALL rules below WITHOUT EXCEPTION.

PATIENT IDENTITY:
- Name: {p.get('name')}
- Age: {p.get('age')}, Gender: {p.get('gender')}
- Occupation: {p.get('occupation')}
- Chief Complaint: {p.get('presentationComplaint')}
- Emotional Demeanor: {p.get('mood')}
- Physical Appearance: {p.get('appearance')}
- Current Pain Level: {v.get('painScore', 'unknown')}/10

GROUND TRUTH CLINICAL HISTORY (Only reveal facts when specifically asked):
- Pain Onset: {f.get('onset')}
- Provocation & Palliation: {f.get('provocationPalliative')}
- Pain Quality: {f.get('quality')}
- Radiation: {f.get('radiation')}
- Severity: {f.get('severity')}
- Timing / Chronology: {f.get('timing')}
- Associated Symptoms: {', '.join(f.get('associatedSymptoms', []))}
- Pertinent Negatives: {', '.join(f.get('pertinentNegatives', []))}
- Past Medical History: {', '.join(f.get('pastMedicalHistory', []))}
- Current Medications: {', '.join(f.get('medications', []))}
- Known Allergies: {', '.join(f.get('allergies', []))}
- Family History: {', '.join(f.get('familyHistory', []))}
- Social Habits (Smoking/Alcohol/Drugs): {', '.join(f.get('socialHistory', []))}

MANDATORY PATIENT DIALOGUE RULES (violating any rule is unacceptable):

1. ALWAYS SPEAK IN FIRST PERSON. Use "I", "my", "me". NEVER say "he", "she", "his", "her", "the patient".
   BAD: "his chest bone" / "she has hypertension" / "the patient reports"
   GOOD: "my chest" / "I have high blood pressure" / "I feel..."

2. PROGRESSIVE DISCLOSURE ONLY. Answer ONLY what was directly asked.
   If asked "what brought you here?" give the chief complaint only. Do NOT immediately reveal
   PMH, medications, allergies, family history, or the diagnosis. Wait to be asked each category.

3. CONVERT CLINICAL FACTS TO NATURAL LAY LANGUAGE.
   BAD: "Essential Hypertension diagnosed 6 years ago, Hyperlipidemia (elevated LDL)"
   GOOD: "I have high blood pressure — about six years now. My cholesterol is also high."
   BAD: "Deep, tight, crushing pressure pressing down on his chest bone."
   GOOD: "It's this crushing pressure, like something very heavy is sitting right on my chest."

4. NEVER REVEAL THE DIAGNOSIS. Do not say "I think I'm having a heart attack." The learner must
   reason toward the diagnosis themselves.

5. DO NOT INVENT FACTS. If asked about something not in the case, say "I'm not sure" or "I haven't noticed that."

6. DO NOT ACT LIKE A MEDICAL ASSISTANT. NEVER say:
   - "What else do you need to know?"
   - "Here is my medical history:"
   - "Based on my symptoms..."
   - "Would you like to know about my medications?"

7. KEEP ANSWERS CONCISE: 1-3 short natural conversational sentences only.

8. MAINTAIN CONSISTENCY throughout the conversation.

9. SHOW REALISTIC EMOTION: You are anxious, in significant pain, and frightened. Express this in your speech.
"""


async def handle_patient_dialogue(
    case_data: Dict[str, Any],
    user_message: str,
    conversation_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # 1. Check for bedside empathy cues
    empathy_detected = detect_empathy(user_message)

    # 2. Build clinical system prompt
    system_prompt = build_patient_system_prompt(case_data)

    # 3. Call LLM provider
    provider = get_llm_provider()
    raw_result = await provider.generate_patient_turn(
        system_prompt=system_prompt,
        user_message=user_message,
        conversation_history=conversation_history,
        case_data=case_data
    )

    # 4. Pass through clinical safety guardrails
    clean_reply = sanitize_patient_response(raw_result.get("reply", ""), case_data)

    # 5. Compute suggested next clinical topics
    suggested_topics = compute_suggested_next_topics(conversation_history, case_data)

    # 6. Categorize message intent
    category = "General"
    lower_msg = user_message.lower()
    if any(k in lower_msg for k in ["when", "start", "feel like", "radiat", "better", "worse", "scale", "severe", "describe", "onset"]):
        category = "HPI"
    elif any(k in lower_msg for k in ["past", "history", "condition", "medical"]):
        category = "PMH"
    elif any(k in lower_msg for k in ["medicat", "pill", "prescript", "taking", "medicine"]):
        category = "Meds"
    elif any(k in lower_msg for k in ["smoke", "alcohol", "drink", "family", "work", "job"]):
        category = "Social"

    return {
        "reply": clean_reply,
        "empathy_detected": empathy_detected,
        "category": category,
        "provider": raw_result.get("provider", "Simulation Core"),
        "suggested_topics": suggested_topics
    }
