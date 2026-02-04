"use client"

import { useEffect, useState } from "react";
import { getCart, fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CartItem {
    product_id: number;
    quantity: number;
    // In a real app, we'd fetch product details for each item or have backend include them.
    // Our simplified Redis backend just returns { product_id: qty }.
    // We need to fetch product info for display.
    product?: {
        name: string;
        price: number;
        image_url?: string;
    }
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function loadCart() {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const res = await getCart();
                // res.items is [{product_id, quantity}]
                // distinct product fetching
                const cartItems: CartItem[] = res.items;

                // Fetch details for each (inefficient N+1, but fine for demo)
                // Better: Backend returns hydrated cart
                const hydratedItems = await Promise.all(cartItems.map(async (item) => {
                    try {
                        const product = await fetchWithAuth(`/products/${item.product_id}`);
                        return { ...item, product };
                    } catch {
                        return item;
                    }
                }));

                setItems(hydratedItems);
            } catch (e) {
                console.error("Failed to load cart", e);
            } finally {
                setLoading(false);
            }
        }
        loadCart();
    }, [isAuthenticated]);

    useEffect(() => {
        const t = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
        setTotal(t);
    }, [items]);

    const handleClearCart = async () => {
        try {
            await fetchWithAuth('/cart/clear', { method: 'DELETE' });
            setItems([]);
        } catch (e) {
            alert("Failed to clear cart");
        }
    };

    const handleCheckout = async () => {
        try {
            await fetchWithAuth('/orders/checkout', { method: 'POST' });
            alert("Order placed successfully!");
            setItems([]);
        } catch (e) {
            alert("Checkout failed. Check stock or try again.");
        }
    };

    if (!isAuthenticated) {
        return <div className="min-h-[50vh] flex items-center justify-center">Please log in to view cart.</div>;
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl">
                    <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.product_id} className="flex items-center p-4 gap-4">
                                <div className="w-20 h-20 bg-slate-800 rounded-md overflow-hidden flex-shrink-0">
                                    {item.product?.image_url ? (
                                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.product?.name || `Product ${item.product_id}`}</h3>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
                                    <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleClearCart}>
                            Clear Cart
                        </Button>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">Summary</h2>
                            <div className="flex justify-between mb-2">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t border-white/10 pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button className="w-full text-lg h-12" onClick={handleCheckout}>
                                Checkout <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
