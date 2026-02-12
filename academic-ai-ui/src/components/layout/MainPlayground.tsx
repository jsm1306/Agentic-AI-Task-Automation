'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Pin, Star } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { PinnedMessages } from './PinnedMessages';
import { AgentActivity } from './AgentActivity';
import { apiClient, apiUtils, ChatMessage, ChatSession } from '../../lib/api';
import { toLocaleTime } from '../../lib/dates';

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
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentActions, setAgentActions] = useState<Array<{
    id: string;
    agent: string;
    action: string;
    timestamp: string;
    details?: string;
  }>>([]);

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
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Send to backend
      const response = await apiClient.sendMessage({
        session_id: session.id,
        message: userMessage.content,
        stream: false
      });

      // Simulate streaming effect
      const fullResponse = response.response;
      let currentText = '';
      const words = fullResponse.split(' ');

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingMessage(currentText);
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
      }

      // Add AI response after streaming is complete
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: response.timestamp,
        tools: response.agent_actions?.map(action => action.action) || [],
        artifact: response.artifact
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingMessage('');
      setIsStreaming(false);

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
      setStreamingMessage('');
      setIsStreaming(false);
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
    <div className="flex-1 flex flex-col glass-card h-full border border-cyan-500/20">
      {pinnedMessages.length > 0 && <PinnedMessages messages={pinnedMessages} onUnpin={togglePin} />}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {messages.length === 0 && !isStreaming && !isTyping ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
              <Star className="w-12 h-12 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-4">
              Welcome to Academic AI
            </h2>
            <p className="text-zinc-400 max-w-md mb-8">
              Select a session from the sidebar or start a new one to begin your research journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full px-4">
              {placeholders.slice(0, 4).map((text, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(text);
                    textareaRef.current?.focus();
                  }}
                  className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-left group"
                >
                  <p className="text-cyan-200 group-hover:text-cyan-100 font-medium text-sm">{text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.filter(msg => !msg.pinned).map((message, index) => (
              <MessageBubble
                key={index}
                id={index.toString()}
                type={message.role === 'user' ? 'user' : 'ai'}
                content={message.content}
                timestamp={toLocaleTime(message.timestamp, { hour: '2-digit', minute: '2-digit' })}
                tools={message.tools}
                pinned={message.pinned}
                onPin={() => togglePin(index.toString())}
                artifact={message.artifact}
              />
            ))}
            {isStreaming && streamingMessage && (
              <MessageBubble
                key="streaming"
                id="streaming"
                type="ai"
                content={streamingMessage}
                timestamp={toLocaleTime(new Date().toISOString(), { hour: '2-digit', minute: '2-digit' })}
                tools={[]}
                pinned={false}
                onPin={() => { }}
                isStreaming={true}
              />
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <AgentActivity actions={agentActions} />
      <div className="p-6 border-t border-cyan-500/20">
        <div className="flex gap-3">
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
              className={`w-full glass-card neon-border-cyan rounded-2xl px-5 py-4 text-white placeholder-zinc-400 focus:outline-none focus:neon-glow-cyan resize-none transition-all duration-300 ${isInputFocused ? 'min-h-[100px] shadow-2xl' : 'min-h-[56px]'
                } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
              rows={isInputFocused ? 3 : 1}
            />
            <div className="absolute bottom-3 right-3 text-xs text-zinc-400">
              {inputValue.length}/2000
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!session || !inputValue.trim() || isTyping}
            className="px-5 py-4 glass-card neon-border-cyan rounded-2xl text-cyan-400 hover:neon-glow-cyan hover-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:neon-glow-cyan-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-zinc-400 mt-3 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};