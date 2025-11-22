import React from 'react';

interface EditorProps {
  code: string;
  language: string;
  readOnly?: boolean;
}

const Editor: React.FC<EditorProps> = ({ code, language }) => {
  return (
    <div className="w-full h-full bg-[#1e1e1e] text-sm overflow-hidden flex flex-col">
      <div className="bg-[#2d2d2d] px-4 py-2 text-gray-400 text-xs flex justify-between items-center border-b border-[#3e3e3e]">
        <span className="uppercase font-semibold tracking-wider">{language}</span>
        <span>ReadOnly View</span>
      </div>
      <textarea
        className="flex-1 w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm resize-none outline-none border-none"
        value={code}
        readOnly
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;