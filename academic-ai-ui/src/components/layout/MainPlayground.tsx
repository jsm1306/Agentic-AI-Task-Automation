'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Pin, Star } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { PinnedMessages } from './PinnedMessages';
import { AgentActivity } from './AgentActivity';
import { apiClient, apiUtils, ChatMessage, ChatSession } from '../../lib/api';

const mockMessages: Array<{
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  pinned: boolean;
  tools?: string[];
}> = [
  {
    id: '1',
    type: 'user',
    content: 'Explain the fundamentals of object detection in computer vision.',
    timestamp: '10:30 AM',
    pinned: false
  },
  {
    id: '2',
    type: 'ai',
    content: 'Object detection is a computer vision technique that identifies and locates objects within an image or video. It combines classification (what) with localization (where).',
    timestamp: '10:31 AM',
    tools: ['Search'],
    pinned: true
  },
  {
    id: '3',
    type: 'ai',
    content: 'Let me search for more detailed information about object detection algorithms.',
    timestamp: '10:31 AM',
    tools: ['Search', 'Save Notes'],
    pinned: false
  }
];

const placeholders = [
  "Ask about your syllabus...",
  "Generate a study plan...",
  "Create notes for Unit 3...",
  "Explain complex concepts...",
  "Plan your study schedule..."
];

export const MainPlayground: React.FC<{ session: ChatSession | null; onArtifactsChanged?: () => void }> = ({ session, onArtifactsChanged }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [agentActions, setAgentActions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from session
  useEffect(() => {
    if (session) {
      setMessages(session.messages || []);
    } else {
      setMessages([]);
    }
  }, [session]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || !session) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send to backend
      const response = await apiClient.sendMessage({
        session_id: session.id,
        message: userMessage.content,
        stream: false
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        tools: response.agent_actions?.map(action => action.action) || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update agent actions for activity stream
      if (response.agent_actions) {
        const mappedActions = response.agent_actions.map((action, index) => ({
          id: `${Date.now()}-${index}`,
          agent: 'Academic Assistant',
          action: action.action,
          timestamp: action.timestamp,
          details: action.details ? JSON.stringify(action.details) : undefined
        }));
        setAgentActions(prev => [...prev, ...mappedActions]);
      }

      // Notify that artifacts might have changed (notes, study plans, etc.)
      if (onArtifactsChanged) {
        onArtifactsChanged();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const togglePin = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
    ));
  };

  const pinnedMessages = messages.filter(msg => msg.pinned);

  return (
    <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md h-full">
      {pinnedMessages.length > 0 && <PinnedMessages messages={pinnedMessages} onUnpin={togglePin} />}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.filter(msg => !msg.pinned).map((message, index) => (
          <MessageBubble
            key={index}
            id={index.toString()}
            type={message.role === 'user' ? 'user' : 'ai'}
            content={message.content}
            timestamp={new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            tools={message.tools}
            pinned={message.pinned}
            onPin={() => togglePin(index.toString())}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <AgentActivity actions={agentActions} />
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={session ? placeholders[currentPlaceholder] : "Select a session to start chatting..."}
              disabled={!session}
              className={`w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-400 resize-none transition-all duration-200 ${
                isInputFocused ? 'min-h-[80px]' : 'min-h-[48px]'
              } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
              rows={isInputFocused ? 3 : 1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-zinc-400">
              {inputValue.length}/2000
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!session || !inputValue.trim() || isTyping}
            className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-zinc-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};