import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi có thể giúp bạn tìm sản phẩm, xem danh mục hoặc thương hiệu.', sender: 'bot', time: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const messagesEndRef = useRef(null);

    // Check login status
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        const interval = setInterval(checkAuth, 1000);
        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = inputValue.trim();
        setMessages(prev => [...prev, { text: userMessage, sender: 'user', time: new Date() }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await api.get(`/bedrock/ask?q=${encodeURIComponent(userMessage)}`);
            const botMessage = res.data?.message || res.data || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
            setMessages(prev => [...prev, { text: botMessage, sender: 'bot', time: new Date() }]);
        } catch (error) {
            console.error('ChatBot error:', error);
            setMessages(prev => [...prev, { 
                text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.', 
                sender: 'bot',
                time: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { icon: '🔍', text: 'Tìm sản phẩm' },
        { icon: '📂', text: 'Xem danh mục' },
        { icon: '🏷️', text: 'Thương hiệu' },
        { icon: '🔥', text: 'Sản phẩm sale' }
    ];

    if (!isLoggedIn) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '24px',
                    width: '360px',
                    height: '520px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #e5e5e5'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#222',
                        color: '#fff',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                            }}>
                                🤖
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>Trợ Lý AI</div>
                                <div style={{ fontSize: '11px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '4px',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        backgroundColor: '#fafafa'
                    }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: '8px',
                                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                                }}>
                                    {msg.sender === 'bot' && (
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: '#222',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            flexShrink: 0
                                        }}>
                                            🤖
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '240px',
                                        padding: '10px 14px',
                                        borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        backgroundColor: msg.sender === 'user' ? '#222' : '#fff',
                                        color: msg.sender === 'user' ? '#fff' : '#222',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '10px',
                                    color: '#999',
                                    marginTop: '4px',
                                    marginLeft: msg.sender === 'bot' ? '36px' : '0',
                                    marginRight: msg.sender === 'user' ? '0' : '0'
                                }}>
                                    {formatTime(msg.time)}
                                </span>
                            </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px'
                                }}>
                                    🤖
                                </div>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0, 1, 2].map(i => (
                                            <span key={i} style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: '#222',
                                                animation: `typing 1s infinite ${i * 0.15}s`
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#fff',
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto'
                    }}>
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(action.text)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '11px',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '16px',
                                    backgroundColor: '#fff',
                                    color: '#222',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#222';
                                    e.target.style.color = '#fff';
                                    e.target.style.borderColor = '#222';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#fff';
                                    e.target.style.color = '#222';
                                    e.target.style.borderColor = '#e5e5e5';
                                }}
                            >
                                <span>{action.icon}</span>
                                {action.text}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            borderTop: '1px solid #f0f0f0',
                            display: 'flex',
                            gap: '10px'
                        }}
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '20px',
                                outline: 'none',
                                fontSize: '13px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#222'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            style={{
                                backgroundColor: isLoading || !inputValue.trim() ? '#ccc' : '#222',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9998,
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#222',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                )}
            </button>

            {/* Notification dot */}
            {!isOpen && (
                <span style={{
                    position: 'fixed',
                    bottom: '68px',
                    right: '24px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#e31837',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    zIndex: 9999
                }} />
            )}

            <style>{`
                @keyframes typing {
                    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
                    30% { opacity: 1; transform: translateY(-3px); }
                }
            `}</style>
        </>
    );
}
