"use client"

import { useState } from "react"
import { Product, addToCart, addToWishlist, removeFromWishlist } from "@/lib/api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter()
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [wishlistLoading, setWishlistLoading] = useState(false)

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to add to cart")
            router.push("/auth/login")
            return
        }

        try {
            await addToCart(product.id, 1)
            toast.success("Added to cart")
        } catch (error) {
            console.error(error)
        }
    }

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to save items")
            router.push("/auth/login")
            return
        }

        setWishlistLoading(true)
        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id)
                setIsWishlisted(false)
                toast.success("Removed from wishlist")
            } else {
                await addToWishlist(product.id)
                setIsWishlisted(true)
                toast.success("Added to wishlist")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setWishlistLoading(false)
        }
    }

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.compare_at_price!) * 100)
        : 0

    return (
        <Link href={`/products/${product.id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                <Card className="overflow-hidden border-border bg-card/50 hover:bg-card/80 transition-colors group h-full flex flex-col shadow-sm">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                        {/* Product Image */}
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                                No Image
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {hasDiscount && (
                                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                                    -{discountPercent}%
                                </Badge>
                            )}
                            {product.is_featured && (
                                <Badge variant="secondary" className="text-xs">
                                    Featured
                                </Badge>
                            )}
                            {product.stock === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                                size="icon"
                                variant="secondary"
                                className={cn(
                                    "rounded-full shadow-lg transition-colors",
                                    isWishlisted && "bg-pink-500 text-white hover:bg-pink-600"
                                )}
                                onClick={handleWishlist}
                                disabled={wishlistLoading}
                            >
                                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                            </Button>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <CardContent className="p-4 flex-grow">
                        {/* Brand */}
                        {product.brand && (
                            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                        )}

                        {/* Name */}
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors text-foreground">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        {product.review_count > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "w-3 h-3",
                                                star <= product.average_rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted-foreground"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    ({product.review_count})
                                </span>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                        </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-foreground">
                                ${product.price.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">
                                    ${product.compare_at_price!.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
                            View Details
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </Link>
    )
}
