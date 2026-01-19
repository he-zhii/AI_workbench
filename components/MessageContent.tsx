import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isUser }) => {
  return (
    <ReactMarkdown
      className={`prose prose-sm max-w-none break-words ${
        isUser 
          ? 'prose-invert text-white prose-p:leading-relaxed prose-pre:bg-blue-800 prose-pre:border-blue-700' 
          : 'prose-slate text-gray-800 prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:border-gray-800'
      }`}
      remarkPlugins={[remarkGfm]}
      components={{
        code({node, inline, className, children, ...props}: any) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : null;

          if (!inline && language) {
            return (
              <div className="not-prose rounded-lg overflow-hidden my-3 border border-gray-700/50 shadow-md">
                <div className="bg-[#1e1e1e] text-gray-400 px-4 py-1.5 text-xs font-mono flex justify-between items-center border-b border-gray-700">
                   <span className="font-semibold uppercase">{language}</span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  customStyle={{ 
                    margin: 0, 
                    borderRadius: 0,
                    padding: '1rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1e1e1e' // Match vscDarkPlus background
                  }}
                  wrapLongLines={true}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          }

          // Inline code or code block without language
          return (
            <code 
              {...props} 
              className={
                inline 
                  ? `${isUser ? 'bg-blue-700 text-white' : 'bg-gray-100 text-red-600'} px-1.5 py-0.5 rounded font-mono text-[0.9em]` 
                  : className
              }
            >
              {children}
            </code>
          );
        },
        // Override standard elements for better chat styling
        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({children}) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-1">{children}</ol>,
        li: ({children}) => <li className="my-0">{children}</li>,
        a: ({href, children}) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`underline underline-offset-2 ${isUser ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
          >
            {children}
          </a>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MessageContent;