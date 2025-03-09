const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
app.use(cors()); // تمكين CORS في Express
// تهيئة multer لتحميل الملفات
const upload = multer({ dest: 'uploads/' }); // يتم حفظ الملفات في مجلد uploads

// تمكين CORS في Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // السماح لجميع المصادر
    methods: ['GET', 'POST'],
  },
});

// تقديم ملفات العميل
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// تقديم الملفات المحملة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

  // استقبال رسالة نصية من العميل
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

  // استقبال ملف من العميل
  socket.on('chat file', (fileData) => {
    if (!socket.senderName) {
      socket.emit('error', 'من فضلك أدخل اسمك أولاً.');
      return;
    }

    console.log(`ملف من ${socket.senderName}: ${fileData.filename}`);
    io.emit('chat file', { sender: socket.senderName, file: fileData });
  });

  socket.on('disconnect', () => {
    console.log('عميل انقطع:', socket.id);
  });
});

// تحميل الملفات
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('لم يتم تحميل أي ملف.');
  }
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

server.listen(3000, () => {
  console.log('الخادم يعمل على http://localhost:3000');
});