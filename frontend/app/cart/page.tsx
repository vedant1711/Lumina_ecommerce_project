"use client"

import { useEffect, useState } from "react"
import { getCart, clearCart, updateCartItem, removeFromCart } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CartItem {
    product_id: number
    name: string
    price: number
    image_url?: string
    quantity: number
}

interface CartResponse {
    items: CartItem[]
    total_amount: number
}

export default function CartPage() {
    const [cart, setCart] = useState<CartResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    async function loadCartData() {
        try {
            const data = await getCart()
            setCart(data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load cart")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCartData()
    }, [])

    const handleClearCart = async () => {
        if (!confirm("Are you sure you want to clear your cart?")) return
        try {
            await clearCart()
            setCart({ items: [], total_amount: 0 })
            toast.success("Cart cleared")
        } catch (error) {
            toast.error("Failed to clear cart")
        }
    }

    const handleUpdateQuantity = async (product_id: number, newQuantity: number) => {
        if (newQuantity < 1) return
        try {
            await updateCartItem(product_id, newQuantity)
            await loadCartData()
            toast.success("Cart updated")
        } catch (error) {
            toast.error("Failed to update quantity")
        }
    }

    const handleRemoveItem = async (product_id: number) => {
        try {
            await removeFromCart(product_id)
            await loadCartData()
            toast.success("Item removed")
        } catch (error) {
            toast.error("Failed to remove item")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
                <Link href="/products">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <Card key={item.product_id} className="flex flex-col sm:flex-row items-center p-4 gap-4 bg-card/50">
                            <div className="w-24 h-24 shrink-0 bg-muted rounded-md overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                                <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <p className="font-bold text-lg text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveItem(item.product_id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                            </div>
                        </Card>
                    ))}

                    <div className="flex justify-end pt-4">
                        <Button variant="destructive" onClick={handleClearCart}>
                            <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 bg-card/80 backdrop-blur-md border-border">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold text-foreground">${cart.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-500">Free</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${cart.total_amount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" onClick={() => router.push('/checkout')}>
                                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
