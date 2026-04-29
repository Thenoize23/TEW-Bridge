// ============================================================
//  TEW Bridge Server  —  bridge.js
//  WebSocket and HTTP on same port 3000 for ngrok compatibility
// ============================================================

const dgram   = require('dgram');
const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const { WebSocketServer } = require('ws');

const UDP_PORT  = 8765;
const HTTP_PORT = 3000;

// HTTP Server
const httpServer = http.createServer((req, res) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html', '.js': 'application/javascript',
        '.json': 'application/json', '.css': 'text/css',
        '.png': 'image/png', '.ico': 'image/x-icon',
    };
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(data);
    });
});

// WebSocket on SAME port as HTTP (ngrok compatible)
const wss = new WebSocketServer({ server: httpServer });
let clients = new Set();

wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log(`[WS] Connected. Clients: ${clients.size}`);
    ws.on('close', () => { clients.delete(ws); console.log(`[WS] Disconnected. Clients: ${clients.size}`); });
    ws.on('error', () => clients.delete(ws));
});

function broadcast(data) {
    for (const client of clients) {
        if (client.readyState === 1) client.send(data);
    }
}

// UDP receives from VST plugin
const udp = dgram.createSocket('udp4');
udp.on('message', (msg, rinfo) => {
    const json = msg.toString();
    console.log(`[UDP] ${rinfo.address}: ${json}`);
    broadcast(json);
    udp.send('TEW_ACK', rinfo.port, rinfo.address);
});
udp.bind(UDP_PORT, () => console.log(`[UDP] Listening on port ${UDP_PORT}`));

// Start
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    const nets = require('os').networkInterfaces();
    let ip = 'localhost';
    for (const n of Object.keys(nets))
        for (const net of nets[n])
            if (net.family === 'IPv4' && !net.internal) { ip = net.address; break; }

    console.log('TEW Bridge running');
    console.log(`Open on iPhone: http://${ip}:${HTTP_PORT}`);
    console.log(`WebSocket: ws://${ip}:${HTTP_PORT} (same port)`);
    console.log(`UDP listening on port ${UDP_PORT}`);
});
