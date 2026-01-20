
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Conversation } from '../types';
import PlusIcon from './icons/PlusIcon';
import MessageIcon from './icons/MessageIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  setIsOpen,
}) => {
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingConvoId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingConvoId]);

  const handleStartEdit = (convo: Conversation) => {
    setEditingConvoId(convo.id);
    setCurrentTitle(convo.title);
  };

  const handleCancelEdit = () => {
    setEditingConvoId(null);
    setCurrentTitle('');
  };

  const handleSaveTitle = () => {
    if (editingConvoId && currentTitle.trim()) {
      onRenameConversation(editingConvoId, currentTitle.trim());
    }
    handleCancelEdit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside
        className={`absolute top-0 left-0 h-full w-64 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col z-30
                    transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 md:w-72 md:flex-shrink-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <PlusIcon />
          New Chat
        </button>

        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-6 mb-2 px-2 uppercase tracking-wider">
          History
        </h2>
        <nav className="flex-1 overflow-y-auto -mx-2">
          <ul className="space-y-1">
            {conversations.sort((a, b) => (b.messages[0]?.id || '').localeCompare(a.messages[0]?.id || '')).map((convo) => {
              const isEditing = editingConvoId === convo.id;
              return (
                <li key={convo.id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isEditing) {
                        onSelectConversation(convo.id);
                      }
                    }}
                    className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      convo.id === activeConversationId && !isEditing
                        ? 'bg-slate-200 dark:bg-slate-700/80 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate w-full">
                      <MessageIcon />
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          onBlur={handleSaveTitle}
                          onKeyDown={handleKeyDown}
                          className="bg-white dark:bg-slate-900 border border-sky-500 rounded-md px-2 py-0.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                        />
                      ) : (
                        <span className="truncate">{convo.title}</span>
                      )}
                    </div>
                    <div className="flex items-center shrink-0">
                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleStartEdit(convo);
                          }}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          aria-label={`Edit title for ${convo.title}`}
                        >
                          <PencilIcon />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteConversation(convo.id);
                        }}
                        className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label={`Delete conversation: ${convo.title}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;