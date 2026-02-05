"use client"

import { useState, useEffect } from "react"
import { getProduct, Product, addToCart } from "@/lib/api" // Assuming api.ts exports these
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Truck, Shield, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"

export default function ProductDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            try {
                if (!id) return
                const data = await getProduct(parseInt(id))
                setProduct(data)
            } catch (e) {
                console.error("Failed to load product", e)
                toast.error("Failed to load product details")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleAddToCart = async () => {
        if (!product) return

        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to add items to cart")
            router.push("/auth/login")
            return
        }

        try {
            await addToCart(product.id, quantity)
            toast.success("Added to cart")
        } catch (error) {
            console.error(error)
            // Error handling is mostly done in api.ts but we can add more specific here if needed
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="h-8 w-32 bg-white/5 rounded mb-8"></div>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="aspect-square bg-white/5 rounded-2xl"></div>
                    <div className="space-y-4">
                        <div className="h-10 w-3/4 bg-white/5 rounded"></div>
                        <div className="h-6 w-1/4 bg-white/5 rounded"></div>
                        <div className="h-32 w-full bg-white/5 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Link href="/products">
                    <Button>Back to Shop</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </Link>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-800 border border-white/5 shadow-2xl">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                        <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-foreground">
                            {product.category_id ? `Category ${product.category_id}` : 'General'}
                        </span>
                        <span>•</span>
                        <span className={product.price > 100 ? "text-cyan-600 dark:text-cyan-400" : "text-green-600 dark:text-green-400"}>
                            In Stock
                        </span>
                    </div>

                    <p className="text-3xl font-bold mb-6 text-foreground">${product.price.toFixed(2)}</p>

                    <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                        {product.description || "No description available for this product."}
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center border border-white/10 rounded-lg p-1">
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
                        </div>
                        <Button size="lg" className="flex-1 rounded-xl shadow-lg shadow-indigo-500/20" onClick={handleAddToCart}>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <div className="text-center">
                            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Truck className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Fast Delivery</span>
                        </div>
                        <div className="text-center">
                            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Secure Payment</span>
                        </div>
                        <div className="text-center">
                            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Top Quality</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
