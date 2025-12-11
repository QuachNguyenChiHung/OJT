import { useState, useRef } from 'react';
import { chatWithBedrock } from '../api/bedrock';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sessionIdRef = useRef(`session-${Date.now()}`);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        // Add user message
        const userMessage = inputValue;
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const botResponse = await chatWithBedrock(userMessage, sessionIdRef.current);
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Bedrock error:', error);
            setMessages(prev => [...prev, {
                text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
                sender: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Interface */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '20px',
                    width: '350px',
                    height: '450px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        backgroundColor: '#3B5998',
                        color: 'white',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h5 style={{ margin: 0 }}>Trợ Lý Ảo</h5>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '0 5px'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '15px',
                        backgroundColor: '#f5f5f5'
                    }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    backgroundColor: msg.sender === 'user' ? '#3B5998' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'black',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                                <div style={{
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    Đang suy nghĩ...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: '15px',
                            backgroundColor: 'white',
                            borderTop: '1px solid #ddd',
                            display: 'flex',
                            gap: '10px'
                        }}
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '20px',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                backgroundColor: '#3B5998',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* Chat Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000,
                    cursor: 'pointer'
                }}
            >
                <img
                    style={{
                        width: '60px',
                        height: '60px',
                        boxShadow: '5px 5px 1px 1px rgba(0,0,0,0.2)',
                        borderRadius: '50%',
                        padding: '6px',
                        backgroundColor: 'rgba(0, 182, 182, 0.8)',
                    }}
                    src="/img/robot-head.png"
                    alt="ChatBot"
                />
            </div>
        </>
    )
}