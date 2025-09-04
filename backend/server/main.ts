import { HttpLayerRouter } from "@effect/platform";
import { auth } from "@openfaith/auth/auth";
import { ServerLive } from "@openfaith/server";

const port = 4000;

// Create the web handler using the same approach as the frontend
const { handler } = HttpLayerRouter.toWebHandler(ServerLive);

// Use Bun's HTTP server for consistency
const server = Bun.serve({
  port,
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // Add health check endpoint (both /health and /api/health)
      if (
        (url.pathname === "/health" || url.pathname === "/api/health") &&
        request.method === "GET"
      ) {
        return new Response(JSON.stringify({ status: "healthy" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle Better Auth routes
      if (url.pathname.startsWith("/api/auth")) {
        return await auth.handler(request);
      }

      // Handle other requests with Effect handler
      return await handler(request);
    } catch (error) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

console.log(`🚀 Backend server listening on http://localhost:${server.port}`);
