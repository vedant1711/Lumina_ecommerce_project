"use client"

import { useState, useEffect } from "react"
import { getProductRecommendations, Product } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles } from "lucide-react"
import Link from "next/link"

interface RecommendedProduct extends Product {
    similarity_score?: number
}

interface Props {
    productId: number
    productName?: string
}

export default function RelatedProducts({ productId, productName }: Props) {
    const [products, setProducts] = useState<RecommendedProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const data = await getProductRecommendations(productId, 8)
                setProducts(data.recommendations || [])
            } catch (e) {
                console.error("Failed to load recommendations", e)
            } finally {
                setLoading(false)
            }
        }
        if (productId) load()
    }, [productId])

    if (loading) {
        return (
            <section className="mt-16">
                <div className="flex items-center gap-2 mb-8">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-2xl font-bold">You May Also Like</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </section>
        )
    }

    if (products.length === 0) return null

    return (
        <section className="mt-16">
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-2xl font-bold">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                        <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 rounded-2xl overflow-hidden h-full cursor-pointer">
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
                                {product.discount_percent > 0 && (
                                    <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
                                        {product.discount_percent}% OFF
                                    </Badge>
                                )}
                                {product.similarity_score !== undefined && product.similarity_score > 0.3 && (
                                    <Badge className="absolute top-2 right-2 bg-indigo-500/80 text-xs backdrop-blur-sm">
                                        {Math.round(product.similarity_score * 100)}% Match
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="p-3">
                                {product.brand && (
                                    <p className="text-xs text-indigo-400 font-medium mb-0.5">{product.brand}</p>
                                )}
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 mb-1.5">
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
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                                    {product.compare_at_price && product.compare_at_price > product.price && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            ${product.compare_at_price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    )
}
