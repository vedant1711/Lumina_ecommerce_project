"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { StarRating } from "./StarRating"
import { toast } from "sonner"
import { Star } from "lucide-react"

interface ReviewFormProps {
    productId: number
    onSubmit: () => void
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [title, setTitle] = useState("")
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error("Please log in to submit a review")
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    rating,
                    title: title || undefined,
                    comment: comment || undefined
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.detail || "Failed to submit review")
            }

            toast.success("Review submitted successfully!")
            setRating(0)
            setTitle("")
            setComment("")
            onSubmit()
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg border border-white/10 bg-card/30">
            <h3 className="text-lg font-semibold">Write a Review</h3>

            {/* Rating selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Your Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer transition-all ${star <= (hoverRating || rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground hover:text-yellow-300"
                                }`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Review Title (optional)</label>
                <Input
                    placeholder="Summarize your experience"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Your Review (optional)</label>
                <Textarea
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
            </div>

            <Button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full"
            >
                {loading ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
    )
}
