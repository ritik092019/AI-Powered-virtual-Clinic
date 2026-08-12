from fastapi import APIRouter, status
from app.ocr.schemas import OCRProcessRequest
from app.ocr.services.ocr_service import OCRService
from app.common.responses import APIResponse

router = APIRouter(prefix="/documents", tags=["Medical Documents & OCR"])

@router.post("/ocr", status_code=status.HTTP_201_CREATED)
def process_document_ocr(req: OCRProcessRequest):
    """Process medical document (lab report, prescription) with OCR and extract structured facts."""
    res = OCRService.process_document(req)
    return APIResponse.created(data=res, message="Document OCR processing completed")

@router.get("/extraction/{document_id}")
def get_document_extraction(document_id: str):
    """Retrieve structured document extraction results by document_id."""
    res = OCRService.get_extraction(document_id)
    return APIResponse.success(data=res)
