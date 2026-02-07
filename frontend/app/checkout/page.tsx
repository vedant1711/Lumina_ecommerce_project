"use client"

import { useEffect, useState } from "react"
import { getCart, createPaymentIntent, confirmCheckout } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import PaymentForm from "@/components/checkout/PaymentForm"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
    const [loading, setLoading] = useState(true)
    const [clientSecret, setClientSecret] = useState("")
    const [total, setTotal] = useState(0)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            try {
                const cart = await getCart()
                if (!cart.items || cart.items.length === 0) {
                    toast.error("Your cart is empty")
                    router.push('/cart')
                    return
                }

                setTotal(cart.total_amount)

                // Create payment intent
                const paymentData = await createPaymentIntent(cart.total_amount)
                setClientSecret(paymentData.client_secret)
            } catch (e) {
                console.error(e)
                toast.error("Failed to initialize checkout")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [router])

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            await confirmCheckout(paymentIntentId)
            toast.success("Order placed successfully!")
            router.push('/orders')
        } catch (error) {
            console.error(error)
            toast.error("Failed to confirm order. Please contact support.")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (!clientSecret) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Unable to initialize payment. Please try again.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Secure Checkout</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <span className="text-lg">Total Amount:</span>
                            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe',
                        },
                    }}
                >
                    <PaymentForm amount={total} onSuccess={handlePaymentSuccess} />
                </Elements>
            </div>
        </div>
    )
}
