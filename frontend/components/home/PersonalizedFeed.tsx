"use client"

import { useState, useEffect } from "react"
import { getUserRecommendations, getTrendingProducts, Product } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RecommendedProduct extends Product {
    relevance_score?: number
}

interface RecommendationData {
    strategy: "personalized" | "trending"
    reason: string
    products: RecommendedProduct[]
}

export default function PersonalizedFeed() {
    const [data, setData] = useState<RecommendationData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

                if (token) {
                    // Try personalized recommendations
                    try {
                        const result = await getUserRecommendations(12)
                        if (result.products && result.products.length > 0) {
                            setData(result)
                            return
                        }
                    } catch {
                        // Fall through to trending
                    }
                }

                // Fallback to trending
                const trending = await getTrendingProducts(12)
                setData(trending)
            } catch (e) {
                console.error("Failed to load recommendations", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-3xl font-bold">Recommended for You</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!data || data.products.length === 0) return null

    const isPersonalized = data.strategy === "personalized"

    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {isPersonalized ? (
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            ) : (
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                            )}
                            <h2 className="text-3xl font-bold">
                                {isPersonalized ? "Recommended for You" : "Trending Now"}
                            </h2>
                        </div>
                        <p className="text-muted-foreground">{data.reason}</p>
                    </div>
                    <Link href="/products">
                        <Button variant="ghost" className="text-primary hover:text-primary/80">
                            View All <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.products.map((product) => (
                        <Link key={product.id} href={`/products/${product.id}`}>
                            <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 rounded-2xl overflow-hidden h-full cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5">
                                <div className="relative aspect-square overflow-hidden bg-slate-800">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-muted-foreground text-sm">
                                            No Image
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {product.discount_percent > 0 && (
                                            <Badge className="bg-red-500 text-xs">
                                                {product.discount_percent}% OFF
                                            </Badge>
                                        )}
                                        {product.is_featured && (
                                            <Badge className="bg-yellow-500 text-xs">⭐ Featured</Badge>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            {product.tags.slice(0, 2).map((tag, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="text-[10px] bg-black/50 backdrop-blur-sm border-white/20 text-white"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4">
                                    {product.brand && (
                                        <p className="text-xs text-indigo-400 font-medium mb-1">{product.brand}</p>
                                    )}
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.round(product.average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                                            />
                                        ))}
                                        <span className="text-xs text-muted-foreground ml-1">
                                            ({product.review_count || 0})
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold">${product.price.toFixed(2)}</span>
                                        {product.compare_at_price && product.compare_at_price > product.price && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                ${product.compare_at_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Category */}
                                    {product.category && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {typeof product.category === 'string' ? product.category : product.category.name}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
