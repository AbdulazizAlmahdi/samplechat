const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// تمكين CORS في Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // السماح لجميع المصادر (يمكنك تحديد مصدر معين مثل 'http://127.0.0.1:5500')
    methods: ['GET', 'POST'], // السماح بطرق HTTP المحددة
  },
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('connection ', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', socket.id+" "+ msg);
    console.log('message: ' +socket.id+" "+ msg);
  });

  socket.on('disconnect', () => {
    console.log('disconnect ', socket.id);
  });
});

server.listen(3000, () => {
  console.log('الخادم يعمل على http://localhost:3000');
});