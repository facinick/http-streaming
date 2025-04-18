"use client";

import { useState, useRef, useEffect } from "react";

type TraceEvent = {
  timestamp: number;
  type: 'request' | 'response' | 'chunk' | 'complete' | 'error';
  message: string;
};

export default function Home() {
  const [numWords, setNumWords] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const traceRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effects
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [streamedText]);

  useEffect(() => {
    if (traceRef.current) {
      traceRef.current.scrollTop = traceRef.current.scrollHeight;
    }
  }, [traceEvents]);

  const addTraceEvent = (type: TraceEvent['type'], message: string) => {
    setTraceEvents(prev => [...prev, {
      timestamp: Date.now(),
      type,
      message
    }]);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center font-mono p-8">
      {/* Main Chat Panel - Fixed size */}
      <div className="bg-black border-2 border-green-400 p-8 w-96 mr-4 h-[600px] flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-center">HTTP STREAMING</h1>

        <div className="mb-4 flex-shrink-0">
          <label
            htmlFor="numWords"
            className="block text-green-400 text-sm font-bold mb-2"
          >
            Number of Words:
          </label>
          <input
            type="number"
            id="numWords"
            value={numWords}
            onChange={(e) => setNumWords(e.target.value)}
            className="bg-black border-2 border-green-400 rounded w-full py-2 px-3 text-green-400 focus:outline-none"
            disabled={isStreaming}
          />
        </div>

        <div className="flex justify-center mb-4 flex-shrink-0">
          <button
            className="bg-green-400 text-black font-bold py-2 px-4 rounded focus:outline-none disabled:opacity-50 border-2 border-green-400"
            onClick={async () => {
              if (isStreaming) return;
              
              // Reset states
              setIsStreaming(true);
              setStreamedText("");
              setTraceEvents([]);

              // Validate input
              const count = parseInt(numWords, 10);
              if (isNaN(count) || count <= 0) {
                setStreamedText("Please enter a valid positive number.");
                setIsStreaming(false);
                addTraceEvent('error', 'Invalid input: number must be positive');
                return;
              }

              // Log request
              addTraceEvent('request', `GET /api/stream?count=${count}`);

              // Make request
              const response = await fetch(`/api/stream?count=${count}`);

              if (!response.ok) {
                setStreamedText(`Server error: ${response.status}`);
                setIsStreaming(false);
                addTraceEvent('error', `Server responded with ${response.status}`);
                return;
              }

              // Log response
              addTraceEvent('response', `200 OK - Stream started`);

              const reader = response.body?.getReader();
              const decoder = new TextDecoder();

              // Process stream
              while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                
                const text = decoder.decode(value);
                if (text.includes("[DONE]")) {
                  addTraceEvent('complete', 'Stream completed');
                  break;
                }
                
                setStreamedText((prev) => prev + text);
                addTraceEvent('chunk', `Received: "${text.trim()}"`);
              }

              setIsStreaming(false);
              setStreamedText((prev) => prev + "\nStream finished.");
            }}
            disabled={isStreaming}
          >
            {isStreaming ? "Streaming..." : "Start Stream"}
          </button>
        </div>

        <div className="flex-grow relative border-2 border-green-400 rounded">
          <textarea
            ref={textAreaRef}
            id="streamedText"
            value={streamedText}
            readOnly
            className="absolute inset-0 bg-black py-2 px-3 text-green-400 font-mono resize-none overflow-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-black"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4ade80 #000000'
            }}
          />
        </div>
      </div>

      {/* Trace Panel - Matches chat height with scroll */}
      <div className="bg-black border-2 border-green-400 p-8 w-96 h-[600px] flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center flex-shrink-0">REQUEST TRACE</h2>
        <div 
          ref={traceRef}
          className="flex-grow overflow-auto pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4ade80 #000000'
          }}
        >
          <div className="space-y-2">
            {traceEvents.map((event, index) => (
              <div 
                key={index} 
                className={`text-sm ${
                  event.type === 'error' ? 'text-red-400' :
                  event.type === 'request' ? 'text-blue-400' :
                  event.type === 'response' ? 'text-yellow-400' :
                  event.type === 'complete' ? 'text-purple-400' :
                  'text-green-400'
                }`}
              >
                <span className="opacity-50">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  })}
                </span>
                {' '}
                <span className="font-bold">[{event.type.toUpperCase()}]</span>
                {' '}
                {event.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
