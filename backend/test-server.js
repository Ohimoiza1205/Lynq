const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Basic server works!');
});

server.listen(3002, '127.0.0.1', () => {
  console.log('Basic server running on http://127.0.0.1:3002');
});
