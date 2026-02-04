"use client"

import { toast } from "sonner"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="w-full max-w-sm border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Welcome Back
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Sign in to access your personalized shopping experience.
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email') as string;
                        const password = formData.get('password') as string;
                        try {
                            const params = new URLSearchParams();
                            params.append('username', email);
                            params.append('password', password);

                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: params
                            });

                            if (!res.ok) throw new Error('Login failed');
                            const data = await res.json();
                            localStorage.setItem('token', data.access_token);
                            // Simple window reload or redirect - ideally use a Context function or router
                            toast.success("Logged in successfully");
                            setTimeout(() => window.location.href = '/', 1000);
                        } catch (err) {
                            toast.error("Invalid credentials");
                        }
                    }}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                Email
                            </label>
                            <Input id="email" name="email" placeholder="m@example.com" type="email" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                Password
                            </label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" type="submit">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
