const express = require('express');
const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  console.log('Simple Express route hit!');
  res.json({ message: 'Simple Express works!' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple Express running on http://127.0.0.1:${PORT}`);
});
