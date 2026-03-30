const redis = require('../config/redis');

module.exports = (io) => {
  console.log('🔌 Socket.IO logic initialized');

  io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    // Join room for targeting (user specific)
    socket.on('join:room', (userId) => {
      socket.join(userId);
      console.log(`👤 User joined room: ${userId}`);
    });

    // Driver location update
    socket.on('driver:location:update', async (data) => {
      // Data expected: { driverId, coordinates, heading, speed, routeId, seats, timestamp }
      const { driverId, coordinates, heading, speed, routeId, seats, timestamp } = data;

      // Update Redis for ultra-fast reads
      if (redis) {
        await redis.set(`driver_live:${driverId}`, JSON.stringify({
          coordinates,
          heading,
          speed,
          routeId,
          seats,
          timestamp,
          socketId: socket.id
        }), 'EX', 60); // Expire after 60 seconds of inactivity
      }

      // Find nearby passengers (this will be complex logic, simplified for now)
      // Broadcast to a specific room for that route logic
      // io.to(`route:${routeId}`).emit('drivers:update', data);
      
      // Emit to all for simplicity in demo
      socket.broadcast.emit('drivers:update', data);
    });

    socket.on('disconnect', () => {
      console.log(`💨 Client disconnected: ${socket.id}`);
    });
  });
};
