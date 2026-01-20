
import React from 'react';
import BotIcon from './icons/BotIcon';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 my-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <BotIcon />
      </div>
      <div className="max-w-xl p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 rounded-bl-none flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default TypingIndicator;