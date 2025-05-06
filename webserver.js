
const express = require('express');
const httpMonitor = require('./features/httpMonitor');

const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/status', (req, res) => {
  const monitors = httpMonitor.getAllMonitors();
  res.status(200).send(`
    <h1>Bot Monitor Status</h1>
    <p>Server is running!</p>
    <div>${monitors.map(m => `
      <div>
        <h3>${m.url}</h3>
        <p>Status: ${m.status}</p>
        <p>Last Check: ${m.lastCheck}</p>
      </div>
    `).join('')}</div>
  `);
});

// 添加自动监控
const monitorUrl = 'https://c51b29e5-696b-4c87-8ee1-6fdec153e37c-00-trq5x1zqk3uk.riker.replit.dev/';
httpMonitor.addMonitor(monitorUrl);

app.listen(port, '0.0.0.0', () => {
  console.log(`Monitor web interface running at http://0.0.0.0:${port}`);
  console.log(`Monitoring URL: ${monitorUrl}`);
});
