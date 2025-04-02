const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

// إعدادات الوسيط (middleware)
app.use(bodyParser.json());
app.use(express.static('public')); // عرض ملفات الواجهة من مجلد public

// مسار ملف JSON لتخزين الرسائل
const messagesFilePath = path.join(__dirname, 'messages.json');

// التأكد من وجود ملف messages.json، وإن لم يكن موجودًا نقوم بإنشائه
if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([]));
}

// نقطة النهاية لجلب جميع الرسائل
app.get('/messages', (req, res) => {
  fs.readFile(messagesFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('حدث خطأ أثناء قراءة الرسائل');
    const messages = JSON.parse(data);
    res.json(messages);
  });
});

// نقطة النهاية لإضافة رسالة جديدة
app.post('/messages', (req, res) => {
  const newMessage = {
    name: req.body.name,
    message: req.body.message,
    timestamp: Date.now()
  };

  fs.readFile(messagesFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('حدث خطأ أثناء قراءة الرسائل');
    const messages = JSON.parse(data);
    messages.push(newMessage);
    fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
      if (err) return res.status(500).send('حدث خطأ أثناء حفظ الرسالة');
      res.status(200).json(newMessage);
    });
  });
});

// عداد المستخدمين الحاليين باستخدام Socket.IO
let onlineUsers = 0;

io.on('connection', socket => {
  onlineUsers++;
  // إرسال التحديث لجميع العملاء
  io.emit('updateUsers', onlineUsers);

  // عند قطع الاتصال (مغادرة الصفحة)
  socket.on('disconnect', () => {
    onlineUsers = Math.max(onlineUsers - 1, 0);
    io.emit('updateUsers', onlineUsers);
  });
});

http.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ http://localhost:${PORT}`);
});
