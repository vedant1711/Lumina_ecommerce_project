"use client"

import Link from "next/link"
import { ShoppingCart, User, Search, Menu, Heart, Store, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserData {
    id: number;
    email: string;
    full_name: string;
    role: "customer" | "merchant" | "admin";
    store_name?: string;
}

export function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)

        // Check auth status and get user data
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        setIsAuthenticated(!!token)
        if (userData) {
            try {
                setUser(JSON.parse(userData))
            } catch (e) {
                console.error('Error parsing user data')
            }
        }

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser(null)
        window.location.href = '/'
    }

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Lumina
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="/products" className="hover:text-primary transition-colors">
                        Shop
                    </Link>
                    <Link href="/categories" className="hover:text-primary transition-colors">
                        Categories
                    </Link>
                    <Link href="/products?is_featured=true" className="hover:text-primary transition-colors">
                        Featured
                    </Link>
                    <Link href="/products?sort_by=newest" className="hover:text-primary transition-colors">
                        New Arrivals
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Link href="/products">
                        <Button variant="ghost" size="icon" className="hidden sm:flex" title="Search Products">
                            <Search className="w-5 h-5" />
                        </Button>
                    </Link>

                    {isAuthenticated && (
                        <Link href="/dashboard/wishlist">
                            <Button variant="ghost" size="icon" title="Wishlist">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </Link>
                    )}

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" title="View Cart">
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        My Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/orders" className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        My Orders
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/wishlist" className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        Wishlist
                                    </Link>
                                </DropdownMenuItem>

                                {/* Merchant menu */}
                                {(user?.role === 'merchant' || user?.role === 'admin') && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/merchant" className="flex items-center gap-2">
                                                <Store className="w-4 h-4" />
                                                Seller Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth/login">
                            <Button variant="ghost" size="icon" title="Login / Signup">
                                <User className="w-5 h-5" />
                            </Button>
                        </Link>
                    )}

                    <ModeToggle />
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
