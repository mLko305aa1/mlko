import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import stopword from 'stopword';
import ArabicStemmer from 'arabic-stemmer';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// قاعدة البيانات
let database = {};
try {
  database = JSON.parse(fs.readFileSync('database.json'));
} catch (err) {
  console.log('جارٍ إنشاء قاعدة بيانات جديدة');
}

// معالجة النص العربي
function processText(text) {
  // إزالة علامات الترقيم
  text = text.replace(/[.,!؟]/g, '');
  
  // تقسيم الكلمات
  let words = text.split(' ').filter(word => word.trim() !== '');
  
  // إزالة الكلمات الشائعة
  words = stopword.removeStopwords(words, stopword.ar);
  
  // استخراج الجذور
  const stemmer = new ArabicStemmer();
  words = words.map(word => stemmer.stemWord(word));
  
  return words.sort();
}

// البحث عن الرد
function findReply(inputWords) {
  for (const [key, value] of Object.entries(database)) {
    const keyWords = key.split(',');
    if (inputWords.every(word => keyWords.includes(word))) {
      return value;
    }
  }
  return null;
}

// نقطة النهاية للدردشة
app.post('/chat', (req, res) => {
  const userMessage = req.body.message;
  const processedWords = processText(userMessage);
  const reply = findReply(processedWords) || "لا أعرف الإجابة. ماذا أردت أن أقول؟";
  
  if (!findReply(processedWords)) {
    database[processedWords.join(',')] = userMessage;
    fs.writeFileSync('database.json', JSON.stringify(database));
  }
  
  res.json({ reply });
});

app.listen(3000, () => console.log('الخادم يعمل على port 3000'));