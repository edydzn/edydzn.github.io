import { serveDir, serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");
const DIST_DIR = "./dist";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // API routes (if needed in the future)
  if (pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle static assets (JS, CSS, images, etc.)
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return serveDir(req, {
      fsRoot: DIST_DIR,
      urlRoot: "",
      showDirListing: false,
      showHidden: false,
    });
  }

  // For all other routes, serve index.html (SPA fallback)
  try {
    const indexPath = `${Deno.cwd()}/${DIST_DIR}/index.html`;
    const indexFile = await Deno.readFile(indexPath);
    return new Response(indexFile, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  } catch (e) {
    console.error("Error serving index.html:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log(`Server running at http://localhost:${PORT}`);
console.log(`Serving files from: ${DIST_DIR}`);

await Deno.serve({ port: PORT }, handler);
