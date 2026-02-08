"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProducts, getCategories, getBrands, Product, ProductFilters } from "@/lib/api"
import { ProductCard } from "@/components/ui/product-card"
import { FilterPanel } from "@/components/filters/FilterPanel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid, List, SlidersHorizontal } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function ProductsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
    const [brands, setBrands] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "")
    const [filters, setFilters] = useState<ProductFilters>({
        category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
        is_featured: searchParams.get('is_featured') === 'true',
        sort_by: searchParams.get('sort_by') || undefined,
    })

    // Load categories and brands
    useEffect(() => {
        async function loadFilters() {
            try {
                const [cats, brs] = await Promise.all([
                    getCategories(),
                    getBrands()
                ])
                setCategories(cats)
                setBrands(brs)
            } catch (e) {
                console.error("Failed to load filter options", e)
            }
        }
        loadFilters()
    }, [])

    // Load products when filters change
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true)
                const data = await getProducts({
                    ...filters,
                    search: searchTerm || undefined
                })
                setProducts(data)
            } catch (e) {
                console.error("Failed to load products", e)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, filters])

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters(newFilters)
    }

    const handleSortChange = (value: string) => {
        setFilters(prev => ({ ...prev, sort_by: value }))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        {filters.is_featured ? "Featured Products" : "Explore Products"}
                    </h1>
                    <p className="text-muted-foreground">
                        {loading ? "Loading..." : `${products.length} products found`}
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-10 bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Sort */}
                    <Select value={filters.sort_by || ""} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Top Rated</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main content with filter sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Panel */}
                <FilterPanel
                    categories={categories}
                    brands={brands}
                    maxPrice={2500}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    className="w-full lg:w-64 shrink-0"
                />

                {/* Products Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                            <Button variant="outline" onClick={() => {
                                setFilters({})
                                setSearchTerm("")
                            }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="h-screen flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}
