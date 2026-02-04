"use client"

import { useState, useEffect } from "react"
import { getProducts, Product } from "@/lib/api"
import { ProductCard } from "@/components/ui/product-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        // Debounce search by 500ms
        const timeoutId = setTimeout(() => {
            async function load() {
                try {
                    setLoading(true) // Show loading state while fetching new results
                    const data = await getProducts(searchTerm)
                    setProducts(data)
                } catch (e) {
                    console.error("Failed to load products", e)
                } finally {
                    setLoading(false)
                }
            }
            load()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Explore Products
                    </h1>
                    <p className="text-muted-foreground">Find the perfect item for your needs.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10 bg-white/5 border-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
                            No products found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
