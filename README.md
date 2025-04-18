# HTTP Streaming Demo with Next.js

This is a [Next.js](https://nextjs.org) project demonstrating real-time HTTP streaming using Web Streams API. The application showcases a retro-style chat interface that streams random words from the server to the client.

## Key Features

- Real-time text streaming using Web Streams API
- Server-side streaming with Node.js runtime
- Client-side stream consumption with ReadableStream
- Auto-scrolling chat interface
- Retro-style UI with Tailwind CSS

## Technical Implementation

### Server-Side Streaming (`app/api/stream/route.ts`)
- Uses Node.js runtime (not Edge runtime)
- Implements `ReadableStream` for chunk-by-chunk data transmission
- Proper HTTP headers for streaming:
  - `Content-Type: text/plain; charset=utf-8`
  - `Cache-Control: no-cache, no-transform`
  - `Connection: keep-alive`
  - `Transfer-Encoding: chunked`

### Client-Side Implementation (`app/page.tsx`)
- Stream consumption using `ReadableStream` and `TextDecoder`
- Real-time UI updates with React state
- Auto-scrolling textarea using `useRef` and `useEffect`
- Error handling for invalid inputs and server errors

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Important Notes

1. Server Configuration:
   - The streaming API route MUST use the Node.js runtime
   - Add `export const runtime = "nodejs"` in your API route

2. Stream Processing:
   - Server sends data in chunks with 500ms intervals
   - Client processes chunks using TextDecoder
   - Special "[DONE]" marker indicates stream completion

3. Browser Compatibility:
   - Requires browsers with Web Streams API support
   - Modern browsers (Chrome, Firefox, Safari, Edge) are supported

## Learn More

To learn more about the technologies used:

- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
