"use client"

import Link from "next/link"
import { ShoppingCart, User, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)

        // Check auth status
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        // Dispatch custom event for other components if needed, or rely on simple reload for now
        window.location.href = '/';
    };

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
                    <Link href="/new-arrivals" className="hover:text-primary transition-colors">
                        New Arrivals
                    </Link>
                    {isAuthenticated && (
                        <Link href="/admin/dashboard" className="hover:text-primary transition-colors">
                            Admin
                        </Link>
                    )}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/products">
                        <Button variant="ghost" size="icon" className="hidden sm:flex" title="Search Products">
                            <Search className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" title="View Cart">
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                            Logout
                        </Button>
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
