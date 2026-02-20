# Frontend Documentation

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Radix UI** | Accessible primitives |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **Stripe.js** | Payment integration |

---

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page with hero + AI feed
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles and theme
│   │
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── products/          # Product pages
│   │   ├── page.tsx       # Product listing with filters
│   │   └── [id]/          # Product detail + AI recommendations
│   │
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Stripe checkout
│   ├── orders/            # Order history
│   ├── wishlist/          # Wishlist
│   │
│   ├── merchant/          # Merchant dashboard
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   │
│   └── admin/             # Admin dashboard
│       └── dashboard/     # 7-tab admin panel
│
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── slider.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Navbar.tsx     # Navigation with auth state
│   │   └── Footer.tsx
│   │
│   ├── home/
│   │   └── PersonalizedFeed.tsx  # AI-powered trending/personalized feed
│   │
│   ├── products/
│   │   └── RelatedProducts.tsx   # AI-powered "You May Also Like"
│   │
│   ├── ProductCard.tsx    # Product grid card
│   ├── FilterPanel.tsx    # Product filters
│   └── theme-provider.tsx # Dark/light mode
│
├── lib/
│   ├── api.ts             # API client with fetchWithAuth + AI endpoints
│   ├── utils.ts           # cn() utility for classnames
│   └── stripe.ts          # Stripe configuration
│
└── context/
    └── auth-context.tsx   # Authentication context
```

---

## Key Pages

### Landing Page (`/`)
- Hero section with promotional content
- **AI-Powered Feed**: "Trending Now" (anonymous) or "Recommended for You" (logged in)
- Category showcase
- Call-to-action buttons

### Products Page (`/products`)
- Product grid with responsive layout
- Filter panel:
  - Category filter (checkboxes)
  - Brand filter (checkboxes)
  - Price range (slider)
  - Sort options (dropdown)
- Search functionality
- Pagination

### Product Details (`/products/[id]`)
- Large product image
- Brand, name, price, stock status
- Quantity selector
- Add to Cart button
- Wishlist toggle
- **Specifications Tab**: Technical details
- **Reviews Tab**:
  - Rating breakdown bars
  - Individual reviews with sentiment labels
  - Write review form (auto-computes sentiment)
- **"You May Also Like"**: AI-powered related products with similarity scores

### Shopping Cart (`/cart`)
- Cart items with quantity controls
- Remove item functionality
- Cart totals
- Proceed to checkout button

### Checkout (`/checkout`)
- Stripe Elements integration
- Multiple payment methods
- Order summary

### Admin Dashboard (`/admin/dashboard`)
7 comprehensive tabs:
1. **Overview**: Stats cards (users, products, orders, revenue)
2. **Users**: User management with role editing
3. **Products**: Product inventory with stock badges
4. **Orders**: Order status management
5. **Reviews**: Review moderation with delete
6. **Wishlist**: All wishlist items
7. **Categories**: Category management

---

## Components

### Navbar (`components/layout/Navbar.tsx`)
- Logo and navigation links
- Search input (optional)
- Auth state (Login/Signup or User Menu)
- Cart icon with item count
- Theme toggle

### ProductCard (`components/ProductCard.tsx`)
- Product image
- Name, brand, price
- Star rating
- Add to Cart button
- Featured badge

### FilterPanel (`components/FilterPanel.tsx`)
- Category checkboxes
- Brand checkboxes
- Price range slider
- Clear filters button

### PersonalizedFeed (`components/home/PersonalizedFeed.tsx`)
- Fetches personalized recommendations for logged-in users
- Falls back to trending products for anonymous users
- Displays strategy label ("Recommended for You" vs "Trending Now")
- Shows explanation text (e.g., "Based on your interest in Electronics")
- Responsive product grid with cards, badges, and hover effects

### RelatedProducts (`components/products/RelatedProducts.tsx`)
- Fetches AI-powered similar product recommendations
- Uses TF-IDF + Cosine Similarity for content-based filtering
- Displays similarity score badges ("X% Match") for high-confidence matches
- Responsive 4-column grid with product cards
- Shown at the bottom of each product detail page

---

## State Management

### Authentication Context
```tsx
import { useAuth } from "@/context/auth-context";

const { user, login, logout, isAuthenticated, isAdmin, isMerchant } = useAuth();
```

### API Client
```tsx
import { fetchWithAuth, getProducts, addToCart } from "@/lib/api";

// Authenticated request
const data = await fetchWithAuth('/cart/');

// Public request
const products = await getProducts({ category_id: 1 });

// AI / Analytics
import { getProductRecommendations, getUserRecommendations, getTrendingProducts, getProductSentiment } from "@/lib/api";

const similar = await getProductRecommendations(productId, 8);  // Similar products
const feed = await getUserRecommendations(12);                   // Personalized feed
const trending = await getTrendingProducts(12);                  // Public trending
const sentiment = await getProductSentiment(productId);          // Review sentiment
```

---

## Styling

### Theme System
- CSS variables for colors in `globals.css`
- Dark mode as default
- Light mode toggle support
- Uses `next-themes` for persistence

### Design Tokens
```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --muted: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
  --destructive: 0 62.8% 30.6%;
}
```

### Glassmorphism Effects
- `backdrop-blur-xl`
- `bg-white/5` or `bg-black/20`
- `border-white/10`

---

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Development

### Start dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Type checking
```bash
npm run lint
```

---

## Best Practices

1. **API Calls**: Always use `fetchWithAuth` for authenticated endpoints
2. **Loading States**: Show skeletons during data fetch
3. **Error Handling**: Use toast notifications for errors
4. **Forms**: Use controlled components with React state
5. **Routing**: Use `useRouter` from `next/navigation`
