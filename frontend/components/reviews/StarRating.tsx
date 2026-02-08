"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: "sm" | "md" | "lg"
    showValue?: boolean
    interactive?: boolean
    onRatingChange?: (rating: number) => void
    className?: string
}

export function StarRating({
    rating,
    maxRating = 5,
    size = "md",
    showValue = false,
    interactive = false,
    onRatingChange,
    className
}: StarRatingProps) {
    const sizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex">
                {Array.from({ length: maxRating }).map((_, i) => (
                    <Star
                        key={i}
                        onClick={() => interactive && onRatingChange?.(i + 1)}
                        className={cn(
                            sizes[size],
                            interactive && "cursor-pointer hover:scale-110 transition-transform",
                            i < rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                        )}
                    />
                ))}
            </div>
            {showValue && (
                <span className="text-sm text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    )
}
