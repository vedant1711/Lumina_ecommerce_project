"use client"

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Star, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm font-medium tracking-wider text-cyan-400 uppercase mb-4">
              The Future of Shopping
            </h2>
            <h1 className="text-5xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-500 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400">
              Discover the <br /> Extraordinary
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Experience a personalized shopping journey powered by AI. curated just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-indigo-500/25 shadow-lg">
                Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/30">
                View Collections
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="Instant Delivery"
              description="Get your products delivered in record time with our AI-optimized logistics."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-indigo-400" />}
              title="Premium Quality"
              description="Curated selection of high-end products guaranteed to exceed expectations."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-cyan-400" />}
              title="Secure Shopping"
              description="State-of-the-art encryption ensures your data and transactions are always safe."
            />
          </div>
        </div>
      </section>

      {/* Hero 2 - Categories Teaser */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-bold">Trending Categories</h2>
            <Link href="/categories" className="text-primary hover:text-primary/80 flex items-center">
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrendingCategories />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl glass-card hover:bg-white/5 transition-colors">
      <div className="mb-4 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TrendingCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/categories/?limit=4`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [])

  if (loading) {
    return [1, 2, 3, 4].map(i => <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)
  }

  if (categories.length === 0) return <div className="text-muted-foreground">No categories found.</div>

  return categories.map((cat) => (
    <Link href={`/products?category_id=${cat.id}`} key={cat.id}>
      <div className="group relative h-80 rounded-2xl overflow-hidden glass-card cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 p-6 z-20">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h3>
          <p className="text-sm text-gray-300">Explore Collection</p>
        </div>
        {/* Placeholder generic image or cat image if available */}
        <div className="absolute inset-0 bg-slate-800 group-hover:scale-105 transition-transform duration-500">
          {/* If cat.image_url exists use it, else random gradient */}
          <div className={`w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20`} />
        </div>
      </div>
    </Link>
  ))
}
