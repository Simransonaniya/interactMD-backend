from typing import List
from fastapi import APIRouter, HTTPException
from app.data.cases import get_all_cases, get_case_by_id
from app.models.schemas import CaseSummary, ClinicalCaseSchema

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("", response_model=List[CaseSummary])
def list_cases():
    """Retrieve the catalog of clinical simulation cases."""
    raw_cases = get_all_cases()
    summaries = []
    for c in raw_cases:
        p = c["patient"]
        summaries.append(CaseSummary(
            id=c["id"],
            title=c["title"],
            shortDescription=c["shortDescription"],
            specialty=c["specialty"],
            difficulty=c["difficulty"],
            estimatedMinutes=c["estimatedMinutes"],
            tags=c["tags"],
            patientName=p["name"],
            patientAge=p["age"],
            patientGender=p["gender"]
        ))
    return summaries

@router.get("/{case_id}", response_model=ClinicalCaseSchema)
def get_case_detail(case_id: str):
    """Retrieve full clinical details, vitals, findings, and knowledge base for a case."""
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case with ID '{case_id}' not found.")
    return case
