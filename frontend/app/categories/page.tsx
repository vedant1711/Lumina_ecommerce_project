"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/categories/`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (e) {
                console.error("Failed to load categories", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                Shop by Category
            </h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Link href={`/products?category_id=${cat.id}`} key={cat.id} className="block group">
                            <div className="relative h-64 rounded-2xl overflow-hidden glass-card">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
                                <div className="absolute top-0 left-0 w-full h-full bg-slate-800 group-hover:scale-105 transition-transform duration-500">
                                    {/* Random gradient background for now */}
                                    <div className={`w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20`} />
                                </div>
                                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                                    <h2 className="text-2xl font-bold text-white mb-2">{cat.name}</h2>
                                    <p className="text-gray-300 line-clamp-2">{cat.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
