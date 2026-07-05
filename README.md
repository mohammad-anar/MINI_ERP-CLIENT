# 💻 Mini ERP Client — Frontend Dashboard & POS App

A modern, highly-responsive Single Page Application (SPA) frontend dashboard for the Mini ERP system. Built using **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Redux Toolkit**, this app features role-based access control, real-time notifications, sales tracking, and interactive product management.

---

## 🌟 Key Features

* **Real-Time Operations Dashboard**: Graphical metrics monitoring total sales, product variety, low-stock warnings, and recent transaction feeds.
* **Product Inventory Management (CRUD)**: Create, read, update, and delete products. Seamlessly handles image previews and file uploads (supporting both local disk and Cloudinary hosts).
* **Point of Sale (POS) Checkout**: A dynamic shopping cart interface supporting real-time quantity validation, stock checks, and checkout.
* **Sales Transaction History**: Expanded transaction tables showing breakdown of sales items, unit prices, timestamps, and customer/employee details.
* **Real-Time Notification Alerts**: Persistent notifications via Socket.IO connections, highlighting low-stock warnings and new transactions instantly.
* **Staff Access Management**: Dedicated panel for administrators to register new Employees, Managers, and Admin accounts.
* **Modern Feedback (Toast Alerts)**: Rich status indicators powered by `sonner` to display immediate form success state and server validation errors.

---

## 🛠️ Technology Stack

| Library | Role |
|---|---|
| **React 19** | Core UI library |
| **Vite** | Fast Next-Gen development server & bundler |
| **TypeScript** | Static typing and interface contracts |
| **Tailwind CSS v4** | Modern utility-first styling |
| **Redux Toolkit** | State management, caching, and RTK Query endpoints |
| **Socket.IO Client** | Real-time bi-directional events handler |
| **Lucide React** | Premium icon library |
| **Sonner** | Interactive toast notifications |

---

## 📋 Prerequisites

* **Node.js**: `^18.x` or `^20.x`
* **Package Manager**: `npm` or `bun`
* **Mini ERP Backend Server**: Ensure the [Mini ERP Backend API](file:///c:/Anar/Test/mongoose-template/README.md) is running.

---

## ⚡ Quick Start

### 1. Navigate to the client directory
```bash
cd client
```

### 2. Install dependencies
```bash
npm install
# or
bun install
```

### 3. Start the development server
```bash
npm run dev
```
The application will launch on your local host (usually `http://localhost:5173`).

---

## 🌍 Configuration & Environment Variables

All API request endpoints are configured to route to the production backend by default. 

To configure/customize backend routing:
1. Open [baseApi.ts](file:///c:/Anar/Test/client/src/redux/api/baseApi.ts) to configure the primary HTTP API endpoint.
2. Open [socket.ts](file:///c:/Anar/Test/client/src/helpers/socket.ts) and [image.ts](file:///c:/Anar/Test/client/src/helpers/image.ts) to adjust local development/production fallback endpoints.

---

## 📁 Folder Structure

```
src/
├── assets/             # SVG and image assets
├── components/
│   ├── guard/          # ProtectedRoute validation wrapper
│   └── layout/         # DashboardLayout (collapsible sidebars, profile pills)
├── helpers/
│   ├── errorHelper.ts  # RTK Query validation response parser
│   ├── image.ts        # Dynamic asset path resolver (local vs Cloudinary)
│   └── socket.ts       # Real-time socket registration and hooks
├── pages/
│   ├── Dashboard.tsx   # ERP Overview metric graphs
│   ├── Products.tsx    # Inventory items CRUD list & modals
│   ├── CreateSale.tsx  # Interactive POS checkout cart
│   ├── SalesHistory.tsx# Auditable invoices feed
│   ├── CreateStaff.tsx # Admin-exclusive registration console
│   └── Login.tsx       # Secured login gate
├── redux/
│   ├── api/            # RTK Query API slices (auth, products, sales, notifications)
│   ├── slices/         # Local Redux slices (auth slice with Redux Persist)
│   └── store.ts        # Redux store configurations
└── main.tsx            # App root render & Toaster declarations
```

---

## 🧪 Available Scripts

Inside the project directory, you can run the following scripts:

```bash
npm run dev     # Starts the development server with Hot Module Replacement (HMR)
npm run build   # Compiles the TypeScript code and bundles the project for production
npm run preview # Starts a local server to preview the production build output
npm run lint    # Runs oxlint to verify code quality and style constraints
```
