# Frontend Documentation

## Technology Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Framer Motion** (Animations)

## Project Structure
- `app/`: Next.js App Router pages.
  - `page.tsx`: Landing page.
  - `auth/`: Authentication pages (Login/Signup).
  - `products/`: Product listing and details.
  - `cart/`: Shopping cart page.
- `components/`: Reusable UI components.
  - `ui/`: Shadcn-like primitive components (Button, Input, Card).
  - `layout/`: Navbar, Footer.
- `lib/`: Utilities.
  - `api.ts`: API client for backend communication.
  - `auth-context.tsx`: React Context for auth state.

## Components
- **Navbar**: Sticky navigation bar with links to Cart, Profile, and Products.
- **ProductCard**: Displays product info and "Add to Cart" button.
- **AuthProvider**: Wraps the app to provide `useAuth` hook.

## Styling
Global styles are in `app/globals.css`. We use a custom dark theme with glassmorphism effects.
