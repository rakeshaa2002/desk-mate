import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.billing import Invoice
from app.schemas.billing import InvoiceCreate, InvoiceOut, InvoiceUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Invoice, InvoiceCreate, InvoiceUpdate](Invoice)

def _generate_invoice_no() -> str:
    return f"INV-{uuid.uuid4().hex[:8].upper()}"

@router.get("/", response_model=list[InvoiceOut])
def list_invoices(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return crud.get_multi(db, skip, limit)

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = crud.get(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("/", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    invoice_no = payload.invoice_no or _generate_invoice_no()
    data = payload.model_dump(exclude={"invoice_no"})
    invoice = Invoice(**data, invoice_no=invoice_no)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db)):
    invoice = crud.get(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return crud.update(db, invoice, payload)

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = crud.get(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    crud.remove(db, invoice)
