# Nike Frontend

## Overview

Modern React-based frontend application for Nike e-commerce platform. Built with cutting-edge technologies to deliver a seamless shopping experience with real-time features and responsive design.

## 🎯 Features

- **Product Browsing** - Explore Nike products with advanced filtering and search
- **Shopping Cart** - Add, remove, and manage cart items
- **Order Management** - Track orders and view order history
- **User Authentication** - Secure login/registration with OTP verification
- **Real-time Chat** - Customer support chat system with live messaging
- **Collections** - Browse curated product collections
- **Responsive Design** - Fully optimized for mobile, tablet, and desktop
- **Dark/Light Mode** - Theme switching capability
- **Image Optimization** - Fast loading with Cloudinary integration

## 🛠️ Tech Stack

**Frontend Framework & Build:**
- React 18+ - UI library
- TypeScript - Type safety and better DX
- Vite - Next generation build tool
- Tailwind CSS - Utility-first CSS framework

**State Management & Data Fetching:**
- Redux Toolkit - Predictable state management
- RTK Query - Data fetching and caching
- Axios - HTTP client

**Real-time Features:**
- Socket.io - Real-time bidirectional communication

**Other Libraries:**
- React Router - Client-side routing
- Formik & Yup - Form management and validation
- SweetAlert2 - Beautiful alerts and modals

## 📦 Installation

### Prerequisites
- Node.js 16+ (or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/asbin007/nike-frontend.git
cd nike-frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
# or
yarn dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Image Upload
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 📁 Project Structure

```
src/
├── app/                 # Redux store configuration
├── components/          # Reusable React components
├── pages/              # Page components
├── services/           # API calls and services
├── hooks/              # Custom React hooks
├── styles/             # Global styles and utilities
├── types/              # TypeScript type definitions
└── App.tsx             # Main app component
```

## 🚀 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

### Development Server

The app runs at `http://localhost:5173` by default.

## 🔗 Connected Backend

This frontend connects to the Nike Backend API:
- Repository: [nike-backend](https://github.com/asbin007/nike-backend)
- API Base URL: `http://localhost:5000/api`
- Real-time Chat: Socket.io connection

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🌐 Deployment

Easily deployable to:
- Vercel (Recommended)
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🤝 Integration with Nike Ecosystem

This frontend is part of the Nike e-commerce ecosystem:

1. **nike-backend** - Node.js/Express API server
2. **nike-frontend** - React frontend (this repo)
3. **admin-panel** - Next.js admin dashboard

## 📚 Related Projects

- [Nike Backend](https://github.com/asbin007/nike-backend) - Backend API
- [Admin Panel](https://github.com/asbin007/admin-panel) - Admin Dashboard

## 📝 License

ISC License

## 🙋 Support

For issues, questions, or suggestions, please open an issue in the [repository](https://github.com/asbin007/nike-frontend/issues).
