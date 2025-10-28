const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Allow CORS from frontend (http://localhost:3000)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
});

const PORT = process.env.PORT || 5000;

let onlineUsers = 0;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  onlineUsers++;
  io.emit('user_count', onlineUsers);

  // When a client sends a chat message
  socket.on('send_message', (msg) => {
    // msg expected: { name, text, time }
    // broadcast to all clients (including sender)
    io.emit('receive_message', { ...msg, id: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit('user_count', onlineUsers);
  });
});

// optional health route
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Socket.io server running' });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
