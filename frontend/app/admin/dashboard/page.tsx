"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
    Search, Shield, Trash2, Star, Users, Package, ShoppingBag,
    Heart, MessageSquare, ArrowUpDown, ChevronDown
} from "lucide-react"

interface DashboardStats {
    total_users: number
    total_products: number
    total_orders: number
    total_reviews: number
    total_revenue: number
    user_breakdown: {
        customers: number
        merchants: number
        admins: number
    }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [users, setUsers] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [wishlistItems, setWishlistItems] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("overview")
    const [loading, setLoading] = useState(true)

    // Search states
    const [userSearch, setUserSearch] = useState("")
    const [productSearch, setProductSearch] = useState("")
    const [orderSearch, setOrderSearch] = useState("")
    const [reviewSearch, setReviewSearch] = useState("")

    // Filter states
    const [userRoleFilter, setUserRoleFilter] = useState("all")
    const [orderStatusFilter, setOrderStatusFilter] = useState("all")
    const [productCategoryFilter, setProductCategoryFilter] = useState("all")

    useEffect(() => {
        loadData()
    }, [router])

    const loadData = async () => {
        try {
            setLoading(true)
            const [statsData, userData, orderData, productData, categoryData, reviewData, wishlistData] = await Promise.all([
                fetchWithAuth('/admin/dashboard').catch(() => null),
                fetchWithAuth('/admin/users').catch(() => []),
                fetchWithAuth('/admin/orders').catch(() => []),
                fetchWithAuth('/admin/products').catch(() => []),
                fetchWithAuth('/admin/categories').catch(() => []),
                fetchWithAuth('/admin/reviews').catch(() => []),
                fetchWithAuth('/admin/wishlist-items').catch(() => [])
            ])

            if (statsData) setStats(statsData)
            setUsers(userData || [])
            setOrders(orderData || [])
            setProducts(productData || [])
            setCategories(categoryData || [])
            setReviews(reviewData || [])
            setWishlistItems(wishlistData || [])
        } catch (err: any) {
            console.error("Admin load error:", err)
            if (err.message?.includes("403")) {
                toast.error("Access Denied: Admin only")
                router.push("/")
            } else {
                toast.error("Failed to load admin data")
            }
        } finally {
            setLoading(false)
        }
    }

