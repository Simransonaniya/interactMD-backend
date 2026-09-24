from fastapi import APIRouter, HTTPException
from app.data.cases import get_case_by_id
from app.models.schemas import EvaluationSubmission, ClinicalEvaluationResponse
from app.services.evaluation_engine import evaluate_encounter

router = APIRouter(prefix="/simulation", tags=["Evaluation"])

@router.post("/evaluate", response_model=ClinicalEvaluationResponse)
def evaluate_clinical_session(submission: EvaluationSubmission):
    """
    Evaluates a completed OSCE encounter across 5 clinical dimensions,
    benchmarking history taking, reasoning, empathy, diagnostic yield, and guideline management.
    """
    case = get_case_by_id(submission.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{submission.case_id}' not found.")
        
    result = evaluate_encounter(case_data=case, submission=submission)
    return result
