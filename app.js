const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// تمكين CORS في Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // السماح لجميع المصادر
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('عميل متصل:', socket.id);

  // طلب اسم المُرسل عند الاتصال
  socket.emit('request sender name');

  // استقبال اسم المُرسل من العميل
  socket.on('send sender name', (senderName) => {
    if (!senderName) {
      socket.emit('error', 'الاسم مطلوب!');
      return;
    }
    console.log(`اسم المُرسل: ${senderName}`);
    socket.senderName = senderName; // تخزين اسم المُرسل في خاصية socket
    socket.emit('name accepted', `مرحبًا ${senderName}!`);
  });

  // استقبال رسالة من العميل
  socket.on('chat message', (message) => {
    if (!socket.senderName) {
      socket.emit('error', 'من فضلك أدخل اسمك أولاً.');
      return;
    }
    if (!message) {
      socket.emit('error', 'الرسالة لا يمكن أن تكون فارغة.');
      return;
    }

    console.log(`رسالة من ${socket.senderName}: ${message}`);
    io.emit('chat message', { sender: socket.senderName, message });
  });

  socket.on('disconnect', () => {
    console.log('عميل انقطع:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('الخادم يعمل على http://localhost:3000');
});