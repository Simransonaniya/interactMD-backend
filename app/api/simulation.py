from fastapi import APIRouter, HTTPException
from app.data.cases import get_case_by_id
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    PhysicalExamRequest,
    PhysicalExamItem,
    InvestigationRequest,
    InvestigationItem
)
from app.services.patient_agent import handle_patient_dialogue

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_patient(payload: ChatRequest):
    """
    Simulates a clinical patient interaction turn with progressive disclosure,
    bedside empathy tracking, and dynamic persona modeling.
    """
    case = get_case_by_id(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{payload.case_id}' not found.")
        
    history_dicts = [m.dict() for m in payload.conversation_history]
    result = await handle_patient_dialogue(
        case_data=case,
        user_message=payload.message,
        conversation_history=history_dicts
    )
    
    return ChatResponse(
        reply=result["reply"],
        empathy_detected=result["empathy_detected"],
        category=result["category"],
        provider=result["provider"],
        suggested_topics=result["suggested_topics"]
    )

@router.post("/exam", response_model=PhysicalExamItem)
def perform_physical_exam(payload: PhysicalExamRequest):
    """
    Executes an objective physical examination maneuver and reveals findings.
    """
    case = get_case_by_id(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{payload.case_id}' not found.")
        
    for exam in case.get("physicalFindings", []):
        if exam["id"] == payload.exam_id:
            return PhysicalExamItem(**exam)
            
    raise HTTPException(status_code=404, detail=f"Physical exam maneuver '{payload.exam_id}' not found for case.")

@router.post("/investigation", response_model=InvestigationItem)
def order_diagnostic_investigation(payload: InvestigationRequest):
    """
    Orders a point-of-care, imaging, or laboratory diagnostic test and returns reports.
    """
    case = get_case_by_id(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{payload.case_id}' not found.")
        
    for inv in case.get("investigations", []):
        if inv["id"] == payload.investigation_id:
            return InvestigationItem(**inv)
            
    raise HTTPException(status_code=404, detail=f"Investigation '{payload.investigation_id}' not found for case.")
