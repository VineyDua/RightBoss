import React, { useState, useRef, useEffect } from 'react';
import { Send, BotMessageSquare, User } from 'lucide-react';
import Button from '../ui/Button';
import { InterviewMessage } from '../../types';

interface ChatInterfaceProps {
  messages: InterviewMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Type your message...',
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <div className="p-4 border-b border-gray-800 bg-gray-850">
        <h2 className="text-lg font-semibold text-white">AI Interview</h2>
        <p className="text-sm text-gray-400">
          Chat naturally with our AI to showcase your skills and experience
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-gray-800 text-gray-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'ai' ? (
                  <BotMessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                ) : (
                  <User className="h-4 w-4 mr-2 text-gray-300" />
                )}
                <span className="text-xs font-medium">
                  {message.sender === 'ai' ? 'RightBoss AI' : 'You'}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3 rounded-tl-none max-w-[80%]">
              <div className="flex items-center">
                <BotMessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                <span className="text-xs font-medium">RightBoss AI</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            variant="primary"
            gradient
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;