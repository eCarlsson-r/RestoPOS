# RestoPOS 🍽️

A modern, high-performance Point of Sale (POS) system designed for restaurants, built with **Nuxt 3/4** and **Nuxt UI v4**.

## ✨ Key Features

-   **Interactive Floor Map**: Real-time table status (Available, Occupied, Reserved) with a drag-and-drop style canvas.
-   **Buffet & Alacarte Support**: Intelligent ordering system that auto-detects buffet-included items and handles additional alacarte charges.
-   **Real-time KDS (Kitchen Display System)**: Instant order notifications using Laravel Reverb (WebSockets).
-   **Reservation Management**: Integrated booking system with automatic table hold and check-in workflow.
-   **Dynamic Kitchen Tickets**: Smart printing logic that identifies "New" vs "In Kitchen" items to avoid duplicate preparation.
-   **Sales Reporting**: Comprehensive dashboards for daily sales, employee performance, and stock mutations.

## 🚀 Tech Stack

-   **Framework**: [Nuxt 3/4](https://nuxt.com/) (Vue 3)
-   **UI Library**: [Nuxt UI v4](https://ui3.nuxt.dev/) (Tailwind CSS based)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Real-time**: [Laravel Echo](https://laravel.com/docs/broadcasting) + [Pusher-js](https://pusher.com/)
-   **Styling**: Tailwind CSS with Glassmorphism & Premium Aesthetics

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🛠️ Configuration

Create a `.env` file in the root directory:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/
NUXT_PUBLIC_ECHO_KEY=your_reverb_key
```

## 📖 Architecture Highlights

-   **Context-Aware Composables**: `useAuth` handles role-based redirection and session persistence with Nuxt instance safety.
-   **Unified API Layer**: `useApi` provides a typed wrapper around `$fetch` with automatic base URL and token injection.
-   **Smart Basket**: The `pos-order` store handles the complex logic of splitting buffet-included items from extra charges.

---
Developed with ❤️ for Modern Restaurants.
