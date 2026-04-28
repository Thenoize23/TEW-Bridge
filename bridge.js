const dgram = require('dgram');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { WebSocketServer } = require('ws');

const UDP_PORT  = 8765;
const WS_PORT   = 8766;
const HTTP_PORT = 3000;

const wss = new WebSocketServer({ port: WS_PORT });
let clients = new Set();
wss.on('connection', ws => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});
function broadcast(data) {
  for (const c of clients) if (c.readyState === 1) c.send(data);
}

const udp = dgram.createSocket('udp4');
udp.on('message', (msg, rinfo) => {
  broadcast(msg.toString());
  udp.send('TEW_ACK', rinfo.port, rinfo.address);
});
udp.bind(UDP_PORT);

const server = http.createServer((req, res) => {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const fp   = path.join(__dirname, file);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const mime = fp.endsWith('.html') ? 'text/html' : 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(HTTP_PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let ip = 'localhost';
  for (const n of Object.values(nets)) {
    for (const a of n) {
      if (a.family === 'IPv4' && !a.internal) { ip = a.address; break; }
    }
  }
  console.log('\nTEW Bridge running');
  console.log('Open on iPhone: http://' + ip + ':' + HTTP_PORT);
  console.log('WebSocket: ws://' + ip + ':' + WS_PORT);
  console.log('UDP listening on port ' + UDP_PORT);
});
