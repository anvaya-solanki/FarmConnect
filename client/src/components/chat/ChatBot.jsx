import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your farming assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (content) => {
    // Split content into lines
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Numbered heading (e.g., 1. Site Selection)
      if (/^\d+\.\s+/.test(trimmed)) {
        // Flush any current list
        if (currentList.length) {
          elements.push(
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3 key={`heading-${idx}`} className="font-semibold text-base mt-3 mb-1">
            {trimmed}
          </h3>
        );
      }
      // Bullet point
      else if (/^-\s+/.test(trimmed)) {
        currentList.push(trimmed.replace(/^-\s+/, ''));
      }
      // Empty line (paragraph break)
      else if (trimmed === '') {
        if (currentList.length) {
          elements.push(
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(<div key={`br-${idx}`} className="mb-2" />);
      }
      // Regular paragraph
      else {
        if (currentList.length) {
          elements.push(
            <ul key={`ul-${idx}`} className="list-disc pl-6 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="text-sm">{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={`p-${idx}`} className="text-sm mb-2">
            {trimmed}
          </p>
        );
      }
    });
    // Flush any remaining list
    if (currentList.length) {
      elements.push(
        <ul key={`ul-last`} className="list-disc pl-6 space-y-1">
          {currentList.map((item, i) => (
            <li key={i} className="text-sm">{item}</li>
          ))}
        </ul>
      );
    }
    return elements;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get response');
      }
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message.content 
        }]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error(error.message || 'Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition-colors duration-200 z-50"
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[400px] bg-white rounded-lg shadow-xl flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-green-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Farming Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-green-700"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-green-700 text-white p-2 rounded-lg hover:bg-green-800 transition-colors duration-200 disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot; 