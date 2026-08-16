const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const BASE_DIR = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/') url = '/index.html';
    const filePath = path.join(BASE_DIR, url);
    const ext = path.extname(filePath).toLowerCase();

    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
