"use client"

import { useEffect, useState } from "react"
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
import { toast } from "sonner"

export default function AdminDashboard() {
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch sequentially to debug or ensure stability
                const userData = await fetchWithAuth('/admin/users');
                if (userData) setUsers(userData);

                const orderData = await fetchWithAuth('/admin/orders');
                if (orderData) setOrders(orderData);

                const productData = await fetchWithAuth('/admin/products');
                if (productData) setProducts(productData);

                const categoryData = await fetchWithAuth('/admin/categories');
                if (categoryData) setCategories(categoryData);

            } catch (err: any) {
                console.error("Admin load error:", err);
                if (err.message && err.message.includes("403")) {
                    toast.error("Access Denied: Admin only")
                    router.push("/")
                } else {
                    toast.error("Failed to load admin data");
                }
            }
        }
        loadData()
    }, [router])

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                    <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                    <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
                    <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                    <UsersTable data={users} onUpdate={() => {
                        // Reload data
                        fetchWithAuth('/admin/users').then(setUsers).catch(console.error)
                    }} />
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products">
                    <DataTable
                        title="Products Inventory"
                        data={products}
                        columns={[
                            { key: "id", label: "ID" },
                            { key: "name", label: "Name" },
                            { key: "category_name", label: "Category" },
                            { key: "price", label: "Price ($)" },
                            { key: "stock", label: "Stock" },
                            { key: "created_at", label: "Created" }
                        ]}
                    />
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <DataTable
                        title="Customer Orders"
                        data={orders}
                        columns={[
                            { key: "id", label: "ID" },
                            { key: "user_email", label: "Customer" },
                            { key: "total_amount", label: "Total ($)" },
                            { key: "status", label: "Status" },
                            { key: "items_count", label: "Items" },
                            { key: "created_at", label: "Date" }
                        ]}
                    />
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories">
                    <DataTable
                        title="Product Categories"
                        data={categories}
                        columns={[
                            { key: "id", label: "ID" },
                            { key: "name", label: "Name" },
                            { key: "description", label: "Description" }
                        ]}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

import { Button } from "@/components/ui/button"
import { Shield, ShieldOff, Check } from "lucide-react"

function UsersTable({ data, onUpdate }: { data: any[], onUpdate: () => void }) {
    if (!data) return null;

    const handleToggleAdmin = async (user: any) => {
        const newStatus = !user.is_superuser;
        if (!confirm(`Are you sure you want to ${newStatus ? 'PROMOTE' : 'DEMOTE'} ${user.email}?`)) return;

        try {
            await fetchWithAuth(`/admin/users/${user.id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ is_superuser: newStatus })
            });
            toast.success(`User ${newStatus ? 'promoted to Admin' : 'demoted'}`);
            onUpdate();
        } catch (err) {
            toast.error("Failed to update role");
        }
    }

    return (
        <Card>
            <CardHeader className="py-4">
                <CardTitle className="text-lg">Registered Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.full_name}</TableCell>
                                    <TableCell>
                                        {user.is_superuser ? (
                                            <span className="inline-flex items-center text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">
                                                <Shield className="w-3 h-3 mr-1" /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">User</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={user.is_superuser ? "destructive" : "default"}
                                            onClick={() => handleToggleAdmin(user)}
                                        >
                                            {user.is_superuser ? "Revoke" : "Make Admin"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function DataTable({ title, data, columns }: { title: string, data: any[], columns: { key: string, label: string }[] }) {
    if (!data) return null;

    return (
        <Card>
            <CardHeader className="py-4">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col.key} className="h-10 text-xs font-bold uppercase tracking-wider bg-muted/50">
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center h-24 text-muted-foreground">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        {columns.map((col) => (
                                            <TableCell key={`${row.id}-${col.key}`} className="py-2 text-xs">
                                                {formatValue(row[col.key], col.key)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function formatValue(value: any, key: string) {
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    if (key.includes("created_at") && value) return new Date(value).toLocaleDateString();
    return value;
}
