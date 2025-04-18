// You MUST make sure this file is using the Node.js runtime
export const runtime = "nodejs"; // 👈 prevents it from running on the Edge
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = parseInt(searchParams.get("count") || "12", 10);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < count; i++) {
        const word = generateRandomWord() + "\n";
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 500));
      }
      controller.enqueue(encoder.encode("[DONE]\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive", // force stream-like connection
      "Transfer-Encoding": "chunked", // hint to proxies that this is streaming
    },
  });
}
function generateRandomWord() {
  const length = Math.floor(Math.random() * 8) + 3;
  let word = '';
  for (let i = 0; i < length; i++) {
    word += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return word;
}