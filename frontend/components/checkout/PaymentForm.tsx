"use client"

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"

interface PaymentFormProps {
    amount: number
    onSuccess: (paymentIntentId: string) => void
}

export default function PaymentForm({ amount, onSuccess }: PaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsProcessing(true)

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            })

            if (error) {
                toast.error(error.message || "Payment failed")
                setIsProcessing(false)
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success("Payment successful!")
                onSuccess(paymentIntent.id)
            }
        } catch (err) {
            toast.error("An error occurred during payment")
            setIsProcessing(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PaymentElement />

                    <div className="pt-4 border-t">
                        <div className="flex justify-between mb-4">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-lg font-bold text-primary">${amount.toFixed(2)}</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={!stripe || isProcessing}
                        >
                            {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Test card: 4242 4242 4242 4242 | Any future date | Any CVC
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
