import React, { useState, useRef, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  Send, 
  Loader2, 
  Sparkles, 
  LayoutTemplate, 
  Maximize2, 
  Columns, 
  ChevronRight,
  Terminal
} from 'lucide-react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { generateAppCode } from './services/geminiService';
import { GeneratedCode, Message, ViewMode } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: prompt, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    setPrompt('');

    try {
      const result = await generateAppCode(
        userMsg.content, 
        history, 
        generated?.code || null
      );

      setGenerated(result);
      setHistory(prev => [...prev, { 
        role: 'model', 
        content: result.explanation, 
        timestamp: Date.now() 
      }]);
      
      // Auto-switch view based on language
      if (result.language !== 'html') {
          setViewMode(ViewMode.EDITOR);
      } else if (viewMode === ViewMode.EDITOR) {
          setViewMode(ViewMode.SPLIT);
      }

    } catch (err) {
      setError("Failed to generate code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 flex items-center px-6 justify-between bg-neutral-900/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Mourish AI Builder
          </h1>
        </div>

        <div className="flex items-center bg-neutral-800 rounded-lg p-1 gap-1">
          <button
            onClick={() => setViewMode(ViewMode.EDITOR)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.EDITOR ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Code Only"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.SPLIT ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Split View"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Preview Only"
          >
            <LayoutTemplate className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Chat & History */}
        <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/30">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && (
              <div className="text-center mt-20 text-neutral-500">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Start by describing an app you want to build.</p>
                <p className="text-xs mt-2 opacity-60">"Create a retro snake game"</p>
                <p className="text-xs opacity-60">"Make a dashboard for crypto prices"</p>
              </div>
            )}
            
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-none' 
                    : 'bg-neutral-800/50 text-neutral-300 border border-neutral-700 rounded-tl-none'
                }`}>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
               <div className="flex justify-start">
                <div className="bg-neutral-800/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 border border-neutral-700">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-xs text-gray-400">Generating code...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-900">
            {error && (
              <div className="mb-2 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
                {error}
              </div>
            )}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your app..."
                className="w-full bg-neutral-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none border border-neutral-700 placeholder-neutral-500"
                rows={3}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || !prompt.trim()}
                className="absolute bottom-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Preview */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] relative overflow-hidden">
          {!generated ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500">
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 rotate-12 shadow-2xl shadow-black">
                    <Code2 className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-xl font-medium text-neutral-300">Ready to Build</h2>
                <p className="text-sm mt-2 opacity-60 max-w-xs text-center">Generated code and live previews will appear here.</p>
             </div>
          ) : (
            <div className="flex-1 flex w-full h-full">
              {/* Editor Pane */}
              <div className={`
                transition-all duration-300 ease-in-out h-full border-r border-neutral-800
                ${viewMode === ViewMode.EDITOR ? 'w-full' : viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-0 hidden'}
              `}>
                <Editor code={generated.code} language={generated.language} />
              </div>

              {/* Preview Pane */}
              <div className={`
                 transition-all duration-300 ease-in-out h-full bg-white
                 ${viewMode === ViewMode.PREVIEW ? 'w-full' : viewMode === ViewMode.SPLIT ? 'w-1/2' : 'w-0 hidden'}
              `}>
                <Preview code={generated.code} language={generated.language} />
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;