import React, { useEffect, useRef } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface PreviewProps {
  code: string;
  language: string;
}

const Preview: React.FC<PreviewProps> = ({ code, language }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateIframe = () => {
    if (iframeRef.current && language === 'html') {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  };

  useEffect(() => {
    updateIframe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language]);

  if (language !== 'html') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-gray-400 p-8 text-center">
        <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-200">Preview Not Available</h3>
        <p className="max-w-md">
          Live preview is currently optimized for HTML/CSS/JS web applications. 
          The generated <strong>{language}</strong> code can be viewed in the editor tab.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
        <div className="absolute top-2 right-2 z-10">
            <button 
                onClick={updateIframe}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition-colors"
                title="Refresh Preview"
            >
                <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
        </div>
      <iframe
        ref={iframeRef}
        title="App Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  );
};

export default Preview;