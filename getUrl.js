
const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send(`您的URL是: ${req.protocol}://${req.headers.host}`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`请访问以下地址来查看您的URL:`);
  console.log(`https://bot.horizon20250504.repl.co`);
});
