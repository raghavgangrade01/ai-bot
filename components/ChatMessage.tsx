
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage as ChatMessageType, Role, TextPart, ImagePart } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import PencilIcon from './icons/PencilIcon';

interface ChatMessageProps {
  message: ChatMessageType;
  isEditing: boolean;
  onStartEdit: (messageId: string) => void;
  onSaveEdit: (messageId: string, newText: string) => void;
  onCancelEdit: () => void;
}

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return !inline && match ? (
    <div className="relative my-2 rounded-lg bg-[#1e1e1e] font-mono shadow-lg">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-t-lg border-b border-slate-300/30 dark:border-slate-600/30">
        <span className="text-xs text-slate-500 dark:text-slate-400 lowercase">{match[1]}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? <CheckIcon /> : <ClipboardIcon />}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
        codeTagProps={{ style: { fontFamily: 'inherit' } }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-slate-200/50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
      {children}
    </code>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isEditing, onStartEdit, onSaveEdit, onCancelEdit }) => {
  const isUser = message.role === Role.USER;
  const textContent = message.parts.filter(part => 'text' in part).map(part => (part as TextPart).text).join('\n');
  const imageParts = message.parts.filter(part => 'inlineData' in part) as ImagePart[];
  
  const [editedText, setEditedText] = useState(textContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (editedText.trim()) {
      onSaveEdit(message.id, editedText.trim());
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className={`group flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <BotIcon />
        </div>
      )}
      <div
        className={`relative max-w-xl transition-colors duration-300 ${
          isUser
            ? ''
            : 'p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
        }`}
      >
        {isUser && !isEditing && (
            <button
                onClick={() => onStartEdit(message.id)}
                className="absolute -left-8 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Edit message"
            >
                <PencilIcon />
            </button>
        )}
        {isEditing ? (
            <div className="w-full">
                <div className="p-4 rounded-2xl bg-sky-600">
                    {imageParts.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                        {imageParts.map((part, index) => (
                            <img
                            key={index}
                            src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                            alt="User upload"
                            className="max-w-xs h-auto rounded-lg"
                            />
                        ))}
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        value={editedText}
                        onChange={handleTextChange}
                        className="w-full bg-transparent text-white placeholder-sky-200 resize-none focus:outline-none text-base"
                        rows={1}
                    />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                    <button onClick={onCancelEdit} className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-500">Save & Submit</button>
                </div>
            </div>
        ) : (
          <div className={`${isUser ? 'p-4 rounded-2xl bg-sky-600 text-white rounded-br-none' : ''}`}>
            {imageParts.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {imageParts.map((part, index) => (
                  <img
                    key={index}
                    src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                    alt="User upload"
                    className="max-w-full h-auto rounded-lg"
                  />
                ))}
              </div>
            )}
            {textContent && (
                <ReactMarkdown
                components={{
                    code: CodeBlock,
                    p: ({ node, ...props }) => <p className="text-base mb-2 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1" {...props} />,
                }}
                >
                {textContent}
                </ReactMarkdown>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
