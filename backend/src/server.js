require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST','PUT']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Static Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Socket.IO Logic
require('./sockets')(io);

// Routes
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/drivers', require('./modules/drivers/routes'));
app.use('/api/passengers', require('./modules/passengers/routes'));
app.use('/api/routes', require('./modules/routes/routes'));
app.use('/api/admin', require('./modules/admin/routes'));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 RouteSync Server running on port ${PORT}`);
});
