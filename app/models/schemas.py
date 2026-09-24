from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Chat & Encounter Models ---

class ChatMessageItem(BaseModel):
    id: Optional[str] = None
    sender: str = Field(..., description="'student', 'patient', or 'system'")
    text: str
    timestamp: Optional[str] = None
    category: Optional[str] = "General"  # 'General', 'HPI', 'PMH', 'Meds', 'Social', 'ROS', 'Comfort'
    empathyDetected: Optional[bool] = False

class ChatRequest(BaseModel):
    case_id: str
    message: str
    conversation_history: List[ChatMessageItem] = []

class ChatResponse(BaseModel):
    reply: str
    empathy_detected: bool = False
    category: str = "General"
    provider: str = "rule_based"
    suggested_topics: List[str] = []

# --- Physical Exam Models ---

class PhysicalExamRequest(BaseModel):
    case_id: str
    exam_id: str

class PhysicalExamItem(BaseModel):
    id: str
    system: str
    name: str
    actionLabel: str
    findingDescription: str
    isAbnormal: bool
    clinicalSignificance: str

# --- Diagnostic Investigation Models ---

class InvestigationRequest(BaseModel):
    case_id: str
    investigation_id: str

class InvestigationItem(BaseModel):
    id: str
    category: str
    name: str
    turnaroundMinutes: int
    normalRange: Optional[str] = None
    value: Optional[str] = None
    interpretation: str
    isAbnormal: bool
    imageUrl: Optional[str] = None
    findingsDetail: List[str] = []

# --- Clinical Case Models ---

class PatientProfile(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    avatarUrl: str
    occupation: str
    presentationComplaint: str
    initialStatement: str
    mood: str
    appearance: str

class Vitals(BaseModel):
    heartRate: int
    bloodPressure: str
    respiratoryRate: int
    oxygenSaturation: int
    temperature: float
    painScore: int

class DiagnosisOption(BaseModel):
    id: str
    name: str
    icdCode: str
    category: str
    isCorrectPrimary: bool
    isHighDifferential: bool
    rationale: str

class ManagementProtocol(BaseModel):
    id: str
    label: str
    isCorrect: bool
    feedback: str

class CaseFacts(BaseModel):
    onset: str
    provocationPalliative: str
    quality: str
    radiation: Optional[str] = None
    severity: str
    timing: str
    associatedSymptoms: List[str] = []
    pertinentNegatives: List[str] = []
    pastMedicalHistory: List[str] = []
    medications: List[str] = []
    allergies: List[str] = []
    familyHistory: List[str] = []
    socialHistory: List[str] = []
    reviewOfSystems: Dict[str, str] = {}

class ClinicalCaseSchema(BaseModel):
    id: str
    title: str
    shortDescription: str
    specialty: str
    difficulty: str
    estimatedMinutes: int
    tags: List[str]
    learningObjectives: List[str]
    triageNurseNote: str
    patient: PatientProfile
    initialVitals: Vitals
    physicalFindings: List[PhysicalExamItem]
    investigations: List[InvestigationItem]
    diagnosisOptions: List[DiagnosisOption]
    managementProtocols: List[ManagementProtocol]
    facts: CaseFacts

class CaseSummary(BaseModel):
    id: str
    title: str
    shortDescription: str
    specialty: str
    difficulty: str
    estimatedMinutes: int
    tags: List[str]
    patientName: str
    patientAge: int
    patientGender: str

# --- OSCE Evaluation Models ---

class DimensionScore(BaseModel):
    dimension: str
    score: int
    maxScore: int = 100
    status: str  # 'Exemplary', 'Competent', 'Developing', 'Critical Gap'
    feedback: str
    highValueHits: List[str] = []
    missedCriticalItems: List[str] = []

class EvaluationSubmission(BaseModel):
    case_id: str
    conversation_history: List[ChatMessageItem]
    performed_exam_ids: List[str] = []
    ordered_investigation_ids: List[str] = []
    primary_diagnosis_id: str
    differential_diagnosis_ids: List[str] = []
    selected_management_ids: List[str] = []
    clinical_rationale: str = ""
    duration_seconds: int = 0

class ClinicalEvaluationResponse(BaseModel):
    session_id: str
    overall_score: int
    pass_status: bool
    dimensions: List[DimensionScore]
    strengths: List[str]
    areas_to_improve: List[str]
    critical_actions_taken: List[str]
    critical_actions_missed: List[str]
    attending_physician_notes: str
    provider: str = "rule_based"
