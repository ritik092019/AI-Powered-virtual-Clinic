from fastapi import APIRouter, status
from app.ocr.schemas import OCRProcessRequest, PatientDocumentSummaryRequest
from app.ocr.services.ocr_service import OCRService
from app.ocr.services.patient_document_ai_service import PatientDocumentAIService
from app.common.responses import APIResponse

router = APIRouter(prefix="/ocr", tags=["Medical Document OCR"])

@router.post("/process", status_code=status.HTTP_201_CREATED)
def process_ocr_document(req: OCRProcessRequest):
    """Process medical document (lab report, prescription) with OCR and extract structured facts."""
    res = OCRService.process_document(req)
    return APIResponse.created(data=res, message="Document OCR completed")

@router.get("/extraction/{document_id}")
def get_ocr_extraction(document_id: str):
    """Retrieve OCR document extraction result by document_id."""
    res = OCRService.get_extraction(document_id)
    return APIResponse.success(data=res)

@router.post("/patient-document-summary")
def get_patient_document_summary(req: PatientDocumentSummaryRequest):
    """Generate structured, patient-friendly AI summary with medication steps, precautions, and next steps."""
    res = PatientDocumentAIService.generate_patient_summary(req)
    return APIResponse.success(data=res, message="Patient document AI summary generated successfully")
