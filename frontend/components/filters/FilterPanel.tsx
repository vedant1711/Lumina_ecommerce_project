"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Star, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
    id: number
    name: string
}

interface FilterPanelProps {
    categories: Category[]
    brands: string[]
    maxPrice: number
    filters: {
        category_id?: number
        brand?: string
        min_price?: number
        max_price?: number
        min_rating?: number
        in_stock?: boolean
    }
    onFilterChange: (filters: any) => void
    className?: string
}

export function FilterPanel({
    categories,
    brands,
    maxPrice = 1000,
    filters,
    onFilterChange,
    className
}: FilterPanelProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setPriceRange([filters.min_price || 0, filters.max_price || maxPrice])
    }, [filters.min_price, filters.max_price, maxPrice])

    const handleCategoryChange = (categoryId: number) => {
        onFilterChange({
            ...filters,
            category_id: filters.category_id === categoryId ? undefined : categoryId
        })
    }

    const handleBrandChange = (brand: string) => {
        onFilterChange({
            ...filters,
            brand: filters.brand === brand ? undefined : brand
        })
    }

    const handlePriceChange = (value: number[]) => {
        setPriceRange([value[0], value[1]])
    }

    const handlePriceCommit = () => {
        onFilterChange({
            ...filters,
            min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
            max_price: priceRange[1] < maxPrice ? priceRange[1] : undefined
        })
    }

    const handleRatingChange = (rating: number) => {
        onFilterChange({
            ...filters,
            min_rating: filters.min_rating === rating ? undefined : rating
        })
    }

    const handleStockChange = (checked: boolean) => {
        onFilterChange({
            ...filters,
            in_stock: checked ? true : undefined
        })
    }

    const clearAllFilters = () => {
        setPriceRange([0, maxPrice])
        onFilterChange({})
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined)

    const filterContent = (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                        Clear All
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Categories</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                            <Checkbox
                                id={`cat-${category.id}`}
                                checked={filters.category_id === category.id}
                                onCheckedChange={() => handleCategoryChange(category.id)}
                            />
                            <label
                                htmlFor={`cat-${category.id}`}
                                className="text-sm cursor-pointer hover:text-primary transition-colors"
                            >
                                {category.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Price Range</h4>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={maxPrice}
                        step={10}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        onValueCommit={handlePriceCommit}
                        className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {brands.map((brand) => (
                            <div key={brand} className="flex items-center gap-2">
                                <Checkbox
                                    id={`brand-${brand}`}
                                    checked={filters.brand === brand}
                                    onCheckedChange={() => handleBrandChange(brand)}
                                />
                                <label
                                    htmlFor={`brand-${brand}`}
                                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                                >
                                    {brand}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Minimum Rating</h4>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <div
                            key={rating}
                            onClick={() => handleRatingChange(rating)}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors",
                                filters.min_rating === rating && "bg-accent"
                            )}
                        >
                            <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">& up</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Availability</h4>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="in-stock"
                        checked={filters.in_stock === true}
                        onCheckedChange={handleStockChange}
                    />
                    <label htmlFor="in-stock" className="text-sm cursor-pointer">
                        In Stock Only
                    </label>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile filter button */}
            <Button
                variant="outline"
                size="sm"
                className="lg:hidden mb-4"
                onClick={() => setIsOpen(true)}
            >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {Object.values(filters).filter(v => v !== undefined).length}
                    </span>
                )}
            </Button>

            {/* Mobile filter drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        {filterContent}
                    </div>
                </div>
            )}

            {/* Desktop filter panel */}
            <div className={cn("hidden lg:block", className)}>
                <div className="sticky top-24 p-4 rounded-lg border border-white/10 bg-card/50 backdrop-blur-sm">
                    {filterContent}
                </div>
            </div>
        </>
    )
}
