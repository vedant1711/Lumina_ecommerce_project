"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getMerchantDashboard, getMerchantProducts, getMerchantOrders } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, ShoppingBag, AlertTriangle, Plus, ChevronRight } from "lucide-react"

export default function MerchantDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        async function loadData() {
            try {
                const [dashboardData, productsData, ordersData] = await Promise.all([
                    getMerchantDashboard(),
                    getMerchantProducts(),
                    getMerchantOrders()
                ])
                setStats(dashboardData)
                setProducts(productsData.slice(0, 5))
                setOrders(ordersData.slice(0, 5))
            } catch (e) {
                console.error("Failed to load merchant data", e)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 bg-white/10 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        {stats?.store_name || 'Seller Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your products and orders
                    </p>
                </div>
                <Link href="/merchant/products/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Sales</p>
                                <p className="text-3xl font-bold">${stats?.total_sales?.toFixed(2) || '0.00'}</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-3xl font-bold">{stats?.total_orders || 0}</p>
                            </div>
                            <ShoppingBag className="w-10 h-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Products</p>
                                <p className="text-3xl font-bold">{stats?.active_products || 0}</p>
                            </div>
                            <Package className="w-10 h-10 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Low Stock</p>
                                <p className="text-3xl font-bold">{stats?.low_stock_products || 0}</p>
                            </div>
                            <AlertTriangle className="w-10 h-10 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Products and Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Products */}
                <Card className="border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your Products</CardTitle>
                        <Link href="/merchant/products">
                            <Button variant="ghost" size="sm">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {products.length > 0 ? (
                            <div className="space-y-3">
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image_url || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Stock: {product.stock}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-semibold">${product.price}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No products yet</p>
                                <Link href="/merchant/products/new">
                                    <Button variant="link" className="mt-2">Add your first product</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link href="/merchant/orders">
                            <Button variant="ghost" size="sm">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {orders.length > 0 ? (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div
                                        key={order.id}
                                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Order #{order.id}</span>
                                            <span className={`text-xs px-2 py-1 rounded capitalize ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {order.items.length} items • {order.customer_email}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No orders yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
