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
        console.log("DEBUG: Sending request with token:", token.substring(0, 10) + "...")
    } else {
        console.log("DEBUG: No token found in localStorage")
    }

    try {
        const res = await fetch(`${API_URL}${url}`, { ...options, headers });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.detail || res.statusText || 'Unknown Error';
            // Only toast on error if it's not a 401 (auth handled via context usually) or specifically requested
            if (res.status !== 401) {
                toast.error(`Error: ${errorMessage}`);
            }
            throw new Error(errorMessage);
        }
        return res.json();
    } catch (error: any) {
        // toast.error(`Network Error: ${error.message}`);
        throw error;
    }
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category_id?: number;
}

export async function getProducts(search?: string, category_id?: number): Promise<Product[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category_id) params.append('category_id', category_id.toString());

    return fetchWithAuth(`/products/?${params.toString()}`);
}

export async function getProduct(id: number): Promise<Product> {
    return fetchWithAuth(`/products/${id}`);
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
