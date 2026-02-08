"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getOrders, getWishlist, Product } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, Package, Clock, ChevronRight } from "lucide-react"

interface Order {
    id: number
    total_amount: number
    status: string
    created_at: string
    items: any[]
}

interface WishlistItem {
    id: number
    product_id: number
    product: Product
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        async function loadData() {
            try {
                const [ordersData, wishlistData] = await Promise.all([
                    getOrders().catch(() => []),
                    getWishlist().catch(() => [])
                ])
                setOrders(ordersData)
                setWishlist(wishlistData)
            } catch (e) {
                console.error("Failed to load dashboard data", e)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const recentOrders = orders.slice(0, 3)
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-500'
            case 'paid': return 'text-blue-500'
            case 'shipped': return 'text-purple-500'
            case 'delivered': return 'text-green-500'
            case 'cancelled': return 'text-red-500'
            default: return 'text-muted-foreground'
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-48 bg-white/10 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/10 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Manage your orders and wishlist
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-3xl font-bold">{orders.length}</p>
                            </div>
                            <ShoppingBag className="w-10 h-10 text-indigo-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Wishlist Items</p>
                                <p className="text-3xl font-bold">{wishlist.length}</p>
                            </div>
                            <Heart className="w-10 h-10 text-pink-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Orders</p>
                                <p className="text-3xl font-bold">{pendingOrders}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="border-white/10 mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link href="/orders">
                        <Button variant="ghost" size="sm">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Package className="w-8 h-8 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Order #{order.id}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                                        <p className={`text-sm capitalize ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No orders yet</p>
                            <Link href="/products">
                                <Button variant="link" className="mt-2">Start Shopping</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/wishlist">
                    <Card className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <Heart className="w-8 h-8 text-pink-400" />
                            <div>
                                <p className="font-semibold">My Wishlist</p>
                                <p className="text-sm text-muted-foreground">
                                    {wishlist.length} items saved
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 ml-auto" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/orders">
                    <Card className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <Package className="w-8 h-8 text-indigo-400" />
                            <div>
                                <p className="font-semibold">Order History</p>
                                <p className="text-sm text-muted-foreground">
                                    View and track your orders
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 ml-auto" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
