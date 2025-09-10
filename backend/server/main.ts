import { createServer } from "node:http";

// Simple HTTP server for basic functionality
const port = 4000;

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Basic health check
  if (req.url === "/" || req.url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "OpenFaith Backend Server is running!",
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      })
    );
    return;
  }

  // WebSocket upgrade endpoint for sync
  if (req.url?.startsWith("/sync/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        endpoint: req.url,
        message: "WebSocket sync endpoint - Zero integration coming soon",
      })
    );
    return;
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not Found",
      message: "This endpoint is not yet implemented",
      url: req.url,
    })
  );
});

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 OpenFaith Backend Server running on http://0.0.0.0:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔄 Sync endpoint: http://localhost:${port}/sync/v25/connect`);
});
