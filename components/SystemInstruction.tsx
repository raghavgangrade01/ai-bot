
import React, { useState, useEffect, useRef } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SystemInstructionProps {
  instruction?: string;
  onSetInstruction: (instruction: string) => void;
  disabled: boolean;
}

const SystemInstruction: React.FC<SystemInstructionProps> = ({ instruction, onSetInstruction, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(instruction || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentInstruction(instruction || '');
  }, [instruction]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isOpen, currentInstruction]);

  const handleSave = () => {
    onSetInstruction(currentInstruction);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setCurrentInstruction(instruction || '');
    setIsOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInstruction(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (disabled && !instruction) {
    return null;
  }

  return (
    <div className="mb-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {instruction && <SparklesIcon />}
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">System Instructions</span>
          {instruction && !isOpen && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
              : "{instruction}"
            </span>
          )}
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Add instructions to customize the AI's behavior for this conversation.
          </p>
          <textarea
            ref={textareaRef}
            value={currentInstruction}
            onChange={handleTextChange}
            placeholder="e.g., You are a helpful assistant that replies in the style of a pirate."
            rows={2}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none placeholder-slate-400 dark:placeholder-slate-500"
            disabled={disabled}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button 
              onClick={handleCancel} 
              disabled={disabled}
              className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={disabled}
              className="px-3 py-1 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemInstruction;
