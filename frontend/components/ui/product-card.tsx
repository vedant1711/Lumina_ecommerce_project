"use client"

import { Product, addToCart } from "@/lib/api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter()

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if wrapped in link
        e.stopPropagation()

        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login to add to cart")
            router.push("/auth/login")
            return
        }

        try {
            await addToCart(product.id, 1)
            toast.success("Added to cart")
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Link href={`/products/${product.id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                <Card className="overflow-hidden border-border bg-card/50 hover:bg-card/80 transition-colors group h-full flex flex-col shadow-sm">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                        {/* Placeholder for real image or fallback */}
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                                No Image
                            </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
                            View Details
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </Link>
    )
}
