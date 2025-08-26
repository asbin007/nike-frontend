# Nike Backend Server

This is the backend server for the Nike Frontend application.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the backend folder with:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   MONGODB_URI=mongodb://localhost:27017/nike-store
   ```

3. **Start the Server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the Server**
   - Health check: http://localhost:5000/api/health
   - The server will run on port 5000

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/auth/login` - User login
- `POST /api/auth/logins` - Admin login
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart items
- `POST /api/wishlist` - Add item to wishlist

## Socket.IO Events

- `updateOrderStatus` - Update order status
- `updatePaymentStatus` - Update payment status

## Mock Data

The server includes mock data for testing:
- Test user: test@example.com / password
- Admin: admin@example.com / admin / admin
