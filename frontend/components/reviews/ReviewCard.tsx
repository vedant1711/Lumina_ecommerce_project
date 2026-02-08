"use client"

import { StarRating } from "./StarRating"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ReviewCardProps {
    review: {
        id: number
        rating: number
        title?: string
        comment?: string
        user_name: string
        verified_purchase: boolean
        helpful_count: number
        created_at: string
    }
    onHelpful?: (reviewId: number) => void
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
    const [helpfulClicked, setHelpfulClicked] = useState(false)
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)

    const handleHelpful = () => {
        if (helpfulClicked) return
        setHelpfulClicked(true)
        setHelpfulCount(prev => prev + 1)
        onHelpful?.(review.id)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="p-4 rounded-lg border border-white/10 bg-card/30 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        {review.verified_purchase && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified Purchase
                            </Badge>
                        )}
                    </div>
                    {review.title && (
                        <h4 className="font-semibold text-sm">{review.title}</h4>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    {formatDate(review.created_at)}
                </span>
            </div>

            {/* Content */}
            {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-muted-foreground">
                    By {review.user_name}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHelpful}
                    disabled={helpfulClicked}
                    className="text-xs gap-1"
                >
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({helpfulCount})
                </Button>
            </div>
        </div>
    )
}
