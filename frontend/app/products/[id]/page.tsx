"use client"

import { useState, useEffect } from "react"
import { getProduct, Product, addToCart, fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft, ShoppingCart, Truck, Shield, Star, Heart,
    Package, Check, X, Tag, Gauge, MessageSquare, ThumbsUp
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"

interface Review {
    id: number
    user_id: number
    user_name?: string
    rating: number
    title: string
    comment: string
    created_at: string
    helpful_count?: number
}

interface ProductWithDetails extends Product {
    weight?: number
    dimensions?: string
}

export default function ProductDetailPage() {
    const params = useParams()
    const id = params?.id as string

    const [product, setProduct] = useState<ProductWithDetails | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [wishlistAdded, setWishlistAdded] = useState(false)
    const router = useRouter()

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewTitle, setReviewTitle] = useState("")
    const [reviewComment, setReviewComment] = useState("")
    const [reviewRating, setReviewRating] = useState(5)
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                if (!id) return
                const data = await getProduct(parseInt(id))
                setProduct(data)

                // Fetch reviews
                try {
                    const reviewsData = await fetchWithAuth(`/reviews/product/${id}`)
                    setReviews(reviewsData || [])
                } catch {
                    // Reviews might fail if not logged in, that's ok
                }

                // Check wishlist status
                const token = localStorage.getItem('token')
                if (token) {
                    try {
                        const wishlistCheck = await fetchWithAuth(`/wishlist/check/${id}`)
                        setWishlistAdded(wishlistCheck?.in_wishlist || false)
                    } catch { }
                }
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
        }
    }

    const handleToggleWishlist = async () => {
        if (!product) return
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to add to wishlist")
            router.push("/auth/login")
            return
        }

        try {
            if (wishlistAdded) {
                await fetchWithAuth(`/wishlist/remove/${product.id}`, { method: 'DELETE' })
                setWishlistAdded(false)
                toast.success("Removed from wishlist")
            } else {
                await fetchWithAuth(`/wishlist/add/${product.id}`, { method: 'POST' })
                setWishlistAdded(true)
                toast.success("Added to wishlist")
            }
        } catch {
            toast.error("Failed to update wishlist")
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to submit a review")
            router.push("/auth/login")
            return
        }

        setSubmittingReview(true)
        try {
            const newReview = await fetchWithAuth('/reviews/', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: product?.id,
                    rating: reviewRating,
                    title: reviewTitle,
                    comment: reviewComment
                })
            })
            setReviews(prev => [newReview, ...prev])
            setShowReviewForm(false)
            setReviewTitle("")
            setReviewComment("")
            setReviewRating(5)
            toast.success("Review submitted!")
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review")
        } finally {
            setSubmittingReview(false)
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

    const discountPercent = product.compare_at_price && product.compare_at_price > product.price
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : 0

    const specifications: Record<string, string> = {
        ...(product.brand && { "Brand": product.brand }),
        ...(product.sku && { "SKU": product.sku }),
        ...(product.weight && { "Weight": `${product.weight} kg` }),
        ...(product.dimensions && { "Dimensions": product.dimensions }),
        "Stock": product.stock > 0 ? `${product.stock} units` : "Out of Stock",
        "Category": `ID: ${product.category_id || 'N/A'}`,
        ...(product.specifications || {})
    }

    const averageRating = product.average_rating || (reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0)

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </Link>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
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
                    {discountPercent > 0 && (
                        <Badge className="absolute top-4 left-4 bg-red-500">
                            {discountPercent}% OFF
                        </Badge>
                    )}
                    {product.is_featured && (
                        <Badge className="absolute top-4 right-4 bg-yellow-500">
                            ⭐ Featured
                        </Badge>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    {/* Brand */}
                    {product.brand && (
                        <p className="text-indigo-400 font-semibold mb-1">{product.brand}</p>
                    )}

                    <h1 className="text-4xl font-bold mb-2 text-foreground">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                />
                            ))}
                        </div>
                        <span className="text-muted-foreground">
                            {averageRating.toFixed(1)} ({reviews.length} reviews)
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                        <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-foreground">
                            {product.category_id ? `Category ${product.category_id}` : 'General'}
                        </span>
                        <span>•</span>
                        <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                        {product.sku && (
                            <>
                                <span>•</span>
                                <span className="text-xs">SKU: {product.sku}</span>
                            </>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <p className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</p>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                            <p className="text-xl text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</p>
                        )}
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                        {product.description || "No description available for this product."}
                    </p>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" /> {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center border border-white/10 rounded-lg p-1">
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
                        </div>
                        <Button
                            size="lg"
                            className="flex-1 rounded-xl shadow-lg shadow-indigo-500/20"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                        </Button>
                        <Button
                            size="lg"
                            variant={wishlistAdded ? "secondary" : "outline"}
                            className="rounded-xl"
                            onClick={handleToggleWishlist}
                        >
                            <Heart className={`w-5 h-5 ${wishlistAdded ? 'fill-red-500 text-red-500' : ''}`} />
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
                                <Package className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Specifications and Reviews */}
            <Tabs defaultValue="specifications" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="specifications" className="gap-2">
                        <Gauge className="w-4 h-4" /> Specifications
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2">
                        <MessageSquare className="w-4 h-4" /> Reviews ({reviews.length})
                    </TabsTrigger>
                </TabsList>

                {/* Specifications Tab */}
                <TabsContent value="specifications">
                    <Card className="border-white/10">
                        <CardHeader>
                            <CardTitle>Product Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                {Object.entries(specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                    <Card className="border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Customer Reviews</CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    {averageRating.toFixed(1)} out of 5 based on {reviews.length} reviews
                                </p>
                            </div>
                            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                                {showReviewForm ? 'Cancel' : 'Write a Review'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {/* Rating Breakdown */}
                            <div className="mb-8 p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                                        <div className="flex justify-center mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length
                                            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                                            return (
                                                <div key={star} className="flex items-center gap-2 text-sm">
                                                    <span className="w-3">{star}</span>
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                                                    </div>
                                                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                                    <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>

                                    {/* Star Rating */}
                                    <div className="mb-4">
                                        <label className="block text-sm mb-2">Your Rating</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star className={`w-8 h-8 transition-colors ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm mb-2">Review Title</label>
                                        <Input
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                            placeholder="Summarize your experience"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm mb-2">Your Review</label>
                                        <Textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Tell us about your experience with this product..."
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" disabled={submittingReview}>
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </form>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No reviews yet. Be the first to review this product!</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="p-6 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                                                        ))}
                                                    </div>
                                                    <h4 className="font-semibold">{review.title}</h4>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground">{review.comment}</p>
                                            {review.helpful_count !== undefined && review.helpful_count > 0 && (
                                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{review.helpful_count} found this helpful</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
