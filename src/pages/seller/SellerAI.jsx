import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SellerAI = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your AI Assistant. I can help you write SEO-optimized product descriptions, analyze your sales trends, or suggest pricing strategies. What do you need help with today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { error } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/seller-ai/chat', { message: userMessage });
      if (res.data.success) {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: res.data.data.reply }]);
      }
    } catch (err) {
      error("Failed to connect to AI Assistant");
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles color="var(--accent-primary)" /> AI Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chat with your AI assistant to optimize your store.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.sender === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="var(--accent-primary)" />}
              </div>
              
              <div style={{
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                maxWidth: '75%',
                lineHeight: '1.6',
                border: msg.sender === 'ai' ? '1px solid var(--border-light)' : 'none',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text.split('**').map((text, i) => i % 2 === 1 ? <strong key={i}>{text}</strong> : text)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="var(--accent-primary)" />
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem 1.5rem', borderRadius: '16px', borderTopLeftRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="animate-spin" color="var(--accent-primary)" />
                <span style={{ color: 'var(--text-secondary)' }}>AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-light)', background: 'rgba(15, 23, 42, 0.3)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ask me to write a description or analyze your products..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '30px' }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!input.trim() || loading}
              style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={20} style={{ marginLeft: '4px' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerAI;
