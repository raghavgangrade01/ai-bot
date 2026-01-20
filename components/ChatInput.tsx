
import React, { useState, KeyboardEvent, useRef, DragEvent, ClipboardEvent } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ChatInputProps {
  onSendMessage: (text: string, image?: File | null) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if ((text.trim() || imageFile) && !disabled) {
      onSendMessage(text, imageFile);
      setText('');
      removeImage();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if(file) {
          handleImageChange(file);
          e.preventDefault();
        }
        break;
      }
    }
  };

  return (
    <div>
      {imagePreview && (
        <div className="relative inline-block mb-2">
            <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded-lg" />
            <button onClick={removeImage} className="absolute top-0 right-0 -mt-2 -mr-2 bg-white dark:bg-slate-800 rounded-full text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Remove image">
                <XCircleIcon />
            </button>
        </div>
      )}
      <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-sky-500 transition-shadow">
        <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            aria-label="Attach file"
        >
            <PaperclipIcon />
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
        />
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type your message or paste an image..."
            rows={1}
            className="w-full bg-transparent resize-none focus:outline-none p-2 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
            disabled={disabled}
            style={{ minHeight: '40px', alignSelf: 'center' }}
        />
        <button
            onClick={handleSubmit}
            disabled={disabled || (!text.trim() && !imageFile)}
            className="flex-shrink-0 w-10 h-10 self-end rounded-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Send message"
        >
            <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;