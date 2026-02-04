export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/20 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
                        Lumina
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Experience the future of shopping with AI-powered recommendations and premium aesthetics.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>All Products</li>
                        <li>New Arrivals</li>
                        <li>Best Sellers</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>FAQ</li>
                        <li>Shipping</li>
                        <li>Returns</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
                © 2024 Lumina E-Commerce. All rights reserved.
            </div>
        </footer>
    )
}
