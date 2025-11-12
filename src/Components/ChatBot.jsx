import { useState } from 'react';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;

        // Add user message
        setMessages([...messages, { text: inputValue, sender: 'user' }]);

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
                sender: 'bot'
            }]);
        }, 1000);

        setInputValue('');
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
                        backgroundColor: 'rgb(228, 148, 0)',
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
                                    backgroundColor: msg.sender === 'user' ? 'rgb(228, 148, 0)' : 'white',
                                    color: msg.sender === 'user' ? 'white' : 'black',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
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
                                backgroundColor: 'rgb(228, 148, 0)',
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