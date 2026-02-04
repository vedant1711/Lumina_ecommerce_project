"use client"

import { useState, useEffect } from "react"
import { getProducts, Product } from "@/lib/api"
import { ProductCard } from "@/components/ui/product-card"

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                // For now, just getting all products as "new arrivals"
                // In a real app we might sort by created_at desc
                const data = await getProducts()
                // Take last 8 items as new arrivals
                setProducts(data.slice(-8).reverse())
            } catch (e) {
                console.error("Failed to load new arrivals", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                New Arrivals
            </h1>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-muted-foreground">
                            No new arrivals.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
