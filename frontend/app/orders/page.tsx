"use client"

import { useEffect, useState } from "react"
import { getOrders } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Order {
    id: number
    total_amount: number
    status: string
    created_at?: string // Optional depending on backend
    items: any[]
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const data = await getOrders()
                // Reverse to show newest first if not sorted by backend
                setOrders((data as Order[]).reverse())
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="container mx-auto px-4 py-20 text-center animate-pulse">Loading orders...</div>

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-4">No orders yet</h2>
                <Link href="/products">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden bg-card/50 border-border">
                        <CardHeader className="bg-muted/30 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {/* Mock date if created_at missing, ideally backend sends it */}
                                    {new Date().toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 mb-2">
                                    {order.status.toUpperCase()}
                                </Badge>
                                <p className="font-bold text-foreground">${order.total_amount.toFixed(2)}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-4">{order.items ? order.items.length : 0} Items</p>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {/* If items details are populated, show images. Currently order.items likely requires eager loading in backend or separate fetch */}
                                    {/* Placeholder visuals for items */}
                                    {Array.from({ length: Math.min(3, order.items ? order.items.length : 1) }).map((_, i) => (
                                        <div key={i} className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                            <Package className="w-6 h-6 text-muted-foreground/50" />
                                        </div>
                                    ))}
                                    {order.items && order.items.length > 3 && (
                                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                            +{order.items.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
