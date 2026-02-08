"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getWishlist, removeFromWishlist, Product } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { StarRating } from "@/components/reviews/StarRating"
import { addToCart } from "@/lib/api"

interface WishlistItem {
    id: number
    product_id: number
    product: Product
    created_at: string
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadWishlist()
    }, [])

    async function loadWishlist() {
        try {
            const data = await getWishlist()
            setWishlist(data)
        } catch (e) {
            console.error("Failed to load wishlist", e)
        } finally {
            setLoading(false)
        }
    }

    async function handleRemove(productId: number) {
        try {
            await removeFromWishlist(productId)
            setWishlist(prev => prev.filter(item => item.product_id !== productId))
            toast.success("Removed from wishlist")
        } catch (e) {
            toast.error("Failed to remove item")
        }
    }

    async function handleAddToCart(product: Product) {
        try {
            await addToCart(product.id, 1)
            toast.success(`${product.name} added to cart`)
        } catch (e) {
            toast.error("Failed to add to cart")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white/10 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                    <p className="text-muted-foreground">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
            </div>

            {wishlist.length > 0 ? (
                <div className="space-y-4">
                    {wishlist.map(item => (
                        <Card key={item.id} className="border-white/10 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Image */}
                                    <Link href={`/products/${item.product_id}`} className="sm:w-40 h-40 shrink-0">
                                        <img
                                            src={item.product?.image_url || '/placeholder.png'}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/products/${item.product_id}`}>
                                                <h3 className="font-semibold hover:text-primary transition-colors">
                                                    {item.product?.name}
                                                </h3>
                                            </Link>
                                            {item.product?.brand && (
                                                <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <StarRating rating={item.product?.average_rating || 0} size="sm" />
                                                <span className="text-xs text-muted-foreground">
                                                    ({item.product?.review_count || 0} reviews)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                <span className="text-lg font-bold">${item.product?.price}</span>
                                                {item.product?.compare_at_price && (
                                                    <span className="text-sm text-muted-foreground line-through ml-2">
                                                        ${item.product.compare_at_price}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemove(item.product_id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => item.product && handleAddToCart(item.product)}
                                                    disabled={item.product?.stock === 0}
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    {item.product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-4">
                        Save items you love for later
                    </p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
