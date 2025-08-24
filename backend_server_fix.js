// Backend Server Fix for Real-time Updates
// Add this to your backend server file

// Handle order status updates from admin panel
socket.on("updateOrderStatus", async (data) => {
  const { status, orderId, userId } = data;
  
  try {
    console.log(`🔄 Admin updating order status: ${orderId} -> ${status}`);
    
    // Update order in database
    const order = await Order.findByPk(orderId);
    if (!order) {
      socket.emit("error", "Order not found");
      return;
    }
    
    await Order.update(
      { orderStatus: status },
      { where: { id: orderId } }
    );
    
    console.log(`✅ Order status updated in database: ${orderId} -> ${status}`);
    
    // Find the user who owns this order
    const orderOwner = activeUser.find((user) => user.userId == order.userId);
    
    // Emit to order owner if online
    if (orderOwner) {
      io.to(orderOwner.socketId).emit("orderStatusUpdated", {
        status,
        orderId,
        userId: order.userId
      });
      console.log(`✅ Order status update sent to user: ${order.userId}`);
    } else {
      console.log(`⚠️ User ${order.userId} not online, but order updated successfully`);
    }
    
    // Emit to admin who made the change
    socket.emit("statusUpdated", {
      status,
      orderId,
      userId: order.userId
    });
    
    console.log(`✅ Order status update completed: ${orderId} -> ${status}`);
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    socket.emit("error", "Failed to update order status");
  }
});

// Handle payment status updates from admin panel
socket.on("updatePaymentStatus", async (data) => {
  const { status, paymentId, userId } = data;
  
  try {
    console.log(`🔄 Admin updating payment status: ${paymentId} -> ${status}`);
    
    // Update payment in database
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      socket.emit("error", "Payment not found");
      return;
    }
    
    await Payment.update(
      { paymentStatus: status },
      { where: { id: paymentId } }
    );
    
    console.log(`✅ Payment status updated in database: ${paymentId} -> ${status}`);
    
    // Find the order to get user ID
    const order = await Order.findOne({
      where: { paymentId: paymentId }
    });
    
    if (order) {
      // Find user's socket connection
      const orderOwner = activeUser.find((user) => user.userId == order.userId);
      
      // Emit to order owner if online
      if (orderOwner) {
        io.to(orderOwner.socketId).emit("paymentStatusUpdated", {
          status,
          orderId: order.id,
          paymentId
        });
        console.log(`✅ Payment status update sent to user: ${order.userId}`);
      } else {
        console.log(`⚠️ User ${order.userId} not online, but payment updated successfully`);
      }
      
      // Emit to admin who made the change
      socket.emit("paymentStatusUpdated", {
        status,
        orderId: order.id,
        paymentId
      });
      
      console.log(`✅ Payment status update completed: ${paymentId} -> ${status}`);
    } else {
      console.log(`❌ Order not found for payment: ${paymentId}`);
      socket.emit("error", "Order not found for payment");
    }
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    socket.emit("error", "Failed to update payment status");
  }
});

// Broadcast order updates to all connected clients
socket.on("broadcastOrderUpdate", async (data) => {
  const { orderId, status } = data;
  
  try {
    console.log(`📡 Broadcasting order update: ${orderId} -> ${status}`);
    
    // Broadcast to all connected clients
    io.emit("orderStatusUpdated", {
      status,
      orderId,
      userId: "broadcast"
    });
    
    console.log(`✅ Order update broadcasted to all clients`);
  } catch (error) {
    console.error("❌ Error broadcasting order update:", error);
  }
});

// Broadcast payment updates to all connected clients
socket.on("broadcastPaymentUpdate", async (data) => {
  const { orderId, paymentId, status } = data;
  
  try {
    console.log(`📡 Broadcasting payment update: ${paymentId} -> ${status}`);
    
    // Broadcast to all connected clients
    io.emit("paymentStatusUpdated", {
      status,
      orderId,
      paymentId
    });
    
    console.log(`✅ Payment update broadcasted to all clients`);
  } catch (error) {
    console.error("❌ Error broadcasting payment update:", error);
  }
}); 