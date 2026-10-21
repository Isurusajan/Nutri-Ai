const http = require('http');

const TARGET_PORT = 8005;
const LISTEN_PORT = 8000;

const server = http.createServer((clientReq, clientRes) => {
  const clientIp = clientReq.socket.remoteAddress;
  console.log(`[PROXY] Incoming ${clientReq.method} ${clientReq.url} from ${clientIp}`);

  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: clientReq.url,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[PROXY ERROR] Forwarding failed: ${err.message}`);
    clientRes.writeHead(502, { 'Content-Type': 'application/json' });
    clientRes.end(JSON.stringify({ error: 'Backend unreachable', detail: err.message }));
  });

  clientReq.pipe(proxyReq, { end: true });
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[PROXY READY] Node.js bridge active on 0.0.0.0:${LISTEN_PORT} -> 127.0.0.1:${TARGET_PORT}`);
});
