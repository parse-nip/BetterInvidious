#!/usr/bin/env node
/**
 * Minimal HTTP CONNECT proxy - no external deps, no binaries.
 * Use with Cloudflare Tunnel: cloudflared tunnel --url http://localhost:3128
 */
const net = require("net");
const PORT = 3128;

const server = net.createServer((clientSocket) => {
  let buffer = Buffer.alloc(0);
  clientSocket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    const idx = buffer.indexOf("\r\n\r\n");
    if (idx !== -1) {
      clientSocket.removeAllListeners("data");
      const headerEnd = idx + 4;
      const headers = buffer.slice(0, headerEnd).toString();
      const rest = buffer.slice(headerEnd);
      const firstLine = headers.split("\r\n")[0];
      const match = firstLine.match(/^CONNECT\s+([^\s:]+):(\d+)\s+/i);
      if (match) {
        const [_, host, port] = match;
        const target = net.connect(parseInt(port, 10), host, () => {
          clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
          if (rest.length) target.write(rest);
          clientSocket.pipe(target);
          target.pipe(clientSocket);
        });
        target.on("error", () => clientSocket.end());
      } else {
        clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
      }
    }
  });
  clientSocket.on("error", () => {});
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Proxy listening on localhost:${PORT}`);
});
