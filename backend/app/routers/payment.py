from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.config import settings
from pydantic import BaseModel
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(
    prefix="/payment",
    tags=["payment"],
)

class PaymentIntentRequest(BaseModel):
    amount: float  # Amount in dollars

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str

@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: PaymentIntentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe PaymentIntent for the checkout process.
    Amount is in dollars, converted to cents for Stripe.
    """
    try:
        # Convert dollars to cents (Stripe uses smallest currency unit)
        amount_cents = int(request.amount * 100)
        
        # Create PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "user_id": user.id,
                "user_email": user.email
            },
            automatic_payment_methods={
                "enabled": True,
            },
        )
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment intent creation failed: {str(e)}"
        )

@router.get("/verify/{payment_intent_id}")
async def verify_payment(
    payment_intent_id: str,
    user: User = Depends(get_current_user)
):
    """
    Verify that a payment was successful.
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return {
            "status": intent.status,
            "amount": intent.amount / 100,  # Convert cents back to dollars
            "payment_method": intent.payment_method,
            "succeeded": intent.status == "succeeded"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
