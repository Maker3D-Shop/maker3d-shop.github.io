import React, { useState, useRef } from 'react';
import RecommendationEngine from '@services/recommendationEngine';
import './ChatAssistant.css';

const ChatAssistant = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '👋 Olá! Sou seu assistente. Fale o que você procura (ex: "peça pequena vermelha", "material resistente")',
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const engine = useRef(new RecommendationEngine(products));
  const messagesEnd = useRef(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);

    // Processa com IA
    const response = engine.current.chatAssistant(input);

    // Adiciona resposta do bot
    const botMessage = {
      id: messages.length + 2,
      text: response.message,
      products: response.products,
      sender: 'bot'
    };

    setMessages(prev => [...prev, botMessage]);
    setInput('');
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir assistente"
      >
        💬
      </button>

      {/* Chat widget */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>Assistente Maker3D 🤖</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message message-${msg.sender}`}>
                <p>{msg.text}</p>
                {msg.products && msg.products.length > 0 && (
                  <div className="suggested-products">
                    {msg.products.map(product => (
                      <div key={product.id} className="suggested-item">
                        <img src={product.image} alt={product.name} />
                        <p>{product.name}</p>
                        <span>R$ {product.price.toLocaleString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Descreva o que procura..."
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;