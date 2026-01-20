
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, Role, Part, TextPart, Conversation } from './types';
import { ai, model, fileToGenerativePart } from './services/geminiService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import SystemInstruction from './components/SystemInstruction';

const LOCAL_STORAGE_KEY_CONVERSATIONS = 'gemini-chat-conversations';
const LOCAL_STORAGE_KEY_THEME = 'gemini-chat-theme';

const initialWelcomeMessage: ChatMessageType = {
  id: `ai-initial-${Date.now()}`,
  role: Role.AI,
  parts: [{ text: "Hello! I'm your AI Bot. You can ask me questions, or even send me an image. How can I help you today?" }],
};

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Load theme from localStorage on initial mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [theme]);
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Effect to load conversations from localStorage ONCE on initial mount
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(LOCAL_STORAGE_KEY_CONVERSATIONS);
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (e) {
      console.error("Failed to load conversations from local storage", e);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  // Effect to save conversations to localStorage whenever they change
  useEffect(() => {
    if (isInitialLoad) return;
    try {
      if (Object.keys(conversations).length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_CONVERSATIONS);
      }
    } catch (e) {
      console.error("Failed to save conversations to local storage", e);
    }
  }, [conversations, isInitialLoad]);
  
  const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
  const activeMessages = activeConversation ? activeConversation.messages : [initialWelcomeMessage];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeMessages, isLoading]);
  
  const handleNewChat = () => {
    setActiveConversationId(null);
    setEditingMessageId(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setEditingMessageId(null);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      setConversations(prev => {
        const newConversations = { ...prev };
        delete newConversations[id];
        return newConversations;
      });
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => {
      const convoToUpdate = prev[id];
      if (convoToUpdate) {
        return {
          ...prev,
          [id]: {
            ...convoToUpdate,
            title: newTitle,
          },
        };
      }
      return prev;
    });
  };

  const handleSetSystemInstruction = (instruction: string) => {
    if (!activeConversationId) return;

    setConversations(prev => {
      const convoToUpdate = prev[activeConversationId];
      if (convoToUpdate) {
        return {
          ...prev,
          [activeConversationId]: {
            ...convoToUpdate,
            systemInstruction: instruction,
          },
        };
      }
      return prev;
    });
  };

  const generateResponse = useCallback(async (conversationId: string, history: ChatMessageType[]) => {
    setIsLoading(true);
    setError(null);
    
    const contents = history.map(({ role, parts }) => ({ role, parts }));
    const systemInstruction = conversations[conversationId]?.systemInstruction;
    const config = systemInstruction ? { systemInstruction } : undefined;

    try {
      const stream = await ai.models.generateContentStream({ model, contents, config });
      const aiMessageId = `ai-${Date.now()}`;
      
      setConversations(prev => {
        const updatedMessages = [...history, { id: aiMessageId, role: Role.AI, parts: [{ text: "" }] }];
        return { ...prev, [conversationId]: { ...prev[conversationId], messages: updatedMessages } };
      });
      setIsLoading(false);

      for await (const chunk of stream) {
        setConversations(prev => {
            const convo = prev[conversationId];
            if (!convo) return prev;
            const updatedMessages = convo.messages.map(msg => {
                if (msg.id === aiMessageId) {
                    const currentText = (msg.parts.find(p => 'text' in p) as TextPart)?.text || '';
                    const newText = currentText + chunk.text;
                    const textPartIndex = msg.parts.findIndex(p => 'text' in p);
                    const newParts = [...msg.parts];
                    if(textPartIndex > -1) {
                       newParts[textPartIndex] = { text: newText };
                    } else {
                       newParts.push({ text: newText });
                    }
                    return { ...msg, parts: newParts };
                }
                return msg;
            });
            return { ...prev, [conversationId]: { ...convo, messages: updatedMessages } };
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      const errorId = `ai-error-${Date.now()}`;
      setConversations(prev => {
        const updatedMessages = [...history, { id: errorId, role: Role.AI, parts: [{ text: "Sorry, I encountered an error. Please try again." }] }];
        return { ...prev, [conversationId]: { ...prev[conversationId], messages: updatedMessages } };
      });
    } finally {
        setIsLoading(false);
    }
  }, [conversations]);

  const handleSendMessage = async (text: string, image?: File | null) => {
    if (!text.trim() && !image) return;

    const userMessageParts: Part[] = [];
    if (image) {
      try {
        const imagePart = await fileToGenerativePart(image);
        userMessageParts.push(imagePart);
      } catch (e) {
        setError("Error processing image file.");
        return;
      }
    }
    if (text.trim()) {
      userMessageParts.push({ text });
    }

    const userMessage: ChatMessageType = { id: `user-${Date.now()}`, role: Role.USER, parts: userMessageParts };
    
    let currentConversationId = activeConversationId;

    if (!currentConversationId) {
      currentConversationId = `convo-${Date.now()}`;
      const newTitle = text.substring(0, 40) || 'Image Query';
      const newHistory = [userMessage];
      setConversations(prev => ({
        ...prev,
        [currentConversationId!]: { id: currentConversationId!, title: newTitle, messages: newHistory }
      }));
      setActiveConversationId(currentConversationId);
      await generateResponse(currentConversationId, newHistory);
    } else {
      const currentHistory = conversations[currentConversationId].messages;
      const newHistory = [...currentHistory, userMessage];
      setConversations(prev => ({
        ...prev,
        [currentConversationId!]: {
          ...prev[currentConversationId!],
          messages: newHistory,
        },
      }));
      await generateResponse(currentConversationId, newHistory);
    }
  };

  const handleStartEdit = (messageId: string) => {
    setEditingMessageId(messageId);
  };
  
  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };
  
  const handleSaveEdit = async (messageId: string, newText: string) => {
    if (!activeConversationId) return;

    const conversation = conversations[activeConversationId];
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    setEditingMessageId(null);

    const originalMessage = conversation.messages[messageIndex];
    const imageParts = originalMessage.parts.filter(p => 'inlineData' in p);

    const updatedParts: Part[] = [...imageParts, {text: newText}];

    const updatedMessage: ChatMessageType = {
      ...originalMessage,
      parts: updatedParts,
    };
    
    const truncatedHistory = conversation.messages.slice(0, messageIndex);
    const newHistory = [...truncatedHistory, updatedMessage];

    setConversations(prev => ({
      ...prev,
      [activeConversationId]: {
        ...prev[activeConversationId],
        messages: newHistory,
      },
    }));

    await generateResponse(activeConversationId, newHistory);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-sans transition-colors duration-300">
      <Sidebar 
        conversations={Object.values(conversations)}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex flex-col flex-1 h-screen">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="max-w-4xl mx-auto w-full">
            <SystemInstruction 
              instruction={activeConversation?.systemInstruction}
              onSetInstruction={handleSetSystemInstruction}
              disabled={isLoading || !!editingMessageId || !activeConversationId}
            />
            {activeMessages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg}
                isEditing={editingMessageId === msg.id}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />
            ))}
            {isLoading && !editingMessageId && <TypingIndicator />}
            {error && (
              <div className="flex justify-center">
                <p className="bg-red-500/20 text-red-400 dark:text-red-300 px-4 py-2 rounded-lg text-sm">{error}</p>
              </div>
            )}
          </div>
        </main>
        <footer className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || !!editingMessageId} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
