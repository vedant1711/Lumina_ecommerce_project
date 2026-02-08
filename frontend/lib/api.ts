const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { toast } from "sonner";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_URL}${url}`, { ...options, headers });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.detail || res.statusText || 'Unknown Error';
            if (res.status !== 401) {
                toast.error(`Error: ${errorMessage}`);
            }
            throw new Error(errorMessage);
        }
        return res.json();
    } catch (error: any) {
        throw error;
    }
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    compare_at_price?: number;
    image_url?: string;
    images?: string[];
    brand?: string;
    sku?: string;
    stock: number;
    specifications?: Record<string, any>;
    tags?: string[];
    is_featured?: boolean;
    category_id?: number;
    category?: { id: number; name: string };
    average_rating: number;
    review_count: number;
    discount_percent: number;
}

export interface ProductFilters {
    search?: string;
    category_id?: number;
    brand?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    in_stock?: boolean;
    is_featured?: boolean;
    sort_by?: string;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters.min_rating !== undefined) params.append('min_rating', filters.min_rating.toString());
    if (filters.in_stock) params.append('in_stock', 'true');
    if (filters.is_featured) params.append('is_featured', 'true');
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    return fetchWithAuth(`/products/?${params.toString()}`);
}

export async function getProduct(id: number): Promise<Product> {
    return fetchWithAuth(`/products/${id}`);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    return fetchWithAuth('/products/featured');
}

export async function getBrands(): Promise<string[]> {
    return fetchWithAuth('/products/brands');
}

export async function getCategories() {
    return fetchWithAuth('/categories/');
}

export async function addToCart(product_id: number, quantity: number) {
    return fetchWithAuth('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id, quantity }),
    });
}

export async function getCart() {
    return fetchWithAuth('/cart/');
}

export async function clearCart() {
    return fetchWithAuth('/cart/clear', { method: 'DELETE' });
}

export async function getOrders() {
    return fetchWithAuth('/orders/');
}

export async function updateCartItem(product_id: number, quantity: number) {
    return fetchWithAuth('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ product_id, quantity }),
    });
}

export async function removeFromCart(product_id: number) {
    return fetchWithAuth(`/cart/remove/${product_id}`, {
        method: 'DELETE',
    });
}

export async function createPaymentIntent(amount: number) {
    return fetchWithAuth('/payment/create-intent', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
}

export async function confirmCheckout(payment_intent_id: string) {
    return fetchWithAuth('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ payment_intent_id }),
    });
}

// Wishlist
export async function getWishlist() {
    return fetchWithAuth('/wishlist/');
}

export async function addToWishlist(product_id: number) {
    return fetchWithAuth(`/wishlist/${product_id}`, { method: 'POST' });
}

export async function removeFromWishlist(product_id: number) {
    return fetchWithAuth(`/wishlist/${product_id}`, { method: 'DELETE' });
}

export async function checkWishlist(product_id: number) {
    return fetchWithAuth(`/wishlist/check/${product_id}`);
}

// Reviews
export async function getProductReviews(product_id: number) {
    return fetchWithAuth(`/reviews/product/${product_id}`);
}

export async function getReviewStats(product_id: number) {
    return fetchWithAuth(`/reviews/product/${product_id}/stats`);
}

export async function submitReview(product_id: number, rating: number, title?: string, comment?: string) {
    return fetchWithAuth('/reviews/', {
        method: 'POST',
        body: JSON.stringify({ product_id, rating, title, comment }),
    });
}

export async function markReviewHelpful(review_id: number) {
    return fetchWithAuth(`/reviews/${review_id}/helpful`, { method: 'POST' });
}

// Merchant
export async function getMerchantDashboard() {
    return fetchWithAuth('/merchant/dashboard');
}

export async function getMerchantProducts() {
    return fetchWithAuth('/merchant/products');
}

export async function createMerchantProduct(product: Partial<Product>) {
    return fetchWithAuth('/merchant/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
}

export async function updateMerchantProduct(id: number, product: Partial<Product>) {
    return fetchWithAuth(`/merchant/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    });
}

export async function getMerchantOrders() {
    return fetchWithAuth('/merchant/orders');
}

// Admin
export async function getAdminDashboard() {
    return fetchWithAuth('/admin/dashboard');
}

export async function getAdminUsers(role?: string) {
    const params = role ? `?role=${role}` : '';
    return fetchWithAuth(`/admin/users${params}`);
}

export async function updateUserRole(user_id: number, role: string) {
    return fetchWithAuth(`/admin/users/${user_id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    });
}