    // Filtered data
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !userSearch ||
                u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
            const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter
            return matchesSearch && matchesRole
        })
    }, [users, userSearch, userRoleFilter])

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !productSearch ||
                p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.brand?.toLowerCase().includes(productSearch.toLowerCase())
            const matchesCategory = productCategoryFilter === "all" ||
                p.category_name?.toLowerCase() === productCategoryFilter.toLowerCase()
            return matchesSearch && matchesCategory
        })
    }, [products, productSearch, productCategoryFilter])

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = !orderSearch ||
                o.user_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.id?.toString().includes(orderSearch)
            const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter
            return matchesSearch && matchesStatus
        })
    }, [orders, orderSearch, orderStatusFilter])

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            return !reviewSearch ||
                r.product_name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                r.user_email?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                r.title?.toLowerCase().includes(reviewSearch.toLowerCase())
        })
    }, [reviews, reviewSearch])

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm("Delete this review?")) return
        try {
            await fetchWithAuth(`/admin/reviews/${reviewId}`, { method: 'DELETE' })
            setReviews(prev => prev.filter(r => r.id !== reviewId))
            toast.success("Review deleted")
        } catch {
            toast.error("Failed to delete review")
        }
    }

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await fetchWithAuth(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            })
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            toast.success("User role updated")
        } catch {
            toast.error("Failed to update role")
        }
    }

    const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await fetchWithAuth(`/admin/orders/${orderId}/status?new_status=${newStatus}`, {
                method: 'PUT'
            })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success("Order status updated")
        } catch {
            toast.error("Failed to update status")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-48 bg-white/10 rounded" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/10 rounded" />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview" className="gap-2">
                        <Package className="w-4 h-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="w-4 h-4" /> Users ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                        <Package className="w-4 h-4" /> Products ({products.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2">
                        <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2">
                        <MessageSquare className="w-4 h-4" /> Reviews ({reviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="gap-2">
                        <Heart className="w-4 h-4" /> Wishlist ({wishlistItems.length})
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="gap-2">
                        Categories ({categories.length})
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard title="Total Users" value={stats?.total_users || 0} icon={<Users />} color="blue" />
                        <StatCard title="Total Products" value={stats?.total_products || 0} icon={<Package />} color="purple" />
                        <StatCard title="Total Orders" value={stats?.total_orders || 0} icon={<ShoppingBag />} color="green" />
                        <StatCard title="Revenue" value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`} icon={<Star />} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-white/10">
                            <CardHeader><CardTitle className="text-sm">User Breakdown</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between"><span>Customers</span><Badge>{stats?.user_breakdown?.customers || 0}</Badge></div>
                                <div className="flex justify-between"><span>Merchants</span><Badge variant="secondary">{stats?.user_breakdown?.merchants || 0}</Badge></div>
                                <div className="flex justify-between"><span>Admins</span><Badge variant="destructive">{stats?.user_breakdown?.admins || 0}</Badge></div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/10">
                            <CardHeader><CardTitle className="text-sm">Reviews</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats?.total_reviews || 0}</div>
                                <p className="text-muted-foreground text-sm">Total product reviews</p>
                            </CardContent>
                        </Card>
                        <Card className="border-white/10">
                            <CardHeader><CardTitle className="text-sm">Wishlist Items</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{wishlistItems.length}</div>
                                <p className="text-muted-foreground text-sm">Products saved by users</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card className="border-white/10">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <CardTitle>Registered Users</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by email or name..."
                                            className="pl-9 w-64"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="merchant">Merchant</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.full_name}</TableCell>
                                            <TableCell>
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell>{user.store_name || '-'}</TableCell>
                                            <TableCell>{formatDate(user.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                                                    <SelectTrigger className="w-28 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="customer">Customer</SelectItem>
                                                        <SelectItem value="merchant">Merchant</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products">
                    <Card className="border-white/10">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <CardTitle>Products Inventory</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or brand..."
                                            className="pl-9 w-64"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.name.toLowerCase()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Featured</TableHead>
                                        <TableHead>Active</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.id}</TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.brand || '-'}</TableCell>
                                            <TableCell>{product.category_name}</TableCell>
                                            <TableCell>${product.price}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                                                    {product.stock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{product.is_featured ? '⭐' : '-'}</TableCell>
                                            <TableCell>{product.is_active ? '✓' : '✗'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <Card className="border-white/10">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <CardTitle>Customer Orders</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by email or order ID..."
                                            className="pl-9 w-64"
                                            value={orderSearch}
                                            onChange={(e) => setOrderSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Update Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{order.user_email}</TableCell>
                                            <TableCell className="font-medium">${order.total_amount}</TableCell>
                                            <TableCell>{order.items_count}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={order.status} />
                                            </TableCell>
                                            <TableCell>{formatDate(order.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <Select value={order.status} onValueChange={(v) => handleOrderStatusChange(order.id, v)}>
                                                    <SelectTrigger className="w-28 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                    <Card className="border-white/10">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <CardTitle>Product Reviews (Moderation)</CardTitle>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search reviews..."
                                        className="pl-9 w-64"
                                        value={reviewSearch}
                                        onChange={(e) => setReviewSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReviews.map(review => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.id}</TableCell>
                                            <TableCell className="font-medium">{review.product_name}</TableCell>
                                            <TableCell>{review.user_email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>{review.title}</TableCell>
                                            <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                                            <TableCell>{formatDate(review.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteReview(review.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Wishlist Tab */}
                <TabsContent value="wishlist">
                    <Card className="border-white/10">
                        <CardHeader>
                            <CardTitle>Wishlist Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wishlistItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.user_email}</TableCell>
                                            <TableCell className="font-medium">{item.product_name}</TableCell>
                                            <TableCell>{formatDate(item.created_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories">
                    <Card className="border-white/10">
                        <CardHeader>
                            <CardTitle>Product Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Products</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map(cat => (
                                        <TableRow key={cat.id}>
                                            <TableCell>{cat.id}</TableCell>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.description || '-'}</TableCell>
                                            <TableCell><Badge>{cat.product_count || 0}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'from-blue-500/10 to-cyan-500/10 text-blue-400',
        purple: 'from-purple-500/10 to-pink-500/10 text-purple-400',
        green: 'from-green-500/10 to-emerald-500/10 text-green-400',
        yellow: 'from-yellow-500/10 to-orange-500/10 text-yellow-400'
    }
    return (
        <Card className={`bg-gradient-to-br ${colorClasses[color]} border-white/10`}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className="opacity-50">{icon}</div>
            </CardContent>
        </Card>
    )
}

function RoleBadge({ role }: { role: string }) {
    switch (role) {
        case 'admin': return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
        case 'merchant': return <Badge variant="secondary">Merchant</Badge>
        default: return <Badge variant="outline">Customer</Badge>
    }
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        paid: 'bg-green-500/20 text-green-400',
        shipped: 'bg-blue-500/20 text-blue-400',
        delivered: 'bg-emerald-500/20 text-emerald-400',
        cancelled: 'bg-red-500/20 text-red-400'
    }
    return <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${variants[status] || ''}`}>{status}</span>
}

function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
