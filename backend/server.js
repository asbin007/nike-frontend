const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock data for testing
const mockProducts = [
  {
    id: "1",
    name: "Nike Air Max 270",
    price: 15000,
    brand: "Nike",
    category: "Running",
    image: "/images/product-1.jpg",
    totalStock: 50,
    inStock: true
  },
  {
    id: "2", 
    name: "Nike Zoom Fly",
    price: 18000,
    brand: "Nike",
    category: "Running",
    image: "/images/product-2.jpg",
    totalStock: 30,
    inStock: true
  }
];

const mockUsers = [
  {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword"
  }
];

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  const user = mockUsers.find(u => u.email === email);
  if (user && password === "password") {
    const token = "mock-jwt-token-" + Date.now();
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: token
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post('/api/auth/logins', (req, res) => {
  const { email, password, role } = req.body;
  
  // Mock admin authentication
  if (email === "admin@example.com" && password === "admin" && role === "admin") {
    const token = "mock-admin-token-" + Date.now();
    res.status(201).json({ token });
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
});

// Product routes
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Cart routes
app.post('/api/cart', (req, res) => {
  const { productId, size, color, quantity } = req.body;
  
  // Mock cart addition
  const product = mockProducts.find(p => p.id === productId);
  if (product) {
    const cartItem = {
      id: Date.now().toString(),
      productId,
      userId: "1", // Mock user ID
      quantity,
      size,
      color,
      Shoe: {
        id: product.id,
        name: product.name,
        images: product.image,
        price: product.price
      }
    };
    
    res.status(201).json({
      data: [cartItem]
    });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.get('/api/cart', (req, res) => {
  // Mock cart data
  res.status(201).json({
    data: []
  });
});

// Wishlist routes
app.post('/api/wishlist', (req, res) => {
  const { productId } = req.body;
  
  // Mock wishlist addition
  res.status(201).json({
    message: "Added to wishlist",
    productId
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
  
  // Handle order status updates
  socket.on('updateOrderStatus', (data) => {
    console.log('🔄 Order status update:', data);
    // Broadcast to all clients
    io.emit('orderStatusUpdated', data);
  });
  
  // Handle payment status updates
  socket.on('updatePaymentStatus', (data) => {
    console.log('🔄 Payment status update:', data);
    // Broadcast to all clients
    io.emit('paymentStatusUpdated', data);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io };
