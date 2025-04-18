"use client";

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';

type TraceEvent = {
  timestamp: number;
  type: 'request' | 'response' | 'chunk' | 'complete' | 'error';
  message: string;
};

type WindowState = {
  isMaximized: boolean;
  originalWidth: string;
  originalHeight: string;
};

export default function Home() {
  const [numWords, setNumWords] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const traceRef = useRef<HTMLDivElement>(null);

  const [chatWindowState, setChatWindowState] = useState<WindowState>({
    isMaximized: false,
    originalWidth: 'w-[400px]',
    originalHeight: 'h-[600px]',
  });

  const [traceWindowState, setTraceWindowState] = useState<WindowState>({
    isMaximized: false,
    originalWidth: 'w-[400px]',
    originalHeight: 'h-[600px]',
  });

  const getWindowClasses = (state: WindowState) => {
    if (state.isMaximized) {
      return 'fixed top-0 left-0 right-0 bottom-0 m-0 w-screen h-screen';
    }
    return `${state.originalWidth} ${state.originalHeight}`;
  };

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

  const handleStream = async () => {
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

    try {
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

      while (true) {
        const { done, value } = await reader!.read();
        
        if (done) {
          addTraceEvent('complete', 'Stream completed');
          break;
        }

        const chunk = decoder.decode(value);
        addTraceEvent('chunk', `Received ${chunk.length} bytes`);
        setStreamedText(prev => prev + chunk);
      }
    } catch (error) {
      addTraceEvent('error', `Stream error: ${error}`);
      setStreamedText(prev => prev + '\nError: Stream interrupted');
    } finally {
      setIsStreaming(false);
    }
  };

  const WindowControls = ({ onMinimize, onMaximize, onClose }: {
    onMinimize: () => void;
    onMaximize: () => void;
    onClose: () => void;
  }) => (
    <div className="flex gap-1">
      <button 
        onClick={onMinimize}
        className="w-5 h-5 bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border flex items-center justify-center hover:bg-gray-300 active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
        aria-label="Minimize"
      >
        _
      </button>
      <button 
        onClick={onMaximize}
        className="w-5 h-5 bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border flex items-center justify-center hover:bg-gray-300 active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
        aria-label="Maximize"
      >
        □
      </button>
      <button 
        onClick={onClose}
        className="w-5 h-5 bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border flex items-center justify-center hover:bg-gray-300 active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#008080] p-8">
      <div className="flex items-start justify-center gap-4">
        {/* Chat Window */}
        <section 
          className={`bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border-2 flex flex-col ${getWindowClasses(chatWindowState)}`}
        >
          {/* Title Bar */}
          <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-1">
              <Image src="/window.svg" alt="Window icon" width={16} height={16} className="mr-1" />
              <span className="font-bold text-sm">Chat Stream</span>
            </div>
            <WindowControls 
              onMinimize={() => {/* Add minimize handler */}}
              onMaximize={() => setChatWindowState(prev => ({...prev, isMaximized: !prev.isMaximized}))}
              onClose={() => {/* Add close handler */}}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col gap-4">
            <div>
              <label htmlFor="numWords" className="block mb-2 text-sm text-black font-medium">Number of Words:</label>
              <input
                type="number"
                id="numWords"
                value={numWords}
                onChange={(e) => setNumWords(e.target.value)}
                className="w-full px-2 py-1 bg-white text-black border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] border text-sm"
                min="1"
                disabled={isStreaming}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStream}
                disabled={isStreaming}
                className="px-4 py-1 bg-[#c0c0c0] text-black border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border text-sm hover:bg-gray-300 active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff]"
              >
                Stream Text
              </button>
            </div>

            <textarea
              ref={textAreaRef}
              value={streamedText}
              readOnly
              className="flex-1 w-full px-2 py-1 bg-white text-black border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] border resize-none text-sm font-mono"
            />
          </div>
        </section>

        {/* Trace Window */}
        <section 
          className={`bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border-2 flex flex-col ${getWindowClasses(traceWindowState)}`}
        >
          {/* Title Bar */}
          <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-1">
              <Image src="/file.svg" alt="File icon" width={16} height={16} className="mr-1" />
              <span className="font-bold text-sm">Request Trace</span>
            </div>
            <WindowControls 
              onMinimize={() => {/* Add minimize handler */}}
              onMaximize={() => setTraceWindowState(prev => ({...prev, isMaximized: !prev.isMaximized}))}
              onClose={() => {/* Add close handler */}}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div 
              ref={traceRef}
              className="flex-1 w-full h-full overflow-y-auto bg-white border-t-[#808080] border-l-[#808080] border-r-[#ffffff] border-b-[#ffffff] border p-2"
            >
              {traceEvents.map((event, index) => (
                <div key={index} className="mb-2 text-sm trace-event whitespace-pre font-mono">
                  <span className="text-black">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour12: true,
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit"
                    })} PM - </span>
                  <span className={`${
                    event.type === 'error' ? 'text-red-600' :
                    event.type === 'complete' ? 'text-green-600' :
                    'text-black'
                  }`}>
                    {event.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
