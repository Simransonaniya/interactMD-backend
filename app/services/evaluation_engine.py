import uuid
from typing import Dict, Any, List
from app.models.schemas import (
    EvaluationSubmission,
    ClinicalEvaluationResponse,
    DimensionScore
)

def evaluate_encounter(case_data: Dict[str, Any], submission: EvaluationSubmission) -> ClinicalEvaluationResponse:
    chat_history = submission.conversation_history
    student_msgs = [m for m in chat_history if m.sender == "student"]
    student_text = " ".join([m.text.lower() for m in student_msgs])
    
    # -------------------------------------------------------------
    # Dimension 1: History Taking & Completeness
    # -------------------------------------------------------------
    hpi_checks = [
        {"name": "Onset & Timing", "keys": ["when", "start", "how long", "onset", "time", "duration"]},
        {"name": "Pain Quality & Character", "keys": ["feel like", "describe", "sharp", "crushing", "heavy", "tight", "nature"]},
        {"name": "Radiation Pattern", "keys": ["radiat", "spread", "jaw", "arm", "back", "neck", "shoulder"]},
        {"name": "Severity Scale (1-10)", "keys": ["scale", "rate", "1-10", "1 to 10", "severity", "how bad"]},
        {"name": "Associated Symptoms", "keys": ["sweat", "nausea", "breath", "vomit", "dizzy", "wheez", "fever", "cough"]},
        {"name": "Past Medical History", "keys": ["history", "medical", "condition", "past", "hospital", "before"]},
        {"name": "Medication History & Adherence", "keys": ["medicat", "medicine", "pill", "inhaler", "taking", "prescript"]},
        {"name": "Allergies", "keys": ["allerg"]},
        {"name": "Social Habits / Toxic Ingestions", "keys": ["smoke", "alcohol", "drink", "tobacco", "cocaine", "lifestyle"]},
        {"name": "Family History", "keys": ["family", "father", "mother", "heart attack", "genetic"]}
    ]
    
    dim1_hits = []
    dim1_misses = []
    dim1_score = 30
    
    for check in hpi_checks:
        if any(k in student_text for k in check["keys"]):
            dim1_score += 7
            dim1_hits.append(check["name"])
        else:
            dim1_misses.append(check["name"])
            
    dim1_score = min(100, max(35, dim1_score))
    
    dim1_status = "Exemplary" if dim1_score >= 85 else "Competent" if dim1_score >= 70 else "Developing"
    dim1_feedback = (
        f"Elicited {len(dim1_hits)}/10 core clinical history pillars. "
        + (f"Missed: {', '.join(dim1_misses[:2])}." if dim1_misses else "Comprehensive coverage.")
    )
    
    # -------------------------------------------------------------
    # Dimension 2: Clinical Reasoning & Diagnosis
    # -------------------------------------------------------------
    dx_options = case_data.get("diagnosisOptions", [])
    primary_correct = any(
        d["id"] == submission.primary_diagnosis_id and d.get("isCorrectPrimary")
        for d in dx_options
    )
    
    dim2_score = 60 if primary_correct else 35
    correct_diffs = [d["id"] for d in dx_options if d.get("isHighDifferential")]
    matched_diffs = [d_id for d_id in submission.differential_diagnosis_ids if d_id in correct_diffs]
    dim2_score += min(25, len(matched_diffs) * 12)
    
    if len(submission.clinical_rationale.strip()) > 75:
        dim2_score += 15
    elif len(submission.clinical_rationale.strip()) > 20:
        dim2_score += 8
    dim2_score = min(100, max(30, dim2_score))
    
    dim2_status = "Exemplary" if dim2_score >= 85 else "Competent" if dim2_score >= 70 else "Developing"
    dim2_feedback = (
        "Correct primary diagnosis identified with sound differential coverage."
        if primary_correct else
        "Incorrect primary diagnosis; review key discriminating findings."
    )
    
    # -------------------------------------------------------------
    # Dimension 3: Bedside Communication & Empathy
    # -------------------------------------------------------------
    empathy_words = ["sorry", "help", "comfort", "take care", "breathe", "right here", "worry", "understand", "ease"]
    empathy_count = sum(1 for m in student_msgs if any(w in m.text.lower() for w in empathy_words))
    
    dim3_score = 60
    if empathy_count >= 3:
        dim3_score = 96
    elif empathy_count >= 1:
        dim3_score = 84
        
    from app.services.guardrails import detect_medical_jargon
    jargon_used = detect_medical_jargon(student_text)
    if jargon_used:
        dim3_score = max(50, dim3_score - (len(jargon_used) * 8))
        
    dim3_status = "Exemplary" if dim3_score >= 85 else "Competent" if dim3_score >= 70 else "Developing"
    dim3_feedback = (
        f"Demonstrated supportive patient connection with {empathy_count} empathetic acknowledgments."
        if empathy_count > 0 else
        "Maintained objective dialogue; incorporate more explicit bedside validation and reassurance."
    )

    # -------------------------------------------------------------
    # Dimension 4: Diagnostic Workup & Cost/Safety Efficiency
    # -------------------------------------------------------------
    available_invs = case_data.get("investigations", [])
    abnormal_inv_ids = [inv["id"] for inv in available_invs if inv.get("isAbnormal")]
    ordered_ids = submission.ordered_investigation_ids
    
    # Check if high-yield investigations were ordered
    ordered_abnormal = [i for i in ordered_ids if i in abnormal_inv_ids]
    dim4_score = 50
    if len(abnormal_inv_ids) > 0:
        dim4_score += int((len(ordered_abnormal) / len(abnormal_inv_ids)) * 40)
    
    # Deduct points if ordered an exorbitant number of unindicated tests
    if len(ordered_ids) > len(available_invs):
        dim4_score -= 10
    dim4_score = min(100, max(30, dim4_score))
    
    dim4_status = "Exemplary" if dim4_score >= 85 else "Competent" if dim4_score >= 70 else "Developing"
    dim4_feedback = f"Ordered {len(ordered_ids)} diagnostic investigations, identifying key abnormalities promptly."

    # -------------------------------------------------------------
    # Dimension 5: Guideline-Directed Management
    # -------------------------------------------------------------
    mgmt_protocols = case_data.get("managementProtocols", [])
    correct_mgmt = [m["id"] for m in mgmt_protocols if m.get("isCorrect")]
    contraindicated = [m["id"] for m in mgmt_protocols if not m.get("isCorrect")]
    
    selected_correct = [m_id for m_id in submission.selected_management_ids if m_id in correct_mgmt]
    selected_contra = [m_id for m_id in submission.selected_management_ids if m_id in contraindicated]
    
    dim5_score = 40
    if len(correct_mgmt) > 0:
        dim5_score += int((len(selected_correct) / len(correct_mgmt)) * 50)
    dim5_score -= (len(selected_contra) * 20)
    dim5_score = min(100, max(25, dim5_score))
    
    dim5_status = "Exemplary" if dim5_score >= 85 else "Competent" if dim5_score >= 70 else "Critical Gap"
    dim5_feedback = (
        f"Selected {len(selected_correct)} guideline therapies."
        + (f" WARNING: Selected {len(selected_contra)} contraindicated action!" if selected_contra else "")
    )

    # -------------------------------------------------------------
    # Overall Score & Aggregation
    # -------------------------------------------------------------
    overall = int((dim1_score * 0.25) + (dim2_score * 0.25) + (dim3_score * 0.15) + (dim4_score * 0.15) + (dim5_score * 0.20))
    pass_status = overall >= 70 and len(selected_contra) == 0
    
    rubric = case_data.get("scoringRubric", {})
    critical_actions = rubric.get("criticalActions", [])
    
    critical_taken = []
    critical_missed = []
    if primary_correct:
        critical_taken.append("Identified correct primary diagnosis")
    else:
        critical_missed.append("Formulated accurate primary diagnosis")
        
    if len(selected_correct) >= 2:
        critical_taken.append("Initiated appropriate guideline pharmacotherapy")
    else:
        critical_missed.append("Prompt medical stabilization")
        
    if len(critical_actions) > 0:
        critical_taken.append(critical_actions[0])

    strengths = []
    if dim1_score >= 75:
        strengths.append("Thorough clinical history elicitation covering core OPQRST elements")
    if dim2_score >= 80:
        strengths.append("Accurate diagnostic precision and differential consideration")
    if dim3_score >= 80:
        strengths.append("Exemplary bedside communication and supportive patient rapport")
    if len(strengths) == 0:
        strengths.append("Completed standardized clinical encounter within the target timeframe")

    improvements = []
    if dim1_misses:
        improvements.append(f"Remember to elicit {', '.join(dim1_misses[:2])}")
    if not primary_correct:
        improvements.append("Re-evaluate physical exam signs and diagnostic findings before finalizing diagnosis")
    if selected_contra:
        improvements.append("Avoid contraindicated pharmacologic agents in acute emergent scenarios")
    if len(improvements) == 0:
        improvements.append("Continue to refine door-to-treatment speed in acute clinical presentations")

    patient_name = case_data.get("patient", {}).get("name", "Patient")
    attending_notes = (
        f"Encounter review for {patient_name}. "
        f"The candidate achieved an overall score of {overall}% ({'PASS' if pass_status else 'REMEDIATION RECOMMENDED'}). "
        f"Key clinical strength: {strengths[0]}. "
        f"Primary clinical area for development: {improvements[0]}."
    )

    dimensions = [
        DimensionScore(
            dimension="Interview Completeness & History",
            score=dim1_score,
            status=dim1_status,
            feedback=dim1_feedback,
            highValueHits=dim1_hits,
            missedCriticalItems=dim1_misses[:3]
        ),
        DimensionScore(
            dimension="Clinical Reasoning & Diagnosis",
            score=dim2_score,
            status=dim2_status,
            feedback=dim2_feedback,
            highValueHits=matched_diffs,
            missedCriticalItems=[] if primary_correct else ["Primary Differential Misaligned"]
        ),
        DimensionScore(
            dimension="Bedside Communication & Empathy",
            score=dim3_score,
            status=dim3_status,
            feedback=dim3_feedback,
            highValueHits=[f"{empathy_count} Empathy Phrases Detected"],
            missedCriticalItems=jargon_used
        ),
        DimensionScore(
            dimension="Diagnostic Workup & Safety",
            score=dim4_score,
            status=dim4_status,
            feedback=dim4_feedback,
            highValueHits=[f"{len(ordered_abnormal)} Abnormal Findings Uncovered"],
            missedCriticalItems=[]
        ),
        DimensionScore(
            dimension="Guideline-Directed Management",
            score=dim5_score,
            status=dim5_status,
            feedback=dim5_feedback,
            highValueHits=[f"{len(selected_correct)} Evidence Protocols Initiated"],
            missedCriticalItems=selected_contra
        )
    ]

    return ClinicalEvaluationResponse(
        session_id=str(uuid.uuid4()),
        overall_score=overall,
        pass_status=pass_status,
        dimensions=dimensions,
        strengths=strengths,
        areas_to_improve=improvements,
        critical_actions_taken=critical_taken,
        critical_actions_missed=critical_missed,
        attending_physician_notes=attending_notes,
        provider="InteractMD Attending Evaluation Core"
    )
